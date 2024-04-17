import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase-config";
import "./AdminBillingUsage.css"; // Make sure your CSS supports this structure

function AdminBillingUsage({ id: propId }) {
  const { id: paramsId } = useParams();
  const id = paramsId || propId;
  const [allUsageData, setAllUsageData] = useState({});
  const [displayData, setDisplayData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDoctors, setExpandedDoctors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  useEffect(() => {
    setIsLoading(true);
    const usageRef = ref(
      db,
      `superadmin/admins/${id}/costing/last_Viewed_Events`
    );

    onValue(usageRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAllUsageData(data);
        filterDisplayData(data, selectedMonth);
      } else {
        setAllUsageData({});
        setDisplayData({});
      }
      setIsLoading(false);
    });
  }, [id, selectedMonth]);

  useEffect(() => {
    filterDisplayData(allUsageData, selectedMonth);
  }, [selectedMonth, allUsageData]);

  const filterDisplayData = (data, selectedMonth) => {
    const monthYearFormat = new Date(selectedMonth).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const filteredData = data[monthYearFormat] || {};

    const aggregatedData = Object.values(filteredData).reduce((acc, entry) => {
      const doctor = entry.doctor;
      const patient = entry.patient;
      if (!acc[doctor]) acc[doctor] = { patients: {} };
      if (!acc[doctor].patients[patient]) {
        acc[doctor].patients[patient] = { viewCount: 0, timestamps: [] };
      }
      acc[doctor].patients[patient].viewCount += 1;
      acc[doctor].patients[patient].timestamps.push(entry.timestamp);
      return acc;
    }, {});

    setDisplayData(aggregatedData);
  };

  const totalViews = Object.values(displayData).reduce((total, details) => {
    return (
      total +
      Object.values(details.patients).reduce(
        (subTotal, { viewCount }) => subTotal + viewCount,
        0
      )
    );
  }, 0);

  const toggleDoctorDetails = (doctorNameOrUID) => {
    setExpandedDoctors((prevState) => ({
      ...prevState,
      [doctorNameOrUID]: !prevState[doctorNameOrUID],
    }));
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  if (isLoading) return <div>Loading...</div>;

  const totalItems = Object.keys(displayData).length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Slicing the displayData for current page
  const currentDisplayData = Object.entries(displayData).slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="admin-billing-usage-wrapper">
      <div className="admin-billing-usage">
        <h1 className="admin-billing-header">Usage Details for {id}</h1>
        <Link to="/Admin" className="homeButton billing-backButton">
          <span id="backText" className="backText">
            Back
          </span>
          <i
            id="backIcon"
            className="fas fa-long-arrow-alt-left fa-lg fa-2x"
          ></i>
        </Link>
        <div className="month-selector-container">
          <label htmlFor="month-select" className="month-selector-label">
            Select Month:
          </label>
          <input
            type="month"
            id="month-select"
            className="month-selector-input"
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>
        <table className="Billing-table-usage">
          <thead>
            <tr>
              <th className="billing-heading-usage">Viewed by Doctor</th>
              <th
                style={{ textAlign: "center" }}
                className="billing-heading-usage"
              >
                View Count
              </th>
            </tr>
          </thead>
          <tbody>
            {currentDisplayData.map(([doctor, details], doctorIndex) => (
              <React.Fragment key={doctorIndex}>
                <tr className="special-row-usage">
                  <td>
                    <button
                      className="toggle-icon-usage"
                      onClick={() => toggleDoctorDetails(doctor)}
                    >
                      {expandedDoctors[doctor] ? "-" : "+"}
                    </button>
                    {doctor}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {Object.values(details.patients).reduce(
                      (acc, { viewCount }) => acc + viewCount,
                      0
                    )}
                  </td>
                </tr>
                {expandedDoctors[doctor] && (
                  <tr>
                    <td colSpan="2">
                      <table className="Billing-table-inner-usage">
                        <thead>
                          <tr>
                            <th>Name of Patient</th>
                            <th>Time of Viewing</th>
                            <th style={{ textAlign: "center" }}>View Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(details.patients).map(
                            ([patient, patientDetails], patientIndex) => (
                              <tr key={patientIndex}>
                                <td>{patient}</td>
                                <td>
                                  <select className="select-full-width-usage">
                                    {patientDetails.timestamps.map(
                                      (timestamp, timestampIndex) => (
                                        <option
                                          key={timestampIndex}
                                          value={timestamp}
                                        >
                                          {timestamp}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  {patientDetails.viewCount}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <h5>Total Views: {totalViews}</h5>

        <div className="pagination-usage">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`pagination-btn-usage ${
                currentPage === page ? "active-usage" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {Object.keys(displayData).length === 0 && (
          <h3 className="no-data-message">
            No usage data available for this month.
          </h3>
        )}
      </div>
    </div>
  );
}

export default AdminBillingUsage;
