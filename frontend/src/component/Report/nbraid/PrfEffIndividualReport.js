import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';

import Sidebar from '../Sidebar';
import Header from '../Header';
import $ from 'jquery';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function PrfIndividualReport() {
  const tableRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [data, setData] = useState([]);
  const animatedComponents = makeAnimated();
  


  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
    employee_id: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
   
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };


  

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: 'http://192.168.56.1:4000/geprfeffindividualreportData',
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        initializeTable(response.timesheet);
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };


  const initializeTable = (timesheet) => {
    // Destroy the existing DataTable instance (if it exists)
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Initialize the DataTable with the updated data
    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv'],
      data: timesheet, // Update the data option here
      columns: [
        { data: 'worker', },
        { data: 'entry_id', },
        { data: 'entry_id', },
        { data: 'entry_id', },
       { data: 'item_description', },
        { data: 'line', },
        { data: 'section_name' },
        { data: 'shift' },
        { data: 'target' },
        {
          data: null,
          render: function (data, type, row) {
            if (type === 'display') {
              // Calculate the total sum of hours for the current row
              const totalSum =
                row.HOUR1 +
                row.HOUR2 +
                row.HOUR3 +
                row.HOUR4 +
                row.HOUR5 +
                row.HOUR6 +
                row.HOUR7 +
                row.HOUR8 +
                row.HOUR9 +
                row.HOUR10 +
                row.HOUR11 ;
               

              // Return the total sum for display
              return totalSum;
            }
            return data;
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            if (type === 'display') {
              // Calculate the total sum of hours for the current row
              const totalSum =
                row.HOUR1 +
                row.HOUR2 +
                row.HOUR3 +
                row.HOUR4 +
                row.HOUR5 +
                row.HOUR6 +
                row.HOUR7 +
                row.HOUR8 +
                row.HOUR9 +
                row.HOUR10 +
                row.HOUR11 ;
               

              // Calculate the efficiency
              const efficiency = (totalSum / row.target) * 100;
              const formattedEfficiency = efficiency.toFixed(2);

              // Return the formatted efficiency percentage for display
              return formattedEfficiency + '%';
            }
            return data;
          },
        },
        //{ data: 'remark' },
       { data: 'site' },
       { data: 'date_time', },
      { data: 'site' },
      { data: 'site' },
      ],
      columnDefs: [


        {
        //  targets: [4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15], // Column indices for Hour 1 to Hour 12
          render: function (data, type, row) {
            if (type === 'display') {
              // Format the hour value to display decimal numbers
              const formattedHour = data.toFixed(4);
              return formattedHour;
            }
            return data;
          },
        },
      ],
    });
  };




  useEffect(() => {

    document.title = 'Performance Efficiency Individual Report';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {


      // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
      // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });

   
    }
   

    const fetchProductOptions = () => {
      $.ajax({
        url: 'http://192.168.56.1:4000/getWorkerTimesheetEmployee',
        method: 'GET',
        success: function (response) {
          setProductOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchProductOptions();


  }, []);

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Performance Efficiency Individual Report</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    // onChange={date => setStartDate(date)}
                    onChange={date => {
                      const formattedDate = date.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      });
                      const updatedEvent = { target: { value: formattedDate, name: 'fromdate' } };
                      handleInputChange(updatedEvent);
                      setStartDate(date);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Start Date"
                    name="fromdate"
                    required
                  />
                </div>
                <div className="col-sm-2">
                  <span className="textgreen">To Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    // onChange={date => {
                    //   setEndDate(date);
                    //   handleInputChange(date);
                    // }}
                    onChange={date => {
                      const formattedDate = date.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      });
                      const updatedEvent = { target: { value: formattedDate, name: 'todate' } };
                      handleInputChange(updatedEvent);
                      setEndDate(date);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                    required
                  />
                </div>
              

                <div className="col-sm-5">
                  <span className="textgreen">ota/ikeja Employee</span>
                  <select
                    className="form-control"
                    name="employee_id"
                    id="employee_id"

                    value={formData.employee_id}
                    onChange={(e) => {
                      handleInputChange(e);
                      //handleProductChange(e);
                    }}

                  >
                    <option value="">Select Employee Name</option>
                    {productOptions.map((productOption) => (
                      <option
                        key={productOption.id}
                        value={productOption.entry_id}
                      >
                           {`${productOption.worker}[${productOption.entry_id}]`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    View
                  </button>
                </div>

              </div>
            
            </form>


            {/* Display Input Field Values */}
            <div>
              <h4 class="header-filter"> <span class="textred" >{startDate && endDate ? `[${formData.fromdate}-${formData.todate}]` : ""}</span>
              <span class="textgreen"> {startDate && endDate ? `[${formData.employee_id}]` : ""}</span></h4>
       
            </div>


            <div className="table-responsive">


              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>Emp Name</th>
                    <th>Emp ID</th>
                    <th>D.O.J</th>
                    <th>Total Days</th>
                    <th>Product Name</th>
                  <th>Line</th> 
                    <th>Section</th>
                    <th>Shift</th>
                  
                    <th>Total Daily Target</th>
                    <th>Total Daily Complete</th>
                    <th>Efficiency</th>
                    <th>Site</th>
                 
                    <th>Date Range</th>
                   
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

export default PrfIndividualReport;
