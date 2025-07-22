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

export function EmployeeTimesheet() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);

  const currentDate = new Date();
  // Extract day, month, and year components
  const day = currentDate.getDate();
  const month = currentDate.toLocaleDateString("en-US", { month: "2-digit" });
  const year = currentDate.getFullYear();
  
  // Create the formatted date string
  const formattedDate = `${month}-${day}-${year}`;
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  useEffect(() => {
    document.title = "BRAID EMPLOYEE TIMESHEET";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/braid/getEmployeeTimesheetDefaultData",
        method: "GET",
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
              { data: "complete" },
              { data: "tar1" },
              { data: "total" },
              { data: "eff" },
              { data: "tDate" },
            ],
            columnDefs: [
              {
                targets: [3, 14], // Assuming columns 3 and 14 contain date values
                render: function (data, type, row, meta) {
                  if (type === 'display' && typeof data === 'string') {
                    var dateParts = data.split('-');
                    if (dateParts.length === 3) {
                      return dateParts[1] + '-' + dateParts[0] + '-' + dateParts[2];
                    }
                  }
                  return data;
                },
              },
            ],
            
          });
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }
  }, []);

  return (
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <h5 className="title">Braid Employee Timesheet <Link to="/report/braid/employee_timesheet_new" className="btn btn-success btn-sm rounded">Previous Date</Link></h5>
            <br />
            <div>
              <h6 className="header-title">
                <span className="textgreen">
                  {formattedDate}
                </span>
              </h6>
            </div>
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
                  <th>Start Hour - End Hour<br/><small>Total Data Captured</small></th>
                  <th> <span>Target</span></th>
                  <th> <span>Complete</span></th>
                  <th> <span>Eff</span></th>
                  <th> <span>Date</span></th>
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

export default EmployeeTimesheet;
