import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./GenerateLinkPatient.css";

// Encryption function
const encrypt = (data) => {
    return window.btoa(data);
};

const GenerateLinkPatient = () => {
    const [patients, setPatients] = useState([]);
    const [generatedLinks, setGeneratedLinks] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLink, setSelectedLink] = useState("");

    const adminName = localStorage.getItem("adminName");

    useEffect(() => {
        const patientsRef = ref(db, `superadmin/admins/${adminName}/patients`);
        onValue(patientsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setPatients(data);
                const links = Object.keys(data).reduce((acc, id) => {
                    acc[id] = `https://easiofyhealth.netlify.app/patient/${encrypt(adminName)}/${encrypt(id)}`;
                    return acc;
                }, {});
                setGeneratedLinks(links);
            }
        });
    }, [adminName]);

    const handleShareClick = (id) => {
        setSelectedLink(generatedLinks[id]);
        setModalVisible(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(selectedLink);
        alert("Link copied to clipboard!");
        setModalVisible(false); // Close modal after copying
    };

    const shareViaWhatsApp = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Click this link to View your Data: " + selectedLink)}`;
        window.open(whatsappUrl, "_blank");
        setModalVisible(false); // Close modal after sharing
    };

    return (
        <>
            <div className="container-fluid">
                <h2 className="text-center adminlist">List of Patients</h2>
                <Link to="/Admin" className="homeButton">
                    <span id="backText" className="backText">Back</span>
                    <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
                </Link>
                <div style={{ marginTop: "100px" }}>
                    <table className="styled-table ASSIGNDOCADMINPANELTABLE">
                        <thead>
                            <tr>
                                <th className="th-head T-NO">No.</th>
                                <th className="th-head T-NAME">Name</th>
                                <th className="th-head T-ACTION">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients && Object.keys(patients).map((id, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td className="admin-name">{patients[id].FullName}</td>
                                    <td>
                                        <button className="btn btn-view" onClick={() => window.open(generatedLinks[id], '_blank')}>Open Link</button>
                                        {/* Share Link button */}
                                        <button className="btn btn-view" onClick={() => handleShareClick(id)}>
                                            Share Link
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {modalVisible && (
  <div className="PatientViewData modal-background" onClick={() => setModalVisible(false)}>
    <div className="PatientViewData modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Share Patient Link</h2>
        <span className="close-btn" onClick={() => setModalVisible(false)}>&times;</span>
      </div>
      <div className="modal-body">
        <p>Select how you'd like to share:</p>
        <button onClick={copyToClipboard} className="modal-button copy-link">
          <i className="fas fa-copy"></i> Copy Link
        </button>
        <button onClick={shareViaWhatsApp} className="modal-button whatsapp-share">
          <i className="fab fa-whatsapp"></i> WhatsApp
        </button>
      </div>
    </div>
  </div>
)}



            </div>
            <Link to={"/Admin"}>
                <div className="container text-center mt-4"> <button className="backbutton1">Back</button></div>
            </Link>
        </>
    );
};

export default GenerateLinkPatient;
