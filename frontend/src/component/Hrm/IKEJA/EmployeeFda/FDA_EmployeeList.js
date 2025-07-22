import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


export function FDAList() {
 
  const [EmployeeData, setEmployeeData] = useState([]);
  const history = useHistory();
  const tableRef = useRef(null);
 
  function convertDateToISO(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[2];
      const month = parts[1];
      const day = parts[0];
      return year + '-' + month + '-' + day;
    }
    return null;
  }


// Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#changezone')) {
    $('#changezone').DataTable().destroy();
  }

// Initialize the DataTable with the updated data
tableRef.current = $('#changezone').DataTable({
  dom: 'Bfrtip',
  buttons: [
      {
          extend: 'copy',
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
      {
          extend: 'csv',
          filename: 'Employees_Details', // Removed space in filename
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
  ],
  data: EmployeeData,
  columns: [
      { data: null}, // Added defaultContent and orderable for the index column
      { data: 'entryid' },
      { data: 'name' },
      { data: 'passive_type' },
      { data: 'joindate' },
      { data: 'exitdate' },
      {
        data: null,
        render: function (data, type, row) {
          if (type === 'display') {
            const joindate = convertDateToISO(row.joindate); // Assuming 'joindate' and 'exitdate' are available in the 'row' object
            const exitdate = convertDateToISO(row.exitdate);
            
            const joinTimestamp = Date.parse(joindate); // Convert to timestamp
            const exitTimestamp = Date.parse(exitdate); // Convert to timestamp
           //alert(joindate+''+joinTimestamp)
            if (!isNaN(joinTimestamp) && !isNaN(exitTimestamp)) {
              const differenceInMilliseconds = exitTimestamp - joinTimestamp;
              const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
              return differenceInDays; // Display the difference in days with two decimal places
            }
          }
      
          return 'Invalid Dates'; // Handle cases where dates are invalid or when not in 'display' mode
        },
      },
        
      { data: 'dept' },
      
  ],
  columnDefs: [
      {
          targets: 0,
          render: function (data, type, row, meta) {
              // Render the row index starting from 1
              return meta.row + 1; // Changed to use meta.row for the index
          },
      },
  ],
});

  useEffect(() => {
    document.title = 'Employees List(FDA)';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
        const fetchEmployeeData = () => {
            fetch('http://192.168.29.243:4000/ikeja/getEmployeeFdaData')
              .then((response) => response.json())
              .then((data) => setEmployeeData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
          fetchEmployeeData();
    }
  }, []);


  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
          <div className="container dt">
          <br/>
          <h4 className="title" style={{textAlign:'center'}}>IKEJA FDA EMPLOYEES LIST FROM LAST 3 MONTHS<button class="btn btn-warning textwhite"><i class="bx bx-calendar-event"></i>Ikeja FDA Attendance</button></h4>
          <br/>
          <hr/>
      
          <table id="changezone" className="display">
            <thead>
              <tr>
                <th>Slno</th>
                <th>Entry ID</th>
                <th>Name</th>
                <th>Passive Type</th>
                <th>Join Date</th>
                <th>Exit Date</th>
                <th>Service Days</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
           
            </tbody>
          </table>
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default FDAList;
