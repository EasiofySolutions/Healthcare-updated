import React, { useEffect, useState } from "react";
import "./Admin.css";
import { Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import "../../AdminPages/AddDoctor/AddDoctor";
import "../../AdminPages/AddPatient/AddPatient";
import "../../AdminPages/AddTechnician/AddTechnician";
import "../../AdminPages/ViewAll/ViewAll";
import "../../AdminPages/AssignDoctor/AssignDoctor";
import { Image } from "react-bootstrap";
import { getDatabase, ref, get } from "firebase/database";
function Admin() {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();
  const [adminName1, setAdminName1] = useState("");
  const [costingType, setCostingType] = useState("");

  useEffect(() => {
    const fetchCostingType = async () => {
      try {
        const adminName = localStorage.getItem("adminName");
        const db = getDatabase();
        const snapshot = await get(
          ref(db, `superadmin/admins/${adminName}/CostingType`)
        );
        const costingTypeValue = snapshot.val();
        setCostingType(costingTypeValue);
        setAdminName1(adminName);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchCostingType();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderBillingLink = () => {
    if (costingType === "Cost Per Upload") {
      return `/Admin/CPU${adminName1}`;
    } else if (costingType === "Cost Per View") {
      return `/Admin/Billing${adminName1}`;
    } else if (costingType === "Cost Per Upload + View") {
      return `/Admin/Combine${adminName1}`;
    }
    // Add more conditions as needed
    return "";
  };

  return (
    <>
      <div className="header-container">
        <div className="container-fluid d-flex justify-content-between align-items-center bg-dark py-1 px-3">
          <h1 className="text-center AdminWelcome text-light mb-0">
            Welcome Admin
          </h1>

          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              <Image
                src="./easiofy.png" // Update the path to your logo
                alt="Company Logo"
                roundedCircle
                style={{ width: "30px", height: "30px", marginRight: "5px" }}
              />
              {adminName1}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to={renderBillingLink()}>
                Billing
              </Dropdown.Item>
              <Dropdown.Item as={Link} to={`/Admin/Usage${adminName1}`}>
                Usage
              </Dropdown.Item>
              <Dropdown.Item
                as={Link}
                to={`/Admin/PaymentReceipt${adminName1}`}
              >
                Payment Receipt
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              {/* Add more dropdown items as needed */}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="div-mainAdmin container">
        <div className="text-center container">
          <Link className="link-btnAdmin btn-oneAdmin" to="AddDoctor">
            ADD DOCTOR
          </Link>
          <br />
          <Link className="link-btnAdmin btn-oneAdmin" to="AddPatient">
            ADD PATIENT
          </Link>
          <br />
          <Link className="link-btnAdmin btn-oneAdmin" to="AddTechnician">
            ADD TECHNICIAN
          </Link>
          <br />
          <Link className="link-btnAdmin btn-oneAdmin" to="AssignDoctor">
            ASSIGN DOCTOR
          </Link>
          <br />
          <Link className="link-btnAdmin btn-oneAdmin" to="GenerateLink">
            LINK FOR PATIENT'S DATA
          </Link>
          <br />
          <Link className="link-btnAdmin btn-oneAdmin" to="ViewAll">
            VIEW ALL
          </Link>
        </div>

        <div className="text-center container">
          <Button className="logout" variant="primary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}

export default Admin;

// var handleFolder = async (e) => {
//   e.preventDefault();

//   const fileInput = document.getElementById("files1");
//   const patientName = document.getElementById("FullName").value; // Use the ID of your readOnly input

//   if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
//     toast.error("Please Select a Folder First", {
//       position: "top-center",
//     });
//     return;
//   }

//   if (!patientName) {
//     toast.error("Please Enter Patient Name", {
//       position: "top-center",
//     });
//     return;
//   }

//   setModalIsOpen(true);
//   var files = Array.from(fileInput.files);

//   // Prepare FormData to send files to backend
//   const formData = new FormData();
//   formData.append("patientName", patientName); // Add patient name to FormData
//   files.forEach((file) => {
//     formData.append("files", file, file.webkitRelativePath);
//   });

//   // Send files to Python backend
//   try {
//     const response = await fetch("http://127.0.0.1:5000/upload", {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error("Failed to upload files");
//     }

//     const result = await response.json();
//     toast.success(result.message || "Your file is ready!", {
//       position: "top-center",
//     });
//   } catch (error) {
//     toast.error(error.message || "An error occurred during the upload.", {
//       position: "top-center",
//     });
//   } finally {
//     setModalIsOpen(false);
//   }
// };
