import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "./UpdatePageDoc.css";

const initialState = {
  Email: "",
  Password: "",
  ID: "",
  Name: "",
  Role: "",
};

function UpdatePageDoc() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});

  const { ID, Name, Role, Email, Password } = state;

  // console.log("STATE", state);

  const navigate = useNavigate();
  const { id } = useParams();

  //   const auth = getAuth();
  //   const user = auth.currentUser;

  var adminName1 = localStorage.getItem("adminName");

  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}/doctors`);
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

  // console.log("data",data)

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const notifySuccess = () =>
    toast.success("Doctors Information Updated Successfully", {
      position: "top-center",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!Name || !ID || !Role) {
      toast.error("Please provide value in each field", {
        position: "top-center",
      });
    } else {
      set(
        ref(db, `superadmin/admins/${adminName1}/doctors/${id}`),
        state,
        (err) => {
          if (err) {
            toast.error(err, {
              position: "top-center",
            });
          } else {
            toast.success("Doctors Information Updated Successfully", {
              position: "top-center",
            });
          }
        }
      );

      notifySuccess();
      setTimeout(function () {
        navigate("/Admin/ViewAll");
      }, 2100);
    }
  };

  return (
    <>
      <h2 className="text-center h2addadmin">Update Doctor's Information</h2>
      
      <Link to="/Admin/ViewAll" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>


      <div className="DocUpdateDiv" style={{ marginTop: "100px" }}>
        <form className="signupForm" onSubmit={handleSubmit}>
          <strong className="strongaddadmin">Doctor's Name:</strong>
          <input
            className="inputaddadmin "
            type="text"
            id="Name"
            name="Name"
            placeholder="Doctor's Name"
            value={Name || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">ID:</strong>
          <input
            className="inputaddadmin "
            type="text"
            id="ID"
            name="ID"
            placeholder="ID"
            value={ID || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Email ID:</strong>
          <input
            className="inputaddadmin inputPN "
            type="text"
            id="Email"
            name="Email"
            placeholder="Email-ID"
            value={Email || ""}
            readOnly
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Password:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="Password"
            name="Password"
            placeholder="Password"
            value={Password || ""}
            readOnly
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Role:</strong>
          <input
            className="inputaddadmin inputPN "
            type="text"
            id="Role"
            name="Role"
            placeholder="Role"
            value={Role || ""}
            readOnly
            onChange={handleInputChange}
          />

          <input className="addadminbtn" type="submit" value="Save" />
          <ToastContainer />
        </form>
      </div>
    </>
  );
}

export default UpdatePageDoc;
