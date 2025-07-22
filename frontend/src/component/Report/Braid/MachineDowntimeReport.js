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

export function MachineDowntimeReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);

  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);

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
    todate: "",
    shift:"",
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

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true)
    // Prepare the form data
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };
  
    const jsonData = JSON.stringify(updatedFormData);
  
    // Make an AJAX request to fetch data
    $.ajax({
      url: "http://192.168.29.243:4000/braid/get_machineDowntime_data2",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response);
        setMonthsArray(response[0].dates)
        setFDate(response[0].fdate); // Use response[0].fdate directly
        setTDate(response[0].tdate);
        try {
          const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }
          // Destroy and reinitialize DataTable with new data
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
            $('#example').remove();
          }
  
          // Initialize DataTable
          setTimeout(() => {
          tableRef.current = $("#example").DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            buttons: ["copy", "csv", "excel"],
            data: response,
            columns:[
              { data: "zones" },
              // Dynamically create columns for dates
              ...response[0].dates.map((dateLabel) => ({
                data: `values.${dateLabel}`,
                render: function (data, type, row) {
                  // 'data' here is the values array for the corresponding dateLabel
                  // You can customize how you want to display this data in your table cell
                  if (type === 'display' && data) {
                    return data.join(', '); // Join the array elements into a string
                  }
                  return "";
                },
              })),
            ],
          });
        }, 100); // Adjust the delay time as needed
        setLoading(false)
        } catch (error) {
          console.error("Error handling new data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        // Handle the error gracefully, e.g., show an error message to the user
      },
    });
  };
  


useEffect(() => {
  document.title = "Machine Downtime";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    history.push("/login");
  } else {
    $.ajax({
      url: "http://192.168.29.243:4000/braid/get_machineDowntime_data1",
      method: "POST",
      data: '', // You can add data here if needed
      processData: false,
      contentType: "application/json",
      success: function (response) {
        try {
          // Destroy and reinitialize DataTable with new data
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
  
          // Create an array of columns for DataTable
          const dateLabels = response[0].dates;  

          // Create DataTable columns dynamically based on the date labels
          const columns = [
            { data: "zones" },
            // Dynamically create columns for dates
            ...dateLabels.map((dateLabel) => ({
              data: `values.${dateLabel}`,
              render: function (data, type, row) {
                // 'data' here is the values array for the corresponding dateLabel
                // You can customize how you want to display this data in your table cell
                if (type === 'display' && data) {
                  return data.join(', '); // Join the array elements into a string
                }
                return "";
              },
            })),
          ];
  
          // Initialize DataTable
          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            buttons: ["copy", "csv", "excel"],
            data: response,
            columns: columns,
          });
        } catch (error) {
          console.error("Error handling new data:", error);
        }
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
            <h5 className="title">View Comparison</h5>
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
              <h6 class="header-title" style={{textAlign:'center'}}>
                <span style={{color:'red'}}>
                {fdate !== '' ? `From [${formatDate(new Date(fdate))}] to [${formatDate(new Date(tdate))}]` : null}
                </span>
              </h6>
            </div>
            <table id="example" className="display">
            <thead>
                <tr>
                <th>Zone & Machine</th>
                {/* Render headers for months */}
                {monthsArray && monthsArray.length > 0 ? (
                    monthsArray.map((monthName, index) => (
                    <th key={monthName}>{monthName}</th>
                    ))
                ) : (
                    // Handle the case where monthsArray is empty or null
                    <th>{formattedDate}</th>
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

export default MachineDowntimeReport;
