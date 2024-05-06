import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  get,
  off,
  onValue,
  ref as rtdbRef,
  set,
  child,
} from "firebase/database";
import { db } from "../../firebase-config";
import "./OrthancServerData.css";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "react-toastify";
import ErrorPage from "../../ErrorPage";
import { format, parse } from "date-fns";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

const extractName = (fullString) => {
  const match = fullString.match(/^[a-zA-Z.^ ]+/); // Removed the unnecessary backslash before '^'
  if (!match) return null;

  return match[0]
    .replace(/[^a-zA-Z ]+/g, " ") // Only allow letters and spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing spaces
};

const OrthancServerData = () => {
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalInstances, setTotalInstances] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState();
  const [loadingDots, setLoadingDots] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); //pagination state
  const [uploadSpinner, setUploadSpinner] = useState(false);
  const [firebasePatientData, setFirebasePatientData] = useState({}); // State for Firebase patient data
  const [doctorNamesList, setDoctorNamesList] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0 });

  var adminName1 = localStorage.getItem("adminName");
  var technicianName = localStorage.getItem("Name");

  const orthancServerURL = "http://localhost:8050";

  // Code for generating List of Doctors Name

  useEffect(() => {
    const path = `superadmin/admins/${adminName1}/doctors`;
    const databaseRef = rtdbRef(db, path);

    // Fetch data from Firebase
    const fetchDoctorNames = async () => {
      try {
        const snapshot = await get(databaseRef);
        const doctorsData = snapshot.val();

        // Map through each doctor and get their names
        const names = Object.values(doctorsData).map((doctor) => doctor.Name);

        // Update the state with the doctor names
        setDoctorNamesList(names);

        // Log the doctor names inside the useEffect
        console.log("DOCTOR'S LIST ---", names);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchDoctorNames(); // Call the fetchDoctorNames function
  }, []); // Empty dependency array means this effect runs once after the initial render

  // const successMessageShownRef = useRef(false);

  const instancesPerPage = 15; // Number of instances to display per page
  const visiblePageNumbers = 2; // Number of visible page numbers after the current page

  // Fetch Firebase data and set it in a state variable
  useEffect(() => {
    const folderPathRef = rtdbRef(
      db,
      `superadmin/admins/${adminName1}/patients`
    );
    const folderPathListener = onValue(folderPathRef, (snapshot) => {
      if (snapshot.exists()) {
        setFirebasePatientData(snapshot.val());
      }
    });

    return () => off(folderPathRef, "value", folderPathListener);
  }, [adminName1]);

  const handledownloadconfirmation = (studyInstanceUID, patientName) => {
    const confirmed = window.confirm(
      "Are you sure you want to download this study?"
    );
    if (confirmed) {
      downloadStudy(studyInstanceUID, patientName);
    }
  };

  const downloadStudy = async (studyInstanceUID, patientName) => {
    try {
      const link = document.createElement("a");
      link.href = `${orthancServerURL}/orthanc/studies/${studyInstanceUID}/archive`;
      link.download = `${patientName}.zip`;
      link.click();
    } catch (error) {
      console.error("Error initiating download:", error);
    }
  };

  const checkServerStatus = async () => {
    try {
      // Ensure this URL matches your Flask API configured route for health checks
      await axios.get(`http://127.0.0.1:5000/health`);
      return true; // Server is up
    } catch (error) {
      console.error("API server is down:", error);
      return false; // Server is down or unreachable
    }
  };

  const handleUploadConfirmation = async (
    studyInstanceUID,
    patientName,
    studyType,
    PatientID,
    PatientBirthDate,
    PatientSex,
    StudyDate,
    ReferringPhysicianName,
    patient,
    modality,
    StudyInstaceUID
  ) => {
    const serverActive = await checkServerStatus();
    if (!serverActive) {
      toast.error("Please start the server first", { position: "top-center" });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to upload this file?"
    );

    if (confirmed) {
      uploadStudy(
        studyInstanceUID,
        patientName,
        studyType,
        PatientID,
        PatientBirthDate,
        PatientSex,
        StudyDate,
        ReferringPhysicianName,
        patient,
        modality,
        StudyInstaceUID
      );
    }
  };

  useEffect(() => {
    let timerId;
    if (uploadMessage === "Please wait, getting files ready") {
      timerId = setInterval(() => {
        setLoadingDots((prevDots) =>
          prevDots.length >= 5 ? "" : prevDots + "."
        );
      }, 500);
    } else {
      setLoadingDots("");
      clearInterval(timerId);
    }

    return () => {
      clearInterval(timerId);
    };
  }, [uploadMessage]);

  // code for sanitizing the name and replacing all the slashes if there's any

  const sanitizeFirebaseKey = (key) => {
    // Replace slashes with underscores
    key = key.replace(/\//g, "_");
    return key;
  };

  const listenToProgress = (patientId) => {
    const eventSource = new EventSource(
      `http://127.0.0.1:5000/progress/${patientId}`
    );
    eventSource.onmessage = (event) => {
      try {
        const progressInfo = JSON.parse(event.data);

        // Update progress state only if valid
        if (progressInfo.total && progressInfo.completed !== undefined) {
          setProgress(progressInfo);

          setUploadMessage(
            `Uploading... (${progressInfo.completed} of ${progressInfo.total} uploaded)`
          );
        }
      } catch (error) {
        console.error("Error parsing progress data:", error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };
  };

  const uploadStudy = async (
    studyInstanceUID,
    patientName,
    studyType,
    StudyDate,
    PatientID,
    PatientBirthDate,
    PatientSex,
    ReferringPhysicianName,
    patient,
    modality,
    StudyInstaceUID
  ) => {
    // const sanitizedPatientName = extractName(patientName);
    // const patientKey = `Patient-${sanitizeFirebaseKey(sanitizedPatientName)}`;
    // setProgress({ total: 1, completed: 0 });
    // listenToProgress(patientKey);
    // const Gender = PatientSex;
    // var DateOfStudy = StudyDate;
    // DateOfStudy = format(
    //   parse(StudyDate, "yyyyMMdd", new Date()),
    //   "dd/MM/yyyy"
    // );

    // const genderLabel =
    //   Gender === "M" ? "Male" : Gender === "F" ? "Female" : "Unknown";
    // const birthDate = PatientBirthDate;
    // const age = new Date().getFullYear() - parseInt(birthDate.slice(0, 4), 10);
    // const studyFolderPath = `superadmin/admins/${adminName1}/patients/${patientKey}/folder_${Date.now()}/`;

    // const DoctorName = ReferringPhysicianName;
    // const currentTimestamp = new Date().toLocaleString("en-GB"); // Format the timestamp as "dd/mm/yyyy hh:mm:ss"

    // // Open the modal only when files are ready to be uploaded
    // setUploadMessage("Please wait, getting files ready");
    // setModalIsOpen(true);

    // const patientSnapshot = await get(
    //   rtdbRef(db, `superadmin/admins/${adminName1}/patients/${patientKey}`)
    // );
    // const patientExists = patientSnapshot.exists();

    // let uploadSuccessful = true;
    // let seriesInstanceUid = [];
    // let seriesDescription = [];
    // let seriesDescriptionMap = new Map(); // Map to hold series descriptions and their UIDs

    // try {
    //   const seriesListResponse = await axios.get(
    //     `${orthancServerURL}/orthanc/studies/${studyInstanceUID}`
    //   );
    //   const instancesToUpload = []; // Initialize the array to collect instances

    //   for (const series of seriesListResponse.data.Series) {
    //     const seriesInstanceUidres = await axios.get(
    //       `${orthancServerURL}/orthanc/series/${series}`
    //     );

    //     const seriesInstanceUID =
    //       seriesInstanceUidres.data.MainDicomTags.SeriesInstanceUID;

    //     seriesInstanceUid.push(seriesInstanceUID);
    //     const seriesDesc =
    //       seriesInstanceUidres.data.MainDicomTags.SeriesDescription;
    //     seriesDescription.push(seriesDesc);
    //     seriesDescriptionMap.set(seriesDesc, series); // Map series description to its UID

    //     const seriesInstanceListResponse = await axios.get(
    //       `${orthancServerURL}/orthanc/series/${series}/instances`
    //     );
    //     instancesToUpload.push(
    //       ...seriesInstanceListResponse.data.map((instance) => ({
    //         ...instance,
    //         seriesDescription: seriesDesc, // Store series description with the instance
    //       }))
    //     );
    //   }

    //   const totalInstances = instancesToUpload.length;
    //   let uploadedCount = 0;

    //   setTotalInstances(totalInstances);

    //   const formData = new FormData();
    //   formData.append("adminName1", adminName1);
    //   formData.append("patientId", patientKey);
    //   formData.append("timestamp", Date.now());
    //   formData.append("folderpath", studyFolderPath);
    //   formData.append("SeriesName", seriesDescription);

    //   const uploadPromises = instancesToUpload.map(async (instance, index) => {
    //     try {
    //       uploadedCount++;
    //       const remainingCount = totalInstances - uploadedCount;

    //       setRemainingCount(remainingCount);

    //       const instanceResponse = await axios.get(
    //         `${orthancServerURL}/orthanc/instances/${instance.ID}/file`,
    //         { responseType: "blob" }
    //       );
    //       formData.append(
    //         "files",
    //         new Blob([instanceResponse.data]),
    //         `${instance.seriesDescription}/${instance.ID}.dcm`
    //       );
    //     } catch (error) {
    //       console.error("Error uploading instance:", error);
    //       uploadSuccessful = false;
    //     }
    //   });

    //   await Promise.all(uploadPromises);

    //   const uploadResponse = await axios.post(
    //     "http://127.0.0.1:5000/uploadortho",
    //     formData,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //     }
    //   );

    //   if (uploadResponse.data.message) {
    //     console.log(uploadResponse.data.message);
    //   } else if (uploadResponse.data.error) {
    //     console.error(uploadResponse.data.error);
    //   }
    // } catch (error) {
    //   console.error("Error fetching study data:", error);
    //   toast.error("Data Uploading Failed...", { position: "top-center" });
    //   uploadSuccessful = false;
    // }
    const sanitizedPatientName = extractName(patientName);
    const patientKey = `Patient-${sanitizeFirebaseKey(sanitizedPatientName)}`;

    // Initialize progress state before listening
    setProgress({ total: 1, completed: 0 });
    listenToProgress(patientKey);

    const Gender = PatientSex;
    var DateOfStudy = StudyDate;
    DateOfStudy = format(
      parse(StudyDate, "yyyyMMdd", new Date()),
      "dd/MM/yyyy"
    );

    const genderLabel =
      Gender === "M" ? "Male" : Gender === "F" ? "Female" : "Unknown";
    const birthDate = PatientBirthDate;
    const age = new Date().getFullYear() - parseInt(birthDate.slice(0, 4), 10);
    const studyFolderPath = `superadmin/admins/${adminName1}/patients/${patientKey}/folder_${Date.now()}/`;

    const DoctorName = ReferringPhysicianName;
    const currentTimestamp = new Date().toLocaleString("en-GB");

    // Open the modal only when files are ready to be uploaded
    setUploadMessage("Please wait, getting files ready");
    setModalIsOpen(true);

    const patientSnapshot = await get(
      rtdbRef(db, `superadmin/admins/${adminName1}/patients/${patientKey}`)
    );
    const patientExists = patientSnapshot.exists();

    let uploadSuccessful = true;
    let seriesInstanceUid = [];
    let seriesDescription = [];
    let seriesDescriptionMap = new Map();

    try {
      const seriesListResponse = await axios.get(
        `${orthancServerURL}/orthanc/studies/${studyInstanceUID}`
      );
      const instancesToUpload = [];

      for (const series of seriesListResponse.data.Series) {
        const seriesInstanceUidres = await axios.get(
          `${orthancServerURL}/orthanc/series/${series}`
        );

        const seriesInstanceUID =
          seriesInstanceUidres.data.MainDicomTags.SeriesInstanceUID;

        seriesInstanceUid.push(seriesInstanceUID);
        const seriesDesc =
          seriesInstanceUidres.data.MainDicomTags.SeriesDescription;
        seriesDescription.push(seriesDesc);
        seriesDescriptionMap.set(seriesDesc, series);

        const seriesInstanceListResponse = await axios.get(
          `${orthancServerURL}/orthanc/series/${series}/instances`
        );
        instancesToUpload.push(
          ...seriesInstanceListResponse.data.map((instance) => ({
            ...instance,
            seriesDescription: seriesDesc,
          }))
        );
      }

      const totalInstances = instancesToUpload.length;
      let uploadedCount = 0;

      setProgress({ total: totalInstances, completed: 0 });

      const formData = new FormData();
      formData.append("adminName1", adminName1);
      formData.append("patientId", patientKey);
      formData.append("timestamp", Date.now());
      formData.append("folderpath", studyFolderPath);
      formData.append("SeriesName", seriesDescription);

      const uploadPromises = instancesToUpload.map(async (instance) => {
        try {
          uploadedCount++;
          const remainingCount = totalInstances - uploadedCount;

          setProgress((prev) => ({
            total: prev.total,
            completed: prev.completed + 1,
          }));

          const instanceResponse = await axios.get(
            `${orthancServerURL}/orthanc/instances/${instance.ID}/file`,
            { responseType: "blob" }
          );
          formData.append(
            "files",
            new Blob([instanceResponse.data]),
            `${instance.seriesDescription}/${instance.ID}.dcm`
          );
        } catch (error) {
          console.error("Error uploading instance:", error);
          uploadSuccessful = false;
        }
      });

      await Promise.all(uploadPromises);

      const uploadResponse = await axios.post(
        "http://127.0.0.1:5000/uploadortho",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.data.message) {
        console.log(uploadResponse.data.message);
      } else if (uploadResponse.data.error) {
        console.error(uploadResponse.data.error);
      }
    } catch (error) {
      console.error("Error fetching study data:", error);
      toast.error("Data Uploading Failed...", { position: "top-center" });
      uploadSuccessful = false;
    }
    if (uploadSuccessful) {
      const folderPath = `superadmin/admins/${adminName1}/patients/${patientKey}`;
      await set(rtdbRef(db, `${folderPath}/FolderPath`), studyFolderPath);

      // Upload was successful, save patient data
      if (!patientExists) {
        const patientData = {
          Age: age || "NA",
          Refered_By_Doctor: DoctorName || "NA",
          Dicom_3D: "",
          Dicom_3DURL: "",
          Dicom_Report: "",
          Dicom_ReportURL: "",
          Date: DateOfStudy || "",
          FolderPath: studyFolderPath,
          FullName: sanitizedPatientName,
          Gender: genderLabel || "",
          ID: PatientID || "",
          Timestamp: currentTimestamp, // Add the current timestamp
          Type_of_CT: studyType || "",
          Prescription: "",
          PrescriptionURL: "",
          Role: "Patient",
          MetaData_Orthanc:
            {
              ID: patient.ID,
              MainDicomTags: {
                PatientID: patient.MainDicomTags.PatientID,
                PaitentName: extractName(patient.MainDicomTags.PatientName),
                PatientBirthDate: patient.MainDicomTags.PatientBirthDate,
                PatientSex: patient.MainDicomTags.PatientSex,
              },
              StudyInstanceUID: StudyInstaceUID,
              SeriesInstaceUID: seriesInstanceUid,
            } || "",
          Version: "02",
          Modality:
            modality === "MR" ? "MRI" : modality === "CR" ? "XRAY" : modality,
        };
        await set(
          rtdbRef(db, `superadmin/admins/${adminName1}/patients/${patientKey}`),
          patientData
        );
      }

      const findMatchingDoctor = (referringPhysicianName, doctorNamesList) => {
        // console.log("List of Doctor ---",doctorNamesList)
        // Special case: if ReferringPhysicianName is "DR R K VERMA", assign to "Rajkumar Verma" and associates
        if (referringPhysicianName.toLowerCase() === "dr r k verma") {
          const rajkumarVermaSpecialization = "(Medicine)";
          const rajkumarVerma = `Rajkumar Verma ${rajkumarVermaSpecialization}`;

          const doctorsWithSameSpecialization = doctorNamesList.filter(
            (doctor) =>
              doctor.includes(rajkumarVermaSpecialization) &&
              doctor !== rajkumarVerma
          );

          return [rajkumarVerma, ...doctorsWithSameSpecialization];
        }

        if (!referringPhysicianName || doctorNamesList.length === 0) {
          return ["Doctor Common"]; // No referring physician name or no doctors in the list
        }

        const cleanReferringPhysicianName = cleanDoctorName(
          referringPhysicianName
        );
        const matchingDoctors = [];

        console.log(
          "Cleaned Referring Physician Name:",
          cleanReferringPhysicianName
        );

        const matchingFirstNames = [];
        let foundMatchOnFirstName = false;

        for (const doctorName of doctorNamesList) {
          const cleanDoctor = cleanDoctorName(doctorName);
          console.log("Cleaned Doctor Name:", cleanDoctor);

          const doctorTokens = cleanDoctor.split(" ");
          const referringPhysicianTokens =
            cleanReferringPhysicianName.split(" ");

          // Check if the first name from the referring physician name matches with the first name from the doctor name
          if (referringPhysicianTokens[0] === doctorTokens[0]) {
            foundMatchOnFirstName = true;
            matchingFirstNames.push(doctorName);
            console.log("Match found based on first name:", doctorName);
          }
        }

        // If there is only one match based on the first name, use that and add associated doctors
        if (matchingFirstNames.length === 1) {
          const matchingFirstName = matchingFirstNames[0];
          matchingDoctors.push(matchingFirstName);

          // Check for specialization and add other doctors with the same specialization
          const specializationMatch = /\(([^)]+)\)/.exec(matchingFirstName);
          if (specializationMatch) {
            const specialization = specializationMatch[1];
            const doctorsWithSameSpecialization = doctorNamesList.filter(
              (otherDoctor) =>
                otherDoctor.includes(`(${specialization})`) &&
                !matchingDoctors.includes(otherDoctor)
            );
            matchingDoctors.push(...doctorsWithSameSpecialization);
            console.log(
              "Doctors with the same specialization:",
              doctorsWithSameSpecialization
            );
          }
        } else if (matchingFirstNames.length > 1) {
          // If no match is found based on first name or multiple matches on the first name, check for both first name and last name
          for (const doctorName of matchingFirstNames) {
            const cleanDoctor = cleanDoctorName(doctorName);
            console.log("Cleaned Doctor Name:", cleanDoctor);

            const doctorTokens = cleanDoctor.split(" ");
            const referringPhysicianTokens =
              cleanReferringPhysicianName.split(" ");

            // Check if both first name and last name from the referring physician name match with the doctor name
            if (
              referringPhysicianTokens[0] === doctorTokens[0] &&
              referringPhysicianTokens[1] === doctorTokens[1]
            ) {
              matchingDoctors.push(doctorName);
              console.log(
                "Match found based on both first and last name:",
                doctorName
              );

              // Check for specialization and add other doctors with the same specialization
              const specializationMatch = /\(([^)]+)\)/.exec(doctorName);
              if (specializationMatch) {
                const specialization = specializationMatch[1];
                const doctorsWithSameSpecialization = doctorNamesList.filter(
                  (otherDoctor) =>
                    otherDoctor.includes(`(${specialization})`) &&
                    !matchingDoctors.includes(otherDoctor)
                );
                matchingDoctors.push(...doctorsWithSameSpecialization);
                console.log(
                  "Doctors with the same specialization:",
                  doctorsWithSameSpecialization
                );
              }

              // Break out of the loop once a match is found
              break;
            }
          }
        }

        // If no match is found in steps 1 and 2, check for last name only
        if (!foundMatchOnFirstName && matchingDoctors.length === 0) {
          for (const doctorName of doctorNamesList) {
            const cleanDoctor = cleanDoctorName(doctorName);
            console.log("Cleaned Doctor Name:", cleanDoctor);

            const doctorTokens = cleanDoctor.split(" ");
            const referringPhysicianTokens =
              cleanReferringPhysicianName.split(" ");

            // Check if the last name from the referring physician name matches with the last name from the doctor name
            if (
              referringPhysicianTokens.some((token) =>
                doctorTokens.includes(token)
              ) ||
              referringPhysicianTokens.some((token) =>
                cleanDoctor.endsWith(token)
              )
            ) {
              matchingDoctors.push(doctorName);
              console.log("Match found based on last name:", doctorName);

              // Check for specialization and add other doctors with the same specialization
              const specializationMatch = /\(([^)]+)\)/.exec(doctorName);
              if (specializationMatch) {
                const specialization = specializationMatch[1];
                const doctorsWithSameSpecialization = doctorNamesList.filter(
                  (otherDoctor) =>
                    otherDoctor.includes(`(${specialization})`) &&
                    !matchingDoctors.includes(otherDoctor)
                );
                matchingDoctors.push(...doctorsWithSameSpecialization);
                console.log(
                  "Doctors with the same specialization:",
                  doctorsWithSameSpecialization
                );
              }

              // Break out of the loop once a match is found
              break;
            }
          }
        }

        // If no match is found, add "Doctor Common" if present in the list
        const commonDoctor = "Doctor Common";
        if (
          matchingDoctors.length === 0 &&
          doctorNamesList.includes(commonDoctor)
        ) {
          matchingDoctors.push(commonDoctor);
          console.log("Common Doctor assigned");
        }

        return matchingDoctors.length > 0 ? matchingDoctors : null; // Return array or null
      };

      const cleanDoctorName = (name) => {
        // Implement any cleaning or formatting logic here (e.g., converting to lowercase)
        return name.toLowerCase();
      };

      const assignedDoctor = findMatchingDoctor(
        ReferringPhysicianName,
        doctorNamesList
      );

      if (assignedDoctor) {
        // Save the assigned doctor in the Realtime Database
        await set(
          rtdbRef(
            db,
            `superadmin/admins/${adminName1}/patients/${patientKey}/DoctorAssigned`
          ),
          assignedDoctor
        );
      } else {
        console.warn(`No matching doctor found for ${ReferringPhysicianName}`);
      }

      // Update local state immediately after successful upload
      setFirebasePatientData((prevData) => ({
        ...prevData,
        [patientKey]: {
          ...prevData[patientKey],
          FolderPath: studyFolderPath,
        },
      }));

      console.log("FolderPath updated in Realtime Database");
      console.log("Study DICOM images uploaded to Firebase Storage");

      // Check if the success message has already been shown using the ref
      // if (!successMessageShownRef.current) {
      //   successMessageShownRef.current = true;
      setModalIsOpen(false);
      if (uploadSuccessful) {
        switch (modality) {
          case "MR":
            await MRIuploadCount(); // Increment MRI count
            break;
          case "CT":
            await CTupload(); // Increment CT count
            break;
          case "CR":
            await Xrayupload(); // Increment X-ray count
            break;
          default:
            console.log("Unknown Modality");

            break;
        }
      }
      await incrementTotalUploads();
      await uploadEvents(sanitizedPatientName);
      toast.success("Files Uplaoded SuccessFully", { position: "top-center" });
    }
  };

  const MRIuploadCount = async () => {
    const totalUploadsRef = rtdbRef(
      db,
      `superadmin/admins/${adminName1}/costing/MriUploads`
    );
    try {
      const snapshot = await get(totalUploadsRef);
      // Convert the value to a number before incrementing
      const currentUploads = Number(snapshot.val()) || 0;
      await set(totalUploadsRef, currentUploads + 1);
      console.log("Total uploads incremented successfully.");
    } catch (error) {
      console.error("Failed to increment total uploads:", error);
    }
  };

  const CTupload = async () => {
    const totalUploadsRef = rtdbRef(
      db,
      `superadmin/admins/${adminName1}/costing/CTUploads`
    );
    try {
      const snapshot = await get(totalUploadsRef);
      // Convert the value to a number before incrementing
      const currentUploads = Number(snapshot.val()) || 0;
      await set(totalUploadsRef, currentUploads + 1);
      console.log("Total uploads incremented successfully.");
    } catch (error) {
      console.error("Failed to increment total uploads:", error);
    }
  };

  const Xrayupload = async () => {
    const totalUploadsRef = rtdbRef(
      db,
      `superadmin/admins/${adminName1}/costing/XrayUploads`
    );
    try {
      const snapshot = await get(totalUploadsRef);
      // Convert the value to a number before incrementing
      const currentUploads = Number(snapshot.val()) || 0;
      await set(totalUploadsRef, currentUploads + 1);
      console.log("Total uploads incremented successfully.");
    } catch (error) {
      console.error("Failed to increment total uploads:", error);
    }
  };

  const incrementTotalUploads = async () => {
    const totalUploadsRef = rtdbRef(
      db,
      `superadmin/admins/${adminName1}/costing/TotalUpload`
    );
    try {
      const snapshot = await get(totalUploadsRef);
      // Convert the value to a number before incrementing
      const currentUploads = Number(snapshot.val()) || 0;
      await set(totalUploadsRef, currentUploads + 1);
      console.log("Total uploads incremented successfully.");
    } catch (error) {
      console.error("Failed to increment total uploads:", error);
    }
  };
  //upload events
  const uploadEvents = async (sanitizedPatientName) => {
    try {
      console.log("Technician Name:", technicianName);
      console.log("Full Name:"); //Pass paitent name here

      if (!technicianName || !sanitizedPatientName) {
        console.error("TechnicianName or FullName is null or undefined");
        return;
      }

      const currentDate = new Date();
      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const currentMonth = monthNames[currentDate.getMonth()];
      const currentYear = currentDate.getFullYear();

      const monthPath = `superadmin/admins/${adminName1}/costing/Upload_Events/${currentMonth} ${currentYear}`;
      const monthRef = rtdbRef(db, monthPath);

      console.log("Month Reference:", monthPath);

      const snapshot = await get(child(monthRef, "/"));
      const nextIndex = snapshot.exists() ? snapshot.size : 0;

      const uploadData = {
        TechnicianName: `${technicianName}`,
        PatientName: ` ${sanitizedPatientName}`,
        timeStamp: `${String(currentDate.getDate()).padStart(2, "0")}/${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}/${currentDate.getFullYear()}, ${String(
          currentDate.getHours()
        ).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(
          2,
          "0"
        )}:${String(currentDate.getSeconds()).padStart(2, "0")}`,
      };

      await set(child(monthRef, `/${nextIndex}`), uploadData);

      console.log("Upload event added successfully.");
    } catch (error) {
      console.error("Failed to upload event:", error);
    }
  };

  useEffect(() => {
    if (patientsData.length === 0) {
      const fetchSeriesForStudy = async (studyID) => {
        try {
          const response = await axios.get(
            `${orthancServerURL}/orthanc/studies/${studyID}/series`
          );
          return response.data;
        } catch (error) {
          console.error(`Error fetching series for study ${studyID}:`, error);
          return [];
        }
      };

      const fetchPatientsData = async () => {
        try {
          const response = await axios.get(
            `${orthancServerURL}/orthanc/patients`
          );
          const patientIDs = response.data;
          const patientsWithDetails = await Promise.all(
            patientIDs.map(async (patientID, index) => {
              const patientDataResponse = await axios.get(
                `${orthancServerURL}/orthanc/patients/${patientID}`
              );
              const studies = await fetchStudiesForPatient(patientID);
              const studiesWithDetails = await Promise.all(
                studies.map(async (study) => {
                  const series = await fetchSeriesForStudy(study.ID); // Fetch series for the current study
                  const firstSeriesModality =
                    series.length > 0
                      ? series[0].MainDicomTags.Modality
                      : "N/A";

                  // Here we console log the StudyInstanceUID for each study
                  // console.log(
                  //   "StudyInstanceUID:",
                  //   study.MainDicomTags.StudyInstanceUID
                  // );

                  return {
                    ...study,
                    FirstSeriesModality: firstSeriesModality,
                    StudyInstanceUID: study.MainDicomTags.StudyInstanceUID, // Ensure this line captures StudyInstanceUID
                  };
                })
              );
              const studiesWithType = studiesWithDetails.map((study) => ({
                ...study,
                type: study.MainDicomTags.StudyDescription,
              }));
              return {
                ...patientDataResponse.data,
                PatientName: extractName(
                  patientDataResponse.data.MainDicomTags.PatientName
                ),
                Studies: studiesWithType,
                originalIndex: index,
              };
            })
          );

          setPatientsData(patientsWithDetails);

          setLoading(false);
          localStorage.setItem(
            "patientsData",
            JSON.stringify(patientsWithDetails)
          );
          setUploadSpinner(true); // Start showing the spinner
        } catch (error) {
          console.error("Error fetching patient data:", error);
          setError(error);
        }
      };

      const fetchStudiesForPatient = async (patientID) => {
        try {
          const response = await axios.get(
            `${orthancServerURL}/orthanc/patients/${patientID}/studies`
          );
          return response.data;
        } catch (error) {
          console.error("Error fetching studies for patient:", error);
          return [];
        }
      };

      fetchPatientsData();
    } else {
      setLoading(false);
    }
  }, [patientsData]);

  //console.log(patientsData);

  // CODE FOR UPLOADING ENTIRE PATIENT'S STUDIES ON PAGE LOAD

  // Function to upload studies for patients with empty FolderPath
  const uploadStudiesForPatientsWithEmptyFolderPath = async (
    patientsToUpload
  ) => {
    if (patientsToUpload.length === 0) {
      // All patients have been processed, exit the function
      setUploadSpinner(false);
      return;
    }

    const patient = patientsToUpload[0]; // Get the first patient in the queue
    const remainingPatients = patientsToUpload.slice(1); // Get the remaining patients

    for (const study of patient.Studies) {
      await uploadStudy(
        study.ID,
        patient.MainDicomTags.PatientName,
        study.type,
        study.MainDicomTags.StudyDate,
        patient.MainDicomTags.PatientID,
        patient.MainDicomTags.PatientBirthDate,
        patient.MainDicomTags.PatientSex,
        study.MainDicomTags.ReferringPhysicianName,
        patient,
        study.FirstSeriesModality,
        study.StudyInstanceUID
      );
    }

    // Call the function recursively with the remaining patients
    uploadStudiesForPatientsWithEmptyFolderPath(remainingPatients);
  };

  useEffect(() => {
    const delay = 9000; // 9 seconds in milliseconds
    const timerId = setTimeout(async () => {
      const patientsToUpload = patientsData.filter((patient) => {
        const patientKey = `Patient-${extractName(
          patient.MainDicomTags.PatientName
        )}`;
        const folderPath = firebasePatientData[patientKey]?.FolderPath;
        return !folderPath || folderPath.trim() === "";
      });

      const totalPatients = patientsToUpload.length;
      const uploadedPatients = patientsData.length - totalPatients;

      const confirmed = window.confirm(`
        Are you sure you want to upload the following patient studies?
        Total Patients to Upload: ${totalPatients}
        Patients Already Uploaded: ${uploadedPatients}
      `);

      if (confirmed) {
        const serverActive = await checkServerStatus();
        if (!serverActive) {
          toast.error("Please start the server first", {
            position: "top-center",
          });
          setUploadSpinner(false);
          return;
        }
        uploadStudiesForPatientsWithEmptyFolderPath(patientsToUpload);
      }
      setUploadSpinner(false);
    }, delay);

    return () => clearTimeout(timerId);
  }, [patientsData]);

  useEffect(() => {
    const cachedData = localStorage.getItem("patientsData");
    if (cachedData) {
      setPatientsData(JSON.parse(cachedData));
      setLoading(false);
    }
  }, []);

  if (error) {
    return <ErrorPage />;
  }

  const filterPatientsBySearchQuery = (query) => {
    return patientsData.filter((patient) =>
      patient.MainDicomTags.PatientName.toLowerCase().includes(
        query.toLowerCase()
      )
    );
  };

  const totalPages = Math.ceil(
    filterPatientsBySearchQuery(searchQuery).length / instancesPerPage
  );

  const startIndex = (currentPage - 1) * instancesPerPage;
  const endIndex = startIndex + instancesPerPage;

  const currentInstances = filterPatientsBySearchQuery(searchQuery).slice(
    startIndex,
    endIndex
  );
  // console.log("Current instances ---", currentInstances)
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-fluid">
      <h2 className="text-center adminlist">Orthanc Patient List</h2>

      {/* Code for Automate Upload Spinner */}

      {uploadSpinner && (
        <div className="AutomateUpload-modal-overlay">
          <LoadingSpinner />
        </div>
      )}

      {/* Code for Back button appearing on top */}
      <Link to="/Technician" className="homeButton">
        <span id="backText" className="backText">
          Back
        </span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>

      {/* Code for Search bar  */}
      <div className="DivsearchBarTechPanelOSD">
        <div className="search-bar searchBarTechPanelOSD">
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Code for modal showing while uploading the files  */}
      {modalIsOpen && (
        <div className="OrthancServerModal">
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Uploading..."
            className="modalUpload"
            overlayClassName="modal-overlay"
          >
            <div>
              <h2>
                {uploadMessage}
                {loadingDots}
              </h2>
              {uploadMessage !== "Please wait, getting files ready" && (
                <div>
                  <div className="modal-upload-progress">
                    <div
                      className="bar"
                      style={{
                        width: `${
                          (progress.completed / progress.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="progress-percent">
                    {Math.floor((progress.completed / progress.total) * 100)}%
                  </span>
                </div>
              )}

              <span className="upload-warning">
                DO NOT CLOSE OR RELOAD THE PAGE
              </span>
            </div>
          </Modal>
        </div>
      )}

      {/* Code for showing loading spinner while fetching data from orthanc */}
      {loading ? (
        <div className="spinner-overlay">
          <div className="spinner"></div>
          <p>Loading patient data...</p>
        </div>
      ) : (
        <div style={{ marginTop: "100px" }}>
          {/* code for patient list table  */}
          <table className="styled-table tableOrthancServerData">
            <thead>
              <tr>
                <th className="th-head T-NO">No.</th>
                <th className="th-head T-NAME">Name</th>
                <th>Uploaded</th>
                <th className="th-head T-ACTION-OSD">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentInstances.map((patient, index) => {
                const patientKey = `Patient-${extractName(
                  patient.MainDicomTags.PatientName
                )}`;

                const isPatientWithFolderPath =
                  firebasePatientData[patientKey] &&
                  firebasePatientData[patientKey].FolderPath !== "";

                return (
                  <tr key={patient.ID}>
                    <th className="INDEX" scope="row">
                      {patient.originalIndex + 1}
                    </th>
                    <td className="admin-name">
                      {extractName(patient.MainDicomTags.PatientName)}
                    </td>
                    <td>
                      {isPatientWithFolderPath && (
                        <span className="tick-mark-icon-forFirebaseConfirmation">
                          ✔️
                        </span>
                      )}
                    </td>
                    <td>
                      {patient.Studies.map((study) => (
                        <div key={study.ID}>
                          <button
                            className="btn btn-view"
                            onClick={() =>
                              handledownloadconfirmation(
                                study.ID,
                                extractName(patient.MainDicomTags.PatientName) // Corrected here
                              )
                            }
                          >
                            Download Study
                          </button>
                          <button
                            className="btn btn-view"
                            onClick={() =>
                              handleUploadConfirmation(
                                study.ID,
                                extractName(patient.MainDicomTags.PatientName),
                                study.type,
                                study.MainDicomTags.StudyDate,
                                patient.MainDicomTags.PatientID,
                                patient.MainDicomTags.PatientBirthDate,
                                patient.MainDicomTags.PatientSex,
                                study.MainDicomTags.ReferringPhysicianName,
                                patient,
                                study.FirstSeriesModality,
                                study.StudyInstanceUID
                              )
                            }
                          >
                            Upload Study
                          </button>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* code for pagination  */}
      <div className="pagination-center">
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {Array.from({ length: visiblePageNumbers * 2 + 1 }).map(
              (_, index) => {
                const page = currentPage - visiblePageNumbers + index;
                if (page >= 1 && page <= totalPages) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageClick(page)}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              }
            )}
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* code for bottom back button  */}
      <Link to="/Technician">
        <div className="container text-center mt-4">
          <button className="backbutton1">Back</button>
        </div>
      </Link>
    </div>
  );
};

export default OrthancServerData;
