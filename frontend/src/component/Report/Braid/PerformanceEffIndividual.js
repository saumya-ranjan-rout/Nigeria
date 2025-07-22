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
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function PerformanceEffIndividual() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employees, setEmployeeIkeja] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [fd, setFd] = useState("");
  const [ld, setLd] = useState("");
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

    $.ajax({
      url: "http://192.168.29.243:4000/braid/get_performance_eff_individual",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
       
           setFd(response.fd)
           setLd(response.ld)
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable("#example")) {
          $("#example").DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $("#example").DataTable({
          dom: "Bfrtip",
          buttons: ["copy", "csv", "excel"],
          data: response.items, // Update the data option here
          columns: [
            { data: "emp" },
            { data: "empid" },
            { data: 'doj'},
            { data: 'total_days'},
            { data: 'shift'},
            { data: 'section'},
            { data: 'item_name'},
            { data: 'zone'},
            { data: 'machine'},
            { data: 'tar1'},
            { data: 'total'},
            { data: 'eff'},
            { data: 'dt'},
            { data: 'site'},
            { data: 'avgeff'},
            { data: 'daycount'}
            
          ],
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    document.title = "Braid Performance Overview Individual";
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
        data: null, // Update the data option here
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
        ],
      });
    }

    // Fetch category options from API
    const fetchEmployees = () => {
      $.ajax({
        url: "http://192.168.29.243:4000/report/getEmployeesikeja",
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
  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem("isLoggedIn");

    // Redirect to the login page
    history.push("/login");
  };

  const selectedOption = employees.find((data) => data.empid === formData.employees);
  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Braid Performance Overview Individual</h5>
            <br />
            <h5 className="title">Date Range</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
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
                <div className="col-sm-3">
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
                  <span className="textgreen">IKEJA/OTA Employees</span>
                  <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Select Employees..."
                        value={selectedOption ? { value: selectedOption.empid, label: selectedOption.emp } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'employees', value: newValue } });
                        }}
                        options={employees.map((data) => ({ value: data.empid, label: data.emp+'('+data.empid+')'}))} required
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

            <div>
              <h6 class="header-title">
                {fd !== "" && ld !== "" && (
                  <span style={{ color: 'green' }}>{fd + ">" + ld}</span>
                )}
              </h6>
            </div>

            <div className="table-responsive">
              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>EMP NAME</th>
                    <th>ID</th>
                    <th>D.O.J</th>
                    <th>Total Day</th>
                    <th>Shift</th>
                    <th>Section</th>
                    <th>Product</th>
                    <th>Zone</th>
                    <th>Machine</th>
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
