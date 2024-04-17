import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";


const initialState = {
    DoctorAssigned:"",
    ID: "",
    FullName: "",
    Role: "",
    Age: "",
};

function UpdatePagePatient() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [doc,setDoc] = useState();


  const { ID, FullName, Role, DoctorAssigned ,Age} = state;

  // console.log("STATE", state);

  const navigate = useNavigate();
  const { id } = useParams();

//   const auth = getAuth();
//   const user = auth.currentUser;

var adminName1 = localStorage.getItem("adminName");


  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}/patients`);
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
  }, [id,adminName1]);

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
  toast.success("Patients Information Updated Successfully", {
    position: "top-center",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!FullName || !ID || !Role || !DoctorAssigned || !Age) {
      toast.error("Please provide value in each field", {
        position: "top-center",
      });
    } else {
      set(
       ref(db, `superadmin/admins/${adminName1}/patients/${id}`),
        state,
        (err) => {
          if (err) {
            toast.error(err, {
              position: "top-center",
            });
          } else {
            toast.success("Patients Information Updated Successfully", {
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
      <h2 className="text-center h2addadmin">Update Patients's Information</h2>

      <Link to="/Admin/ViewAll" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>

      <div style={{ marginTop: "100px" }}>
        <form className="signupForm" onSubmit={handleSubmit}>
          <strong className="strongaddadmin">Patient's Name:</strong>
          <input
            className="inputaddadmin "
            type="text"
            id="FullName"
            name="FullName"
            placeholder="Patients's Name"
            value={FullName || ""}
            onChange={handleInputChange}
          />

<strong className="strongaddadmin">Patient's Age:</strong>
          <input
            className="inputaddadmin "
            type="number"
            id="Age"
            name="Age"
            placeholder="Patients's Age"
            value={Age || ""}
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

          <strong className="strongaddadmin">Doctor Assigned:</strong>

          <select className="inputaddadmin" name="DoctorAssigned" id="DoctorAssigned" value={DoctorAssigned || ""} 
          onChange={handleInputChange}
          >
            {doc &&  Object.keys(doc).map((doctor,index)=> (
              <option  key={index} >
                {doc[doctor].Name}
              </option>
            ))

            }
          </select>


          {/* <input
            className="inputaddadmin"
            type="text"
            id="DoctorAssigned"
            name="DoctorAssigned"
            placeholder="Doctor Assigned"
            value={DoctorAssigned || ""}
            onChange={handleInputChange}
          /> */}

<strong className="strongaddadmin">Role:</strong>
          <input
          className="inputaddadmin inputPN"
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

export default UpdatePagePatient;
