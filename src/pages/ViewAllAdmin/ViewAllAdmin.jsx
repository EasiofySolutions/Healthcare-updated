// /* eslint-disable */

// import React, { useState, useEffect } from "react";
// import { db } from "../../firebase-config";
// import { Link, useNavigate } from "react-router-dom";
// import { ref, onValue, remove } from "firebase/database";
// import "./ViewAllAdmin.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


// const ViewAll = () => {
//   const [posts, setPosts] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const posts = ref(db,`superadmin/admins`);
//     onValue(posts, (snapshot) => {
//       var data = snapshot.val();
//       setPosts(data)
//     });
//   }, []);

//   // console.log(posts);

//                       // DELETE FUNCTION
  

//   // const onDelete = async (id) => {
//   //   try {
//   //     if (window.confirm(`Are you sure you want to delete Admin ${posts[id].FullName} ?`)) {
//   //       const userDoc = ref(db, `superadmin/admins/${id}`);
//   //       await remove(userDoc)
//   //     }
//   //     navigate("/SuperAdmin/ViewAll");
//   //   } catch (err) {
//   //     if (err) {
//   //       toast.error(err);
//   //     } else {
//   //       toast.success("Admin Deleted Sucessfully");
//   //     }
//   //   }
//   // };

//   return (
//     <>
//       <div className="container-fluid">
//         <h2 className="text-center adminlist">List of Admins</h2>
//         <div style={{ marginTop: "100px" }}>
//           <table className="styled-table ">
//             <thead>
//               <tr>
//                 <th className="th-head" style={{ textAlign: "center" }}>
//                   No.
//                 </th>
//                 <th className="th-head" style={{ textAlign: "center" }}>
//                   Name
//                 </th>
//                 <th className="th-head" style={{ textAlign: "center" }}>
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {posts && Object.keys(posts).map((id, index) => {
//                 return (
//                   <tr key={index}>
//                     <th scope="row">{index + 1}</th>
//                     <td className="admin-name">{posts[id].FullName}</td>
//                     <td>
//                     <div class="link-buttons">
//                       <Link to={"/SuperAdmin/ViewSingleAdmin" + id}>
//                         <button className="btn btn-view">View</button>
//                       </Link>
//                       <Link to={"/SuperAdmin/EditAdmin" + id}>
//                         <button className="btn btn-edit">Update</button>
//                       </Link>
//                       <Link to={"/SuperAdmin/LicenseDetails" + id}>
//                         <button className="btn btn-view">License Details</button>
//                       </Link>
//                       </div>
//                       {/* <button
//                         className="btn btn-delete"
//                         onClick={() => onDelete(id)}
//                       >
//                         Delete
//                       </button> */}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <Link to={"/SuperAdmin"}>
//         <div className="container text-center mt-4">
//           {" "}
//           <button className="backbutton1">Back</button>
//         </div>
//       </Link>
//       <ToastContainer/>
//     </>
//   );
// };

// export default ViewAll;


/* eslint-disable */

import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { differenceInDays } from "date-fns"; // Import date-fns function
import "./ViewAllAdmin.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewAll = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = ref(db, `superadmin/admins`);
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      setPosts(data);
    });
  }, []);

  // Calculate days remaining until a date
  const calculateDaysRemaining = (expiryDate) => {
    const currentDate = new Date();
    const parts = expiryDate.split("-");
    const parsedExpiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
    return differenceInDays(parsedExpiryDate, currentDate);
  };

  return (
    <>
      <div className="container-fluid ">
        <h2 className="text-center adminlist">List of Admins</h2>
        <Link to="/SuperAdmin" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
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
                <th className="th-head" style={{ textAlign: "center" }}>
                  License Expire in
                </th>
                <th className="th-head" style={{ textAlign: "center" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {posts &&
                Object.keys(posts).map((id, index) => {
                  const expiryDate = posts[id]?.["License Details"]?.ExpiryDate;
                  const daysRemaining = expiryDate ? calculateDaysRemaining(expiryDate) : "N/A";

                  return (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td className="admin-name">{posts[id]?.FullName}</td>
                      <td>{expiryDate ? `${daysRemaining} days` : "N/A"}</td>
                      <td>
                        <div className="link-buttons">
                          <Link to={"/SuperAdmin/ViewSingleAdmin" + id}>
                            <button className="btn btn-view">View</button>
                          </Link>
                          <Link to={"/SuperAdmin/EditAdmin" + id}>
                            <button className="btn btn-edit">Update</button>
                          </Link>
                          <Link to={"/SuperAdmin/LicenseDetails" + id}>
                            <button className="btn btn-view">License Details</button>
                          </Link>
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
};

export default ViewAll;
