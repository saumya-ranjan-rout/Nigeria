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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';

export function SectionComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
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

  const handleEdit = (id) => {
    history.push(`/master/edit-section/${id}`);
  };

  
   const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do You Really Want To Delete Section??');
    if (confirmDelete) {

      // Destroy the DataTable instance before making the fetch request
    if (tableRef.current) {
      tableRef.current.destroy();
    }
      fetch(`http://192.168.29.243:4000/sectiondelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Section deleted:', data);
          // Refresh the list of items
          fetchData();
          // Set the server message and style it
          setServerMessage('Section deleted successfully');
          setServerMessageClass('alert alert-success');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
          }, 5000);
        })
        .catch((error) => {
          console.error('Error deleting Section:', error);
          // Set the server error message and style it
          setServerMessage('An error occurred while deleting Section');
          setServerMessageClass('alert alert-danger');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
          }, 3000);
        });
    }
  };

  const fetchData = () => {
    $.ajax({
      url: 'http://192.168.29.243:4000/section',
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
            { data: null },
            { data: 'section_name' },
            { data: 'target_unit' },
            { data: 'section_type' },
            { data: 'id' },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              },
            },
            {
              targets: 4,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash"></i></button>
                `;
              },
            },
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
        <h5 className="title">Section{' '}
            <Link to="/master/add-section" className="btn btn-success btn-sm rounded">
              Add new
            </Link>
            </h5>
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
                    <th>Section Name</th>
                    <th>Target Unit</th>
                     <th>Section Type</th>
                    <th>Action</th>
                </tr>
            </thead>
            
            <tfoot>
                <tr>
                <th>#</th>
                    <th>Section Name</th>
                    <th>Target Unit</th>
                     <th>Section Type</th>
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

export default SectionComponent;
