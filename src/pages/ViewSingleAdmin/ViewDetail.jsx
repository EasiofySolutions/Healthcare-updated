import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { useParams, Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./ViewSingleAdmin.css";
import "./ViewDetail.css";

function ViewDetail() {
  const [users, setUser] = useState({});
  const { id } = useParams();
  const [showDoctors, setShowDoctors] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [showTech, setShowTech] = useState(false);



  const handleDoctorClick = () => {
    setShowDoctors(!showDoctors);
    const button = document.getElementsByClassName('ShowButton');
    if (showDoctors) {
      button.setAttribute('data-state', 'hide');
    } else {
      button.setAttribute('data-state', 'show');
    }
  };

  const handlePatientsClick = () => {
    setShowPatients(!showPatients);
    const button = document.getElementsByClassName('ShowButton');
    if (showPatients) {
      button.setAttribute('data-state', 'hide');
    } else {
      button.setAttribute('data-state', 'show');
    }
  };

  const handleTechClick = () => {
    setShowTech(!showTech);
    const button = document.getElementsByClassName('ShowButton');
    if (showTech) {
      button.setAttribute('data-state', 'hide');
    } else {
      button.setAttribute('data-state', 'show');
    }
  };


  useEffect(() => {
    const users = ref(db, `superadmin/admins/${id}`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setUser({ ...snapshot.val() });
      } else {
        setUser({});
      }
    });
  }, [id]);

  // console.log("users", users);

  return (
    <>
      <div style={{ marginTop: "100px" }}>
        <h2 className="text-center adminName">{users.FullName}</h2>
        <div className="container ">
          <div className="card-header">
            <strong>AdminName:</strong>
            <span className="admin-name">{users.FullName}</span>
            <hr />

            <Link to={"/SuperAdmin/ViewSingleAdmin" + id}>
              <button className="backbutton">Back</button>
            </Link>

            {/* CODE FOR DOCTORS DETAILS */}

            <div style={{ textAlign: 'center' }}>
              <button className="ShowButton" onClick={handleDoctorClick} data-state={showDoctors ? 'hide' : 'show'}>
                {showDoctors ? "Hide Doctors" : "Show Doctors"}
              </button>
              {showDoctors && (
                <>
                  <h5 className="text-center">DOCTORS</h5>
                  <br />
                  <table className="styled-table1">
                    <thead>
                      <tr>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Name
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          ID
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {React.Children.toArray(
                        users &&
                        users.doctors &&
                        Object.values(users.doctors).map((doctor) => {
                          return (
                            <>
                              <tr>
                                <td>{doctor.Name}</td>
                                <td>{doctor.ID}</td>
                                <td>Doctor</td>
                              </tr>
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <br />
                  <hr />
                </>
              )}
            </div>


            {/* CODE FOR PATIENTS DETAILS */}
            <div style={{ textAlign: 'center' }}>
              <button className="ShowButton" onClick={handlePatientsClick} data-state={showPatients ? 'hide' : 'show'}>
                {showPatients ? "Hide Patients" : "Show Patients"}
              </button>
              {showPatients && (
                <>
                  <h5 className="text-center">PATIENTS</h5>
                  <br />
                  <table className="styled-table1">
                    <thead>
                      <tr>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Name
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Age
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          ID
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Doctor Assigned
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {React.Children.toArray(
                        users &&
                        users.patients &&
                        Object.values(users.patients).map((patient) => {
                          return (
                            <>
                              <tr>
                                <td>{patient.FullName}</td>
                                <td>{patient.Age}</td>
                                <td>{patient.ID}</td>
                                <td>{patient.DoctorAssigned}</td>
                                <td>{patient.Role}</td>
                              </tr>
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <br />
                  <hr />
                </>
              )}
            </div>

            {/* CODE FOR TECHNICIANS DETAILS */}


            <div style={{ textAlign: 'center' }}>
              <button className="ShowButton" onClick={handleTechClick} data-state={showTech ? 'hide' : 'show'}>
                {showTech ? "Hide Technician" : "Show Technician"}
              </button>
              {showTech && (
                <>
                  <h5 className="text-center">TECHNICIANS</h5>

                  <br />
                  <table className="styled-table1">
                    <thead>
                      <tr>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Name
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Email
                        </th>
                        <th className="th-head1" style={{ textAlign: "center" }}>
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {React.Children.toArray(users &&
                        users.technicians &&
                        Object.values(users.technicians).map((technician) => {
                          return (
                            // console.log(technician),
                            (
                              <>

                                <tr>
                                  <td>{technician.Name}</td>
                                  <td>{technician.Email}</td>
                                  <td>{technician.Role}</td>
                                </tr>
                              </>
                            )
                          );
                        }))}
                    </tbody>
                  </table>
                </>
              )}
            </div>


            <br />
            <br />
            <div className="backbuttondetail">
              <Link to={"/SuperAdmin/ViewSingleAdmin" + id}>
                <button className="backbutton2 ">Back</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewDetail;
