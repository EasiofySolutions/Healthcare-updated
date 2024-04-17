import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { ref as sRef , getBlob } from 'firebase/storage';

import { db ,storage} from '../../firebase-config';
import './AdminPaymentReceipt.css'; // Make sure the path matches where your CSS file is located

const AdminPaymentReceipt = () => {
  const { id } = useParams();
  const [paymentDetails, setPaymentDetails] = useState([]);

  useEffect(() => {
    const paymentRef = ref(db, `superadmin/admins/${id}/payment`);
    const fetchPaymentDetails = () => {
      onValue(paymentRef, (snapshot) => {
        const payments = snapshot.val();
        const paymentList = [];
        for (let key in payments) {
          paymentList.push({ id: key, ...payments[key] });
        }
        setPaymentDetails(paymentList);
      });
    };

    fetchPaymentDetails();

    // Cleanup function to unsubscribe from the realtime listener when the component unmounts
    return () => off(paymentRef);
  }, [id]);

  const handleViewPdf = async (pdfPath) => {
    const pdfRef = sRef(storage, pdfPath); // Create a reference to the PDF file in Firebase Storage
  
    try {
      const blob = await getBlob(pdfRef); // Fetch the PDF as a blob
      const pdfUrl = URL.createObjectURL(blob); // Create a blob URL for the PDF
      window.open(pdfUrl, '_blank'); // Open the blob URL in a new tab/window
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };
  

  return (
    <div className="unique-payment-receipts-component">
      <Link to="/Admin" className="homeButton billing-backButton">
        <span id="backText" className="backText">Back</span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>
      <div className='admin-Payment-wrapper'>
        <div className="admin-payment-receipt-container">
          <h1 className="receipt-title">Payment Receipts - {id}</h1>

          <table className="admin-payment-receipt-table">
            <thead>
              <tr>
                <th>Sr. No</th> {/* Added header for serial numbers */}
                <th>Order ID</th>
                <th>Payment ID</th>
                <th>Date & Time</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paymentDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{index + 1}</td> {/* Outputs the serial number */}
                  <td>{detail.orderId}</td>
                  <td>{detail.paymentId}</td>
                  <td>{detail.paymentTimestamp}</td>
                  <td>
                    <div className="pdf-icon-container">
                      <button onClick={() => handleViewPdf(detail.pdfDownloadUrl)} className="pdf-icon-btn">
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );

};

export default AdminPaymentReceipt;
