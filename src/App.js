import "./App.css";
import React from "react";
import Login from "./components/Login-Page/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from './Home';
import ProtectedRoute from "./ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import SuperAdmin from "./components/SuperAdmin/SuperAdmin";
import AddAdmin from "./pages/AddAdmin/AddAdmin";
import ViewAllAdmin from "./pages/ViewAllAdmin/ViewAllAdmin";
import EditAdmin from "./pages/EditAdmin/EditAdmin";
import ViewSingleAdmin from "./pages/ViewSingleAdmin/ViewSingleAdmin";
import ViewDetail from "./pages/ViewSingleAdmin/ViewDetail";
import Admin from "./components/Admin/Admin";
import AddDoctor from "./AdminPages/AddDoctor/AddDoctor";
import AddPatient from "./AdminPages/AddPatient/AddPatient";
import AddTechnician from "./AdminPages/AddTechnician/AddTechnician";
import ViewAll from "./AdminPages/ViewAll/ViewAll";
import AssignDoctor from "./AdminPages/AssignDoctor/AssignDoctor";
import AssignDoctor1 from "./AdminPages/AssignDoctor/AssignDoctor1";
import ViewAdminDetail from "./AdminPages/ViewAll/ViewAdminDetail";
import Technician from "./components/Technician/Technician";
import ListOfPatient from "./TechnicianPages/ListOfPatient/ListOfPatient";
import OrthancServerData from "./TechnicianPages/OrthancServerData/OrthancServerData";
import AddImage from "./TechnicianPages/AddImage/AddImage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdatePageDoc from "./AdminPages/UpdatePageDoc/UpdatePageDoc";
import UpdatePagePatient from "./AdminPages/UpdatePagePatient/UpdatePagePatient";
import UpdatePageTech from "./AdminPages/UpdatePageTech/UpdatePageTech";
import DocPanel from "./components/DocPanel/DocPanel";
// import ListOfPatientDoc from "./DocPanelPages/ListOfPatientDoc/ListOfPatientDoc";
// import AddPatientDetails from './DocPanelPages/AddPatientDetails/AddPatientDetails';
import ModelViewer from "./DocPanelPages/ModelViewer/ModelViewer";
import VidhishaDashBoard from "./components/VidishaDashBoard/VidhishaDashBoard";
// import ReportHomePage from './ReportTemplates/ReportHomePage/ReportHomePage';
import AddPatientTech from "./TechnicianPages/AddPatientTech/AddPatientTech";
import LicenseDetails from "./pages/LicenseDetails/LicenseDetails";
import PageNotFound from "./PageNotFound";
import Billing from "./pages/Billing/Billing";
import BillingDetails from "./pages/Billing/BillingDetails/BillingDetails";
import BillingDetailsAdmin from "./pages/Billing/BillingDetailsAdmin/BillingDetailsAdmin";
import AdminBillingUsage from "./pages/AdminBillingUsage/AdminBillingUsage";
import AdminPaymentReceipt from "./pages/AdminPaymentReceipt/AdminPaymentReceipt";
import Unauthorized from "./unauthorized";
import GenerateLinkPatient from "./AdminPages/GenerateLinkPatient/GenerateLinkPatient";
import GeneratedPatientData from "./AdminPages/GeneratedPatientData/GeneratedPatientData";
import ModelViewerPatientView from "./AdminPages/GeneratedPatientData/ModelViewerPatientView";
import Cpu from "./pages/CostingTypes/Cost Per Upload/Cpu";
import Combine from "./pages/CostingTypes/Cpu+Cpv/Combine";

// import DicomData from './DicomData/DicomData';

function App() {
  return (
    <>
      <UserAuthContextProvider>
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route exact path="/" element={<Login />} />
              {/* <Route exact path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } /> */}

              {/* ROUTING FOR SUPERADMIN PAGE */}

              <Route
                exact
                path="/SuperAdmin"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <SuperAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                exact
                path="SuperAdmin/AddAdmin"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <AddAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                exact
                path="SuperAdmin/ViewAll"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <ViewAllAdmin />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/Billing"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <Billing />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/BillingDetails:id"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <BillingDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/EditAdmin:id"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <EditAdmin />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/ViewSingleAdmin:id"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <ViewSingleAdmin />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/ViewDetail:id"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <ViewDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="SuperAdmin/LicenseDetails:id"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <LicenseDetails />
                  </ProtectedRoute>
                }
              />

              {/* ROUTING FOR ADMIN PAGE */}

              <Route
                exact
                path="/Admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/AddDoctor"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddDoctor />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/Billing:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <BillingDetailsAdmin />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/CPU:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Cpu />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/Combine:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Combine />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/Usage:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBillingUsage />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/PaymentReceipt:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminPaymentReceipt />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/UpdatePageDoc:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UpdatePageDoc />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/AddPatient"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddPatient />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/UpdatePagePatient:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UpdatePagePatient />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/AddTechnician"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddTechnician />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/UpdatePageTech:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UpdatePageTech />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/AssignDoctor"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AssignDoctor />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/AssignDoctor1:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AssignDoctor1 />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/ViewAll"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ViewAll />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/ViewAdminDetail"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ViewAdminDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Admin/GenerateLink"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <GenerateLinkPatient />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/patient/:adminName/:patientId"
                element={<GeneratedPatientData />}
              />

              <Route
                exact
                path="/ModelViewer"
                element={<ModelViewerPatientView />}
              />

              {/* ROUTING FOR TECHNICIAN */}

              <Route
                exact
                path="/Technician"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <Technician />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Technician/AddPatient"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <AddPatientTech />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Technician/OrthancServerData"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <OrthancServerData />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Technician/ListOfPatient"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <ListOfPatient />
                  </ProtectedRoute>
                }
              />

              <Route
                exact
                path="/Technician/AddImage:id"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <AddImage />
                  </ProtectedRoute>
                }
              />

              {/* ROUTING FOR DOC PANEL */}

              <Route
                exact
                path="/DoctorPanel"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DocPanel />
                  </ProtectedRoute>
                }
              />

              {/* <Route exact path="/DoctorPanel/ListOfPatient" element={
               <ProtectedRoute>
                 <ListOfPatientDoc />
               </ProtectedRoute>
              } /> */}

              {/* <Route exact path="/DoctorPanel/AddPatientDetails:id" element={
               <ProtectedRoute>
                 <AddPatientDetails />
               </ProtectedRoute>
              } /> */}

              {/* <Route exact path="/DoctorPanel/Report:id" element={
               <ProtectedRoute>
                 <ReportHomePage />
               </ProtectedRoute>
              } /> */}

              <Route
                exact
                path="/DoctorPanel/ModelViewer"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <ModelViewer />
                  </ProtectedRoute>
                }
              />

              {/* ROUTING FOR VIDISHA DASHBOARD */}

              <Route
                exact
                path="/Dashboard"
                element={
                  //  <ProtectedRoute>
                  <VidhishaDashBoard />
                  //  </ProtectedRoute>
                }
              />

              {/* ROUTING FOR GOOGLE SHEET PREP DICOM DATA */}

              {/* <Route exact path="/DicomData" element={
              //  <ProtectedRoute>
                 <DicomData/>
              //  </ProtectedRoute>
              } /> */}

              {/* CATCH-ALL ROUTE: This will match any URL that hasn't been matched by other routes */}
              <Route path="*" element={<PageNotFound />} />

              {/* Route for Unauthorized Access */}
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
          </BrowserRouter>
        </div>
      </UserAuthContextProvider>
      <ToastContainer />
    </>
  );
}

export default App;
