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
  import '../Loader.css' // Import the CSS file
  import 'jszip';
  import 'pdfmake';
  import Sidebar from '../../Sidebar';
  import Header from '../../Header';
  import $ from 'jquery';
  import { Link } from 'react-router-dom';
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';

  export function PPPOverall() {
    const [loading, setLoading] = useState(false);
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [itemCategories, setItemCategories] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const today = new Date(); // Get the current date
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    // Add one day to oneMonthAgo
    oneMonthAgo.setDate(oneMonthAgo.getDate() + 1);

    const [startDate, setStartDate] = useState(oneMonthAgo);
    const [endDate, setEndDate] = useState(today);
   
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');
  

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
  

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
       zone: '',
       shift: '',
       machine1: '',
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
    
    // Define an array to store the 'tw' values
          let twValues = []; 
           let tfgValues = []; 

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


      // Modify the sendToAnotherRequest function to return a Promise
      function sendToAnotherRequest(dateColumns, responseData) {
        setLoading(true)
        return new Promise((resolve, reject) => {
          const otherJsonData = JSON.stringify({ dateColumns, responseData });

          $.ajax({
            url: 'http://192.168.29.243:4000/getpppvalue',
            method: 'POST',
            data: otherJsonData,
            processData: false,
            contentType: 'application/json',
            success: function (response) {
              const { data } = response;

              // Resolve the Promise with the response data
              resolve(data);
              setLoading(false)
            },
            error: function (xhr, status, error) {
              console.error('Error:', error);

              // Reject the Promise with the error
              reject(error);
            },
          });
        });
      }

// In your handleSubmit function, use the Promise
const handleSubmit = (event) => {
  setLoading(true);
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
    url: 'http://192.168.29.243:4000/ppp_overall_daterangeview',
    method: "POST",
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      const { items, from, to } = response;
    
      setFDate(from);
      setTDate(to);

      const newDateColumns = generateDateColumns(startDate, endDate);
      

      // Use the Promise to get the response from sendToAnotherRequest
      sendToAnotherRequest(newDateColumns, response)
  .then((receivedData) => {
    //alert(JSON.stringify(receivedData));
    // Now you can use receivedData here to create the DataTable
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Assuming receivedData is your original data
const formattedData = receivedData[0].item_data.map((item) => ({
  date: item.date,
  pw: parseFloat(item.pw).toFixed(2), // Format 'pw' to two decimal places
}));

    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv'],
      data: formattedData, // Use the received data here
      columns: [
        { data: 'date', title: 'Date' },
        { data: 'pw', title: 'PPP' }, // Use 'pw' data for the 'PPP' column
      ],
    });
  })
  
  .catch((error) => {
    console.error('Error:', error);
  });

  setLoading(false);
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
};


      useEffect(() => {

         document.title = 'Productive Breakdown';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        history.push('/login');
      } else {


   $.ajax({
        url: 'http://192.168.29.243:4000/getdefault_ppp_overall',
        method: 'GET',
        processData: false,
        contentType: 'application/json',
       success: function (response) {
        const { items, from, to } = response;
        setFDate(from);
        setTDate(to);
  
        const newDateColumns = generateDateColumns(today, today);

  
        // Use the Promise to get the response from sendToAnotherRequest
        sendToAnotherRequest(newDateColumns, response)
    .then((receivedData) => {
      //alert(JSON.stringify(receivedData));
      // Now you can use receivedData here to create the DataTable
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
  
      // Assuming receivedData is your original data
  const formattedData = receivedData[0].item_data.map((item) => ({
    date: item.date,
    pw: parseFloat(item.pw).toFixed(2), // Format 'pw' to two decimal places
  }));
  
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv'],
        data: formattedData, // Use the received data here
        columns: [
          { data: 'date', title: 'Date' },
          { data: 'pw', title: 'PPP' }, // Use 'pw' data for the 'PPP' column
        ],
      });
    })
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
              <h5 className="title">PPP Overall</h5>
              <br/>
                <h5 className="title">Date Range</h5>
                <hr></hr>
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-4">
                    <span className="textgreen">Start Date</span>
                  <DatePicker
                  className="form-control margin-bottom"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
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
                    onChange={date => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                  </div>

                  
                  <div className="col-sm-4">
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
             
              <br/>
              <div>
                <h6 className="header-title" style={{ textAlign: 'center' }}>
                  <span style={{ color: 'red' }}>
                    {fdate !== tdate
                      ? (
                        <>
                          <span style={{ color: 'black' }}> FROM </span>
                           [{formatDate(new Date(fdate))}] 
                          <span style={{ color: 'black' }}> TO </span> 
                          [{formatDate(new Date(tdate))}]
                        </>
                      ) :
                      <>
                   <span style={{ color: 'black' }}>  Today </span> <span style={{ color: 'red' }}>[{formatDate(today)}]</span>
                  </>
                   }
                  </span>
            
                </h6>
              </div>
             
              <div className="table-responsive">
             

                <table id="example" className="display">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>PPP</th>
                      
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

  export default PPPOverall;
