import React, { useEffect, useState } from 'react';
import './DicomData.css'; // Import the CSS file

function DicomData() {
  const [adminsData, setAdminsData] = useState([]);

  useEffect(() => {
    // Fetch the JSON data from the public folder
    fetch('/dicom.json')
      .then((response) => response.json())
      .then((data) => {
        // Extract admins data including doctors and technicians
        const admins = Object.keys(data.superadmin.admins).map((adminKey) => {
          const admin = data.superadmin.admins[adminKey];

          // Extract doctors' data
          const doctors = Object.keys(admin.doctors).map((doctorKey) => {
            const doctor = admin.doctors[doctorKey];
            return {
              name: doctor.Name,
              email: doctor.Email,
              password: doctor.Password,
              role: doctor.Role,
            };
          });

          // Extract technicians' data
          const technicians = Object.keys(admin.technicians).map((techKey) => {
            const technician = admin.technicians[techKey];
            return {
              name: technician.Name,
              email: technician.Email,
              password: technician.Password,
              role: technician.Role,
            };
          });

          return {
            email: admin.Email,
            password: admin.Password,
            role: admin.Role,
            Name: admin.FullName,
            doctors,
            technicians,
          };
        });

        setAdminsData(admins);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="dicom-data-container"> {/* Apply a CSS class to the container */}
     
      {adminsData.map((admin, index) => (
        <div key={index} className="dicom-card">
          <h3 className="dicom-card-title">Admin {index + 1}</h3>
          <h5 className="dicom-admin-name">ADMIN NAME: {admin.Name.toUpperCase()}</h5>

          <div className="dicom-card-content">
            <div className="dicom-info-section">
              <h4>Admin Information:</h4>
              <ul className="dicom-info-list">
                <li>
                  Email: {admin.email}
                </li>
                <li>
                  Password: {admin.password}
                </li>
                
              </ul>
            </div>

            <div className="dicom-info-section">
  <h4>Doctors </h4>
  <ul className="dicom-info-list">
    {admin.doctors.map((doctor, doctorIndex) => (
      <li key={doctorIndex}>
        {doctorIndex + 1}. Name: {doctor.name}, <br /> Email: {doctor.email}, Password: {doctor.password},
      </li>
    ))}
  </ul>
</div>

<div className="dicom-info-section">
  <h4>Technicians </h4>
  <ul className="dicom-info-list">
    {admin.technicians.map((technician, techIndex) => (
      <li key={techIndex}>
        {techIndex + 1}. Name: {technician.name}, <br /> Email: {technician.email}, Password: {technician.password},
      </li>
    ))}
  </ul>
</div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default DicomData;
