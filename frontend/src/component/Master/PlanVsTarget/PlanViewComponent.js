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
//import '../Loader.css' // Import the CSS file
import "jszip";
import "pdfmake";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import $ from "jquery";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PlanViewComponent() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
 
  const [itemCategories, setItemCategories] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [dataTableInitialized, setDataTableInitialized] = useState(false);
  


  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const days = [];
  for (let dt = new Date(weekStart); dt <= weekEnd; dt.setDate(dt.getDate() + 1)) {
    const currentDate = new Date(dt); // Create a new Date object
    //alert(currentDate)
    days.push({
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      date: formatDate(currentDate),
    });
  }
  
    const fetchData = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/weeklyplanview',
        method: 'GET',
        success: function (response) {
          setItemCategories(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });
    };
  

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
  
 
 
  useEffect(() => {
    setLoading(true)
    document.title = "Plan Vs Target";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  
    if (!isLoggedIn) {
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/targetplan/batchh",
        method: "GET",
        processData: false,
        contentType: "application/json",
        success: function (response) {
          console.log("API Response:", response);
          try {
            const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
            // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
            if (dataTable) {
              // Clear and destroy the DataTable
              dataTable.clear().destroy();
            }
            // Clear and destroy DataTable if it exists
           if ($.fn.DataTable.isDataTable("#example")) {
             tableRef.current.DataTable().clear().destroy();
           }
 
           // Set the new table data
           setTableData(response);
 
           // Set the flag to indicate DataTable initialization
           setDataTableInitialized(false);
         } catch (error) {
           console.error("Error handling new data:", error);
         }
        setLoading(false)
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

  useEffect(() => {
    if (tableData.length > 0 && !dataTableInitialized) {
      try {
        tableRef.current = $("#example").DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel'],
          data: tableData,
          columns: generateColumns(tableData[0].dates),
        });
        setDataTableInitialized(true);
      } catch (error) {
        console.error("Error initializing DataTable:", error);
      }
    }
  }, [tableData, dataTableInitialized]);
  
  
  const generateColumns = (dateLabels) => {
    const columns = [
      { data: "desc" },
      ...dateLabels.map((dateLabel) => ({
        data: (row) => row.values[dateLabel],
        render: function (data, type, row) {
          if (type === "display" && data !== undefined) {
            return data;
          }
          return "";
        },
      })),
    ];
    return columns;
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
          <h6 className="title">Plan View{' '} 
              <Link to="/master/add-plan-target" className="btn btn-success btn-sm rounded">
                Add new
              </Link>

            </h6>
            <br/>
            <table id="example" className="display">
            <thead>
            <tr>
                  <th>Product Description</th>
                  {days.map((day, index) => (
                    <th key={index}>
                      {day.dayName}
                      <br />
                      {day.date}
                    </th>
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

export default PlanViewComponent;
