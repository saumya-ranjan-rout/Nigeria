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

export function FGMonthlyReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);

  const currentYear = new Date().getFullYear();

 
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    start_month: "",
    start_year: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "start_year") {
      setFormData({ ...formData, start_year: value });
    }else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    setLoading(true)
    event.preventDefault();
    const updatedFormData = {
      ...formData,
    };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: "http://192.168.29.243:4000/Nbraid/getFgMonthlyDataSearch",
      method: "POST",
      data: jsonData,
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
            { data: null},
            { data: "item_description" },
            { data: "line" },
            { data: "tar" },
            { data: "countResult" },
            { data: "shift" },
          ],
          columnDefs: [
              {
                // Add a custom rendering function for the serial number column
                targets: 0,
                data: null,
                render: function (data, type, row, meta) {
                  // Calculate the serial number as meta.row + 1
                  return meta.row + 1;
                },
              },
            ],
        });
        setLoading(false)
      },
      error: function (xhr, status, error) {
        setLoading(false)
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    setLoading(true)
    document.title = "FG Monthly";
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/Nbraid/getFgMonthlyDefaultData",
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
                { data: null},
                { data: "item_description" },
                { data: "line" },
                { data: "tar" },
                { data: "countResult" },
                { data: "shift" },
              ],
            columnDefs: [
                {
                  // Add a custom rendering function for the serial number column
                  targets: 0,
                  data: null,
                  render: function (data, type, row, meta) {
                    // Calculate the serial number as meta.row + 1
                    return meta.row + 1;
                  },
                },
              ],
          });
          setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }

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
            <h5 className="title"></h5>
            <br />
            Date Range
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
              <div className="col-sm-2">
                  <span className="textgreen">Start Month</span>
                  <select
                    id="start_month"
                    className="form-control"
                    name="start_month"
                    value={formData.start_month}
                    onChange={handleInputChange}
                  >
                    <option value="">select</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen"> Year</span>
                  <select
                    name="start_year"
                    id="syear"
                    className="form-control"
                    value={formData.start_year}
                    onChange={handleInputChange}
                  >
                     <option value="">select Year</option>
                    <option value={currentYear}>{currentYear}</option>
                  </select>
                </div>
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            {/* Display Input Field Values */}
            <p style={{color:'red'}}>* Due to a recent development in our system, shift data has been recorded from October 10, 2023, onwards in fgoutput . As a result, shift information for the entire previous month is currently unavailable</p>
            <div>
              <h6 class="header-title">
                <span class="textred">
                  {/* [{fdate}-{tdate}] */}
                </span>
              </h6>
            </div>
            <div className="table-responsive">
              <table id="example" className="display">
                <thead>
                <tr>
                    <th>SLNO</th>
                    <th>Product Name</th>
                    <th>Line</th>
                    <th>FG</th>
                    <th>Count No Of Workers</th>
                    <th>Shift</th>
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

export default FGMonthlyReport;
