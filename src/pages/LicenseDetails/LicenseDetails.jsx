import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useParams} from "react-router-dom";
import { ref, onValue, update, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal"; // Import the React Modal component
import "./LicenseDetails.css";

const initialState = {
  FullName: "",
};

function LicenseDetails() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [licenseDetails, setLicenseDetails] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [generateLicense, setGenerateLicense] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState(""); // Changed to an empty string initially


  const { FullName } = state;

 
  const { id } = useParams();

  useEffect(() => {
    const users = ref(db, `superadmin/admins`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setData({ ...snapshot.val() });
        const licenseRef = ref(db, `superadmin/admins/${id}/License Details`);
        onValue(licenseRef, (licenseSnapshot) => {
          if (licenseSnapshot.exists()) {
            setLicenseDetails({ ...licenseSnapshot.val() });
          } else {
            setLicenseDetails({});
            setTimeout(() => {
                // Show the Modal if license details are not available
                if (!licenseSnapshot.exists()) {
                  setModalIsOpen(true);
                }
              }, 500);
          }
        });
      } else {
        setData({});
        setLicenseDetails({});
      }
    });
    return () => {
      setData({});
      setLicenseDetails({});
    };
  }, [id]);

  

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
    setLicenseDetails({ ...licenseDetails, [name]: value });
  };

  const notifySuccess = () =>
    toast.success("License Information Updated Successfully", {
      position: "top-center",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!FullName) {
          toast.error("Please provide a value in each field", {
            position: "top-center",
          });
        } else {
          // Update only the License Details node for the specific admin
          const licenseRef = ref(db, `superadmin/admins/${id}/License Details`);
          update(licenseRef, licenseDetails, (err) => {
            if (err) {
              toast.error(err, {
                position: "top-center",
              });
            } else {
              toast.success("License Information Updated Successfully", {
                position: "top-center",
              });
            }
          });
          if (generateLicense && selectedExpiry !== "") {
            const licenseKey = generateLicenseKey();
            const currentDate = new Date();
            const issueDate = formatDate(currentDate);
            const expiryDate = calculateExpiryDate(parseInt(selectedExpiry));
      

            // Store license details under the same admin node
            set(ref(db, `superadmin/admins/${id}/License Details/LicenseKey`), licenseKey);
            set(ref(db, `superadmin/admins/${id}/License Details/IssueDate`), issueDate);
            set(ref(db, `superadmin/admins/${id}/License Details/ExpiryDate`), expiryDate);
          }
      
          notifySuccess();
        //   setTimeout(function () {
        //     navigate("/SuperAdmin/ViewAll");
        //   }, 2100);
        }
      };

      // Helper function to generate a license key (you can customize this as per your requirements)
const generateLicenseKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const keyLength = 10;
    let licenseKey = '';
  
    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      licenseKey += characters[randomIndex];
    }
  
    return licenseKey;
  };

   // Helper function to format the date as "DD-MM-YYYY"
const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const calculateExpiryDate = (months) => {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + months, currentDate.getDate());
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

      const closeModal = () => {
        // Function to close the Modal
        setModalIsOpen(false);
      };

      const hasLicenseDetails = Object.keys(licenseDetails).length > 0;
      

  return (
    <>
      <h2 className="text-center h2addadmin license-details">License Details</h2>

      <Link to="/SuperAdmin/ViewAll" className="homeButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>
      
      <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="License Details Modal"
  className="custom-modal"
  overlayClassName="custom-modal-overlay"
>
  <h2 className="custom-modal-title">ATTENTION</h2>
  <p className="custom-modal-text">Admin doesn't have a license.</p>
  <p className="custom-modal-text">Add/Renew license.</p>
  <button className="custom-modal-button" onClick={closeModal}>
    OK
  </button>
</Modal>


      <div >
        <form className="signupForm" onSubmit={handleSubmit}>
          <strong className="strongaddadmin">Admin's Name:</strong>
          <input
            className="inputaddadmin"
            type="text"
            id="FullName"
            name="FullName"
            readOnly
            placeholder="Admin Name"
            value={FullName || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">License Key:</strong>
          <input
            className="inputaddadmin"
            type="text"
            id="LicenseKey"
            name="LicenseKey"
            readOnly
            placeholder="License Key"
            value={licenseDetails.LicenseKey || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Expiry Date:</strong>
          <input
            className="inputaddadmin"
            type="text"
            id="ExpiryDate"
            name="ExpiryDate"
            placeholder="Expiry Date"
            readOnly
            value={licenseDetails.ExpiryDate || ""}
            onChange={handleInputChange}
          />

          <strong className="strongaddadmin">Issue Date:</strong>
          <input
            className="inputaddadmin"
            type="text"
            id="IssueDate"
            name="IssueDate"
            placeholder="Issue Date"
            readOnly
            value={licenseDetails.IssueDate || ""}
            onChange={handleInputChange}
          />

<div className="checkbox-container">
  <input
    type="checkbox"
    className="custom-checkbox"
    id="generateLicense"
    checked={generateLicense}
    onChange={(e) => setGenerateLicense(e.target.checked)}
  />
  <label htmlFor="generateLicense" style={{ marginLeft: '8px', fontSize: '20px' }}>
          {hasLicenseDetails ? 'RENEW LICENSE' : 'ADD LICENSE'}
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

          <input className="addadminbtn" type="submit" value="Save" />
          <ToastContainer />
        </form>
      </div>
    </>
  );
}

export default LicenseDetails;
