import React from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import "../../pages/AddAdmin/AddAdmin";
import "../../pages/ViewAllAdmin/ViewAllAdmin";
import "./SuperAdmin.css";

function SuperAdmin() {
  const { logOut /*user*/ } = useUserAuth();
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
      <h1 className="text-center container">Welcome SuperAdmin</h1>
      {/* <p>{user.email}</p> */}
      <div className="div-main container">
        <div className="text-center container">
          <Link className="link-btn btn-one" to="AddAdmin">
            ADD ADMIN
          </Link>
          <br />
          <Link className="link-btn btn-one" to="ViewAll">
            VIEW ADMIN'S
          </Link>
          <br />
          <Link className="link-btn btn-one" to="Billing">
           ADMIN BILLING
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

export default SuperAdmin;
