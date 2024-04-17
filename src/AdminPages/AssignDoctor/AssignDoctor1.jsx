import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useParams } from "react-router-dom";
import { ref, onValue, update, runTransaction, get, query, child, orderByValue, equalTo } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "./AssignDoctor1.css"

const initialState = {
  DoctorAssigned: "",
  FullName: "",
  ID: "",
};

function AssignDoctor1() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [doc, setDoc] = useState();


  const { DoctorAssigned, FullName, ID } = state;


  const { id } = useParams();

  var adminName1 = localStorage.getItem("adminName");

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

  useEffect(() => {
    const docRef = ref(db, `superadmin/admins/${adminName1}/doctors`);
    onValue(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setDoc({ ...snapshot.val() });
      } else {
        setDoc({});
      }
    });
    return () => {
      setData({});
    };
  }, [id, adminName1]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };


  const notifySuccess = () =>
    toast.success("Doctor Assigned Successfully", {
      position: "top-center",
    });

  // CODE FOR DOCTOR ASSIGN

  var handleAssingedDoc = (e) => {
    e.preventDefault();
    var DoctorAssigned = document.getElementById("DoctorAssigned").value;

    // Check if a doctor is selected
    if (!DoctorAssigned) {
      toast.error("SELECT A DOCTOR FIRST", { position: "top-center" });
      return;
    }

    async function addValue(value) {
      try {
        const valuesRef = ref(db, `superadmin/admins/${adminName1}/patients/${id}/DoctorAssigned/`);

        // Check if the doctor is already assigned to the patient
        const query1 = await get(query(child(valuesRef, "/"), orderByValue(), equalTo(value)));
        const existingAssignments = query1.val();
        if (existingAssignments) {
          // The doctor is already assigned to the patient, show an alert and return
          window.alert('This doctor is already assigned to the patient.');
          return;
        }

        runTransaction(valuesRef, (currentData) => {
          let currentMaxKey = 0;

          if (currentData) {
            Object.keys(currentData).forEach((key) => {
              const currentKey = parseInt(key, 10);
              if (!isNaN(currentKey) && currentKey > currentMaxKey) {
                currentMaxKey = currentKey;
              }
            });
          }

          if (!currentData) {
            update(ref(db, `superadmin/admins/${adminName1}/patients/${id}/DoctorAssigned`), {
              0: DoctorAssigned
            });
          } else {
            currentData[currentMaxKey + 1] = value;
            return currentData;
          }
        });
        notifySuccess();

      } catch (error) {
        alert('Error Assigning Doctor, ask Admin to Delete already assigned doctor if any from the database.', error);
      }
    }

    addValue(DoctorAssigned);

  };


  return (
    <>
      <h2 className="text-center h2addadmin1">Assign Doctor</h2>

      <Link to="/Admin/AssignDoctor" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>

      <div>
        <form className="signupForm2">
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


          <strong className="strongaddadmin">ID:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="ID"
            name="ID"
            placeholder="Patient ID"
            value={ID || ""}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">Assign Doctor:</strong>

          <select
            className="inputaddadmin"
            name="DoctorAssigned"
            id="DoctorAssigned"
            value={DoctorAssigned || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a doctor</option>
            <optgroup label="Assigned Doctors">
              {doc &&
                Object.keys(doc).map((doctor, index) => {
                  const doctorName = doc[doctor].Name;
                  const isAssigned = (state.DoctorAssigned && state.DoctorAssigned.includes(doctorName)) || false;
                  if (isAssigned) {
                    return (
                      <option key={index} value={doctorName}>
                        {doctorName}
                      </option>
                    );
                  }
                  return null;
                })}
            </optgroup>
            <optgroup label="Unassigned Doctors">
              {doc &&
                Object.keys(doc).map((doctor, index) => {
                  const doctorName = doc[doctor].Name;
                  const isAssigned = (state.DoctorAssigned && state.DoctorAssigned.includes(doctorName)) || false;
                  if (!isAssigned) {
                    return (
                      <option key={index} value={doctorName}>
                        {doctorName}
                      </option>
                    );
                  }
                  return null;
                })}
            </optgroup>

          </select>


          <button type="submit" className="addimagebtn" onClick={handleAssingedDoc}>Assign Doctor</button>



          <ToastContainer />
        </form>
      </div>





    </>
  );
}

export default AssignDoctor1;
