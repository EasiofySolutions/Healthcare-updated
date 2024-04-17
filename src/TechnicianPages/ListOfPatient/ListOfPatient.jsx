import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./ListOfPatient.css";
import { useLocation } from "react-router-dom";

const patientsPerPage = 15; // Number of patients to display per page
const visiblePageNumbers = 2; // Number of visible page numbers after the current page

const ListOfPatient = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const currentPageFromURL = parseInt(urlParams.get("page")) || 1;

  // Set the current page based on the URL parameter
  useEffect(() => {
    setCurrentPage(currentPageFromURL);
  }, [currentPageFromURL]);

  var adminName1 = localStorage.getItem("adminName");

  useEffect(() => {
    const postsRef = ref(db, `superadmin/admins/${adminName1}/patients`);
    onValue(postsRef, (snapshot) => {
      var data = snapshot.val();
  
      // Convert the data object into an array with the original index
      const dataArray = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));
  
      // Filter patients with a Timestamp entry and transform string timestamps to Date objects
      const patientsWithTimestamp = dataArray
        .filter((patient) => !!patient.Timestamp)
        .map((patient) => {
          const dateParts = patient.Timestamp.split(', '); // Split the date and time
          const [date, time] = dateParts;
          const [day, month, year] = date.split('/'); // Extract day, month, year
          const [hour, minute, second] = time.split(':'); // Extract hour, minute, second
  
          const timestamp = new Date(year, month - 1, day, hour, minute, second); // Create a Date object
  
          return {
            ...patient,
            Timestamp: timestamp,
          };
        });
  
      // Sort the patients based on Timestamp in descending order
      patientsWithTimestamp.sort((a, b) => b.Timestamp - a.Timestamp);
  
      // Patients without Timestamp remain in their original order
      const patientsWithoutTimestamp = dataArray.filter((patient) => !patient.Timestamp);
  
      // Combine the two sorted arrays
      const sortedPatients = [...patientsWithTimestamp, ...patientsWithoutTimestamp];
  
      setPosts(sortedPatients);
    });
  }, [adminName1]);
  
  
  // Filter patients based on search query
  const filteredPatients = searchQuery
  ? posts.filter((patient) =>
      patient.FullName && patient.FullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : posts;

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Calculate the range of patients to display for the current page
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;

  // Get the patients for the current page
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Calculate the adjusted index for the current page
const calculateAdjustedIndex = (index) => {
  // Start the index from 1 on the first page, 16 on the second page, and so on
  return index + (currentPage - 1) * patientsPerPage;
};


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="container-fluid">
        <h2 className="text-center adminlist">List of Patients</h2>

        <Link to="/Technician" className="homeButton">
          <span id="backText" className="backText">
            Back
          </span>
          <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
        </Link>

        <div className="search-bar searchBarTechPanelLOP">
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div>
          <table className="styled-table ListofPatientTechPanel">
            <thead>
              <tr>
                <th className="th-head T-NO">No.</th>
                <th className="th-head T-NAME">Name</th>
                <th className="th-head T-ACTION">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((patient,index) => (
                <tr key={patient.id}>
                  <th className="INDEX" scope="row">
                  {calculateAdjustedIndex(index + 1)}
                  </th>
                  <td className="admin-name adminName-LOPT">
      {patient.FullName ? patient.FullName.toUpperCase() : 'N/A'}
    </td>
                  <td>
                  <Link to={`/Technician/AddImage${patient.id}?page=${currentPage}`}>
  <button className="btn btn-view">ADD</button>
</Link>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-center">
        <div className="pagination-container">
        <div className="pagination">
  <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
    <i className="fas fa-chevron-left"></i>
  </button>
  {Array.from({ length: visiblePageNumbers + 1 }).map((_, index) => {
    const page = currentPage + index;
    if (page <= totalPages) {
      return (
        <button
          key={page}
          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      );
    }
    return null;
  })}
  {currentPage + visiblePageNumbers < totalPages && (
    <span key="ellipsis" className="page-ellipsis">
      ...
    </span>
  )}
  <button className="pagination-btn btn-last" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
    Last Page 
  </button>
  <button className="pagination-btn btn-last" onClick={handleNextPage} disabled={currentPage === totalPages}>
      <i className="fas fa-chevron-right"> </i>
  </button>
</div>
</div>
</div>
      </div>
      <Link to={"/Technician"}>
        <div className="container text-center mt-4">
          <button className="backbutton1">Back</button>
        </div>
      </Link>
    </>
  );
};

export default ListOfPatient;
