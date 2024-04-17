/* eslint-disable */

import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase-config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logIn } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await logIn(email, password);

      var userEmail = document.getElementById("userEmail").value;
      var userPassword = document.getElementById("userPassword").value;
      // console.log("email:",userEmail)
      // console.log("password:",userPassword)
      var users = ref(db, `superadmin`);
      onValue(
        users,
        (snapshot) => {
          const data = snapshot.val();
          //  console.log(data)

          if (data.Email === userEmail && data.Password === userPassword) {
            // console.log("Match Found in SuperAdmin");
            // console.log("Password-----", data.Password);
            // console.log("Role-----", data.Role);
            localStorage.setItem("role", "superadmin");
            // window.location.replace("./pages/profile1.html");
            setLoading(false); // Disable loading right before navigation
            navigate("/SuperAdmin");
          } else {
            var adminData = data.admins;
            // console.log(adminData);
            Object.entries(adminData).forEach((el) => {
              // console.log(el[1]);
              var adminAsUser = el[1].Email;
              var adminPass = el[1].Password;
              // console.log("Email ---- ", adminAsUser);
              // console.log(adminPass);
              if (userEmail === adminAsUser && userPassword === adminPass) {
                // console.log("Match Found in admins");
                // console.log("Password-----", el[1].Password);
                // console.log("Role-----", el[1].Role);
                const patients = el[1].patients;
                // console.log(patients);
                localStorage.setItem("role", "admin");
                localStorage.setItem("adminName", el[1].FullName);
                // window.location.replace("./pages/profileAdmin.html");
                setLoading(false); // Disable loading right before navigation
                navigate("/Admin");
              } else {
                var techData = el[1].technicians;
                if (techData) {
                  //console.log(techData);
                  Object.entries(techData).forEach((element) => {
                    var techAsUser = element[1].Email;
                    const techPass = element[1].Password;
                    if (userEmail === techAsUser && userPassword === techPass) {
                      // console.log("Match Found in Technician");
                      // console.log("Password-----", element[1].Password);
                      // console.log("Role-----", element[1].Role);
                      // console.log("Admin Belongs----", el[1].FullName);
                      const patients = el[1].patients;
                      // console.log(patients);
                      // Object.entries(patients).forEach((patient) => {
                      //   localStorage.setItem = ("patientData", patient[1]);
                      //   console.log(localStorage);
                      // });
                      const techFullName = element[1].Name;
                      localStorage.setItem("Name", techFullName);

                      localStorage.setItem("techName", element[1].FullName);
                      localStorage.setItem("adminName", el[1].FullName);
                      localStorage.setItem("role", "technician");
                      localStorage.setItem("patientsList", el[1].patients);
                      setLoading(false); // Disable loading right before navigation
                      navigate("/Technician");
                    } else {
                      var DocData = el[1].doctors;
                      if (DocData) {
                        Object.entries(DocData).forEach((doclist) => {
                          var docAsUser = doclist[1].Email;
                          const docPass = doclist[1].Password;
                          if (
                            userEmail === docAsUser &&
                            userPassword === docPass
                          ) {
                            localStorage.setItem("docName", doclist[1].Name);
                            localStorage.setItem("adminName", el[1].FullName);
                            localStorage.setItem("role", "doctor");
                            setLoading(false); // Disable loading right before navigation
                            navigate("/DoctorPanel");
                          }
                        });
                      }
                    }

                    // else{
                    //   alert("This User is been Deleted , ask SuperAdmin to add again.");
                    //   // navigate("/");
                    // }
                  });
                }
              }
            });
          }
          // if(data.Email != userEmail){
          //   alert("This User is been Deleted , ask SuperAdmin to add again.");
          // };
        },
        { onlyOnce: true }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  //   const userEmail = email
  //   const userPassword = password

  return (
    <div className="container">
      <form className="loginForm" onSubmit={handleSubmit}>
        <h1 className="text-center">Welcome to Easiofy Solutions</h1>
        {error && (
          <Alert className="loginError" variant="danger">
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-center h-100">
          <div className="card">
            <div className="card-header">
              <h3>Sign In</h3>
            </div>
            <div className="card-body">
              <div className="input-group form-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
                <input
                  type="email"
                  id="userEmail"
                  className="form-control"
                  placeholder="email id"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group form-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="fas fa-key"></i>
                  </span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="userPassword"
                  className="form-control"
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text show-password-toggle"
                    onClick={handleShowPassword}
                  >
                    {showPassword ? (
                      <i className="fas fa-eye-slash"></i>
                    ) : (
                      <i className="fas fa-eye"></i>
                    )}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <button
                  className="btn text-center login_btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Login"}
                </button>
              </div>
              {loading && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                  <p>Please wait...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </form>
    </div>
  );
};

export default Login;
