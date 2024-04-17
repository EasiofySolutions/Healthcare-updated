import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { storage } from "../../firebase-config";
import { getDownloadURL, ref as ref_storage, uploadBytesResumable } from "firebase/storage";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import "./AddPatientDetails.css";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";

Modal.setAppElement('#root');


const initialState = {
  DoctorAssigned: "",
  FullName: "",
  ID: "",
  Role: "",
  Age: "",
  Dicom_ReportURL: "",
  Dicom_3DURL: "",
  PrescriptionURL: "",
  Dicom_ZipURL: "",
  FolderPath: "",

};


function AddPatientDetails() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState();
  const [popupDescription, setPopupDescription] = useState();

  const { DoctorAssigned, FullName, ID, Dicom_ReportURL, Age, Dicom_3DURL, PrescriptionURL, FolderPath } =
    state;

  // console.log("STATE", state);

  const navigate = useNavigate();
  const { id } = useParams();

  var adminName1 = localStorage.getItem("adminName");

  useEffect(() => {
    const licenseRef = ref(db, `superadmin/admins/${adminName1}/License Details`);
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
        // console.log(issueDate)

        if (LicenseKey) {
          if (ExpiryDate) {
            const [expiryDay, expiryMonth, expiryYear] = ExpiryDate.split('-');
            const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay); // Months are zero-based

            if (expiryDate >= issueDate) {
              // License key and expiry date are valid
              // Allow access to patient details
            } else {
              // License key has expired
              setShowPopup(true);
              setPopupMessage("Your License Has Expired");
              setPopupDescription("You are not allowed to view the patient details. Renew your license key first to access the data.");
            }
          } else {
            // Expiry date is missing
            setShowPopup(true);
            setPopupMessage("License Key Required");
            setPopupDescription("You are not allowed to view the patient details. Get the license key first to access the data.");
          }
        } else {
          // License key is not found
          setShowPopup(true);
          setPopupMessage("License Key Required");
          setPopupDescription("You are not allowed to view the patient details. Get the license key first to access the data.");
        }
      } else {
        // License details not found
        setShowPopup(true);
        setPopupMessage("License Key Required");
        setPopupDescription("You are not allowed to view the patient details. Get the license key first to access the data.");
      }
    });
  }, [adminName1]);



  const closeModal = () => {
    setShowPopup(false);
    window.history.back(); // Navigate to the previous page
  };




  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}/patients/`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setData({ ...snapshot.val() });

      } else {
        setData({});
      }
    });
    return () => {
      setData({});
    };
  }, [id, adminName1]);

  // console.log(data[id]);

  useEffect(() => {
    if (id) {
      setState({ ...data[id] });
    } else {
      setState({ ...initialState });
    }

    return () => {
      setState({ ...initialState });
    };
  }, [id, data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };


  const notifySuccess = () =>
    toast.success("Details Added Successfully", {
      position: "top-center",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    var Prescription1 = document.getElementById("files1").files[0] || "Anonymous";
    if (!FullName || !ID || !DoctorAssigned) {
      toast.error("Please provide value in each field", {
        position: "top-center",
      });
    } else {

      // UPLOADING TO FIREBASE STORAGE

      let filePrescription = document.getElementById("files1").files[0];
      let fileRef = ref_storage(storage, `superadmin/admins/${adminName1}/patients/${id}/` + filePrescription.name);

      const uploadTask = uploadBytesResumable(fileRef, filePrescription);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.log(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((PrescriptionURL) => {
            console.log('Prescription URL :', PrescriptionURL);
            update(
              ref(db, `superadmin/admins/${adminName1}/patients/${id}`),
              {
                Prescription: Prescription1.name,
                PathPrescription: `superadmin/admins/${adminName1}/patients/${id}/${Prescription1.name}`,
                PrescriptionURL: PrescriptionURL,
              },
              (err) => {
                if (err) {
                  toast.error(err, {
                    position: "top-center",
                  });
                } else {
                  toast.success("Details Added Successfully", {
                    position: "top-center",
                  });
                }
              }
            );
          });
        }
      );
      notifySuccess();
      setTimeout(function () {
        navigate("/DoctorPanel/");
      }, 2100);


    }

    // console.log("zipurl", Dicom_ZipURL)

  };


  // ...


  return (
    <>

      <Link to="/DoctorPanel" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>


      <h2 className="text-center h2addadmin1">PATIENT DETAILS</h2>
      <div>
        <form className="signupForm2" onSubmit={handleSubmit}>
          <strong className="strongaddadmin">Patient Name:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="FullName"
            name="FullName"
            placeholder="Patient Name"
            value={FullName || ""}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">Age:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="Age"
            name="Age"
            placeholder="Patient Age"
            value={Age || ""}
            onChange={handleInputChange}
            readOnly
          />

          {/* <strong className="strongaddadmin">ID:</strong> */}
          <input
            className="inputaddadmin inputPN"
            type="hidden"
            id="ID"
            name="ID"
            placeholder="Patient ID"
            value={ID || ""}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">View Report:</strong>
          {Dicom_ReportURL !== "" ? (
            <a
              href={Dicom_ReportURL}
              target="_blank"
              rel="noreferrer"
              className="inputaddadmin BTN-REPORT"
            >
              View Report
            </a>
          ) : (
            <input
              className="inputaddadmin"
              type="text"
              placeholder=" No File Found !"
            />
          )}

          <strong className="strongaddadmin">View GLTF:</strong>
          {Dicom_3DURL !== "" ? (
            <Link to={"/DoctorPanel/ModelViewer" + id}>
              <button className="inputaddadmin BTN-3D">View 3D</button>
            </Link>
          ) : (
            <input
              className="inputaddadmin"
              type="text"
              placeholder=" No File Found !"
            />
          )}

          <strong className="strongaddadmin">View Dicom :</strong>
          {FolderPath !== "" ?
            <a href={`https://easiofydicomviewer.netlify.app?Patient=${FolderPath}`} rel="noreferrer" className="inputaddadmin BTN-3D BTN-REPORT">View Dicom</a>
            :
            <input
              className="inputaddadmin"
              type="text"
              placeholder=" No File Found !"
            />
          }

          {PrescriptionURL === "" ?
            <>
              <strong className="strongaddadmin">  Add Prescription:</strong>
              <input
                type="file"
                id="files1"
                name="files[]"
                placeholder="Add Prescription"
                required
              /></> :
            <>
              <strong className="strongaddadmin">View Prescription:</strong>
              <a href={PrescriptionURL} target="_blank"
                rel="noreferrer"
                className="inputaddadmin BTN-REPORT">View Prescription</a></>}





          <input className="addadminbtn" type="submit" value="Save" />
          <ToastContainer />
        </form>
      </div>

      <Modal isOpen={showPopup} className="custom-modal">
        <h2 className="modal-title">{popupMessage}</h2>
        <p className="modal-description">{popupDescription}</p>
        <button className="modal-button" onClick={closeModal}>Close</button>
      </Modal>

    </>
  );
}

export default AddPatientDetails;
