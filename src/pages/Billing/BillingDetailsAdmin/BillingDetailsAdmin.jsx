/* eslint-disable */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ref, onValue, push } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { ref as databaseRef } from "firebase/database";
import { db, storage } from "../../../firebase-config";
import { useReactToPrint } from "react-to-print";
import "./BillingDetailsAdmin.css";
import axios from "axios";
import html2pdf from "html2pdf.js";

// Separate component for the receipt version
const PrintableReceipt = React.forwardRef(
  (
    {
      id,
      doctorData,
      totalViews,
      totalAmount,
      paymentId,
      orderId,
      paymentTimestamp, // add new props here
    },
    ref
  ) => {
    const headerContainerStyles = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "8px solid transparent", // Set border color to transparent
      background: "linear-gradient(to right, #436850 50%, black 50%)", // Gradient from green to black
      backgroundSize: "100% 8px", // The size of the gradient background (full width and 8px height)
      backgroundRepeat: "no-repeat", // Prevent the gradient background from repeating
      backgroundPosition: "bottom", // Position the background at the bottom of the element
      marginBottom: "20px",
      marginLeft: "15px",
      marginRight: "15px",
    };

    const logoAndNameContainerStyles = {
      display: "flex",
      alignItems: "center",
    };

    const logoStyles = {
      height: "auto", // Adjust height automatically to maintain aspect ratio
      width: "48px", // Adjust to the desired size
    };

    const companyNameStyles = {
      color: "#436850", // Green color for company name
      fontWeight: "bold",
      fontSize: "60px",
      marginLeft: "10px", // Space between logo and company name
    };

    const taglineStyles = {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#000", // Black color for tagline
      marginTop: "5px", // Space between the logo/name and the tagline
    };

    const contactDetailsStyles = {
      textAlign: "right",
      color: "#000", // Black color for contact details
      fontSize: "16px",
    };

    const boldDetailStyles = {
      fontWeight: "bold",
    };

    const usageSectionStyles = {
      margin: "0 80px", // Adds left and right margins to the usage section
      paddingBottom: "10px",
    };

    const transactionDetailContainerStyles = {
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#ffffff", // White background for the transaction detail section
      boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)", // subtle shadow for depth
      borderRadius: "8px",
      marginBottom: "40px",
    };

    const transactionDetailHeadingStyles = {
      marginBottom: "20px",
      color: "#333", // Darker text for better readability
      borderBottom: "2px solid #436850", // Use brand color for heading underline
      paddingBottom: "5px",
      fontSize: "22px",
      fontWeight: "bold", // Bold for headings
    };

    const transactionDetailLabelStyles = {
      display: "block",
      color: "#555", // Medium contrast for labels
      marginBottom: "2px",
    };

    const transactionDetailValueStyles = {
      color: "#000", // Black for important detail text
      fontWeight: "bold",
      marginBottom: "10px", // Space between each detail set
      fontSize: "16px",
    };

    // Convert timestamp to readable date string if needed
    const paymentDate = paymentTimestamp
      ? new Date(paymentTimestamp).toLocaleDateString("en-GB") +
        ", " +
        new Date(paymentTimestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "";

    return (
      <div
        id="printableReceipt"
        className="receipt-container"
        ref={ref}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header Section */}
        <div style={headerContainerStyles}>
          <div>
            <div style={logoAndNameContainerStyles}>
              <img src="/easiofy.png" alt="Easiofy Logo" style={logoStyles} />
              <span style={companyNameStyles}>EASIOFY</span>
            </div>
            <div style={taglineStyles}>Easiofy Solutions Pvt Ltd</div>
          </div>
          <div style={contactDetailsStyles}>
            <div style={boldDetailStyles}>
              I 1607, AVJ heights, sector <br /> zeta1, Greater Noida 201307
              <i
                className="fas fa-map-marker-alt"
                style={{ marginLeft: "5px" }}
              ></i>
            </div>
            <div>
              +91 99584 99337
              <i className="fas fa-phone" style={{ marginLeft: "5px" }}></i>
            </div>
            <div>
              noor.fatma@easiofy.com
              <i className="fas fa-envelope" style={{ marginLeft: "5px" }}></i>
            </div>
            <div>
              <a
                href="https://easiofy.com/"
                style={{ textDecoration: "none", color: "#333" }}
              >
                https://easiofy.com/
              </a>
              <i className="fas fa-globe" style={{ marginLeft: "5px" }}></i>
            </div>
          </div>
        </div>

        {/* Title and Usage Section */}
        <div style={usageSectionStyles}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "30px",
              fontWeight: "bold",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {`Payment Receipt`}
          </h2>

          {/* New Section for Payment Details */}
          <div style={transactionDetailContainerStyles}>
            <h3 style={transactionDetailHeadingStyles}>Transaction Details</h3>
            <div>
              <span style={transactionDetailLabelStyles}>Payment ID</span>
              <span style={transactionDetailValueStyles}>{paymentId}</span>
            </div>
            <div>
              <span style={transactionDetailLabelStyles}>Order ID</span>
              <span style={transactionDetailValueStyles}>{orderId}</span>
            </div>
            <div>
              <span style={transactionDetailLabelStyles}>Date</span>
              <span style={transactionDetailValueStyles}>{paymentDate}</span>
            </div>
          </div>

          <h2
            style={{
              textAlign: "center",
              fontSize: "17px",
              fontWeight: "bold",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {`Usage details for ${id}`}
          </h2>

          {/* Billing Details Table */}
          <table className="Billing-table">
            <thead>
              <tr>
                <th className="billing-heading">Viewed by Doctor</th>
                <th className="billing-heading" style={{ textAlign: "center" }}>
                  View Count
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(doctorData).map(
                ([doctorNameOrUID, { viewCount }]) => (
                  <tr key={doctorNameOrUID}>
                    <td>{doctorNameOrUID}</td>
                    <td style={{ textAlign: "center" }}>{viewCount}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <h5>Total Views: {totalViews}</h5>
          <div className="total-amount">
            <div>Total Amount Paid</div>
            <div>{`₹${totalAmount}`}</div>
          </div>
        </div>
      </div>
    );
  }
);

// separate component for the printable version
const PrintableBillingDetails = React.forwardRef(
  ({ id, doctorData, totalViews, totalAmount }, ref) => {
    const headerContainerStyles = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "8px solid transparent", // Keep your gradient or solid color as before
      background: "linear-gradient(to right, #436850 50%, black 50%)",
      backgroundSize: "100% 8px",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "bottom",
      marginBottom: "20px",
      width: "100%", // Ensure the header takes full width
    };

    // Styles for the rest of the content to be narrower
    const contentStyles = {
      margin: "0 auto", // Center the content
      maxWidth: "960px", // Adjust the max width as needed
      width: "100%", // Use full width up to the maxWidth
    };

    const logoAndNameContainerStyles = {
      display: "flex",
      alignItems: "center",
    };

    const logoStyles = {
      height: "auto", // Adjust height automatically to maintain aspect ratio
      width: "48px", // Adjust to the desired size
    };

    const companyNameStyles = {
      color: "#436850", // Green color for company name
      fontWeight: "bold",
      fontSize: "60px",
      marginLeft: "10px", // Space between logo and company name
    };

    const taglineStyles = {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#000", // Black color for tagline
      marginTop: "5px", // Space between the logo/name and the tagline
    };

    const contactDetailsStyles = {
      textAlign: "right",
      color: "#000", // Black color for contact details
      fontSize: "16px",
    };

    const boldDetailStyles = {
      fontWeight: "bold",
    };

    return (
      <div className="billing-container printing-div" ref={ref}>
        {/* Header Section */}
        <div style={headerContainerStyles}>
          <div>
            <div style={logoAndNameContainerStyles}>
              <img src="/easiofy.png" alt="Easiofy Logo" style={logoStyles} />
              <span style={companyNameStyles}>EASIOFY</span>
            </div>
            <div style={taglineStyles}>Easiofy Solutions Pvt Ltd</div>
          </div>
          <div style={contactDetailsStyles}>
            <div style={boldDetailStyles}>
              I 1607, AVJ heights, sector <br /> zeta1, Greater Noida 201307
              <span role="img" aria-label="Location">
                📍
              </span>
            </div>
            <div>
              +91 99584 99337
              <span role="img" aria-label="Phone">
                📞
              </span>
            </div>
            <div>
              noor.fatma@easiofy.com
              <span role="img" aria-label="Email">
                📧
              </span>
            </div>
            <div>
              <a
                href="https://easiofy.com/"
                style={{ textDecoration: "none", color: "#333" }}
              >
                https://easiofy.com/
              </a>
              <span role="img" aria-label="Website">
                💻
              </span>
            </div>
          </div>
        </div>

        {/* Wrap the rest of the content to control its width */}
        <div style={contentStyles}>
          <h2
            style={{ marginBottom: "30px", marginTop: "20px" }}
            className="BillingAdminName"
          >{`Billing Details for ${id}`}</h2>
          <table className="Billing-table">
            <thead>
              <tr>
                <th className="billing-heading">Viewed by Doctor</th>
                <th className="billing-heading">View Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(doctorData).map(
                ([doctorNameOrUID, { viewCount }]) => (
                  <tr key={doctorNameOrUID}>
                    <td>{doctorNameOrUID}</td>
                    <td style={{ textAlign: "center" }}>{viewCount}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <h5>Total Views: {totalViews}</h5>
          <div className="total-amount">
            <div>Total Amount to Pay</div>
            <div>{`₹${totalAmount}`}</div>
          </div>
        </div>
      </div>
    );
  }
);

function BillingDetailsAdmin({ id: propId }) {
  // Use id from params if available, otherwise use the prop
  const { id: paramsId } = useParams();
  const id = paramsId || propId;
  // console.log("ID ---",id)
  const [billingData, setBillingData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [printableVisible, setPrintableVisible] = useState(false);
  const componentRef = React.useRef();
  // State to manage visibility of patient information for each doctor
  const [showPatientInfo, setShowPatientInfo] = useState({});
  const [cpvNotSet, setCpvNotSet] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderPaymentInitialized, setIsLoaderPaymentInitialized] =
    useState(false);

  const receiptRef = React.useRef(); // Reference for the PrintableReceipt component
  const [receiptVisible, setReceiptVisible] = useState(false); // State to toggle visibility of PrintableReceipt

  // Add new state hooks to store the payment details
  const [paymentId, setPaymentId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [paymentTimestamp, setPaymentTimestamp] = useState("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isPaymentUpToDate, setIsPaymentUpToDate] = useState(false);

  // console.log("ORDER ID --", orderId)

  // Effect that triggers PDF generation when payment details are set
  useEffect(() => {
    // Check if all payment details are available
    if (orderId && paymentId && paymentTimestamp) {
      generatePDFandSave(orderId, paymentId, id);
    }
  }, [orderId, paymentId, paymentTimestamp, id]);

  const navigate = useNavigate();

  // UseEffect TO CAPTURE ADMINS EMAIL AND FULLNAME
  useEffect(() => {
    const userDetailsRef = ref(db, `superadmin/admins/${id}`);
    onValue(userDetailsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFullName(data.FullName || "");
        setEmail(data.Email || "");
      } else {
        console.log("No data available");
      }
      setIsLoading(false); // Update here once data is fetched or determined to be unavailable
    });
  }, [id]);

  // Function to toggle visibility for a specific doctor
  const togglePatientInfo = (doctorName) => {
    setShowPatientInfo((prevState) => ({
      ...prevState,
      [doctorName]: !prevState[doctorName],
    }));
  };

  const pageNotFoundStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
  };

  const headingStyles = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#fff",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
    marginBottom: "20px",
  };

  const descriptionStyles = {
    fontSize: "24px",
    color: "#fff",
    textAlign: "center",
    maxWidth: "600px",
    marginBottom: "30px",
  };

  const buttonStylesPNF = {
    padding: "15px 35px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#ff4081",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.2s ease-in-out",
  };

  const handleGoBack = () => {
    setCpvNotSet(false);
    navigate(-1);
  };

  const handlePrintReceipt = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => setReceiptVisible(false), // Hide receipt after printing
  });

  const showReceipt = () => {
    setReceiptVisible(true);
    handlePrintReceipt(); // Manually trigger the print when the button is clicked
  };

  const printBillingDetails = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => setPrintableVisible(false), // Hide printable version after printing
  });

  const showPrintable = () => {
    setPrintableVisible(true);
    printBillingDetails(); // Manually trigger the print when the button is clicked
  };

  const doctorsPerPage = 5;
  const pagesToShow = 3;

  // UseEffect to fetch and check for cpv, costing data and payment timestamp

  useEffect(() => {
    function parseTimestamp(timestampStr) {
      try {
        const [datePart, timePart] = timestampStr.split(", ");
        const [day, month, year] = datePart.split("/");
        const [hours, minutes, seconds] = timePart.split(":");
        return new Date(year, month - 1, day, hours, minutes, seconds);
      } catch (e) {
        return null; // Return null if parsing fails
      }
    }

    // Check for the presence of costing data and CPV set
    const usersRef = ref(db, `superadmin/admins/${id}/costing`);
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Check if CPV is not set or undefined
        if (data.CPV === "" || data.CPV === undefined) {
          setCpvNotSet(true);
          setIsLoading(false);
          return; // Do not proceed if CPV is not set
        }

        // Fetch the latest payment timestamp if CPV is set
        const paymentRef = ref(db, `superadmin/admins/${id}/payment`);
        onValue(paymentRef, (paymentSnapshot) => {
          let maxTimestamp = null;
          if (paymentSnapshot.exists()) {
            const payments = paymentSnapshot.val();
            Object.values(payments).forEach((payment) => {
              const paymentTime = parseTimestamp(payment.paymentTimestamp);
              if (
                paymentTime &&
                (!maxTimestamp || paymentTime > maxTimestamp)
              ) {
                maxTimestamp = paymentTime;
              }
            });
          }

          // If no valid latest payment timestamp is found, or no payment data exists
          if (!maxTimestamp) {
            // Simply display all costing data since CPV is set but no payments have been made
            setBillingData(data);
            setIsLoading(false);
            return;
          }

          // Filter the costing data based on the latest payment timestamp
          const filteredData = Object.keys(
            data.last_Viewed_Events || {}
          ).reduce((acc, month) => {
            const monthEntries = data.last_Viewed_Events[month];
            const filteredEntries = Object.keys(monthEntries).reduce(
              (monthAcc, index) => {
                const entry = monthEntries[index];
                const entryTime = parseTimestamp(entry.timestamp);
                if (entryTime && entryTime > maxTimestamp) {
                  monthAcc[index] = entry; // Include this entry
                }
                return monthAcc;
              },
              {}
            );
            if (Object.keys(filteredEntries).length > 0) {
              acc[month] = filteredEntries; // Include filtered entries
            }
            return acc;
          }, {});

          // After filtering the costing data based on the latest payment timestamp
          const filteredDataIsEmpty =
            Object.keys(filteredData).length === 0 &&
            Object.keys(filteredData).every(
              (month) => Object.keys(filteredData[month]).length === 0
            );
          setIsPaymentUpToDate(filteredDataIsEmpty); // Set based on whether filtered data is empty
          setBillingData({ ...data, last_Viewed_Events: filteredData });
          setIsLoading(false);
        });
      } else {
        // Costing data not present or CPV not set
        setCpvNotSet(true);
        setIsLoading(false);
      }
    });
  }, [id]);
  // Depend on `id` to re-fetch if it changes

  if (isLoading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
        <p>Please wait...</p>
      </div>
    ); // Simple loading indicator
  }

  // Before returning the main component content, check if the receipt is being generated or if payment is up to date
  if (isGeneratingReceipt) {
    // Return the loading/spinner or checkmark UI
  } else if (isPaymentUpToDate) {
    // Render the success message with centered content and full-page animated background
    return (
      <div className="success-theme">
        <div>
          {" "}
          {/* Wrapper for text content to align it properly */}
          <h1>Payments Up to Date &#10003;</h1>
          <p>Your payments are up to date. You don't have any pending bills.</p>
          <button className="go-back-btn" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Then follow up with your main component return logic

  if (!billingData || cpvNotSet) {
    return (
      <div style={pageNotFoundStyles}>
        <h1 style={headingStyles}>Billing Details Not Available</h1>
        <p style={descriptionStyles}>
          Billing details are not set for this admin.
        </p>
        <button style={buttonStylesPNF} onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    );
  }

  const { last_Viewed_Events, CPV } = billingData;

  // Check if last_Viewed_Events is defined and not an empty array
  if (!last_Viewed_Events || typeof last_Viewed_Events !== "object") {
    return (
      <div style={pageNotFoundStyles}>
        <h1 style={headingStyles}>Billing Details Not Available</h1>
        <p style={descriptionStyles}>
          Billing details are not set for this admin.
        </p>
        <button style={buttonStylesPNF} onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    );
  }

  const viewedData = Object.keys(last_Viewed_Events).flatMap((month) => {
    const monthEntries = last_Viewed_Events[month];
    return Object.keys(monthEntries).map((index) => {
      const { doctor, patient, timestamp } = monthEntries[index];
      return { doctor, patient, timestamp };
    });
  });

  console.log(viewedData); // Add this line to log the data

  const doctorData = viewedData.reduce(
    (accumulator, { doctor, patient, timestamp }) => {
      accumulator[doctor] = accumulator[doctor] || {
        entries: [],
        viewCount: 0,
      };
      accumulator[doctor].entries.push({ patient, timestamp });
      accumulator[doctor].viewCount += 1;
      return accumulator;
    },
    {}
  );

  // Calculate total views and total amount to pay
  const totalViews = Object.values(doctorData).reduce(
    (acc, { viewCount }) => acc + viewCount,
    0
  );
  const totalAmount = totalViews * CPV;

  // Calculate pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const paginatedDoctors = Object.entries(doctorData).slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const totalPages = Math.ceil(
    Object.entries(doctorData).length / doctorsPerPage
  );

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const getUniquePatients = (entries) => {
    const uniquePatients = [];
    entries.forEach(({ patient }) => {
      if (!uniquePatients.includes(patient)) {
        uniquePatients.push(patient);
      }
    });
    return uniquePatients;
  };

  // Dynamically load Razorpay script
  const loadRazorpayScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Handle Razorpay payment
  const handlePayment = async () => {
    setIsLoaderPaymentInitialized(true); // Show the loader when payment starts

    const scriptLoaded = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!scriptLoaded) {
      alert(
        "Failed to load Razorpay SDK. Please check your internet connection."
      );
      setIsLoaderPaymentInitialized(false); // Hide the loader if the script loading fails
      return;
    }

    try {
      const orderResponse = await axios.post(
        "https://hqkcxtqdsi.execute-api.us-east-1.amazonaws.com/dev/create-order",
        {
          amount: totalAmount * 100, // Convert amount to paise
        }
      );
      const orderData = orderResponse.data;

      const options = {
        key: "rzp_test_0TrVVCr438tsgd",
        amount: orderData.amount,
        currency: "INR",
        name: "Easiofy Solution",
        description: `Bill Payment for ${id}`,
        image: `${window.location.origin}/easiofy.png`,
        order_id: orderData.id,
        prefill: {
          name: fullName,
          email: email,
        },
        theme: {
          color: "#3399cc",
        },
        handler: async (response) => {
          setIsLoaderPaymentInitialized(false);
          // Logic after successful payment
          const verificationResponse = await axios.post(
            "https://hqkcxtqdsi.execute-api.us-east-1.amazonaws.com/dev/verify-payment",
            {
              orderCreationId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }
          );

          if (verificationResponse.data.valid) {
            alert("Payment verified successfully");
            setPaymentId(response.razorpay_payment_id);
            setOrderId(orderData.id);
            setPaymentTimestamp(Date.now()); // set current timestamp or use server's response if available
          } else {
            alert("Payment verification failed.");
          }

          setIsLoaderPaymentInitialized(false); // Hide the loader after payment attempt
        },
        modal: {
          ondismiss: () => {
            setIsLoaderPaymentInitialized(false); // Hide the loader when the payment modal is dismissed without making a payment
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
      setIsLoaderPaymentInitialized(false); // Hide the loader if there's an error
    }
  };

  // function to generate the pdf
  const generatePDFandSave = async (orderId, paymentId, id) => {
    setIsGeneratingReceipt(true); // Indicate loading
    try {
      const element = document.getElementById("printableReceipt");
      const options = {
        margin: [0, 0, 2, 0],
        filename: `Receipt-${orderId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate PDF as a blob
      const blob = await html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .output("blob");

      // Define storage path
      const pdfPath = `superadmin/admins/${id}/Payment/Receipt-${orderId}.pdf`;

      // Upload PDF to Firebase Storage
      const pdfStorageRef = storageRef(storage, pdfPath);
      await uploadBytes(pdfStorageRef, blob);

      // Get PDF download URL
      const pdfDownloadUrl = await getDownloadURL(pdfStorageRef);

      // Format current date and time to match the costing timestamp format
      const formatDateTime = (date) =>
        `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}, ` +
        `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

      const Timestamp = formatDateTime(new Date());

      // Save payment details to Firebase Realtime Database
      const paymentDetailsRef = databaseRef(
        db,
        `superadmin/admins/${id}/payment`
      );
      await push(paymentDetailsRef, {
        orderId,
        paymentId,
        pdfDownloadUrl,
        paymentTimestamp: Timestamp, // Corrected use of Timestamp
      });

      console.log(
        "PDF uploaded, payment details saved, and payment details reset."
      );
    } catch (error) {
      console.error("Error generating or uploading PDF:", error);
    } finally {
      // Show the checkmark icon indicating the receipt is ready
      setShowCheckmark(true);

      // Set a timeout to navigate to the admin page after a short delay
      setTimeout(() => {
        navigate("/Admin"); // Navigate to the admin page
      }, 3000); // Delay in milliseconds (3000 milliseconds = 3 seconds)
    }
  };

  return (
    <>
      {isLoaderPaymentInitialized && (
        <div className="loader-payment-initialized-container">
          <div className="loader-payment-initialized">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </div>
      )}

      <div className="billing-body">
        <Link to="/Admin" className="homeButton billing-backButton">
          <span id="backText" className="backText">
            Back
          </span>
          <i
            id="backIcon"
            className="fas fa-long-arrow-alt-left fa-lg fa-2x"
          ></i>
        </Link>

        {isGeneratingReceipt && (
          <div className="payment-spinner-overlay">
            {!showCheckmark ? (
              <div className="payment-spinner-container">
                <div className="lds-ripple">
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : (
              <div className="payment-success-container">
                <div className="payment-success-icon">&#10003;</div>{" "}
                {/* Checkmark symbol */}
              </div>
            )}
            <div className="payment-message-container">
              <h2>
                {!showCheckmark ? "Generating Receipt..." : "Receipt Ready!"}
              </h2>
              <h5>You'll be redirected to the homepage shortly.</h5>
            </div>
          </div>
        )}

        {/* PrintableReceipt for generating PDF */}
        <div style={{ display: receiptVisible ? "block" : "none" }}>
          <PrintableReceipt
            ref={receiptRef}
            id={id}
            doctorData={doctorData}
            totalViews={totalViews}
            totalAmount={totalAmount}
            paymentId={paymentId}
            orderId={orderId}
            paymentTimestamp={paymentTimestamp}
          />
        </div>

        <div style={{ display: printableVisible ? "block" : "none" }}>
          <PrintableBillingDetails
            ref={componentRef}
            id={id}
            doctorData={doctorData}
            totalViews={totalViews}
            totalAmount={totalAmount}
          />
        </div>

        <div className="billing-container">
          <h2 className="BillingAdminName">{`Billing Details for ${id}`}</h2>

          {/* Buttons for printing and showing receipt */}
          <div className="actions">
            <button onClick={showPrintable} className="print-button">
              Click to Print
            </button>
            <button
              onClick={showReceipt}
              className="print-button"
              style={{ display: "none" }}
            >
              Generate Receipt
            </button>
          </div>

          <table className="Billing-table">
            <thead>
              <tr>
                <th className="billing-heading">Viewed by Doctor</th>
                <th style={{ textAlign: "center" }} className="billing-heading">
                  View Count
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDoctors.map(
                ([doctorNameOrUID, { entries, viewCount }]) => (
                  <React.Fragment key={doctorNameOrUID}>
                    <tr className="special-row">
                      <td>
                        <button
                          onClick={() => togglePatientInfo(doctorNameOrUID)}
                        >
                          {showPatientInfo[doctorNameOrUID] ? "-" : "+"}
                        </button>
                        {doctorNameOrUID}
                      </td>
                      <td style={{ textAlign: "center" }}>{viewCount}</td>
                    </tr>
                    {showPatientInfo[doctorNameOrUID] && (
                      <tr>
                        <td colSpan="2">
                          {/* Display patient name and timestamp here */}
                          <table className="Billing-table-inner">
                            <thead>
                              <tr>
                                <th>Name of Patient</th>
                                <th>Time of Viewing</th>
                                <th style={{ textAlign: "center" }}>
                                  View Count
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getUniquePatients(entries).map(
                                (patient, index) => (
                                  <tr key={index}>
                                    <td>{patient}</td>
                                    <td>
                                      <select>
                                        {entries
                                          .filter(
                                            (entry) => entry.patient === patient
                                          )
                                          .map((entry, index) => (
                                            <option key={index}>
                                              {entry.timestamp}
                                            </option>
                                          ))}
                                      </select>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                      {
                                        entries.filter(
                                          (entry) => entry.patient === patient
                                        ).length
                                      }
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="billing-pagination">
            <button
              className="billing-pagination-btn"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            {Array.from(
              { length: totalPages > pagesToShow ? pagesToShow : totalPages },
              (_, index) => (
                <button
                  key={index + 1}
                  className={`billing-pagination-btn ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              )
            )}
            {totalPages > pagesToShow && (
              <span className="billing-pagination-ellipsis">...</span>
            )}
            {totalPages > pagesToShow && (
              <button
                className={`billing-pagination-btn ${
                  currentPage === totalPages ? "active" : ""
                }`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button
              className="billing-pagination-btn"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <h5>Total Views : {totalViews}</h5>

          <div className="total-amount">
            <div>Total Amount to Pay</div>
            <div>{`₹${totalAmount}`}</div>
          </div>
          {/* Pay Now button */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => handlePayment(totalAmount)}
              className="pay-button btn btn-dark btn-lg"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BillingDetailsAdmin;
