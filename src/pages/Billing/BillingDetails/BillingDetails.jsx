import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../firebase-config';
import { useReactToPrint } from 'react-to-print';

// separate component for the printable version
const PrintableBillingDetails = React.forwardRef(({ id, doctorData, totalViews, totalAmount }, ref) => {
    return (
        <div className='billing-container printing-div' ref={ref}>
            <h2 style={{ marginBottom: "30px", marginTop: "20px" }} className='BillingAdminName'>{`Billing Details for ${id}`}</h2>
            <table className="Billing-table">
                <thead>
                    <tr>
                        <th className="billing-heading">Viewed by Doctor</th>
                        <th className="billing-heading">View Count</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(doctorData).map(([doctorNameOrUID, { viewCount }]) => (
                        <tr key={doctorNameOrUID}>
                            <td>{doctorNameOrUID}</td>
                            <td style={{ textAlign: 'center' }}>{viewCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h5>Total Views: {totalViews}</h5>
            <div className='total-amount'>
                <div>Total Amount to Pay</div>
                <div>{`₹${totalAmount}`}</div>
            </div>
        </div>
    );
});


function BillingDetails({ id: propId }) {
    
    // Use id from params if available, otherwise use the prop
    const { id: paramsId } = useParams();
    const id = paramsId || propId;
    const [billingData, setBillingData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [printableVisible, setPrintableVisible] = useState(false);
    const componentRef = React.useRef();
    // State to manage visibility of patient information for each doctor
    const [showPatientInfo, setShowPatientInfo] = useState({});
    const [cpvNotSet, setCpvNotSet] = useState(false);
    const navigate = useNavigate();

    // Function to toggle visibility for a specific doctor
    const togglePatientInfo = (doctorName) => {
        setShowPatientInfo(prevState => ({
            ...prevState,
            [doctorName]: !prevState[doctorName]
        }));
    };

    const pageNotFoundStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)',
    };

    const headingStyles = {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        marginBottom: '20px',
    };

    const descriptionStyles = {
        fontSize: '24px',
        color: '#fff',
        textAlign: 'center',
        maxWidth: '600px',
        marginBottom: '30px',
    };

    const buttonStylesPNF = {
        padding: '15px 35px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#ff4081',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'background-color 0.2s ease-in-out',
    };

    const handleGoBack = () => {
        setCpvNotSet(false);
        navigate(-1);
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

    const dbPath = `superadmin/admins/${id}/costing`;

    useEffect(() => {
        const users = ref(db, dbPath);
        onValue(users, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data && (data.CPV === "" || data.CPV === undefined)) {
                    setCpvNotSet(true);
                } else {
                    setBillingData({ ...data });
                }
            } else {
                setCpvNotSet(true);
            }
        });
    }, [id, dbPath]);

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
if (!last_Viewed_Events || typeof last_Viewed_Events !== 'object') {
    return (
        <div style={pageNotFoundStyles}>
            <h1 style={headingStyles}>No Billing Data Available</h1>
            <p style={descriptionStyles}>
                No billing data available for this admin.
            </p>
            <button style={buttonStylesPNF} onClick={handleGoBack}>
                Go Back
            </button>
        </div>
    );
}
    const viewedData = Object.keys(last_Viewed_Events).flatMap(month => {
        const monthEntries = last_Viewed_Events[month];
        return Object.keys(monthEntries).map(index => {
            const { doctor, patient, timestamp } = monthEntries[index];
            return { doctor, patient, timestamp };
        });
    });

    const doctorData = viewedData.reduce((accumulator, { doctor, patient, timestamp }) => {
        accumulator[doctor] = accumulator[doctor] || { entries: [], viewCount: 0 };
        accumulator[doctor].entries.push({ patient, timestamp });
        accumulator[doctor].viewCount += 1;
        return accumulator;
    }, {});

    // Calculate total views and total amount to pay
    const totalViews = Object.values(doctorData).reduce((acc, { viewCount }) => acc + viewCount, 0);
    const totalAmount = totalViews * CPV;

    // Calculate pagination
    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
    const paginatedDoctors = Object.entries(doctorData).slice(indexOfFirstDoctor, indexOfLastDoctor);

    const totalPages = Math.ceil(Object.entries(doctorData).length / doctorsPerPage);

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

    return (
        <div className='billing-body'>
            <Link to="/SuperAdmin/Billing" className="homeButton billing-backButton">
                <span id="backText" className="backText">Back</span>
                <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
            </Link>

            <div style={{ display: printableVisible ? 'block' : 'none' }}>
                <PrintableBillingDetails
                    ref={componentRef}
                    id={id}
                    doctorData={doctorData}
                    totalViews={totalViews}
                    totalAmount={totalAmount}
                />
            </div>

            <div className="billing-container">
                <h2 className='BillingAdminName'>{`Billing Details for ${id}`}</h2>

                <button onClick={showPrintable} className='print-button'>
                    Click to Print
                </button>

                <table className="Billing-table">
                    <thead>
                        <tr>
                            <th className="billing-heading">Viewed by Doctor</th>
                            <th style={{ textAlign: 'center' }} className="billing-heading">View Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDoctors.map(([doctorNameOrUID, { entries, viewCount }]) => (
                            <React.Fragment key={doctorNameOrUID}>
                                <tr className="special-row">
                                    <td>
                                        <button onClick={() => togglePatientInfo(doctorNameOrUID)}>
                                            {showPatientInfo[doctorNameOrUID] ? '-' : '+'}
                                        </button>
                                        {doctorNameOrUID}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{viewCount}</td>
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
                                                        <th style={{ textAlign: 'center' }}>View Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getUniquePatients(entries).map((patient, index) => (
                                                        <tr key={index}>
                                                            <td>{patient}</td>
                                                            <td>
                                                                <select>
                                                                    {entries
                                                                        .filter((entry) => entry.patient === patient)
                                                                        .map((entry, index) => (
                                                                            <option key={index}>{entry.timestamp}</option>
                                                                        ))}
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{entries.filter((entry) => entry.patient === patient).length}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="billing-pagination">
                    <button className="billing-pagination-btn" onClick={goToPreviousPage} disabled={currentPage === 1}>
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    {Array.from({ length: totalPages > pagesToShow ? pagesToShow : totalPages }, (_, index) => (
                        <button key={index + 1} className={`billing-pagination-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    {totalPages > pagesToShow && <span className="billing-pagination-ellipsis">...</span>}
                    {totalPages > pagesToShow && (
                        <button className={`billing-pagination-btn ${currentPage === totalPages ? 'active' : ''}`} onClick={() => setCurrentPage(totalPages)}>
                            {totalPages}
                        </button>
                    )}
                    <button className="billing-pagination-btn" onClick={goToNextPage} disabled={currentPage === totalPages}>
                        Next <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                <h5>Total Views : {totalViews}</h5>

                <div className="total-amount">
                    <div>Total Amount to Pay</div>
                    <div>{`₹${totalAmount}`}</div>
                </div>
            </div>
        </div>
    );
}

export default BillingDetails;
