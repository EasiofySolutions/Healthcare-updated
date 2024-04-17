import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase-config";
import "./ReportHomePage.css";

function ReportHomePage() {
  const [data, setData] = useState();
  const { id } = useParams();

  var adminName1 = localStorage.getItem("adminName");

  useEffect(() => {
    const users = ref(db, `superadmin/admins/${adminName1}/patients/${id}`);
    onValue(users, (snapshot) => {
      if (snapshot.exists()) {
        setData({ ...snapshot.val() });
      } else {
        setData();
      }
    });
    return () => {
      setData();
    };
  }, [id, adminName1]);

  console.log(data);

  return (
    <>
      {/* <h2 className="text-center h2addadmin1">
       {data && data.FullName.toUpperCase()}
      </h2> */}

      <div className="templatereportcss">
      {/* <span className="templatePName">Patient Name: </span> */}
        <h2 className="text-center h2addadmin1 templateH1">Choose Template</h2>


<div className="template-Maindiv">
        <div className=" template-center">
          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-1
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>
          

          <div className=" template-center">
          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-2
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>

          <div className=" template-center">

          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-3
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>
          
      </div>
      


          
        
        
        <div className="template-MaindivB">

        <div className=" template-center">
          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-4
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>

          <div className=" template-center">

          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-5
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>

          <div className=" template-center">

          <a href="https://codepen.io/chloe47632" className="anchor-template">
            <button type="submit" className=" template-btn">
              Template-6
            </button>{" "}
          </a>
          <div className="templateP">
          <h5>CT and MR Liver - LI-RADS</h5>
          </div>
          </div>

          </div>
        
      </div>
    </>
  );
}

export default ReportHomePage;
