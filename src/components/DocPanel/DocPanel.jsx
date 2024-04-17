import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { db } from "../../firebase-config";
import { ref, onValue } from "firebase/database";
import "./DocPanel.css";
import Modal from "react-modal";
import PatientItem from "./PatientItem";

Modal.setAppElement("#root");

const DoctorPanel = () => {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  const [posts, setPosts] = useState([]);
  const adminName1 = localStorage.getItem("adminName");
  const docName = localStorage.getItem("docName");
  // console.log("DOCTOR NAME----",docName)
  const [noPatientsAssigned, setNoPatientsAssigned] = useState(false); // Flag variable
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState();
  const [popupDescription, setPopupDescription] = useState();
  const [hasValidLicense, setHasValidLicense] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // State to track mobile view
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const patientsPerPage = 15; // Number of patients to display per page
  const visiblePageNumbers = 2; // Number of visible page numbers after the current page
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkLicenseDetails = () => {
      const licenseRef = ref(
        db,
        `superadmin/admins/${adminName1}/License Details`
      );
      onValue(licenseRef, (snapshot) => {
        if (snapshot.exists()) {
          const licenseData = snapshot.val();
          const { LicenseKey, ExpiryDate } = licenseData;

          // Get the current date
          const currentDate = new Date();
          const day = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const issueDate = new Date(year, month - 1, day); // Months are zero-based

          if (LicenseKey) {
            if (ExpiryDate) {
              const [expiryDay, expiryMonth, expiryYear] = ExpiryDate.split(
                "-"
              );
              const expiryDate = new Date(
                expiryYear,
                expiryMonth - 1,
                expiryDay
              ); // Months are zero-based

              if (expiryDate >= issueDate) {
                setHasValidLicense(true);
              } else {
                setShowPopup(true);
                setPopupMessage("Your License Has Expired");
                setPopupDescription(
                  "You are not allowed to view the patient details. Renew your license key first to access the data."
                );
                setHasValidLicense(false);
              }
            } else {
              setShowPopup(true);
              setPopupMessage("License Key Required");
              setPopupDescription(
                "You are not allowed to view the patient details. Get the license key first to access the data."
              );
              setHasValidLicense(false);
            }
          } else {
            setShowPopup(true);
            setPopupMessage("License Key Required");
            setPopupDescription(
              "You are not allowed to view the patient details. Get the license key first to access the data."
            );
            setHasValidLicense(false);
          }
        } else {
          setShowPopup(true);
          setPopupMessage("License Key Required");
          setPopupDescription(
            "You are not allowed to view the patient details. Get the license key first to access the data."
          );
          setHasValidLicense(false);
        }
      });
    };

    const timerId = setTimeout(checkLicenseDetails, 500);
    return () => clearTimeout(timerId);
  }, [adminName1]);

  const closeModal = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const posts = ref(db, `superadmin/admins/${adminName1}/patients`);
    onValue(posts, (snapshot) => {
      const data = snapshot.val();
  
        // Check if data is not null or undefined
    if (data) {
      const results = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));
  
      const filteredResults = results.filter((result) => {
        const doctorAssigned = result.DoctorAssigned;
        return (
          Array.isArray(doctorAssigned) &&
          doctorAssigned.some((doctor) => doctor === docName)
        );
      });
  
      // Filter patients with a Timestamp entry and transform string timestamps to Date objects
      const patientsWithTimestamp = filteredResults
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
  
      // Sort patients with timestamps by the date in descending order
      patientsWithTimestamp.sort((a, b) => b.Timestamp - a.Timestamp);
  
      // Patients without Timestamp remain in their original order
      const patientsWithoutTimestamp = filteredResults.filter((patient) => !patient.Timestamp);
  
      // Combine the two arrays: sorted by timestamp and those without a timestamp
      const sortedPatients = [...patientsWithTimestamp, ...patientsWithoutTimestamp];
  
      // Add the original index to each patient
      const resultsWithIndex = sortedPatients.map((patient, index) => ({
        ...patient,
        originalIndex: index,
      }));
  
      setPosts(resultsWithIndex);
      setNoPatientsAssigned(sortedPatients.length === 0);
    } else {
      // Handle the case where there are no patients
      setPosts([]);
      setNoPatientsAssigned(true);
    }
  });
}, [adminName1, docName]);
  

  useEffect(() => {
    if (noPatientsAssigned) {
      setTimeout(() => {
        alert("No Patient is Assigned Yet......");
      }, 1000);
    }
  }, [noPatientsAssigned]);

  // MOBILE DROPDOWN BUTTON

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDropdownChange = (event, patient) => {
    const selectedOption = event.target.value;

    switch (selectedOption) {
      case "report":
        if (hasValidLicense && patient.Dicom_ReportURL) {
          window.open(patient.Dicom_ReportURL, "_blank");
        }
        break;
      case "dicom":
        if (hasValidLicense && patient.FolderPath) {
          const folderPath = encodeURIComponent(patient.FolderPath);
          const viewerUrl = `https://easiofydicomviewer.netlify.app?Patient=${folderPath}&InstituteName=${adminName1}&DoctorName=${docName}&PatientName=${patient.FullName}`;         
           window.location.href = viewerUrl;
        } else {
          console.error("FolderPath is not defined for the selected patient.");
        }
        break;
      case "3d":
        if (hasValidLicense && patient.Dicom_3DURL) {
          const view3Durl = `/DoctorPanel/ModelViewer?url=${encodeURIComponent(
            patient.Dicom_3DURL
          )}`;
          window.location.href = view3Durl;
        }
        break;
      case "prescription":
        if (hasValidLicense) {
          setShowPrescriptionModal(true);
          setSelectedPatient(patient);
        }
        break;
      default:
        // Handle default case
        break;
    }
  };

  const handleDropdownBlur = (event) => {
    // Reset the dropdown value when the user closes the dropdown
    event.target.value = "";
  };

  // Filter patients based on search query
  const filteredPatients = searchQuery
    ? posts.filter((patient) =>
        patient.FullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Calculate the range of patients to display for the current page
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;

  // Get the patients for the current page
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Handle pagination functions
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
      <div className="logout-button-top">
  <Button variant="primary" onClick={handleLogout}>
    <span className="button-icon">
      <i className="fas fa-sign-out-alt"></i>
    </span>
    <span className="button-text">Logout</span>
  </Button>
</div>


      <h1 className="text-center container headingDocPanel">
        WELCOME TO DOCTOR PANEL
      </h1>
      <div className="div-mainTech containerDocPanel">
        {posts.length > 0 ? (
          <div className=" patient-listDOCPANEL">
            <h2 className="text-center adminlist">List of Patients</h2>

            {!hasValidLicense && (
              <div className="flash-message">
                <p className="flash-text">
                  Please Purchase/Renew the license to view the patient details
                </p>
              </div>
            )}

            <div className="search-bar-container">
              <div className="search-bar">
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

            <div
              className="table-doc docPanel-table-div"
              style={{ marginTop: "2%" }}
            >
              <table
                className="styled-table docPanel-table"
                style={{ marginTop: "1%" }}
              >
                <thead>
                  <tr>
                    <th className="th-head T-NO">No.</th>
                    <th className="th-head T-NAME">Name</th>
                    <th className="th-head T-ACTIONDOC">
                      Action/View{" "}
                      <i className="fas fa-arrow-down fa-fw down-arrow"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients &&
                    currentPatients.map((patient) => {
                      return (
                        <tr key={patient.id}>
                          <th className="INDEX" scope="row">
                            {patient.originalIndex + 1}
                          </th>
                          <td className="admin-name admin-nameDOC">
                            {patient.FullName.toUpperCase()}
                          </td>
                          <td className="TD-BUTTONDOC">
                            <div style={{ display: "flex", alignItems: "center" }}>
                              {isMobile && hasValidLicense ? (
                                <select
                                  className="dropdownMobileMenuButtons"
                                  onChange={(event) =>
                                    handleDropdownChange(event, patient)
                                  }
                                  onBlur={(event) =>
                                    handleDropdownBlur(event)
                                  }
                                >
                                  <option value="">Select an option</option>
                                  <option
                                    value="report"
                                    disabled={
                                      !hasValidLicense ||
                                      patient.Dicom_ReportURL === ""
                                    }
                                  >
                                    Report
                                  </option>
                                  <option
                                    value="dicom"
                                    disabled={
                                      !hasValidLicense || patient.FolderPath === ""
                                    }
                                  >
                                    Dicom
                                  </option>
                                  <option
                                    value="3d"
                                    disabled={
                                      !hasValidLicense ||
                                      patient.Dicom_3DURL === ""
                                    }
                                  >
                                    3D
                                  </option>
                                  <option
                                    value="prescription"
                                    disabled={!hasValidLicense}
                                  >
                                    Prescription
                                  </option>
                                </select>
                              ) : (
                                <>
                                  {/* Button 1 */}
                                  {hasValidLicense && patient.Dicom_ReportURL ? (
                                    <a
                                      className="btn btn-view"
                                      href={patient.Dicom_ReportURL}
                                      rel="noopener noreferrer"
                                    >
                                      Report
                                    </a>
                                  ) : (
                                    <span className="btn btn-view unclickable">
                                      Report
                                    </span>
                                  )}

                                  {/* Button 2 */}
                                  {hasValidLicense && patient.FolderPath ? (
                                    <a
                                      className="btn btn-view"
                                      href={`https://easiofydicomviewer.netlify.app?Patient=${patient.FolderPath}&InstituteName=${adminName1}&DoctorName=${docName}&PatientName=${patient.FullName}`}
                                      rel="noopener noreferrer"
                                    >
                                      Dicom
                                    </a>
                                  ) : (
                                    <span className="btn btn-view unclickable">
                                      Dicom
                                    </span>
                                  )}

                                  {/* Button 3 */}
                                  {hasValidLicense && patient.Dicom_3DURL ? (
                                    <Link
                                      to={`/DoctorPanel/ModelViewer?url=${encodeURIComponent(
                                        patient.Dicom_3DURL
                                      )}`}
                                    >
                                      <button className="btn btn-view btn-3D">
                                        &nbsp; 3D &nbsp;
                                      </button>
                                    </Link>
                                  ) : (
                                    <button className="btn btn-view btn-3D unclickable">
                                      &nbsp; 3D &nbsp;
                                    </button>
                                  )}

                                  {/* Button 4 for prescription */}
                                  {hasValidLicense ? (
                                    <PatientItem
                                      key={patient.id}
                                      patient={patient}
                                      adminName1={adminName1}
                                    />
                                  ) : (
                                    <button className="btn btn-view btn-3D unclickable">
                                      Prescription
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-center Pagination-DoctorPanel">
  <div className="pagination-container">
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      {Array.from({ length: visiblePageNumbers + 1 }).map((_, index) => {
        const page = currentPage + index;
        if (page <= totalPages) {
          return (
            <button
              key={page}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
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
      <button
        className="pagination-btn btn-last"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last Page
      </button>
      <button
        className="pagination-btn btn-last"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"> </i>
      </button>
    </div>
  </div>
</div>

          </div>
        ) : null}
        <div className="text-center container" style={{ marginTop: "2%" }}>
          <Button
            className="logout  logoutDocPanel"
            variant="primary"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </div>

      {/* FOR LICENSE VALIDATION POP UP MODAL */}
      <Modal isOpen={showPopup} className="custom-modal">
        <h2 className="modal-title">{popupMessage}</h2>
        <p className="modal-description">{popupDescription}</p>
        <button className="modal-button" onClick={closeModal}>
          Close
        </button>
      </Modal>

      {/* FOR PRESCRIPTION UPLOADING MODAL */}
      {showPrescriptionModal && selectedPatient && (
        <Modal isOpen={showPrescriptionModal} className="custom-modal-prescription">
          <button
            className="close-button-PresModal"
            onClick={() => setShowPrescriptionModal(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <br />
          <PatientItem
            key={selectedPatient.id}
            patient={selectedPatient}
            adminName1={adminName1}
          />
        </Modal>
      )}
    </>
  );
};

export default DoctorPanel;
