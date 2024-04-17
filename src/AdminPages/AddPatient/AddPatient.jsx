/* eslint-disable */

import React, { useState } from "react";
import { db } from "../../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { ref, set, onValue } from "firebase/database";
// import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddPatient.css";

const AddPatient = () => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Patient");
  const [Id, setID] = useState("");
  const [Dicom3D, setDicom3D] = useState("");
  const [DoctorAssigned, setDoctorAssigned] = useState("");
  const [gender, setGender] = useState("");
  // const [DicomImage, setDicomImage] = useState("");
  const [age, setAge] = useState("");

  var adminName1 = localStorage.getItem("adminName");
  // console.log(adminName1)

  const sanitizeFirebaseKey = (key) => {
    // Replace slashes with underscores
    key = key.replace(/\//g, '_');
    return key;
  };

  const users = ref(db, `superadmin/admins/${adminName1}`);
  onValue(users, (snapshot) => {
    const data = snapshot.val();
    // console.log(data)
  });

  const notifySuccess = () =>
    toast.success("Patient Added Successfully", {
      position: "top-center",
    });

  const navigate = useNavigate();
  //   const notifyWarning = () =>
  //     toast.warn("please enter details correctly", {
  //       position: "top-center",
  //     });

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedFullName = sanitizeFirebaseKey(fullName);
    const patientKey = `${role}-${sanitizedFullName}`;

// Get the current date and timestamp in "dd/mm/yyyy" format
const currentDate = new Date().toLocaleDateString('en-GB'); // Format the date as "dd/mm/yyyy"
const currentTimestamp = new Date().toLocaleString('en-GB'); // Format the timestamp as "dd/mm/yyyy hh:mm:ss"

    function onRegister() {
      set(ref(db, `superadmin/admins/${adminName1}/patients/${patientKey}`), {
          FullName: fullName,
          ID: "P" + Id,
          Role: role,
          Dicom_3D: Dicom3D,
          DoctorAssigned: DoctorAssigned,
          Age: age,
          Dicom_3DURL: "",
          Dicom_Report: "",
          Dicom_ReportURL: "",
          Prescription: "",
          PrescriptionURL: "",
          FolderPath: "",
          "Type_of_CT": "",
          Date: currentDate, // Add the current date
          Timestamp: currentTimestamp, // Add the current timestamp
          Gender: gender, // Add the gender field
          Version: "02"
        }
      );
      notifySuccess();
      e.target.reset();
      setTimeout(function () {
        navigate("/Admin");
      }, 2000);

      // .catch((error) => notifyWarning(error));
    }
    onRegister();
  };

  return (
    <div>
      <h2 className="text-center h2addadmin">ADD PATIENT</h2>

      <Link to="/Admin" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>


      <form className="signupForm" onSubmit={handleSubmit}>
        <strong className="strongaddadmin">FULL NAME :-</strong>
        <input
          className="inputaddadmin"
          type="text"
          placeholder="Enter Full Name"
          onChange={(e) => setFullName(e.target.value)}
          required
        ></input>

        <strong className="strongaddadmin">Age :-</strong>
        <input
          className="inputaddadmin"
          type="text"
          placeholder="Enter Age"
          onChange={(e) => setAge(e.target.value)}
          required
        ></input>

<strong className="strongaddadmin">Gender :-</strong>
<select
  className="inputaddadmin"
  value={gender} // Control the value with React state
  onChange={(e) => setGender(e.target.value)}
  required
>
  <option value="" disabled>Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select>


        <input
          type="hidden"
          id="role"
          name="role"
          value="Patient"
          onChange={(e) => setRole(e.target.value)}
        />

        <input
          type="hidden"
          id="Dicom3D"
          name="Dicom3D"
          value="null"
          onChange={(e) => setDicom3D(e.target.value)}
        />

        <input
          type="hidden"
          id="DoctorAssigned"
          name="DoctorAssigned"
          value="null"
          onChange={(e) => setDoctorAssigned(e.target.value)}
        />

        {/* <input
          type="hidden"
          id="DicomImage"
          name="DicomImage"
          value="null"
          onChange={(e) => setDicomImage(e.target.value)}
        /> */}

        <strong className="strongaddadmin">ID :-</strong>
        <input
          className="inputaddadmin"
          placeholder="Enter ID"
          onChange={(e) => setID(e.target.value)}
          required
          type="text"
        ></input>
        {/* <strong className="strongaddadmin">PASSWORD :-</strong>
        <input className="inputaddadmin"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
        ></input> */}
        <button className="addadminbtn">Add Patient</button>
        <ToastContainer />
      </form>
    </div>
  );
};

export default AddPatient;
