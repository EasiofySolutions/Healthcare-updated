import React, { useState, useEffect } from "react";
import "./Cpu.css";

import { db } from "../../../firebase-config";
import { ref, get } from "firebase/database";

const adminName = localStorage.getItem("adminName");

const Cpu = () => {
  const [billingDetails, setBillingDetails] = useState([]);
  const [totalAmountToPay, setTotalAmountToPay] = useState(0);
  const [totalUploads, setTotalUploads] = useState(0);
  const [detailedTable, setDetailedTable] = useState({});
  const [uploadEvents, setUploadEvents] = useState([]);

  useEffect(() => {
    const dbRefTechnicians = ref(
      db,
      `superadmin/admins/${adminName}/technicians`
    );

    // Dynamically generate the database reference for the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate
      .toLocaleString("default", { month: "short" })
      .toUpperCase();
    const currentYear = currentDate.getFullYear();

    const dbRefUploadEvents = ref(
      db,
      `superadmin/admins/${adminName}/costing/Upload_Events/${currentMonth} ${currentYear}`
    );

    const dbRefCosting = ref(db, `superadmin/admins/${adminName}/costing`);

    Promise.all([
      get(dbRefTechnicians),
      get(dbRefUploadEvents),
      get(dbRefCosting),
    ])
      .then(([techniciansSnapshot, uploadEventsSnapshot, costingSnapshot]) => {
        const technicians = techniciansSnapshot.val();
        const uploadEventsData = uploadEventsSnapshot.val();
        const costing = costingSnapshot.val();

        setTotalUploads(costing?.TotalUpload || 0);
        setUploadEvents(uploadEventsData);

        const billingDetailsArray = [];
        const patientwiseUploads = {}; // Object to store timeStamp count for each patient

        if (uploadEventsData) {
          for (let eventKey in uploadEventsData) {
            const events = uploadEventsData[eventKey];
            if (events) {
              for (let i = 0; i < events.length; i++) {
                const patientName = events[i].PatientName;
                if (!patientwiseUploads[patientName]) {
                  patientwiseUploads[patientName] = 0;
                }
                patientwiseUploads[patientName] += events[i].timeStamp.length;
              }
            }
          }
        }

        for (let technicianKey in technicians) {
          const technicianName =
            technicians[technicianKey]?.Name || "Unknown Technician";

          let totalUploads = 0;
          for (let patient in patientwiseUploads) {
            totalUploads += patientwiseUploads[patient];
          }

          billingDetailsArray.push({
            uploadedByTechnician: technicianName,
            totalUploads: totalUploads,
          });
        }

        setBillingDetails(billingDetailsArray);

        const total = billingDetailsArray.reduce(
          (acc, detail) => acc + detail.totalUploads,
          0
        );
        setTotalAmountToPay(total);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const toggleDetailedTable = (technicianName) => {
    setDetailedTable((prev) => ({
      ...prev,
      [technicianName]: !prev[technicianName],
    }));
  };

  const handlePayNow = () => {
    alert("Payment successful!");
  };

  return (
    <div className="cpu-container">
      <div className="title">Billing Details of {adminName}</div>
      <table className="billing-table">
        <thead>
          <tr>
            <th>Uploaded By Technician</th>
            <th>Uploads Count</th>
          </tr>
        </thead>
        <tbody>
          {billingDetails.map((detail, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>
                  <button
                    onClick={() =>
                      toggleDetailedTable(detail.uploadedByTechnician)
                    }
                  >
                    +
                  </button>
                  {detail.uploadedByTechnician}
                </td>
                <td>{detail.totalUploads}</td>
              </tr>
              {detailedTable[detail.uploadedByTechnician] && (
                <tr>
                  <td colSpan={2}>
                    <table>
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Technician Name</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadEvents &&
                          uploadEvents.map((event, idx) => (
                            <tr key={idx}>
                              <td>{event.PatientName}</td>
                              <td>{event.TechnicianName}</td>
                              <td>{event.timeStamp}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="total">Total Uploads: {totalUploads}</div>
      <div className="total">Total Amount to Pay: {totalAmountToPay}</div>
      <button className="pay-now" onClick={handlePayNow}>
        Pay Now
      </button>
    </div>
  );
};

export default Cpu;
