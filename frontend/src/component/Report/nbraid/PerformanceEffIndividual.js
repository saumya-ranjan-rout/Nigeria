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
import "jszip";
import "pdfmake";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import $ from "jquery";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PerformanceEffIndividual() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employees, setEmployeeIkeja] = useState([]);
  const [employeesota, setEmployeeota] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [date_time, setDateTime] = useState("");

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
    employees: "",
    employeesota: "",
  });

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
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);
    if(formData.employees ==='' && formData.employeesota ==='' ){
     window.alert('Please select either OTA or IKEJA.');
    }else{
    $.ajax({
      url: "http://192.168.29.243:4000/nbraid/get_performance_eff_individual",
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
          buttons: [
            {
              extend: "copy",
              filename: `NON-BRAID PERFORMANCE OVERVIEW INDIVIDUAL REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            {
              extend: "csv",
              filename: `NON-BRAID PERFORMANCE OVERVIEW INDIVIDUAL REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            "excel",
          ],          
          data: response, // Update the data option here
          columns: [
            { data: "worker" },
            { data: "entry_id"},
            { data: 'regg'},
            { data: 'diff'},
            { data: 'shift'},
            { data: 'sec'},
            { data: 'pro'},
            { data: 'line'},
            { data: 'target'},
            { data: 'sum'},
            {
              data: 'efficiency',
              render: function (data, type, row) {
                // Check if the rendering is for display, not sorting or filtering
                if (type === 'display') {
                  return `${data}%`;
                }
                return data;
              },
            },
            
            { data: 'date_time'},
            { data: 'ss'},
            {
              data: 'faef',
              render: function (data, type, row) {
                // Check if the rendering is for display, not sorting or filtering
                if (type === 'display') {
                  return `${data}%`;
                }
                return data;
              },
            },
            
            { data: 'day_count'},
            
          ],
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
   }
  };

  useEffect(() => {
    document.title = "Performance Eff Individual";
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push("/login");
    } else {
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }

      // Initialize the DataTable with the updated data
      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        buttons: ["copy", "csv", "excel"],
        data: '', // Update the data option here
        columns: [
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
        ],
      });
    }

    // Fetch category options from API
    const fetchEmployees = () => {
      $.ajax({
        url: "http://192.168.29.243:4000/report/nbraid/getEmployeesikeja",
        method: "GET",
        success: function (response) {
          setEmployeeIkeja(response);
        },
        error: function (xhr, status, error) {
          console.error("Error fetching  options:", error);
        },
      });
    };

    fetchEmployees();

     // Fetch category options from API
     const fetchEmployeesota = () => {
        $.ajax({
          url: "http://192.168.29.243:4000/report/nbraid/getEmployeesota",
          method: "GET",
          success: function (response) {
            setEmployeeota(response);
          },
          error: function (xhr, status, error) {
            console.error("Error fetching  options:", error);
          },
        });
      };
  
      fetchEmployeesota();
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
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Performance Overview Individual</h5>
            <br />
            <h5 className="title">Date Range</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-2">
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
                <div className="col-sm-2">
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
                
                <div className="col-sm-3">
                  <span className="textgreen">OTA</span>
                  <select
                    id="employees"
                    className="form-control"
                    name="employeesota"
                    value={formData.employeesota}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Employees</option>
                    {employeesota.map((employee) => (
                      <option key={employee.entry_id} value={employee.entry_id}>
                        {employee.worker + "(" + employee.entry_id + ")"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-3">
                  <span className="textgreen">IKEJA</span>
                  <select
                    id="employees"
                    className="form-control"
                    name="employees"
                    value={formData.employees}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.entry_id} value={employee.entry_id}>
                        {employee.worker + "(" + employee.entry_id + ")"}
                      </option>
                    ))}
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
      
            <div>
            <h6 className="header-title">
              <span className="textred">
                {startDate !== endDate 
                  ? `[${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${formData.employeesota}]-[${formData.employees}]`
                  : new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
              </span>
            </h6>
          </div>

            <div className="table-responsive">
              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>EMP NAME</th>
                    <th>ID</th>
                    <th>D.O.J</th>
                    <th>No Of Day</th>
                    <th>Shift</th>
                    <th>Section</th>
                    <th>Product Name</th>
                    <th>Line</th>
                    <th>Total Daily Target</th>
                    <th>Total Daily Complete</th>
                    <th>Efficiency</th>
                    <th>Date Range</th>
                    <th>Site</th>
                    <th>Average Efficiency</th>
                    <th>Total No Of Days</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default PerformanceEffIndividual;
