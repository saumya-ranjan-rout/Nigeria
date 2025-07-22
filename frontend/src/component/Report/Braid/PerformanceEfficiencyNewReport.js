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

export function PerformanceEffNew() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const today = new Date();
  const currentDate = new Date();
  // Extract day, month, and year components
  const day = currentDate.getDate();
  const month = currentDate.toLocaleDateString("en-US", { month: "2-digit" });
  const year = currentDate.getFullYear();
  
  // Create the formatted date string
  const formattedDate = `${day}-${month}-${year}`;
  const [sdate, setSdate] = useState(formattedDate)
  const [startDate, setStartDate] = useState(today);
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

 
  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = {
      fromdate: startDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: "http://192.168.29.243:4000/braid/getPerformanceEffNew",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setSdate(response.resultData[0].date)
        const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }
      // Initialize DataTable with the fetched data
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }

      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        buttons: ["copy", "csv", "excel"],
        data: response.resultData,
        columns: [
            { data: "emp" },
            { data: "empid" },
            {
              data: "site",
              defaultContent: 'N/A', // Provide default content for the "site" column
            },
            {
              data: "regg", // Use the "regg" property directly
              render: function (data, type, row) {
                if (typeof data === 'undefined' || data === null) {
                  return 'N/A';
                }
                // Add your logic here for rendering "regg" column
                return data;
              },
            },
            {
              data: null,
              render: function (data, type, row) {
                if (typeof data === 'undefined' || data === null) {
                  return 'N/A';
                }
                return data.diff + ' Days';
              },
            },
            { data: "item_description" },
            { data: "section_name" },
            { data: "zone" },
            { data: "machine" },
            { data: "shift" },
            { data: "eff" },
          ],
    
        
      });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

 

  useEffect(() => {
    //setLoading(true)
    document.title = "Braid Performance Efficiency";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/braid/getPerformanceEffNew",
        method: "POST",
        data: '',
        processData: false,
        contentType: "application/json",
        success: function (response) {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }

          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            buttons: ["copy", "csv", "excel"],
            data: response.resultData,
            columns: [
              { data: "emp" },
              { data: "empid" },
              {
                data: "site",
                defaultContent: 'N/A', // Provide default content for the "site" column
              },
              {
                data: "regg", // Use the "regg" property directly
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
                  // Add your logic here for rendering "regg" column
                  return data;
                },
              },
              {
                data: null,
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
                  return data.diff + ' Days';
                },
              },
              { data: "item_description" },
              { data: "section_name" },
              { data: "zone" },
              { data: "machine" },
              { data: "shift" },
              { data: "eff" },
            ],
            // columnDefs: [
            //   {
            //     targets: [3, 14], // Assuming columns 3 and 14 contain date values
            //     render: function (data, type, row, meta) {
            //       if (type === 'display' && typeof data === 'string') {
            //         var dateParts = data.split('-');
            //         if (dateParts.length === 3) {
            //           return dateParts[1] + '-' + dateParts[0] + '-' + dateParts[2];
            //         }
            //       }
            //       return data;
            //     },
            //   },
            // ],
            
          });
          setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }
  }, []);

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
            <h5 className="title">Braid Performance Efficiency</h5>
            <br />
            <br />
            <h5 className="title">Search Between Dates Reports</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
               <div className="col-sm-4">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select Start Date"
                    name="fromdate"
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

            <div className="table-responsive">
              <table id="example" className="display" style={{ width: '100%' }}>
                <thead>
                  <tr>
                  <th>EMP NAME</th>
                  <th>ID</th>
                  <th>Site</th>
                  <th>D.O.J</th>
                  <th>Total Days</th>
                  <th>Product</th>
                  <th>Section</th>
                  <th>Zone</th>
                  <th>Machine</th>
                  <th>Shift</th>
                  <th>{sdate}</th>
                  
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

export default PerformanceEffNew;
