import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'jszip';
import 'pdfmake';
import Sidebar from './Sidebar';
import Header from './Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';

export function UserStatusComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const tableRef = useRef(null);
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const fetchData = () => {
    $.ajax({
      url: 'http://192.168.29.243:4000/userstatus',
      method: 'GET',
      success: function (response) {
        // Set the fetched data in the state
        setUsers(response);

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          //buttons: ['copy', 'csv'],
          buttons: [
            {
              extend: 'copy',
              text: 'Copy',
              exportOptions: {
                columns: [0, 1, 2, 3], // Include only the first and second columns in copying
              },
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                columns: [0, 1, 2, 3], // Include only the first and second columns in CSV
              },
              action: function (e, dt, button, config) {
                // Hide the action column when CSV button is clicked
                tableRef.current.column(2).visible(false);
                $.fn.DataTable.ext.buttons.csvHtml5.action.call(this, e, dt, button, config);
                tableRef.current.column(2).visible(true); // Show the action column again
              },
            },
          ],
          data: response,
columns: [
  {
    data: null,
    render: function (data, type, row, meta) {
      return meta.row + 1; // Serial number
    },
  },
  { data: 'name' },
  {
    data: null,
    render: function (data, type, row) {
      return `${row.email} (${row.entryid})`;
    },
  },
  {
    data: 'roleid',
    render: function (data, type, row) {
      if (data == 5) return 'Admin';
      else if (data == 3) return 'Operator';
      else if (data == 6) return 'Manager';
      else return data;
    },
  },
  { data: 'production_type' },
  { data: 'category_type' },
  {
    data: 'status',
    render: function (data, type, row) {
      if (data === 'online') {
        return '<span style="color: green; font-size: 20px;">•</span>';
      } else if (data === 'offline') {
        return '<span style="color: red; font-size: 20px;">•</span>';
      } else {
        return data;
      }
    },
  },
  { data: 'login_time' },
  { data: 'logout_time' },
],


        });
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  };

  useEffect(() => {

    document.title = 'Section';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      // Fetch item categories from API
      fetchData();
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
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
        <div className="container dt">

        </div>
          
          <div className="container dt">
 {serverMessage && (
              <div className={serverMessageClass} style={{ padding: '5px', margin: '5px 0' }}>
                {serverMessage}
              </div>
            )}
          
          <table id="example" class="display">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Username(Entry Id)</th>
                    <th>Role</th>
                    <th>Production Type</th>
                     <th>Category Type</th>
                      <th>Status</th>
                       <th>Login</th>
                        <th>Last Logout</th>
          
                </tr>
            </thead>
            
            <tfoot>
                <tr>
                <th>#</th>
                    <th>Name</th>
                    <th>Username(Entry Id)</th>
                    <th>Role</th>
                    <th>Production Type</th>
                     <th>Category Type</th>
                      <th>Status</th>
                       <th>Login</th>
                        <th>Last Logout</th>
                   
                </tr>
            </tfoot>
        </table>
          
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default UserStatusComponent;
