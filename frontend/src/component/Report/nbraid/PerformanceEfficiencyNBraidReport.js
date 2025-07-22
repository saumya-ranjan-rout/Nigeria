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

export function PerformanceEfficiencyNBraidReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [monthsArray, setMonthsArray] = useState([]);


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
    setLoading(true);
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };
    const jsonData = JSON.stringify(updatedFormData);
    $.ajax({
      url: "http://192.168.29.243:4000/Nbraid/get_performance_eff_search_data",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response);
        setMonthsArray(response.dates)
        try {
          const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
          if (dataTable) {
            dataTable.clear().destroy();
          }
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          setTimeout(() => {
            tableRef.current = $('#example').DataTable({
              autoWidth: false,
              dom: 'Bfrtip',
              buttons: [
                {
                  extend: "copy",
                  filename: `OTA PERFORMANCE EFFICIENCY REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
                },
                {
                  extend: "csv",
                  filename: `OTA PERFORMANCE EFFICIENCY REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
                },
                "excel",
              ], 
              data: response.items,
              columns : [
                { data: "worker" },
                { data: "entry_id" },
                { data: "regg" },
                { data: "diff" },
                { data: "section" },
                { data: "product" },
                { data: "line"},
                ...response.dates.map((dateLabel) => ({
                  data: `count.${dateLabel}`,
                  render: function (data, type, row) {
                    if (type === "display" && data) {
                     const formattedData = data.map(value => (value !== '-' ? value + '%' : value));
                     return formattedData.join(", ");
                    }
                    return "";
                  },
                })),
              ],
            });
          }, 100);
          setLoading(false);
        } catch (error) {
          console.error("Error handling new data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };


  useEffect(() => {
    setLoading(true);
    document.title = "Performance Efficiency";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/Nbraid/get_performance_efficiency_data",
        method: "GET",
        processData: false,
        contentType: "application/json",
        success: function (response) {
          setMonthsArray(response.dates);
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          setTimeout(() => {
            tableRef.current = $('#example').DataTable({
              autoWidth: false,
              dom: 'Bfrtip',
              buttons: [
                {
                  extend: "copy",
                  filename: `OTA PERFORMANCE EFFICIENCY REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
                },
                {
                  extend: "csv",
                  filename: `OTA PERFORMANCE EFFICIENCY REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
                },
                "excel",
              ], 
              data: response.items,
              columns : [
                { data: "worker" },
                { data: "entry_id" },
                { data: "regg" },
                { data: "diff" },
                { data: "section" },
                { data: "product" },
                { data: "line"},
                ...response.dates.map((dateLabel) => ({
                  data: `count.${dateLabel}`,
                  render: function (data, type, row) {
                    if (type === "display" && data) {
                     const formattedData = data.map(value => (value !== '-' ? value + '%' : value));
                     return formattedData.join(", ");
                    }
                    return "";
                  },
                })),
              ],
            });
          }, 100);
          setLoading(false);
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }
  }, [history]);

  useEffect(() => {
    return () => {
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }
    };
  }, []);

  
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
            <h5 className="title">Performance Efficiency</h5>
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
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <br/>
            <br/>

            <div>
            <h6 className="header-title">
              <span className="textred">
                {startDate !== endDate 
                  ? `[${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]`
                  : new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
              </span>
            </h6>
          </div>

            <table id="example" className="display">
            <thead>
            <tr>
               
            <th>EMP NAME</th>
            <th>ID</th>
            <th>Date of Joining</th>
            <th>Total No Of Days</th>
            <th>Section</th>
            <th>Product Name</th>
            <th>Line</th>
        
              {monthsArray.map((monthName, index) => (
                  <th key={monthName}>{monthName}</th>
              ))}
                  
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

export default PerformanceEfficiencyNBraidReport;
