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

export function FgOutputComponentOtaNbraid() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
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
    

   
  });

  const handleChange = (name, value) => {
  setFormData({ ...formData, [name]: value });
};

const handleEdit = (id) => {
    history.push(`edit_fgoutputotanbraid/${id}`);
  };


  

const handleSubmit = (event) => {
    event.preventDefault();
   const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
 /* if (startDate) {
    // Adjust the selected date based on the time zone offset
    const offset = startDate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(startDate.getTime() - offset);

    const dateValue = adjustedDate.toISOString().split('T')[0];*/


      $.ajax({
        url: 'http://192.168.29.243:4000/get_fg_output_search_ota_nbraid',
        method: 'POST',
        data: updatedFormData,
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
                  // Calculate the index of the row
                  var index = meta.row + meta.settings._iDisplayStart + 1;
                  return index;
                }
              },
              { data: 'item_description' },
              { data: 'product_code' },
              { data: 'product_des' },
              { data: 'line' },
              { data: 'color_name' },
              { data: 'shift' },
              { data: 'hour' },
              { data: 'fg_output' },
              { data: 'date_time' },
              { data: 'site' },
              { data: 'user_name' },
              {
                data: null,
                render: function (data, type, row) {
                  return `
                    <div>
                      <button
                        class="btn btn-primary btn-sm"
                        onclick="handleEdit(${row.id})"
                      >
                        <i class="bx bx-edit"></i>
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        onclick="handleDelete(${row.id})"
                      >
                        <i class="bx bxs-trash"></i>
                      </button>
                    </div>
                  `;
                },
              },
              
              
              
              ]
          });
        },
        error: function (error) {
          console.error(error);
        },
      });
    }
  


const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do You Really Want To Delete fg detail ?');
    
    //alert(id);
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/fgoutputdelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fg Output deleted:', data);
          // Refresh the list of items
           // Reload the page after successful deletion
        window.location.reload();
          
        })
        .catch((error) => console.error('Error deleting Fg Output:', error));
    }
  }; 

const shouldShowDeleteButton = () => {
  // Assuming you want to show the delete button only for a specific role (e.g., roleid === 5)
  return roleId === '5';
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
      url: 'http://192.168.29.243:4000/get_fg_output_default_ota_nbraid',
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
                  // Calculate the index of the row
                  var index = meta.row + meta.settings._iDisplayStart + 1;
                  return index;
                }
              },
              { data: 'item_description' },
              { data: 'product_code' },
              { data: 'product_des' },
              { data: 'line' },
              { data: 'color_name' },
              { data: 'shift' },
              { data: 'hour' },
              { data: 'fg_output' },
              { data: 'date_time' },
              { data: 'site' },
              { data: 'user_name' },
              {
              data: null,
              render: function (data, type, row) {
                return `
                  <div>
                    <button
                      class="btn btn-primary btn-sm"
                      onclick="handleEdit(${row.id})"
                    >
                      <i class="bx bx-edit"></i>
                    </button>
                    ${shouldShowDeleteButton() ? `
                      <button
                        class="btn btn-danger btn-sm"
                        onclick="handleDelete(${row.id})"
                      >
                        <i class="bx bxs-trash"></i>
                      </button>
                    ` : ''}
                  </div>
                `;
              },
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
            <h5 className="title">FG Output {' '}
            <Link to="/fgoutput/add_fgoutput_ota_nbraid" className="btn btn-success btn-sm rounded">
              Add new
            </Link>
            </h5><br></br>
            <h5>Date Range</h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Start Date</span>
                <DatePicker
  className="form-control margin-bottom"
  selected={startDate}
  onChange={date => setStartDate(date)}
  dateFormat="dd-MM-yyyy"
  placeholderText="Select Date"
  name="fromdate"

/>
                </div>
                <div className="col-sm-2">
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
          <th>Product Code</th>
          <th>Product Desc</th>
          <th>Line</th>
          <th>Color</th>
          <th>Shift</th>
          <th>Hour</th>
          <th>FG</th>
          <th>Date</th>
          <th>Site</th>
          <th>Added By</th>
          <th>Actions</th>
        </tr>
      </thead>
      
       {/*<tfoot>
        <tr>
          <th>#</th>
          <th>Product Name</th>
          <th>Product Code</th>
          <th>Product Desc</th>
          <th>Line</th>
          <th>Color</th>
          <th>Shift</th>
          <th>Hour</th>
          <th>FG</th>
          <th>Date</th>
          <th>Site</th>
          <th>Added By</th>
          <th>Actions</th>
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

export default FgOutputComponentOtaNbraid;
