import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { useParams, Link } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";

const initialState = {
  Email: "",
  FullName: "",
  Password: "",
  Role: "",
};

function EditAdmin() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [costing, setCosting] = useState({});

  const { Email, FullName, Password, Role } = state;

  // console.log("STATE", state);

  const { id } = useParams();

  //   const auth = getAuth();
  //   const user = auth.currentUser;

  useEffect(() => {
    const users = ref(db, `superadmin/admins`);
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
  }, [id]);

  // console.log("data",data)

  useEffect(() => {
    if (id) {
      setState({ ...data[id] });

      // Fetch costing details for the specific admin
      const adminRef = ref(db, `superadmin/admins/${id}`);
      onValue(adminRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val().costing) {
          setCosting(snapshot.val().costing);
        } else {
          setCosting({});
        }
      });
    } else {
      setState({ ...initialState });
    }

    return () => {
      setState({ ...initialState });
    };
  }, [id, data]);

  const formatCostingKeyName = (key) => {
    const keyNames = {
      CPU: "CPU: (Cost Per Upload)",
      CPV: "CPV: (Cost Per View)",
      CPU_CPV: "CPU+CPV: (Cost Per Upload + Cost Per View)",
    };

    return keyNames[key] || key;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleCostingChange = (e) => {
    const { name, value } = e.target;
    setCosting({ ...costing, [name]: value });
  };

  const notifySuccess = () =>
    toast.success("Admins Information Updated Successfully", {
      position: "top-center",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!FullName || !Password || !Email) {
      toast.error("Please provide value in each field", {
        position: "top-center",
      });
    } else {
      try {
        // Update admin information
        await set(ref(db, `superadmin/admins/${id}`), state);

        // Update costing details
        await set(ref(db, `superadmin/admins/${id}/costing`), costing);

        notifySuccess();
        // setTimeout(function () {
        //   navigate("/SuperAdmin/ViewAll");
        // }, 2100);
      } catch (error) {
        toast.error(error.message, {
          position: "top-center",
        });
      }
    }
  };

  return (
    <>
      <h2 className="text-center h2addadmin">Update Admin's Information</h2>
      <Link to="/SuperAdmin/ViewAll" className="homeButton">
        <span id="backText" className="backText">
          Back
        </span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>
      <div style={{ marginTop: "100px" }}>
        <form className="signupForm" onSubmit={handleSubmit}>
          <strong className="strongaddadmin">Admins Name:</strong>
          <input
            className="inputaddadmin "
            type="text"
            id="FullName"
            name="FullName"
            placeholder="Admin Name"
            value={FullName || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Email:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="Email"
            name="Email"
            placeholder="Email ID"
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
          {Object.entries(costing)
            .filter(
              ([key]) => key !== "last_Viewed_Events" && key !== "totalViews"
            )
            .map(([key, value]) => (
              <div key={key}>
                <strong className="strongaddadmin">
                  {formatCostingKeyName(key)}
                </strong>
                <input
                  className="inputaddadmin inputPN"
                  type="text"
                  id={key}
                  name={key}
                  placeholder={`Enter ${formatCostingKeyName(key)}`}
                  value={value || ""}
                  onChange={handleCostingChange}
                />
              </div>
            ))}

          <input
            type="hidden"
            id="Role"
            name="Role"
            placeholder="Role"
            value={Role || ""}
            onChange={handleInputChange}
          />

          <input className="addadminbtn" type="submit" value="Save" />
          <ToastContainer />
        </form>
      </div>
    </>
  );
}

export default EditAdmin;
