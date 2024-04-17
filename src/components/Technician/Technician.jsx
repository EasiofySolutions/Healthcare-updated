import React from "react";
import "./Technician.css";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import "../../AdminPages/AddDoctor/AddDoctor";
import "../../AdminPages/AddPatient/AddPatient";
import "../../AdminPages/AddTechnician/AddTechnician";
import "../../AdminPages/ViewAll/ViewAll";

function Technician() {
  var adminName1 = localStorage.getItem("adminName");
  console.log("ADMIN NAME ---", adminName1);

  const { logOut } = useUserAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <h1 className="text-center container">WELCOME TO THE LAB</h1>
      <div className="div-mainTech container">
        <div className="text-center container">
          <Link className="link-btnAdmin btn-oneAdmin" to="AddPatient">
            ADD PATIENT
          </Link>
          <br />
          <Link className="link-btnTech btn-oneTech" to="ListOfPatient">
            ADD PATIENT DATA
          </Link>
          <br />
          {/* {adminName1 === "Vidisha District Hospital" && ( */}
          <Link className="link-btnTech btn-oneTech" to="OrthancServerData">
            ORTHANC SERVER DATA
          </Link>

          {/* )} */}
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

export default Technician;
