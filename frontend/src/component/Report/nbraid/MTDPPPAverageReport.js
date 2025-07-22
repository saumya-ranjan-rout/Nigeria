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

export function MTDPPPAverageReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const [category, setCategory] = useState([]);
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const [selectedYear1, setSelectedYear1] = useState(currentYear);
  const [selectedYear2, setSelectedYear2] = useState(currentYear);
  const [monthsArray, setMonthsArray] = useState([]);
  const currentDate = new Date();
  const monthYearString = `${currentDate.toLocaleDateString("en-US", { month: "long" })}`;
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    category: "",
    start_month: "",
    start_year: "",
    end_month: "",
    end_year: "",
  });

  //today date
  const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' });
  const parts = date.split('/');
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  const currentMonth = `${month}-${year}`;


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "start_year") {
      setFormData({ ...formData, start_year: value });
    } else if (name === "end_year") {
      setFormData({ ...formData, end_year: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
      setLoading(true);
    event.preventDefault();
    const updatedFormData = {
      ...formData,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: "http://192.168.29.243:4000/Nbraid/getMtdPppAverageSearch",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
       setMonthsArray(response.data.months);
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

      const columns = [
        { data: "category" },
        { data: "item" },
        // Generate columns for each month's average
        ...response.data.months.map((avg, index) => ({
          data: `monthlyAverages.${index}`, // Access monthlyAverages by index
          render: function (data, type, row) {
            return data ? data : "";
          },
        })),
      ];
      setTimeout(() => {
      tableRef.current = $('#example').DataTable({
        autoWidth: false,
        dom: 'Bfrtip',
        buttons: [
          {
            extend: "copy",
            filename: "NON-BRAID MTD PPP REPORT FROM " + (formData.start_month + '-' + formData.start_year) + ' TO ' + (formData.end_month + '-' + formData.end_year),
          },
          {
            extend: "csv",
            filename: "NON-BRAID MTD PPP REPORT FROM " + (formData.start_month + '-' + formData.start_year) + ' TO ' + (formData.end_month + '-' + formData.end_year),
          },
          "excel",
        ],
        
        data: response.data.items, // Use the data from the API response
        columns: columns,
      });
    }, 100); // Adjust the delay time as needed
      setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

 

  useEffect(() => {
    //setLoading(true)
    document.title = "MTD PPP";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      history.push("/login");
    } else {
      $.ajax({
        url: "http://192.168.29.243:4000/Nbraid/getMtdPppAverageDefaultData",
        method: "GET",
        processData: false,
        contentType: "application/json",
        success: function (response) {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }

          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            buttons: [
              {
                extend: "copy",
                filename: "NON-BRAID MTD PPP REPORT  " + currentMonth,
              },
              {
                extend: "csv",
                filename: "NON-BRAID MTD PPP REPORT  " + currentMonth,
              },
              "excel",
            ],
            data: response,
            columns: [
              { data: "category" },
              { data: "item" },
              { data: "avg" },
            ],
          });
          setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });

      const fetchCategory = () => {
        $.ajax({
          url: "http://192.168.29.243:4000/braid/getCategoryOptions",
          method: "GET",
          success: function (response) {
            setCategory(response);
          },
          error: function (xhr, status, error) {
            console.error("Error fetching shift options:", error);
          },
        });
      };

      fetchCategory();
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
            <h5 className="title">MTD PPP AVERAGE</h5>
            <br />
            Month Range
            <hr></hr>
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Category</span>
                  <select
                    id="category"
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {category.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.category_name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <option value=''>Select</option>
                    <option value={currentYear}>{currentYear}</option>
                    <option value={lastYear}>{lastYear}</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen"> End Month</span>
                  <select
                    id="end_month"
                    className="form-control"
                    name="end_month"
                    value={formData.end_month}
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
                    name="end_year"
                    id="end_year"
                    className="form-control"
                    value={formData.end_year}
                    onChange={handleInputChange}
                  >
                    <option value=''>Select</option>
                    <option value={currentYear}>{currentYear}</option>
                    <option value={lastYear}>{lastYear}</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <div>
            <h6 className="header-title">
              {formData.start_month !== '' && (
                <span className="textgreen">
                  [{formData.start_month}-{formData.start_year} TO {formData.end_month}-{formData.end_year}]
                </span>
              )}
            </h6>
          </div>


            <div className="table-responsive">
              <table id="example" className="display" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>CATEGORY NAME</th>
                    <th>ITEM NAME</th>
                    {/* Render headers for months */}
                    {monthsArray && monthsArray.length > 0 ? (
                      monthsArray.map((monthName, index) => (
                        <th key={index}>{monthName}</th>
                      ))
                    ) : (
                      // Handle the case where monthsArray is empty or null
                      <th>{monthYearString}</th>
                    )}
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

export default MTDPPPAverageReport;
