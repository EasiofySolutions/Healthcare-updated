import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { db } from "../../firebase-config";
import { storage } from "../../firebase-config";
import {
  ref as ref_storage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ref,
  onValue,
  update,
  runTransaction,
  get,
  query,
  child,
  orderByValue,
  equalTo,
  set,
} from "firebase/database";
import "./AddImage.css";
import { ToastContainer, toast } from "react-toastify";
// import ProgressBar from "react-progressbar";
import Modal from "react-modal"; // Import the react-modal library
import { useNavigate } from "react-router-dom";

const initialState = {
  DoctorAssigned: "",
  FullName: "",
  ID: "",
  Role: "",
  Age: "",
  Dicom_3D: "",
  Dicom_Report: "",
  FolderPath: "",
  Type_of_CT: "",
  Gender: "",
  Refered_By_Doctor: "",
};

function AddImage() {
  const [state, setState] = useState(initialState);
  const [data, setData] = useState({});
  const [doc, setDoc] = useState();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedFileType, setSelectedFileType] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

  const fileInputRef = useRef(null);
  const page = new URLSearchParams(location.search).get("page");

  const ctTypes = [
    "Brain",
    "Chest",
    "Thorax",
    "PNS",
    "Temporal Bone",
    "Abdomen",
    "Pelvis",
    "Knee Joint",
    "Ankle Joint",
    "Face 3D",
    "Spine - C|D|L|S",
    "Neck",
    "Orbit",
  ];

  const {
    DoctorAssigned,
    FullName,
    ID,
    Role,
    Age,
    Dicom_3D,
    Dicom_Report,
    FolderPath,
    Type_of_CT,
    Refered_By_Doctor,
  } = state;

  // console.log("STATE", state);

  // const navigate = useNavigate();
  const { id } = useParams();

  var adminName1 = localStorage.getItem("adminName");
  var technicianName = localStorage.getItem("Name");

  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}/patients/`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setData({ ...snapshot.val() });
      } else {
        setData({});
      }
    });
    return () => {
      setData({});
    };
  }, [id, adminName1]);

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

  useEffect(() => {
    const docRef = ref(db, `superadmin/admins/${adminName1}/doctors`);
    onValue(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setDoc({ ...snapshot.val() });
      } else {
        setDoc({});
      }
    });
    return () => {
      setData({});
    };
  }, [id, adminName1]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleAgeUpdate = () => {
    // Get the updated age value from the state
    const updatedAge = state.Age;

    // Update the Age in the database
    update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
      Age: updatedAge,
    })
      .then(() => {
        toast.success("Age updated successfully", {
          position: "top-center",
        });
      })
      .catch((error) => {
        toast.error("Error updating age", {
          position: "top-center",
        });
        console.error("Error updating age:", error);
      });
  };

  // Gender Adding Code

  // Function to save the gender to the database
  const handleSaveGender = () => {
    const { Gender } = state;

    if (!Gender) {
      toast.error("Please select a gender", {
        position: "top-center",
      });
      return;
    }

    // Update the Gender in the database
    update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
      Gender,
    })
      .then(() => {
        toast.success("Gender saved successfully", {
          position: "top-center",
        });
        navigate();
      })
      .catch((error) => {
        toast.error("Error saving gender", {
          position: "top-center",
        });
        console.error("Error saving gender:", error);
      });
  };

  function fileValidation() {
    var fileInput = document.getElementById("files2");
    // console.log(fileInput);
    var filePath = fileInput.value;

    // Allowing file type
    var allowedExtensions = /(\.gltf|\.glb)$/i;

    if (!allowedExtensions.exec(filePath)) {
      toast.error("Invalid File Type, Select only .gltf or .glb file", {
        position: "top-center",
      });
      fileInput.value = "";
      return false;
    }
  }

  function fileValidation1() {
    var fileInput = document.getElementById("files1");
    var files = Array.from(fileInput.files);

    // Check if any files are selected
    if (files.length === 0) {
      toast.error("No files selected", { position: "top-center" });
      return false;
    }

    // Check if the first selected file is a folder
    if (!files[0].webkitRelativePath.includes("/")) {
      toast.error("Please select a folder", { position: "top-center" });
      fileInput.value = "";
      return false;
    }

    // Check if the files inside the folder are DICOM files
    var isDICOMFolder = true;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = file.name.toLowerCase();
      var fileExtension = fileName.split(".").pop();

      // Check if the file is a DICOM file
      if (fileExtension !== "dcm") {
        isDICOMFolder = false;
        break;
      }
    }

    if (!isDICOMFolder) {
      toast.error("Invalid folder contents. Only DICOM files are allowed", {
        position: "top-center",
      });
      fileInput.value = "";
      return false;
    }

    return true;
  }

  const notifySuccess = () =>
    toast.success("Doctor Assigned Successfully", {
      position: "top-center",
    });

  // CODE FOR DOCTOR ASSIGN

  var handleAssingedDoc = (e) => {
    e.preventDefault();
    var DoctorAssigned = document.getElementById("DoctorAssigned").value;

    // Check if a doctor is selected
    if (!DoctorAssigned) {
      toast.error("SELECT A DOCTOR FIRST", { position: "top-center" });
      return;
    }

    async function addValue(value) {
      try {
        const valuesRef = ref(
          db,
          `superadmin/admins/${adminName1}/patients/${id}/DoctorAssigned/`
        );

        // Check if the doctor is already assigned to the patient
        const query1 = await get(
          query(child(valuesRef, "/"), orderByValue(), equalTo(value))
        );
        const existingAssignments = query1.val();
        if (existingAssignments) {
          // The doctor is already assigned to the patient, show an alert and return
          window.alert("This doctor is already assigned to the patient.");
          return;
        }

        runTransaction(valuesRef, (currentData) => {
          let currentMaxKey = 0;

          if (currentData) {
            Object.keys(currentData).forEach((key) => {
              const currentKey = parseInt(key, 10);
              if (!isNaN(currentKey) && currentKey > currentMaxKey) {
                currentMaxKey = currentKey;
              }
            });
          }

          if (!currentData) {
            update(
              ref(
                db,
                `superadmin/admins/${adminName1}/patients/${id}/DoctorAssigned`
              ),
              {
                0: DoctorAssigned,
              }
            );
          } else {
            currentData[currentMaxKey + 1] = value;
            return currentData;
          }
        });
        notifySuccess();
        navigate();
        // setTimeout(function () {
        //   navigate("/Technician");
        // }, 2100);
      } catch (error) {
        alert(
          "Error Assigning Doctor, ask Admin to Delete already assigned doctor if any from the database.",
          error
        );
      }
    }

    addValue(DoctorAssigned);
  };

  // CODE FOR TYPE OF CT SELECTION

  const handleTypeOfCT = (e) => {
    e.preventDefault();
    const typeOfCT = document.getElementById("TypeOfCT").value;

    // Check if a valid CT type is selected
    if (!typeOfCT) {
      toast.error("Please select a Type of CT", {
        position: "top-center",
      });
      return;
    }

    // Save the selected Type of CT to the state
    setState({ ...state, TypeOfCT: typeOfCT });

    // Update the Type of CT in the database
    update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
      Type_of_CT: typeOfCT,
    })
      .then(() => {
        toast.success("Type of CT Added Successfully", {
          position: "top-center",
        });
      })
      .catch((error) => {
        toast.error("Error adding Type of CT", {
          position: "top-center",
        });
        console.error("Error adding Type of CT:", error);
      });
  };

  // FOR 3D GTLF FUNCTION

  var handleGltf = (e) => {
    e.preventDefault();

    // Check if a file is selected
    const fileInput = document.getElementById("files2");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      toast.error("Please Select a 3D File First", {
        position: "top-center",
      });
      return;
    }

    setModalIsOpen(true); // Open the modal when the upload starts
    var Dicom_3D = fileInput.files[0];
    update(
      ref(db, `superadmin/admins/${adminName1}/patients/${id}`),
      {
        Dicom_3D: Dicom_3D.name,
        Path3D: `superadmin/admins/${adminName1}/patients/${id}/${Dicom_3D.name}`,
      },
      (err) => {
        if (err) {
          toast.error(err, {
            position: "top-center",
          });
        } else {
          toast.success("GTLF Added Successfully", {
            position: "top-center",
          });
        }
      }
    );

    // DICOM GTLF 3D UPLOAD

    let file3D = document.getElementById("files2").files[0];
    let fileRef = ref_storage(
      storage,
      `superadmin/admins/${adminName1}/patients/${id}/` + file3D.name
    );

    const uploadTask = uploadBytesResumable(fileRef, file3D);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.floor(progress));
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((Dicom_3Durl) => {
          console.log("DICOM3D URL :", Dicom_3Durl);
          update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
            Dicom_3DURL: Dicom_3Durl,
          });
        });

        setModalIsOpen(false); // close the modal when the upload ends
        toast.success("GLTF Added Successfully", { position: "top-center" });
        navigate();
        // setTimeout(function () {
        //   navigate("/Technician");
        // }, 2100);
      }
    );
  };

  // FOR DICOM Folder FUNCTION

  // var handleFolder = async (e) => {
  //   e.preventDefault();

  //   // Check if files are selected
  //   const fileInput = document.getElementById("files1");
  //   if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
  //     toast.error("Please Select a Folder First", {
  //       position: "top-center",
  //     });
  //     return;
  //   }

  //   setModalIsOpen(true); // Open the modal when the upload starts
  //   var files = Array.from(fileInput.files);

  //   // Root folder path for the upload
  //   var rootFolderPath = `superadmin/admins/${adminName1}/patients/${id}/folder_${Date.now()}/`;

  //   try {
  //     // Update the database with root folder information
  //     await update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
  //       FolderPath: rootFolderPath,
  //     });

  //     // Upload each file, preserving the directory structure
  //     const uploadPromises = files.map((file) => {
  //       let filePath = rootFolderPath + file.webkitRelativePath; // Use the webkitRelativePath for the folder structure
  //       let fileRef = ref_storage(storage, filePath);
  //       const uploadTask = uploadBytesResumable(fileRef, file);

  //       return new Promise((resolve, reject) => {
  //         uploadTask.on(
  //           "state_changed",
  //           (snapshot) => {
  //             const progress =
  //               (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //             setUploadProgress(Math.floor(progress));
  //             console.log("Upload is " + progress + "% done");
  //           },
  //           (error) => {
  //             console.log(error);
  //             reject(error);
  //           },
  //           () => {
  //             getDownloadURL(uploadTask.snapshot.ref)
  //               .then((fileUrl) => {
  //                 // Optionally, update the database with file URLs
  //                 resolve();
  //               })
  //               .catch((error) => {
  //                 console.log(error);
  //                 reject(error);
  //               });
  //           }
  //         );
  //       });
  //     });

  //     await Promise.all(uploadPromises);
  //     await incrementTotalUploads();
  //     await uploadEvents();
  //   } catch (error) {
  //     toast.error(error.message || "An error occurred during the upload.", {
  //       position: "top-center",
  //     });
  //   } finally {
  //     setModalIsOpen(false); // Close the modal when the upload ends
  //     toast.success("Folder Added Successfully", { position: "top-center" });
  //     // Navigate to another page if needed
  //   }
  // };

  var handleFolder = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("files1");
    const patientName = document.getElementById("FullName").value; // Use the ID of your readOnly input

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      toast.error("Please Select a Folder First", {
        position: "top-center",
      });
      return;
    }

    if (!patientName) {
      toast.error("Please Enter Patient Name", {
        position: "top-center",
      });
      return;
    }

    setModalIsOpen(true);
    var files = Array.from(fileInput.files);

    var formData = new FormData();
    formData.append("adminName1", adminName1);
    formData.append("patientId", id);
    formData.append("timestamp", Date.now());

    files.forEach((file) => {
      formData.append("files", file, file.webkitRelativePath);
    });

    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress >= 95) {
        clearInterval(progressInterval);
      } else {
        progress += 5;
        setUploadProgress(progress);
      }
    }, 1000);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await response.json();

      toast.success(result.message || "Your file is ready!", {
        position: "top-center",
      });
      if (selectedFileType === "MRI") {
        await MRIuploadCount();
      } else if (selectedFileType === "CT") {
        await CTupload();
      } else if (selectedFileType === "CR") {
        await Xrayupload();
      }
      await update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
        Modality: selectedFileType,
      });
    } catch (error) {
      toast.error(error.message || "An error occurred during the upload.", {
        position: "top-center",
      });
    } finally {
      setModalIsOpen(false);
    }
    await incrementTotalUploads();
    await uploadEvents();
  };

  const MRIuploadCount = async () => {
    const totalUploadsRef = ref(
      db,
      `superadmin/admins/${adminName1}/costing/MriUploads`
    );
    try {
      const snapshot = await get(totalUploadsRef);

      const currentUploads = Number(snapshot.val()) || 0;
      await set(totalUploadsRef, currentUploads + 1);
      console.log("Total uploads incremented successfully.");
    } catch (error) {
      console.error("Failed to increment total uploads:", error);
    }
  };

  const CTupload = async () => {
    const totalUploadsRef = ref(
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
    const totalUploadsRef = ref(
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
    const totalUploadsRef = ref(
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
  const uploadEvents = async () => {
    try {
      console.log("Technician Name:", technicianName);
      console.log("Full Name:", FullName);

      if (!technicianName || !FullName) {
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
      const monthRef = ref(db, monthPath);

      console.log("Month Reference:", monthPath);

      const snapshot = await get(child(monthRef, "/"));
      const nextIndex = snapshot.exists() ? snapshot.size : 0;

      const uploadData = {
        TechnicianName: `${technicianName}`,
        PatientName: ` ${FullName}`,
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

  // FOR REPORT FUNCTION

  var handleReport = (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("files3");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      toast.error("Please Select a File First", {
        position: "top-center",
      });
      return;
    }

    setModalIsOpen(true);
    var Dicom_Report = fileInput.files[0];
    update(
      ref(db, `superadmin/admins/${adminName1}/patients/${id}`),
      {
        Dicom_Report: Dicom_Report.name,
        PathReport: `superadmin/admins/${adminName1}/patients/${id}/${Dicom_Report.name}`,
      },
      (err) => {
        if (err) {
          toast.error(err, {
            position: "top-center",
          });
        } else {
          toast.success("Report Added Successfully", {
            position: "top-center",
          });
        }
      }
    );

    // DIAGNOSTIC REPORT UPLOAD

    let fileReport = document.getElementById("files3").files[0];
    let fileRef2 = ref_storage(
      storage,
      `superadmin/admins/${adminName1}/patients/${id}/` + fileReport.name
    );

    const uploadTask2 = uploadBytesResumable(fileRef2, fileReport);
    uploadTask2.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.floor(progress));

        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask2.snapshot.ref).then((Reporturl) => {
          console.log("REPORT URL -", Reporturl);
          update(ref(db, `superadmin/admins/${adminName1}/patients/${id}`), {
            Dicom_ReportURL: Reporturl,
          });
        });

        setModalIsOpen(false); // close the modal when the upload ends
        toast.success("Report Added Successfully", { position: "top-center" });
        navigate();
        // setTimeout(function () {
        //   navigate("/Technician");
        // }, 2100);
      }
    );
  };
  const handleFileSelect = (event) => {
    if (!selectedFileType) {
      setModalVisible(true);
      event.preventDefault(); // Stop the file dialog from opening
    } else {
      // If selectedFileType is already set, proceed to open the file dialog.
      fileInputRef.current?.click();
    }
  };

  // Using useEffect to open the file dialog when selectedFileType changes
  useEffect(() => {
    if (selectedFileType) {
      fileInputRef.current?.click();
    }
  }, [selectedFileType]);

  const handleTypeSelect = (type) => {
    setSelectedFileType(type);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setSelectedFileType(null); // Reset selectedFileType when closing the modal
    setModalVisible(false);
  };

  return (
    <>
      <h2 className="text-center h2addadmin1">ADD IMAGE</h2>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Uploading..."
        className="modalUpload" // Updated class name
        overlayClassName="modal-overlay" // Add overlay class (optional)
      >
        <div>
          <h2>Uploading...</h2>
          <div className="modal-upload-progress">
            <div
              className="bar"
              style={{ width: `${uploadProgress}%` }} // Dynamically set the width based on the upload progress
            ></div>
          </div>
          <span className="progress-percent">{uploadProgress}%</span>{" "}
          {/* Display the percentage */}
        </div>
      </Modal>

      {/* TO MAKE CSS CHANGES FOR BELOW LINK BUTTON , GO TO ADDPATIENTDETAILS.CSS in DOC PANEL*/}

      <Link
        to={`/Technician/ListOfPatient?page=${page}`}
        className="homeButton"
      >
        <span id="backText" className="backText">
          Back
        </span>
        <i id="backIcon" className="fas fa-long-arrow-alt-left fa-lg fa-2x"></i>
      </Link>

      <div>
        <form className="signupForm2">
          <strong className="strongaddadmin">Patient Name:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="FullName"
            name="FullName"
            placeholder="Patient Name"
            value={FullName || ""}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">Age:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="Age"
            name="Age"
            placeholder="Age"
            value={Age || ""}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="addimagebtn"
            onClick={handleAgeUpdate}
          >
            Update Age
          </button>

          {/* // Display the dropdown menu for selecting gender */}
          <strong className="strongaddadmin">Gender:</strong>
          <select
            className="inputaddadmin"
            name="Gender"
            value={state.Gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* // Add a button to save the selected gender */}
          <button
            type="button"
            className="addimagebtn"
            onClick={handleSaveGender}
          >
            Assign Gender
          </button>

          <strong className="strongaddadmin">ID:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="ID"
            name="ID"
            placeholder="Patient ID"
            value={ID || ""}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">Refered_By_Doctor:</strong>
          <input
            className="inputaddadmin inputPN"
            type="text"
            id="Refered_By_Doctor"
            name="Refered_By_Doctor"
            placeholder="Patient ID"
            value={Refered_By_Doctor || "NA"}
            onChange={handleInputChange}
            readOnly
          />

          <strong className="strongaddadmin">Assign Doctor:</strong>

          <select
            className="inputaddadmin"
            name="DoctorAssigned"
            id="DoctorAssigned"
            value={DoctorAssigned || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a doctor</option>
            <optgroup label="Assigned Doctors">
              {doc &&
                Object.keys(doc).map((doctor, index) => {
                  const doctorName = doc[doctor].Name;
                  const isAssigned =
                    (state.DoctorAssigned &&
                      state.DoctorAssigned.includes(doctorName)) ||
                    false;
                  if (isAssigned) {
                    return (
                      <option key={index} value={doctorName}>
                        {doctorName}
                      </option>
                    );
                  }
                  return null;
                })}
            </optgroup>
            <optgroup label="Unassigned Doctors">
              {doc &&
                Object.keys(doc).map((doctor, index) => {
                  const doctorName = doc[doctor].Name;
                  const isAssigned =
                    (state.DoctorAssigned &&
                      state.DoctorAssigned.includes(doctorName)) ||
                    false;
                  if (!isAssigned) {
                    return (
                      <option key={index} value={doctorName}>
                        {doctorName}
                      </option>
                    );
                  }
                  return null;
                })}
            </optgroup>
          </select>

          {/* <option key={index} value={doctorName} disabled={isAssigned}>
  {doctorName}
</option> */}

          <button
            type="submit"
            className="addimagebtn"
            onClick={handleAssingedDoc}
          >
            Assign Doctor
          </button>

          <input
            type="hidden"
            id="Role"
            name="Role"
            placeholder="Role"
            value={Role || ""}
            onChange={handleInputChange}
          />

          {/* <input
            type="hidden"
            id="Age"
            name="Age"
            placeholder="Age"
            value={Age || ""}
            onChange={handleInputChange}
          /> */}

          {/* Dropdown for Type of CT */}
          <strong className="strongaddadmin">Type of CT:</strong>
          <select
            className="inputaddadmin"
            name="TypeOfCT"
            id="TypeOfCT"
            value={state.TypeOfCT || ""}
            onChange={handleInputChange}
          >
            {state.Type_of_CT === "" ? (
              <option value="">Select Type of CT</option>
            ) : (
              <option value="">{state.Type_of_CT}</option>
            )}
            {ctTypes.map((ctType, index) => (
              <option key={index} value={ctType}>
                {ctType}
              </option>
            ))}
          </select>
          {Type_of_CT === "" ? (
            <button
              type="submit"
              className="addimagebtn"
              onClick={handleTypeOfCT} // Add the function to handle Type of CT selection
            >
              Add
            </button>
          ) : (
            <button
              type="submit"
              className="TechupdateBTN"
              onClick={handleTypeOfCT} // Add the function to handle Type of CT selection
            >
              Update
            </button>
          )}

          {Dicom_3D === "" ? (
            <>
              <strong className="strongaddadmin"> Select gltf:</strong>
              <input
                type="file"
                id="files2"
                name="files[]"
                placeholder="Dicom_3D"
                accept=".gltf,.glb"
                required
                onChange={fileValidation}
              />
              <button
                type="submit"
                className="addimagebtn"
                onClick={handleGltf}
              >
                ADD
              </button>
            </>
          ) : (
            <>
              <strong className="strongaddadmin">Already Added gltf:</strong>
              <input
                type="text"
                className="inputaddadmin inputPN"
                id="files22"
                name="files[]"
                placeholder="Dicom_3D"
                value={Dicom_3D || ""}
              />
              <input
                type="file"
                id="files2"
                name="files[]"
                placeholder="Dicom_3D"
                accept=".gltf,.glb"
                required
                onChange={fileValidation}
              />

              <button
                type="submit"
                className="TechupdateBTN"
                onClick={handleGltf}
              >
                UPDATE
              </button>
            </>
          )}
          {/* <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            multiple
            webkitdirectory="true"
          /> */}
          {modalVisible && (
            <div className="type-selection-modal">
              <h2>Select Type Of File</h2>
              <button onClick={() => handleTypeSelect("CT")}>CT</button>
              <button onClick={() => handleTypeSelect("MRI")}>MRI</button>
              <button onClick={() => handleTypeSelect("CR")}>CR</button>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          )}

          {FolderPath === "" ? (
            <>
              <strong className="strongaddadmin"> Select Dicom Folder:</strong>
              <input
                type="file"
                id="files1"
                name="files[]"
                placeholder="Dicom Folder"
                multiple
                webkitdirectory="true"
                // accept=".zip"
                required
                onChange={fileValidation1}
                onClick={handleFileSelect}
                ref={fileInputRef}
              />
              <button
                type="submit"
                className="addimagebtn"
                onClick={handleFolder}
              >
                ADD
              </button>
            </>
          ) : (
            <>
              <strong className="strongaddadmin">
                Already Added Dicom Folder:
              </strong>
              <input
                type="text"
                className="inputaddadmin inputPN"
                id="files11"
                name="files[]"
                placeholder="Dicom Folder"
                readOnly
                // value={FolderPath || ""}
              />
              <input
                type="file"
                id="files1"
                name="files[]"
                placeholder="Dicom_Zip"
                multiple
                webkitdirectory="true"
                // accept=".zip"
                required
                onChange={fileValidation1}
                onClick={handleFileSelect}
                ref={fileInputRef}
              />
              <button
                type="submit"
                className="TechupdateBTN"
                onClick={handleFolder}
              >
                UPDATE
              </button>
            </>
          )}

          {Dicom_Report === "" ? (
            <>
              <strong className="strongaddadmin"> Select Report:</strong>
              <input
                type="file"
                id="files3"
                name="files[]"
                placeholder="Dicom_Report"
                required
                // onChange={fileValidation}
              />
              <button
                type="submit"
                className="addimagebtn"
                onClick={handleReport}
              >
                ADD
              </button>
            </>
          ) : (
            <>
              <strong className="strongaddadmin">Already Added Report:</strong>
              <input
                type="text"
                className="inputaddadmin inputPN"
                id="files33"
                name="files[]"
                placeholder="Dicom_Report"
                value={Dicom_Report || ""}
              />
              <input
                type="file"
                id="files3"
                name="files[]"
                placeholder="Dicom_Report"
                required
                // onChange={fileValidation}
              />
              <button
                type="submit"
                className="TechupdateBTN"
                onClick={handleReport}
              >
                UPDATE
              </button>
            </>
          )}

          {/* <input className="addadminbtn" type="submit" value="Save" /> */}
          <ToastContainer />
        </form>
      </div>
    </>
  );
}

export default AddImage;
