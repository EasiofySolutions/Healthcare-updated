import React, { useState } from "react";
import Modal from "react-modal";
import { db } from "../../firebase-config";
import { storage } from "../../firebase-config";
import { getDownloadURL, ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import { toast } from "react-toastify";
import { ref, update } from "firebase/database";
import "./PatientItem.css"

const PatientItem = ({ patient }) => {
    const [showPopupPrescription, setShowPopupPrescription] = useState(false);
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const adminName1 = localStorage.getItem("adminName");

    


    const handlePrescriptionUpload = (e, patientId) => {

        const file = e.target.files[0];
        if (file) {
            setPrescriptionFile(file);
        }
    };


    // Function to trigger prescription upload
    const uploadPrescription = () => {
        setIsUploading(true);


        // Get the necessary details
        const Prescription1 = prescriptionFile || "Anonymous";
        const filePrescription = prescriptionFile;
        const fileRef = ref_storage(storage, `superadmin/admins/${adminName1}/patients/${patient.id}/` + filePrescription.name);
        const uploadTask = uploadBytesResumable(fileRef, filePrescription);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.log(error);
                setIsUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((PrescriptionURL) => {
                    console.log('Prescription URL :', PrescriptionURL);
                    update(
                        ref(db, `superadmin/admins/${adminName1}/patients/${patient.id}`),
                        {
                            Prescription: Prescription1.name,
                            PathPrescription: `superadmin/admins/${adminName1}/patients/${patient.id}/${Prescription1.name}`,
                            PrescriptionURL: PrescriptionURL,
                        },
                        (err) => {
                            if (err) {
                                toast.error(err, {
                                    position: "top-center",
                                });
                            } else {
                                // Show toast message for successful upload
                                toast.success("File uploaded successfully", {
                                    position: "top-center",
                                });
                    
                                
                            }
                        }
                    );
                   
                    // Reset states and close the modal
                    setIsUploading(false);
                    setPrescriptionFile(null); // Reset the chosen file
                    setShowPopupPrescription(false);
                    toast.success("File uploaded successfully", {
                        position: "top-center",
                    });
                });
            }
        );
    };

    const prescriptionButton = patient.PrescriptionURL ? (
        <a className="btn btn-view prescription-link" href={patient.PrescriptionURL} target="_blank" rel="noreferrer">
          Prescription
        </a>
      ) : (
        <button className="btn btn-view add-prescription-button" onClick={() => setShowPopupPrescription(true)}>
          Add Prescription
        </button>
      );
      

    

    return (
        <div key={patient.id}>
            {/* Render patient details */}
            {/* Render other buttons */}
            {prescriptionButton}
            {showPopupPrescription && (
                <Modal isOpen={showPopupPrescription} className="custom-modal-prescription">
                    <h6 className="modal-title-prescription">Upload Prescription - {patient.FullName}</h6>
                    <div className="modal-input-prescription">
                        <input
                            type="file"
                            id={`files-${patient.id}`}
                            name={`files-${patient.id}`}
                            onChange={handlePrescriptionUpload}
                            required
                        />

                    </div>
                    <button className="modal-button-prescription upload" onClick={uploadPrescription} disabled={!prescriptionFile || isUploading}>
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                    <button className="modal-button-prescription cancel" onClick={() => {
                        setShowPopupPrescription(false);
                        setPrescriptionFile(null); // Reset the chosen file
                        setIsUploading(false); // Reset the uploading state
                    }}>Cancel</button>
                </Modal>
            )}
        </div>
    );
};

export default PatientItem;
