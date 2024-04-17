import React, { useState } from "react";
import { auth, db } from "../../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "./AddAdmin.css";

const AddAdmin = () => {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [costingType, setCostingType] = useState("");
  const [generateLicense, setGenerateLicense] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [costingAmount, setCostingAmount] = useState("");
  const navigate = useNavigate();

  const getCostingLabel = () => {
    if (!costingType) return "";
    switch (costingType) {
      case "Cost Per View":
        return "CPV (Cost Per View)";
      case "Cost Per Upload":
        return "CPU (Cost Per Upload)";
      case "Cost Per Upload + View":
        return "CPU+CPV (Cost Per Upload + View)";
      default:
        return "Set Costing";
    }
  };

  const getAbbreviation = () => {
    switch (costingType) {
      case "Cost Per View":
        return "CPV";
      case "Cost Per Upload":
        return "CPU";
      case "Cost Per Upload + View":
        return "CPU+CPV";
      default:
        return "";
    }
  };

  const notifyWarning = () => {
    toast.warn(
      "Please enter a valid ID/Password, or the Email ID already exists. Kindly change the Email ID.",
      {
        position: "top-center",
      }
    );
  };

  const notifySuccess = () => {
    toast.success("Admin added successfully", {
      position: "top-center",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    function onRegister() {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          set(ref(db, `superadmin/admins/${fullName}`), {
            FullName: fullName,
            Password: password,
            Email: email,
            Role: role,
            CostingType:
              costingTypes.find((item) => item.value === costingType)?.label ||
              costingType,
          });

          if (costingAmount !== "") {
            let costingData = {};

            switch (costingType) {
              case "Cost Per View":
                costingData = { CPV: costingAmount };
                break;
              case "Cost Per Upload":
                costingData = { CPU: costingAmount };
                break;
              case "Cost Per Upload + View":
                costingData = { CPU_CPV: costingAmount };
                break;
              default:
                costingData = {};
            }

            set(ref(db, `superadmin/admins/${fullName}/costing`), costingData);
          }

          if (generateLicense && selectedExpiry !== "") {
            const licenseKey = generateLicenseKey();
            const currentDate = new Date();
            const issueDate = formatDate(currentDate);
            const expiryDate = calculateExpiryDate(parseInt(selectedExpiry));

            set(
              ref(
                db,
                `superadmin/admins/${fullName}/License Details/LicenseKey`
              ),
              licenseKey
            );
            set(
              ref(
                db,
                `superadmin/admins/${fullName}/License Details/IssueDate`
              ),
              issueDate
            );
            set(
              ref(
                db,
                `superadmin/admins/${fullName}/License Details/ExpiryDate`
              ),
              expiryDate
            );
          }

          notifySuccess();
          e.target.reset();
          setTimeout(function () {
            navigate("/SuperAdmin");
          }, 3000);
        })
        .catch((error) => notifyWarning(error));
    }
    onRegister();
  };

  const costingTypes = [
    { label: "Select Costing Type", value: "" },
    { label: "Cost Per Upload", value: "Cost Per Upload" },
    { label: "Cost Per View", value: "Cost Per View" },
    { label: "Cost Per Upload + View", value: "Cost Per Upload + View" },
  ];

  const generateLicenseKey = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const keyLength = 10;
    let licenseKey = "";

    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      licenseKey += characters[randomIndex];
    }

    return licenseKey;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateExpiryDate = (months) => {
    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + months,
      currentDate.getDate()
    );
    return formatDate(expiryDate);
  };

  const expiryOptions = [
    { label: "Trial License", months: 1 },
    { label: "3 Months", months: 3 },
    { label: "6 Months", months: 6 },
    { label: "1 Year", months: 12 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 },
  ];

  const handleCostingTypeChange = (e) => {
    const newCostingType = e.target.value;
    setCostingType(newCostingType);
  };

  const renderCostingInput = () => {
    switch (costingType) {
      case "Cost Per View":
      case "Cost Per Upload":
      case "Cost Per Upload + View":
        return (
          <div>
            <strong className="strongaddadmin">{getCostingLabel()}: </strong>
            <div className="input-group">
              <input
                className="inputaddadmin inputaddadmin-CPV"
                placeholder={`Enter ${getAbbreviation()} Amount`}
                onChange={(e) => setCostingAmount(e.target.value)}
                type="number"
              />
              <span className="input-currency-symbol">₹</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-center h2addadmin">ADD ADMIN</h2>
      <Link to="/SuperAdmin" className="homeButton">
        <span id="backText" className="backText">
          Back
        </span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>
      <form className="signupForm" onSubmit={handleSubmit}>
        <ToastContainer />
        <strong className="strongaddadmin">FULL NAME:</strong>
        <input
          className="inputaddadmin"
          type="text"
          placeholder="Enter Full Name"
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="hidden"
          id="role"
          name="role"
          value="admin"
          onChange={(e) => setRole(e.target.value)}
        />
        <strong className="strongaddadmin">EMAIL:</strong>
        <input
          className="inputaddadmin"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
        />
        <strong className="strongaddadmin">PASSWORD:</strong>
        <input
          className="inputaddadmin"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
        />
        <strong className="strongaddadmin">Costing Type:</strong>
        <select
          className="inputaddadmin"
          value={costingType}
          onChange={handleCostingTypeChange}
          required
        >
          {costingTypes.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="custom-checkbox"
            id="generateLicense"
            checked={generateLicense}
            onChange={(e) => setGenerateLicense(e.target.checked)}
          />
          <label
            htmlFor="generateLicense"
            style={{ marginLeft: "8px", fontSize: "20px" }}
          >
            Generate License
          </label>
        </div>
        {generateLicense && (
          <div>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="expiry-dropdown"
            >
              <option value="" disabled>
                Select Expiry Duration
              </option>
              {expiryOptions.map((option, index) => (
                <option key={index} value={option.months}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {renderCostingInput()}{" "}
        <button className="addadminbtn">Add Admin</button>
        <ToastContainer />
      </form>
    </div>
  );
};

export default AddAdmin;
