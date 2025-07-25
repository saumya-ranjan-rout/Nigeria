import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'jszip';
import 'pdfmake';
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClipboardJS from 'clipboard';

export function Wastage() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  // Add one day to oneMonthAgo
oneMonthAgo.setDate(oneMonthAgo.getDate() + 1);

const [startDate, setStartDate] = useState(oneMonthAgo);
const [endDate, setEndDate] = useState(today); // Use the current date as the default end date
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
  const [date_time, setDateTime] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false); // New state for form submission status
  const [formHidden, setFormHidden] = useState(false);
   const [dateColumns, setDateColumns] = useState([]);
 const [seconddata, setSecondData] = useState([]);


  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
    product_name: '',
    line_no: '',
    section: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'fromdate') {
      setStartDate(new Date(value));
    } else if (name === 'todate') {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const generateDateColumns = (startDate, endDate) => {
    const dateColumns = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-');
      dateColumns.push({ data: formattedDate, title: formattedDate });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateColumns;
  };

const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
    url: 'http://192.168.29.243:4000/wastage-daterangeview',
    method: 'POST',
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      const { data } = response;
      setData(data);

      // Generate date columns based on the selected date range
      const newDateColumns = generateDateColumns(startDate, endDate);
      setDateColumns(newDateColumns);

      // Set formSubmitted to true when the form is successfully submitted
      setFormSubmitted(true);

      // Now, you can send the generated date columns and response data to another AJAX request
      sendToAnotherRequest(newDateColumns, data);
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
};

// Function to send data to another AJAX request
function sendToAnotherRequest(dateColumns, responseData) {
  const otherJsonData = JSON.stringify({ dateColumns, responseData });
   let receivedData; // Define a variable in the outer scope

  $.ajax({
    url: 'http://192.168.29.243:4000/wastage-target-expected-wasteweight',
    method: 'POST',
    data: otherJsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      const { data } = response;
      setSecondData(data);

       
      // Assign the data to the outer variable
      receivedData = JSON.stringify(data);

      // Now you can use receivedData here or anywhere else in the function
      //alert(receivedData);


    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
}


  useEffect(() => {
      document.title = 'Wastage Report';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        history.push('/login');
      } else {

      $.ajax({
      url: 'http://192.168.29.243:4000/wastage',
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        const { data } = response;
      setData(data);

      // Generate date columns based on the selected date range
      const newDateColumns = generateDateColumns(endDate, endDate);
      setDateColumns(newDateColumns);

      // Set formSubmitted to true when the form is successfully submitted
      setFormSubmitted(true);

      // Now, you can send the generated date columns and response data to another AJAX request
      sendToAnotherRequest(newDateColumns, data);
            
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
        
     }
    
    }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const handleProductChange = (e) => {
    const selectedProduct = e.target.value;

    // Fetch line options based on the selected product
    $.ajax({
      url: `http://192.168.29.243:4000/getLineOptions/${selectedProduct}`,
      method: 'GET',
      success: function (response) {
        setLineOptions(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching line options:', error);
      },
    });
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse', // Collapse borders between cells
  };

  const cellStyle = {
    padding: '5px', // Add some padding to the cells for spacing
    border: '1px solid black', // Add an outer border to the table
    fontSize: '12px',

  };

 const initializeTableCopying = () => {
    // Initialize clipboard.js with the table element
    const clipboard = new ClipboardJS('.copy-button', {
      target: () => tableRef.current,
    });

    // Add an event listener to handle successful copying
    clipboard.on('success', function (e) {
      e.clearSelection(); // Clear the selection after copying
      alert('Table contents copied to clipboard!');
    });

    // Clean up the clipboard instance when the component unmounts
    return () => {
      clipboard.destroy();
    };
  };
 return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Wastage Report</h5>
            <br />
            Date Range
            <hr />
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-4">
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
                <div className="col-sm-4">
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

            <div align="center">
              <h6 class="header-title">

                {formHidden && (
            <>
              From <span className="textred">{fdate}</span> To{' '}
              <span className="textred">{tdate}</span>
            </>
          )}
              </h6>
               <p>From: <span className="textred">{formatCurrentDate(today)}</span> To: <span className="textred">{formatCurrentDate(today)}</span></p>
               
            </div>
            <div style={{ marginBottom: '10px' }}>
              
               
               <button
                className="btn btn-primary copy-button"
                data-clipboard-action="copy"
                data-clipboard-target="#table-to-copy"
              >
                Copy 
              </button>&nbsp;
              <button className="btn btn-success" >
                CSV
              </button>
            </div>

            <div className="table-responsive">
               <table style={tableStyle} ref={tableRef} id="table-to-copy">
                <tbody>
                  <tr>
                    <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Date</td>
                    {formSubmitted
                    ? dateColumns.map((column) => (
                        <React.Fragment key={column.data}>
                          <td colSpan="3" style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>
                            {column.title}
                          </td>
                        </React.Fragment>
                      ))
                    : (
                        <React.Fragment>
                          <td style={cellStyle} colSpan="3">
                            {formatCurrentDate(today)}
                          </td>
                        </React.Fragment>
                      )}
                  </tr>
                  <tr>
                    <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Product Name </td>
                    {formSubmitted
                    ? dateColumns.map((column) => (
                        <React.Fragment key={column.data}>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Targeted</td>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Expected</td>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Waste Weight</td>
                        </React.Fragment>
                      ))
                    : (
                        <React.Fragment>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Targeted</td>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Expected</td>
                          <td style={{ ...cellStyle, fontSize: '12px', fontWeight: 'bold' }}>Waste Weight</td>
                        </React.Fragment>
                      )}
                  </tr>
                  {seconddata && seconddata.map((item, index) => (
                    <tr key={index}>

                       <td style={{ ...cellStyle, color: 'red', fontSize: '10px', fontWeight: 'bold' }}>{item.item_description}</td>
                      {item.item_data.map((dataItem, dataIndex) => (
                      <React.Fragment key={dataIndex}>
                        
                        <td style={cellStyle}>{dataItem.tww}</td>
                        <td style={cellStyle}>{dataItem.eww}</td>
                        <td style={cellStyle}>{dataItem.wst}</td>
                      </React.Fragment>
                    ))}
                    </tr>
                  ))}


                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

function formatCurrentDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default Wastage;
