import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
// import "./ViewAllAdmin.css";
import "./AssignDoctor.css"

const AssignDoctor = () => {
  const [posts, setPosts] = useState([]);
  var adminName1 = localStorage.getItem("adminName");

  useEffect(() => {
    const posts = ref(db,`superadmin/admins/${adminName1}/patients`);
    onValue(posts, (snapshot) => {
      var data = snapshot.val();
      setPosts(data)
    //   console.log(setPosts)
      // console.log({ ...snapshot.val() });
    });
  }, [adminName1]);

// console.log(posts)

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
            <thead  >
              <tr >
                <th className="th-head T-NO" >
                  No.
                </th>
                <th className="th-head T-NAME" >
                  Name
                </th>
                <th className="th-head T-ACTION">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {posts && Object.keys(posts).map((id, index) => {
                return (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td className="admin-name">{posts[id].FullName}</td>
                    <td>
                      {/* <Link to={"/SuperAdmin/ViewSingleAdmin" + id}>
                        <button className="btn btn-view">View</button>
                      </Link> */}

                      <Link to={"/Admin/AssignDoctor1" + id}>
                        <button className="btn btn-view">Assign Doctor</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Link to={"/Admin"}>
       <div className="container text-center mt-4"> <button className="backbutton1">Back</button></div>
      </Link>
    </>
  );
};

export default AssignDoctor;
