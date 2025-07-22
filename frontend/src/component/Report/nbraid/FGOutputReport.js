import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';

import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';


export function FGOutputReport() {
  
 
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
 const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
const [shiftOptions, setShiftOptions] = useState([]);
const [siteFromResponse, setSiteFromResponse] = useState([]);
const [dayFromResponse, setDayFromResponse] = useState([]);
const [sectionFromResponse, setSectionFromResponse] = useState('');
const [itemDescription, setItemDescription] = useState('');
const [line, setLine] = useState('');

 const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
  

  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
    shift: '',
    product_id: '',
    product_name: '',
    site:'',
   // section_id: '',
   // section_name: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'product_id') {
      const selectedProduct = productOptions.find(product => String(product.id) === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: value,
        product_name: productName,
      }));
    }else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
 

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

     

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: 'http://192.168.29.243:4000/getfgoutputreport',
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, shift, site, fdate, tdate } = response;

       

      // Set the site value to state
      setSiteFromResponse(site);
      setDayFromResponse(shift);

       setFDate(fdate);
      setTDate(tdate);

        // Update the component state with the timesheet data
        setData(timesheet);
        //alert(JSON.stringify(timesheet));


         // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
       // initializeTable(response.timesheet);
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };

// Assuming workerCount is an array of values related to each row in the DataTable
const workerCount = [/* ... */];
  const initializeTable = (timesheet, formattedDate) => {
    // Destroy the existing DataTable instance (if it exists)
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Initialize the DataTable with the updated data
    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
      buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID FGOUTPUT REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
      data: timesheet, // Update the data option here
      columns: [
       
       
        {
        // Add the first column for row numbers
        data: null,
        render: function (data, type, row, meta) {
          // 'meta.row' contains the index of the row
          return meta.row + 1;
        },
      },
        { data: 'item_description', },
        { data: 'line', },
        { data: 'shift', },
        { data: 'tar' },
        {
          data: 'workerCount',
         
        },
        {
          data: 'workerCount',
          render: function (data, type, row, meta) {
            const tarValue = row.tar; // Assuming 'tar' is a property of the row data

            // Check if 'workerCount' is not zero to avoid division by zero
            const result = data !== 0 ? (tarValue / data).toFixed(2) : '0';

            return result;
          },
        },
        { data: 'site', },
        { data: 'date_time', },
      
        
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

    document.title = 'FGOUTPUT REPORT';
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

      $.ajax({
        url: 'http://192.168.29.243:4000/get_fgoutput_default',
        method: "GET",
        data: [],
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response;
          const { date } = response;
          // Update the component state with the timesheet data
          setData(timesheet);
          setCurrentDate(date);
          // Format the date as "DD-MM-YYYY"
          const formattedDate = date;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    }



    const fetchProductOptions = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getProductOptions',
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

    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getShiftOptions',
        method: 'GET',
        success: function (response) {
          setShiftOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };

    fetchShiftOptions();


  }, []);

 

  const calculateSummary = () => {
    // Calculate total target and total completed
    let totalFg = 0;
    data.forEach((row) => {
      totalFg += row.tar;
    });
   // totalFg = totalFg.toFixed(2);
    return { totalFg };
  };


  

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">FG OUTPUT </h5>
            <br></br>
                        <h5 className="title">Date Range</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-3">
                  <span className="textgreen"> Date</span>
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
                  <span className="textgreen">Shift</span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                    value={formData.shift} onChange={handleInputChange}
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen">Site</span>
                  <select
                    id="site"
                    className="form-control"
                    name="site"
                    value={formData.site} onChange={handleInputChange}>
                    <option value="">Select</option>
                   
                    <option value="ota">ota</option>
                    <option value="ikeja">ikeja</option>
                     
                  </select>

                </div>
                
                <div className="col-sm-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    View
                  </button>
                </div>
              </div>
             
            </form>


          

            <div>
              {fdate && tdate ? (
                <>
                  <h6 className="header-filter">
                    <span className="textred">[{fdate}] - [{tdate}]</span><span className="textgreen"> [{dayFromResponse}]</span><span className="textblue"> [{siteFromResponse}]</span>
                    
                  </h6>
                </>
              ) : (
                <span className="textred">{currentDate}</span>
              )}
            </div>


            <div className="table-responsive">


              <table id="example" className="display">
              <thead>
                  <tr>

                  <th>#</th>
                  <th>Product Name</th>
                  <th>Line</th>
                  <th>Shift</th>
                  <th>FG</th>
                  <th>Count Of<br/> Workers</th>
                  <th>PPP</th>
                  <th>Site</th>
                  <th>Date</th>
             
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

export default FGOutputReport;
