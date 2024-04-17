import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { Link, useLocation } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import "./ModelViewer.css";

const initialState = {
  FullName: "",
  Age: "",
  Dicom_3DURL: "",
};

function ModelViewer() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true); // Add loading state

  const { FullName, Age, Dicom_3DURL } = state;
  const [databasePath, setDatabasePath] = useState("");

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const dicom_3DURL = decodeURIComponent(urlParams.get("url"));
    const regex = /superadmin\/admins\/[^/]+\/patients\/[^/]+/;
    const match = dicom_3DURL.match(regex);

    if (match) {
      const desiredPart = match[0];
      setDatabasePath(desiredPart);
    }
  }, [databasePath, location.search]);

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    const fetchDataAfterDelay = setTimeout(() => {
      const users = ref(db, databasePath);
      onValue(users, (snapshot) => {
        if (snapshot.exists()) {
          setState({ ...snapshot.val() });
        }
        setLoading(false); // Set loading to false after fetching
      });
    }, 1000);

    return () => clearTimeout(fetchDataAfterDelay);
  }, [databasePath]);

  return (
    <div className="ModelViewer">
      <h1 className="h2VIEW3D">3D View</h1>
      <Link to={"/DoctorPanel"} >
        <span id="backText-ModelViewer3D" className="backText">
          Back
        </span>
        <i
          id="backIcon-ModelViewer3D"
          className="fas fa-long-arrow-alt-left fa-lg fa-2x homeButton"
        ></i>
      </Link>

      <div id="card">
        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner"></div>
            <p>Loading 3D...</p>
          </div>
        ) : (
          <>
            <model-viewer
              src={Dicom_3DURL}
              alt="A 3D model"
              shadow-intensity="1"
              camera-controls
              auto-rotate
              ar
            ></model-viewer>
            <section id="attribution" className="attribution">
              <h2 className="h2VIEW3D1">
                <span className="SPANVIEW3D1"> Name: </span> {FullName}
              </h2>
              <h2 className="h2VIEW3D1">
                <span className="SPANVIEW3D1">Age:</span>
                {Age}
              </h2>
            </section>
          </>
          
        )}
      </div>
    </div>
  );
}

export default ModelViewer;
