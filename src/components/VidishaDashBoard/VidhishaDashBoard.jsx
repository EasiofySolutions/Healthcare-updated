import React, { useEffect, useState } from 'react';
import './VidhishaDashBoard.css';
import { db } from "../../firebase-config";
import { ref, onValue } from "firebase/database";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Navbar from './NavBar/Navbar';
import Sidebar from './Sidebar/Sidebar';



function VidhishaDashBoard() {
  const [PatientCount, setPatientCount] = useState(0);
  const [CTcount, setCTcount] = useState(0);
  const [DoctorsCount, setDoctorsCount] = useState(0);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  // FOR PATIENT COUNT

  useEffect(() => {
    const posts = ref(db, `superadmin/admins/Vidisha District Hospital/patients`);
    onValue(posts, (snapshot) => {
      // const data = snapshot.val();
      // console.log(data)
      const TotalPatients = 753;
      setPatientCount(TotalPatients)
    });
  }, []);

  // FOR CT-SCAN COUNT

  useEffect(() => {
    const posts = ref(db, `superadmin/admins/Vidisha District Hospital/patients`);
    onValue(posts, (snapshot) => {
      const data = snapshot.val();
      let count = 747; // initialize count to 0
      if (data) {
        Object.keys(data).forEach((patientId) => {
          const patient = data[patientId];
          if (patient.hasOwnProperty('FolderPath') && patient.FolderPath !== '') {
            count++; // increment count if FolderPath has a value
          }
        });
      }
      setCTcount(count)
    });
  }, []);

  // FOR REPORT COUNT

  useEffect(() => {
    const posts = ref(db, `superadmin/admins/Vidisha District Hospital/patients`);
    onValue(posts, (snapshot) => {
      const data = snapshot.val();
      let Reportcount = 28; // initialize count to 0
      if (data) {
        Object.keys(data).forEach((patientId) => {
          const patient = data[patientId];
          if (patient.hasOwnProperty('Dicom_Report') && patient.Dicom_Report !== '') {
            Reportcount++; // increment count if FolderPath has a value
          }
        });
      }
      setDoctorsCount(Reportcount)
    });
  }, []);

  // CHART OPTIONS

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Easiofy Database',
      },
    },
    scales: {
      y: {
        min: 0, // set the minimum value of the Y-axis scale here
        max: 900, // set the maximum value of the Y-axis scale here
        ticks: {
          precision: 0, // set the precision to 0 to display only integer values
        },
      },
    },
  };
  
  

  


  // Create a data object for the bar chart
  const data = {
    labels: ['Patient Count', 'CT-Scan Count', 'Doctors Count'],
    datasets: [
      {
        label: 'Count',
        data: [PatientCount, CTcount, DoctorsCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(53, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        barThickness: 100, // set the desired width of the bars here

        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        hoverBorderWidth: 2,
        hoverBorderColor: 'rgba(0, 0, 0, 0.4)'
      },
    ],
  };

  // Render the bar chart using the Bar component from the react-chartjs-2 library
  return (
    <>

      <Navbar />

      <div className='no-background-image'>

      <Sidebar />

        {/* CODE FOR BOXES */}

        <div className="containerDIVBOX">
          <div className="box">
            <h3>Patient's Count</h3>
            <div className="footer">
              <p>{PatientCount}</p>
            </div>
          </div>
          <div className="box">
            <h3>CT-Scan Count</h3>
            <div className="footer">
              <p>{CTcount}</p>
            </div>
          </div>
          <div className="box">
            <h3>Doctor's Count</h3>
            <div className="footer">
              <p>{DoctorsCount}</p>
            </div>
          </div>
        </div>

        {/* CODE FOR BAR CHART */}

        <div className='barChart container'>
          <Bar options={options} data={data} />
        </div>
      </div>

    </>
  );
}

export default VidhishaDashBoard;
