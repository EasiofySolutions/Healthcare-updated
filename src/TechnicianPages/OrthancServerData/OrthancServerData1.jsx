import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./OrthancServerData.css";
import { Link} from 'react-router-dom';
import Modal from 'react-modal';
import ErrorPage from '../../ErrorPage';
// import { ref, uploadBytesResumable } from 'firebase/storage';
// import { storage } from '../../firebase-config';

const OrthancServerData = () => {
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);  //pagination state

  var adminName1 = localStorage.getItem("adminName");


  const orthancServerURL = 'http://localhost:8050';


  const instancesPerPage = 15; // Number of instances to display per page
  const visiblePageNumbers = 2; // Number of visible page numbers after the current page

  const handledownloadconfirmation = (studyInstanceUID, patientName) => {
    const confirmed = window.confirm("Are you sure you want to download this study?");
    if (confirmed) {
      downloadStudy(studyInstanceUID, patientName);
    }
  };

  const downloadStudy = async (studyInstanceUID, patientName) => {
    try {
      const link = document.createElement('a');
      link.href = `${orthancServerURL}/orthanc/studies/${studyInstanceUID}/archive`;
      link.download = `${patientName}.zip`;
      link.click();
    } catch (error) {
      console.error('Error initiating download:', error);
    }
  };


  useEffect(() => {
    if (patientsData.length === 0) {
      const fetchStudiesForPatient = async (patientID) => {
        try {
          const response = await axios.get(`${orthancServerURL}/orthanc/patients/${patientID}/studies`);
          return response.data;
        } catch (error) {
          console.error('Error fetching studies for patient:', error);
          return [];
        }
      };

      const fetchPatientsData = async () => {
        try {
          const response = await axios.get(`${orthancServerURL}/orthanc/patients`);
          const patientIDs = response.data;
          const patientsWithDetails = await Promise.all(
            patientIDs.map(async (patientID, index) => {
              const patientDataResponse = await axios.get(`${orthancServerURL}/orthanc/patients/${patientID}`);
              const studies = await fetchStudiesForPatient(patientID);
              const studiesWithType = studies.map((study) => ({
                ...study,
                type: study.MainDicomTags.StudyDescription,
              }));
              return {
                ...patientDataResponse.data,
                Studies: studiesWithType,
                originalIndex: index,
              };
            })
          );
console.log("PATIENT DETAILS", patientsWithDetails)
          setPatientsData(patientsWithDetails);
          setLoading(false);
          localStorage.setItem('patientsData', JSON.stringify(patientsWithDetails));

          
      

        } catch (error) {
          console.error('Error fetching patient data:', error);
          setError(error);
        }
      };

      fetchPatientsData();
    } else {
      setLoading(false);
    }
  }, [patientsData,adminName1]);

  
 
  if (error) {
    return <ErrorPage />;
  }

  const filterPatientsBySearchQuery = (query) => {
    return patientsData.filter((patient) =>
      patient.MainDicomTags.PatientName.toLowerCase().includes(query.toLowerCase())
    );
  };

  const totalPages = Math.ceil(filterPatientsBySearchQuery(searchQuery).length / instancesPerPage);

  const startIndex = (currentPage - 1) * instancesPerPage;
  const endIndex = startIndex + instancesPerPage;

  const currentInstances = filterPatientsBySearchQuery(searchQuery).slice(startIndex, endIndex);

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
    <div className="container-fluid">
      <h2 className="text-center adminlist">Orthanc Patient List</h2>

      <Link to="/Technician" className="homeButton">
          <span id="backText" className="backText">
            Back
          </span>
          <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
        </Link>

      <div className="DivsearchBarTechPanelOSD">
        <div className="search-bar searchBarTechPanelOSD">
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
      </div>

      {modalIsOpen && (
        <div className="OrthancServerModal">
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Uploading..."
            className="modalUpload"
            overlayClassName="modal-overlay"
          >
          </Modal>
        </div>
      )}

      {loading ? (
        <div className="spinner-overlay">
          <div className="spinner"></div>
          <p>Loading patient data...</p>
        </div>
      ) : (
        <div style={{ marginTop: "100px" }}>
          <table className="styled-table tableOrthancServerData">
            <thead>
              <tr>
                <th className="th-head T-NO">No.</th>
                <th className="th-head T-NAME">Name</th>
                <th className="th-head T-ACTION-OSD">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentInstances.map((patient, index) => (
                <tr key={patient.ID}>
                  <th className="INDEX" scope="row">{patient.originalIndex + 1}</th>
                  <td className="admin-name">{patient.MainDicomTags.PatientName}</td>
                  <td>
                    {patient.Studies.map((study) => (
                      <div key={study.ID}>
                        <button className="btn btn-view" onClick={() => handledownloadconfirmation(study.ID, patient.MainDicomTags.PatientName)}>
                          Download Study
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination-center">
        <div className="pagination-container">
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left"></i>
            </button>
            {Array.from({ length: visiblePageNumbers * 2 + 1 }).map((_, index) => {
              const page = currentPage - visiblePageNumbers + index;
              if (page >= 1 && page <= totalPages) {
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
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      <Link to="/Technician">
        <div className="container text-center mt-4">
          <button className="backbutton1">Back</button>
        </div>
      </Link>
    </div>
  );
};

export default OrthancServerData;
