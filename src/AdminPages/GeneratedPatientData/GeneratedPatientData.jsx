import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./GeneratedPatientData.css";

// Decryption function
const decrypt = (data) => {
    return window.atob(data);
};

const GeneratedPatientData = () => {
    const { adminName, patientId } = useParams();
    const decryptedAdminName = decrypt(adminName);
    const decryptedPatientId = decrypt(patientId);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state


    useEffect(() => {
        setLoading(true); // Set loading to true before fetching
        const patientRef = ref(db, `superadmin/admins/${decryptedAdminName}/patients/${decryptedPatientId}`);
        onValue(patientRef, (snapshot) => {
            const data = snapshot.val();
            setPatientData(data);
            setLoading(false); // Set loading to false after fetching

        });
    }, [decryptedAdminName, decryptedPatientId]);

    return (
        <>
            <h2 className="text-center h2addadmin1">PATIENT DATA</h2>
            {loading && (
                <div className="spinner-overlay">
                    <div className="spinner"></div>
                    <p>Please wait...</p>
                </div>
            )}
            <div className="PatientData-container">
                <form className="signupForm2 PatientData-container">
                    {patientData ? (
                        <div>

                            <strong className="strongaddadmin">Patient Name:</strong>
                            <input
                                className="inputaddadmin inputPN"
                                type="text"
                                id="FullName"
                                name="FullName"
                                placeholder="Patient Name"
                                value={patientData.FullName || ""}
                                readOnly
                            />

                            <strong className="strongaddadmin">ID:</strong>
                            <input
                                className="inputaddadmin inputPN"
                                type="text"
                                id="FullName"
                                name="FullName"
                                placeholder="Patient Name"
                                value={patientData.ID || ""}
                                readOnly
                            />

                            <strong className="strongaddadmin">AGE:</strong>
                            <input
                                className="inputaddadmin inputPN"
                                type="text"
                                id="FullName"
                                name="FullName"
                                placeholder="Patient Name"
                                value={patientData.Age ? `${patientData.Age} years` : "NA"}
                                readOnly
                            />


                            {/* Button 1 */}

                            <strong className="strongaddadmin">View 3D:</strong>
                            {patientData.Dicom_3DURL ? (
                                <Link
                                    to={`/ModelViewer?url=${encodeURIComponent(
                                        patientData.Dicom_3DURL
                                    )}`}
                                >
                                    <button className="btn btn-view btn-3D patient-data-btn ">
                                        &nbsp; 3D &nbsp;
                                    </button>
                                </Link>
                            ) : (
                                <button className="btn btn-view btn-3D patient-data-btn unclickable">
                                    &nbsp; 3D &nbsp;
                                </button>
                            )}

                            {/* Button 2 */}
                            <strong className="strongaddadmin"> View Report:</strong>

                            {patientData.Dicom_ReportURL ? (
                                <a
                                    className="btn btn-view patient-data-btn"
                                    href={patientData.Dicom_ReportURL}
                                    rel="noopener noreferrer"
                                >
                                    Report
                                </a>
                            ) : (
                                <span className="btn btn-view patient-data-btn unclickable">
                                    Report
                                </span>
                            )}

                            <strong className="strongaddadmin">View Dicom:</strong>
                            {/* Button 3 */}
                            {patientData.FolderPath ? (
                                <a
                                    className="btn btn-view patient-data-btn"
                                    href={`https://easiofydicomviewer.netlify.app?Patient=${patientData.FolderPath}`}
                                    rel="noopener noreferrer"
                                >
                                    Dicom
                                </a>
                            ) : (
                                <span className="btn btn-view patient-data-btn unclickable">
                                    Dicom
                                </span>
                            )}

                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </form >
            </div >
        </>
    );
};

export default GeneratedPatientData;
