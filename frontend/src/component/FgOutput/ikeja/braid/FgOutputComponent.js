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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function FgOutputComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);


  

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

 const [formData, setFormData] = useState({
     date: '',
    

   
  });

  const handleChange = (name, value) => {
  setFormData({ ...formData, [name]: value });
};

const handleEdit = (id) => {
    history.push(`edit_fgoutput/${id}`);
  };


  

 const handleSubmit = (event) => {
    event.preventDefault();

    if (startDate) {
    // Adjust the selected date based on the time zone offset
    const offset = startDate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(startDate.getTime() - offset);

    const dateValue = adjustedDate.toISOString().split('T')[0];


      $.ajax({
        url: 'http://192.168.29.243:4000/get_fg_output_search_ikeja',
        method: 'POST',
        data: { date: dateValue },
        success: function (response) {


             // Access the timesheet results from the response object
            const { fgDetails } = JSON.stringify(response);

            // Update the component state with the timesheet data
            setData(fgDetails);
          // Handle response data
          //alert(JSON.stringify(response));

         


       // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Reinitialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            data: response, // Use fgDetails as the data source
            columns: [
              {
                data: null,
                render: function (data, type, row, meta) {
                  return meta.row + 1; // Auto-increment for each row
                }
              },
              { data: 'item_description' },
              { data: 'color_name' },
              { data: 'tar' },
              { data: 'date' },
              { data: 'site' },
              {
                data: 'emp_id',
                render: function (data, type, row) {
                  // Conditionally render the 'name' based on the 'emp_id'
                  return data === 1 ? 'admin' : row.name;
                }
              },
              
              ]
          });
        },
        error: function (error) {
          console.error(error);
        },
      });
    }
  };


const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this FG Output?');
    
    //alert(id);
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/fgoutputdelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fg Output deleted:', data);
          // Refresh the list of items
          
        })
        .catch((error) => console.error('Error deleting Fg Output:', error));
    }
  }; 


    useEffect(() => {

       document.title = 'FG Output';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

    $.ajax({
      url: 'http://192.168.29.243:4000/get_fg_output_default_ikeja',
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {

         // Access the timesheet results from the response object
            const { fgDetails } = JSON.stringify(response);

            // Update the component state with the timesheet data
            setData(fgDetails);
          // Handle response data
          //alert(JSON.stringify(response));

         


       // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Reinitialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            data: response, // Use fgDetails as the data source
            columns: [
              {
                data: null,
                render: function (data, type, row, meta) {
                  return meta.row + 1; // Auto-increment for each row
                }
              },
              { data: 'item_description' },
              { data: 'color_name' },
              { data: 'tar' },
              { data: 'date' },
              { data: 'site' },
              {
                data: 'emp_id',
                render: function (data, type, row) {
                  // Conditionally render the 'name' based on the 'emp_id'
                  return data === 1 ? 'admin' : row.name;
                }
              },
             
             
              
              
              
              
              ]
          });
        },
                  error: function (xhr, status, error) {
                    console.error('Error:', error);
                  },
                });
             

                     
                    }
 

    
// Attach the functions to the window object
    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
    
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
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
           
            <h5>Date Range</h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-6">
                  <span className="textgreen">Date</span>
                <DatePicker
  className="form-control margin-bottom"
  selected={startDate}
  onChange={date => setStartDate(date)}
  dateFormat="dd-MM-yyyy"
  placeholderText="Select Date"
  name="date"

/>
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

            
            
              
           
           <div className="table-responsive">
    <table id="example" className="display">
      <thead>
        <tr>
         <th>#</th>
          <th>Product Name</th>
          <th>Color </th>
          <th>FG</th>
          <th>Date</th>
          <th>Site</th>
          <th>Added By</th>
        </tr>
      </thead>
      
      {/*<tfoot>
        <tr>
        <th>#</th>
          <th>Product Name</th>
          <th>Color </th>
          <th>FG</th>
          <th>Date</th>
          <th>Site</th>
          <th>Added By</th>
        </tr>
      </tfoot>*/}
    </table>
  </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default FgOutputComponent;
