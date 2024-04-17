import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { useParams, Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./ViewSingleAdmin.css";
import "./ViewDetail"

function ViewSingleAdmin() {
  // const [posts, setPosts] = useState([]);
  // const { id } = useParams();
  // useEffect(() => {
  //   const posts = ref(db, `superadmin/admins/${id}`);
  //   onValue(posts, (snapshot) => {
  //     const json = { ...snapshot.toJSON() };
  //     const keys = Object.keys(json);
  //     const postJSON = keys.map((key) => {
  //       const element = json[key];
  //       return element ;
  //     });
  //     setPosts(postJSON);
  //     console.log({ ...snapshot.val() });
  //   });
  // }, [id]);

  // console.log(posts);

  const [users, setUser] = useState({});
  const { id } = useParams();


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

  

//  console.log("users", users);
//   const {doctors} = users
//   console.log("ID", doctors && Object.values(doctors)[0])

  return (
    <>
      <div style={{ marginTop: "100px" }}>
        
        <h2 className="text-center adminlist">{users.FullName}</h2>
        <Link to="/SuperAdmin/ViewAll" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>
        <div className="container div-viewSingleAdmin ">
          <div className="card-header">
            <strong>AdminName:</strong>
            <span className="admin-name">{users.FullName}</span>
            <hr />

            <strong>Doctors:</strong>

            {users &&
              users.doctors &&
              Object.keys(users.doctors).map((doctor, index) => {
                return (
                  <div key={index}>
                    {" "}
                    <span className="viewAllName"> {doctor}</span>
                    {/* <button className="btn1 btn-view1">view</button> */}
                  </div>
                );
              })}

            <br />
            <strong>Patients:</strong>
            {users &&
              users.patients &&
              Object.keys(users.patients).map((patient, index) => {
                return (
                  <div key={index}>
                    {" "}
                    <span className="viewAllName">{patient}</span>
                    {/* <button className="btn1 btn-view1">view</button> */}
                  </div>
                );
              })}
            <br />
            <strong>Technicians:</strong>
            {users &&
              users.technicians &&
              Object.keys(users.technicians).map((technician, index) => {
                return (
                  <div key={index}>
                    {" "}
                    <span className="viewAllName">{technician}</span>
                    {/* <button className="btn1 btn-view1">view</button> */}
                  </div>
                );
              })}
            <br />
            <br />

            <Link to={"/SuperAdmin/ViewDetail" + id}>
              <button className="btn1 btn-view1">View Detail</button>
            </Link>

            <Link to="/SuperAdmin/ViewAll">
              <button className="backbutton">Back</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewSingleAdmin;
