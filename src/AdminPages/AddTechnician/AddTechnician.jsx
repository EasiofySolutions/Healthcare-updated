/* eslint-disable */

import React, { useState } from "react";
import { auth, db } from "../../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { ref, set, onValue } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddTechnician.css";

const AddTechnician = () => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Technician");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  var adminName1 = localStorage.getItem("adminName");
  // console.log(adminName1)

  const users = ref(db, `superadmin/admins/${adminName1}`);
  onValue(users, (snapshot) => {
    const data = snapshot.val();
    // console.log(data)
  });




  const notifyWarning = () =>
    toast.warn("please enter valid ID/Password Or E-mail already exists", {
      position: "top-center",
    });
  const notifySuccess = () =>
    toast.success("Technician Added Successfully", {
      position: "top-center",
    });

    const navigate = useNavigate();


  const handleSubmit = (e) => {
    e.preventDefault();
    function onRegister() {
      createUserWithEmailAndPassword(auth, Email, password)
        .then((userCredential) => {
          set(
            ref(
              db,
              `superadmin/admins/${adminName1}/technicians/` +
                role +
                "-" +
                fullName
            ),
            {
              Name: fullName,
              Password: password,
              Email: Email,
              Role: role,
            }
          );
          notifySuccess();
          e.target.reset();
          setTimeout(function () {
            navigate("/Admin");
          }, 2000);
        })

        .catch((error) => notifyWarning(error));
    }
    onRegister();
  };

  return (
    <div>
      <h2 className="text-center h2addadmin">Add Technician</h2>

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

        <input
          type="hidden"
          id="role"
          name="role"
          value="Technician"
          onChange={(e) => setRole(e.target.value)}
        />
        <strong className="strongaddadmin">EMAIL :-</strong>
        <input
          className="inputaddadmin"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
        ></input>
        <strong className="strongaddadmin">PASSWORD :-</strong>
        <input
          className="inputaddadmin"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
        ></input>
        <button className="addadminbtn">Add Technician</button>
        <ToastContainer />
      </form>
    </div>
  );
};

export default AddTechnician;
