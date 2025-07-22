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

export function ProductivityReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);


  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dataTableInitialized, setDataTableInitialized] = useState(false);
  

  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    fromdate: "",
    line_no: '',
  });
  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
   
  };
 
  
 
  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
  
    // Prepare the form data
    const updatedFormData = { ...formData, fromdate: startDate};
  
    const jsonData = JSON.stringify(updatedFormData);
   
    // Make an AJAX request to fetch data
    $.ajax({
      url: "http://192.168.29.243:4000/nbraid/getfilteredproductivity",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {

        console.log("Response Data:", response);
        setMonthsArray(response.section)
        try {
          const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
          // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
          if (dataTable) {

            // Clear and destroy the DataTable
            dataTable.clear().destroy();
          }
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          
          const flattenedData = response.items.map((row) => {
            const flattenedRow = {
              lines: row.lines,
              tm: row.tm,
              pp: row.pp,
              eff: row.eff,
            };
          
            response.section.forEach((section, index) => {
              flattenedRow[`section_${index}`] = row.section_data[index];
            });
          
            return flattenedRow;
          });
          
          // Initialize DataTable with flattened data
          setTimeout(() => {
            tableRef.current = $('#example').DataTable({
              autoWidth: false,
              dom: 'Bfrtip',
              buttons: [
                {
                  extend: "copy",
                  filename: "LINE_REPORT_Copy_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                {
                  extend: "csv",
                  filename: "LINE_REPORT_CSV_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                "excel",
              ],
              data: flattenedData,
              columns: [
                { data: "lines" },
                ...response.section.map((section, index) => ({ data: `section_${index}` })),
                { data: "tm" },
                { data: "pp" },
                { data: "eff" },
              ],
            });
          }, 100);
          
          // Set the new table data
          setTableData(response.items);

          // Set the flag to indicate DataTable initialization
          setDataTableInitialized(false);
        } catch (error) {
          console.error("Error handling new data:", error);
        }
        setLoading(false);
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        // Handle the error gracefully, e.g., show an error message to the user
      },
    });
  };
  
useEffect(() => {
  setLoading(true);
  document.title = "Productivity Report";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    history.push("/login");
  } else {
    $.ajax({
      url: "http://192.168.29.243:4000/Nbraid/getfilteredproductivitydefault",
      method: "GET",
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setMonthsArray(response.section);
        try {
          
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
        
           // Initialize the DataTable with the updated data
       
            tableRef.current = $("#example").DataTable({
              dom: "Bfrtip",
              buttons: [
                {
                  extend: "copy",
                  filename: "LINE_REPORT_Copy_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                {
                  extend: "csv",
                  filename: "LINE_REPORT_CSV_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                "excel",
              ],
              data: response.items, // Update the data option here
              columns: [
                { data: "lines" },
                
                { data: "tm" },
                { data: "pp" },
                { data: "eff" },
               
              ],
            });
      
        } catch (error) {
          console.error("Error handling initial data:", error);
        }
        setLoading(false);
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  }
}, [history]);

  
  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
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
            <h5 className="title">Productivity & Display</h5>
            <br />
            <h5 className="title">Date Range</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
              <div className="col-sm-2"></div>
                <div className="col-sm-3">
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
                  <span className="textgreen">Line No</span>
                  <select
                    name="line_no"
                    className="form-control subcat"
                    id="line_no"
                    value={formData.line_no} onChange={handleInputChange}
                  >
                     <option>Select Line</option>
                    <option value="1">LINE 1-16</option>
                    <option value="2">EB LINE</option>
                  </select>
                </div> 
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <br/>
            
            <div>
              <h6 className="header-title">
                <span className="textred">
                  {startDate &&
                    startDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    }).replace(/\//g, '-')}
                </span>
              </h6>
            </div>


            <br/>
            <table id="example" className="display">
            <thead>
            <tr>
                {/* Render headers for months */}
                {monthsArray && monthsArray.length > 0 ? (
                    <>
                      <th>Line</th> 
                        {monthsArray.map((monthName, index) => (
                            <th key={monthName}>{monthName}</th>
                        ))}
                      <th>Total ManPower</th>
                      <th>Total Production<br/>Fg Output</th>
                      <th>PPP</th>
                    </>
                ) : (
                    <>
                      <th>Line</th> 
                      
                      <th>Total ManPower</th>
                      <th>Total Production<br/>Fg Output</th>
                      <th>PPP</th>
                    </>
                   
                )}
            </tr>
            </thead>
            <tbody>

            </tbody>
            </table>
           
          </div>
        </main>
      </section>
    </div>
    </>
  );
}

export default ProductivityReport;
