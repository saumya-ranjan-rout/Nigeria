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

/* import Sidebar from '../Sidebar'; */
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import config from '../../../config';
import dateUtils from '../../../utils/dateUtils';

export function DatewisePlanView() {

  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);

  const dateHeaders = dateUtils.getCurrentMonthDates();

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const history = useHistory();

  const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/target-plan/current-month`,
      method: 'GET',
      headers: customHeaders,
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
          //scrollY: '300px', // Set the height here
          //scrollCollapse: true, // To enable the collapsing of the table
          scrollX: true,
          columns: [
            { data: null },
            { data: 'item_group' },
            { data: 'item_description' },

            ...dateHeaders.map((date, index) => ({
              data: null,
              render: function (data, type, row) {
                if (type === 'display') {
                  const plan = `${row[`day${index}`]}`;

                  return plan;
                }
                return data;
              },
            })),

            // ... Other parts of your code ...

          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              }
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
  }, []);


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

            </h6>
          </div>

          <div className="container dt">


            <table id="example" class="display">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Name</th>

                  {/* ... Other column headers ... */}
                  {dateHeaders.map((date) => (
                    <th key={date}>{date}</th>
                  ))}
                </tr>
              </thead>

              <tfoot>
                <tr>
                  <th>#</th>
                  <th>Product Code</th>
                  <th>Product Name</th>

                  {/* ... Other column headers ... */}
                  {dateHeaders.map((date) => (
                    <th key={date}>{date}</th>
                  ))}
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

export default DatewisePlanView;
