import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "jquery/dist/jquery.min.js";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import '../Loader.css' // Import the CSS file
import "jszip";
import "pdfmake";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import $ from "jquery";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PlanVsActualReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
 
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
 
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: "",
    todate: "",
  });

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  //today date
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const tday =`${day}-${month}-${year}`;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "fromdate") {
      setStartDate(new Date(value));
    } else if (name === "todate") {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
   // setLoading(true)
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: "http://192.168.29.243:4000/braid/getPlanVsactualReportSearch",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        
        if(response.fdate){
          setFDate(response.fdate); // Use response[0].fdate directly
          setTDate(response.tdate);
        }else{
          setFDate(response[0].fdate); // Use response[0].fdate directly
          setTDate(response[0].tdate);
        }
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable("#example")) {
          $("#example").DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $("#example").DataTable({
          dom: "Bfrtip",
          buttons: ["copy", "csv", "excel"],
          data: response, // Update the data option here
          columns: [
            { data: "product" },
            { data: "total" },
            {
                data: null,
                render: function (data, type, row) {
                if (data.sump == null) {
                    return '<span style="color:red">-</span>';
                } else {
                    return data.sump;
                }
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                const data1 = data.sump;
                const data12 = row.total;
                const totals = (data12) - (data1);
                return totals;
                },
            },
          ],
        });
        //setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    //setLoading(true)
    document.title = "PLAN VS ACTUAL REPORT";
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/braid/getPlanVsactualReportDefault",
        method: "GET",
        processData: false,
        contentType: "application/json",
        success: function (response) {
        
          // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }

          // Initialize the DataTable with the updated data
          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            buttons: ["copy", "csv", "excel"],
            data: response, // Update the data option here
            columns: [
              { data: "product" },
              { data: "total" },
              {
                  data: null,
                  render: function (data, type, row) {
                  if (data.sump == null) {
                      return '<span style="color:red">-</span>';
                  } else {
                      return data.sump;
                  }
                  },
              },
              {
                  data: null,
                  render: function (data, type, row) {
                  const data1 = data.sump;
                  const data12 = row.total;
                  const totals = (data12) - (data1);
                  return totals;
                  },
              },
            ],
          });
         // setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }

    const date = new Date().toLocaleDateString("en-GB", {
      timeZone: "Africa/Lagos",
    });
    const parts = date.split("/");
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    const newcurrentDate1 = `${day}-${month}-${year}`;
  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem("isLoggedIn");

    // Redirect to the login page
    history.push("/login");
  };

  return (
    <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">PLAN VS ACTUAL REPORT</h5>
            <br />
            Date Range
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-4">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Start Date"
                    name="fromdate"
                  />
                </div>
                <div className="col-sm-4">
                  <span className="textgreen">To Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                </div>
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            {/* Display Input Field Values */}
            <br/>
            <div>
              {fdate && tdate ? (
                <>
                  <h6 className="header-filter">
                    <span class="textred" >[{fdate}] - [{tdate}]</span>
                    
                  </h6>
                </>
              ) : (
                <span className="textred"></span>
              )}
            </div>
            <div className="table-responsive">
              <table id="example" className="display">
                <thead>
                <tr>
                <th>Product Description</th>
                {fdate !== '' && tdate !== '' ? (
                    <>
                    <th>Total Plan</th>
                    <th>Total Achieve</th>
                    </>
                ) : (
                    <>
                    <th>Daily Plan</th>
                    <th>Current Production</th>
                    </>
                )}
                <th>Balance</th>
                </tr>
                </thead>
              </table>
            </div>
          </div>
        </main>
      </section>
    </div>
    </>
  );
}

export default PlanVsActualReport;
