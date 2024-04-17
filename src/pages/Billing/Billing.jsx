import React, { useEffect, useState } from "react";
import "./Billing.css";
import { db } from "../../firebase-config";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Billing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsRef = ref(db, `superadmin/admins`);
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      setPosts(data);
    });
  }, []);

  return (
    <>
      <div className="container-fluid ">
        <h2 className="text-center adminlist">Billing</h2>
        <Link to="/SuperAdmin" className="homeButton">
          <span id="backText" className="backText">
            Back
          </span>
          <i
            id="backIcon"
            className="fas fa-long-arrow-alt-left fa-lg fa-2x"
          ></i>
        </Link>
        <div style={{ marginTop: "100px" }}>
          <table className="styled-table ViewAllAdminPageTable">
            <thead>
              <tr>
                <th className="th-head" style={{ textAlign: "center" }}>
                  No.
                </th>
                <th className="th-head" style={{ textAlign: "center" }}>
                  Name
                </th>
                {/* <th className="th-head" style={{ textAlign: "center" }}>
                  License Expire in
                </th> */}
                <th className="th-head" style={{ textAlign: "center" }}>
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {posts &&
                Object.keys(posts).map((id, index) => {
                  return (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td className="admin-name">{posts[id]?.FullName}</td>
                      <td>
                        <div className="link-buttons">
                          <Link to={"/SuperAdmin/BillingDetails" + id}>
                            <button className="btn btn-view">
                              View Billing Details
                            </button>
                          </Link>
                          {/* <Link to={"/SuperAdmin/EditAdmin" + id}>
                            <button className="btn btn-edit">Update</button>
                          </Link>
                          <Link to={"/SuperAdmin/LicenseDetails" + id}>
                            <button className="btn btn-view">License Details</button>
                          </Link> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <Link to={"/SuperAdmin"}>
        <div className="container text-center mt-4">
          <button className="backbutton1">Back</button>
        </div>
      </Link>
      <ToastContainer />
    </>
  );
}

export default Billing;
