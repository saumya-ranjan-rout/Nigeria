import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
//Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';

import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'jszip';
import 'pdfmake';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* import Sidebar from '../Sidebar'; */
import Sidebar from '../../Sidebar';
import Header from '../../Header';
// import AddNewComponent from './AddNewComponent';
import $ from 'jquery';
import { Link } from 'react-router-dom';

export function PlanVSTargetComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
   const [data, setData] = useState([]);

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };



  const history = useHistory();

  const fetchData = () => {
    $.ajax({
      url: 'http://192.168.29.243:4000/get_default_planvstarget',
      method: 'GET',
      success: function (response) {
        // Set the fetched data in the state
        setItemCategories(response);

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel'],
          data: response,
          columns: [
            { data: null },
            { data: 'product_code' },
            { data: 'product_des' },
            { data: 'target_plan' },
            { data: 'date' },
            { data: 'id' },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              }
            },
            {
              targets: 5,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash"></i></button>
                `;
              },
            },
          ]
        });
      },
      error: function (xhr, status, error) {
        console.log(error);
      }
    });
  }


  useEffect(() => {

    document.title = 'Plan vs Target';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      // Fetch item categories from API
      fetchData();
    }

    // Attach the functions to the window object
    window.handleDelete = handleDelete;
  }, []);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/planvstargetdelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Plan vs Target deleted:', data);
          // Refresh the list of items
          fetchData();
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };
  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const [formData, setFormData] = useState({
     fromdate: '', 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'fromdate') {
    setStartDate(new Date(value));
  } else {
    setFormData({ ...formData, [name]: value });
  }
};

  const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate};

  const jsonData = JSON.stringify(updatedFormData);
  //alert(jsonData);

  $.ajax({
    url: 'http://192.168.29.243:4000/get_search_planvstarget',
    method: "POST",
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
    // Update the component state with the response data
      setData(response);

      // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }

      // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel'],
        data: response, // Use the updated data state
        columns: [
          { data: null },
          { data: 'product_code' },
          { data: 'product_des' },
          { data: 'target_plan' },
          { data: 'date' },
          { data: 'id' },
        ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              }
            },
            {
              targets: 5,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash"></i></button>
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
  };


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h6 className="title">Plan vs Target{' '}
              <Link to="/master/add-plan-target" className="btn btn-success btn-sm rounded">
                Add new
              </Link>
              Datewise{' '}
              <Link to="/master/weekly-plan-view" className="btn btn-warning btn-sm rounded">
                View
              </Link>
              Import{' '}
              <Link to="/master/add-plan-target" className="btn btn-danger btn-sm rounded">
                 Plan
              </Link>
            </h6>
          </div>


          <div className="container dt">
 
          Date Range
          <hr></hr>
             <form  onSubmit={handleSubmit} method='POST'>
          <div className="row space">
                <div className="col-sm-6">
                  <span className="textgreen"> Date</span>
                <DatePicker
                  className="form-control margin-bottom"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select Start Date"
                  name="fromdate"

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

            <table id="example" class="display">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Desc</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tfoot>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Desc</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </tfoot>
            </table>

          </div>
        </main>
      </section>

    </div>
  );
}

export default PlanVSTargetComponent;
