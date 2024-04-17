import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue, remove } from "firebase/database";
// import "./ViewSingleAdmin.css";
import "./ViewAll.css"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function ViewAll() {

  const [users, setUser] = useState({});

  var adminName1 = localStorage.getItem("adminName");

  const navigate = useNavigate();

  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setUser({ ...snapshot.val() });
      } else {
        setUser({});
      }
    });
  }, [adminName1]);

  // DELETE DOCTOR CODE

  const onDeleteDoc = async (doctor) => {
    try {
      if (window.confirm(`Are you sure you want to delete ${doctor} ?`)) {
        const userDoc = ref(db, `superadmin/admins/${adminName1}/doctors/${doctor}`);
        await remove(userDoc)
      }
      navigate("/Admin/ViewAll");
    } catch (err) {
      if (err) {
        toast.error(err);
      } else {
        toast.success("Doctor Deleted Sucessfully", {
          position: "top-center",
        });
      }
    }
  };


  // DELETE PATIENT CODE

  const onDeletepatient = async (patient) => {
    try {
      if (window.confirm(`Are you sure you want to delete ${patient} ?`)) {
        const userDoc = ref(db, `superadmin/admins/${adminName1}/patients/${patient}`);
        await remove(userDoc)
      }
      navigate("/Admin/ViewAll");
    } catch (err) {
      if (err) {
        toast.error(err);
      } else {
        toast.success("Patient Deleted Sucessfully", {
          position: "top-center",
        });
      }
    }
  };

  // DELETE TECH CODE

  const onDeletetechnician = async (technician) => {
    try {
      if (window.confirm(`Are you sure you want to delete ${technician} ?`)) {
        const userDoc = ref(db, `superadmin/admins/${adminName1}/technicians/${technician}`);
        await remove(userDoc)
      }
      navigate("/Admin/ViewAll");
    } catch (err) {
      if (err) {
        toast.error(err);
      } else {
        toast.success("Technician Deleted Sucessfully", {
          position: "top-center",
        });
      }
    }
  };


  return (
    <>
      <div style={{ marginTop: "100px" }}>

        <h2 className="text-center adminlist">{adminName1}</h2>

        <Link to="/Admin" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>


        <div className="container div-viewAll">
          <div className="card-header">
            <strong>AdminName:</strong>
            <span className="admin-name">{adminName1}</span>
            <hr />



            <strong>Doctors:</strong>

            {users &&
              users.doctors &&
              Object.keys(users.doctors).map((doctor, index) => {
                return (
                  <div className="divCenter" key={index}>
                    {" "}

                    <span className="viewAllName "> Doctor-{users.doctors[doctor].Name}</span>
                    <Link to={"/Admin/UpdatePageDoc" + doctor}>
                      <button className="btn btn-edit btn-update">Update</button>
                    </Link>
                    <button
                      className="btn btn-delete btn-del "
                      onClick={() => onDeleteDoc(doctor)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}

            <br />
            <strong>Patients:</strong>
            {users &&
              users.patients &&
              Object.keys(users.patients).map((patient, index) => {
                return (
                  <div className="divCenter" key={index}>
                    {" "}
                    <span className="viewAllName">Patient-{users.patients[patient].FullName}</span>
                    <Link to={"/Admin/UpdatePagePatient" + patient}>
                      <button className="btn btn-edit btn-update">Update</button>
                    </Link>
                    <button
                      className="btn btn-delete btn-del"
                      onClick={() => onDeletepatient(patient)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            <br />
            <strong>Technicians:</strong>
            {users &&
              users.technicians &&
              Object.keys(users.technicians).map((technician, index) => {
                return (
                  <div className="divCenter" key={index}>
                    {" "}
                    <span className="viewAllName">Technician-{users.technicians[technician].Name}</span>
                    <Link to={"/Admin/UpdatePageTech" + technician}>
                      <button className="btn btn-edit btn-update">Update</button>
                    </Link>
                    <button
                      className="btn btn-delete btn-del"
                      onClick={() => onDeletetechnician(technician)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}



            <br />
            <br />
            <Link to={"/Admin/ViewAdminDetail"}>
              <button className="btn1 btn-view1">View Detail</button>
            </Link>

            <Link to="/Admin">
              <button className="backbutton">Back</button>
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default ViewAll;
