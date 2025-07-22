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
import config from '../../../config';
import dateUtils from '../../../utils/dateUtils';

export function PlanvsTarget() {

  const [isfetched, setIsfetched] = useState(false);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const today = dateUtils.getCurrentDateTime();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
  const [endDate, setEndDate] = useState(today);

  const [fetchedDate, setFetchedDate] = useState(null);
  const tableRef = useRef(null);

  const [formData, setFormData] = useState({
    date: formattedToday,
  });
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchData();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  const history = useHistory();

  const fetchData = () => {
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);
    // Encode parameters
    const encodedDate = encodeURIComponent(formData.date);
    $.ajax({
      url: `${config.apiUrl}/target-plan/search-by-date?date=${encodedDate}`,
      method: "GET",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        setIsfetched(true);
        setFetchedDate(response.date);
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
              exportOptions: {
                columns: [0, 1, 2, 3, 4],
              },
            },
            {
              extend: 'csv',
              exportOptions: {
                columns: [0, 1, 2, 3, 4],
              },
            },
            {
              extend: 'excel',
              exportOptions: {
                columns: [0, 1, 2, 3, 4],
              },
            },
          ],
          data: response.data,
          columns: [
            { data: null },
            { data: 'item_group' },
            { data: 'item_description' },
            { data: 'plan' },
            { data: 'datetime' },
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
    const isLoggedIn = localStorage.getItem('isLoggedIn');
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
      fetch(`${config.apiUrl}/target-plan/delete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          alert('Plan vs Target deleted');
          // Refresh the list of items
          //fetchData();
          window.location.reload();
        })
        .catch((error) => alert('Error deleting item:', error));
    }
  };
  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  return (
    <div className="container-fluid">
      <div id="layout">
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
              <Link to="/master/datewise-plan-view" className="btn btn-warning btn-sm rounded">
                View
              </Link>
              Import{' '}
              <Link to="/import/import-planvstarget" className="btn btn-danger btn-sm rounded">
                Plan
              </Link>
            </h6>
          </div>

          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-3">
                  <span className="textgreen">Date <span className='textred'>*</span></span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={date => {
                      const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                      const updatedEvent = { target: { value: formattedDate, name: 'date' } };
                      handleInputChange(updatedEvent);

                      setEndDate(date);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Date"
                    name="date"
                    id="date"
                    required
                  />
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
              <hr></hr>
              <div>
                <h4 class="header-title"> <span class="textred" >{isfetched ? `[${fetchedDate}]` : ''}</span></h4>
              </div>

            </form>

            <table id="example" class="display">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tfoot>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
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
    </div>
  );
}

export default PlanvsTarget;
