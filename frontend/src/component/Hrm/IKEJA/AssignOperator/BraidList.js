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
import 'react-datepicker/dist/react-datepicker.css';

export function BraidAssignList() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [workList, setAssignList] = useState([])
  const tableRef = useRef(null);
  
  const toggleClass = () => {
    setActive(!isActive);
  };
  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };
 
  const history = useHistory();
  useEffect(() => {
  document.title = 'Employee Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    history.push('/login');
  } else {
    window.handleDelete = handleDelete;
    const fetchUsers = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/get_operator_assign_list`,
        method: 'GET',
        success: function (response) {
          
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#asssignNbraid')) {
          $('#asssignNbraid').DataTable().destroy();
        }
        // Initialize the DataTable with the updated data
        tableRef.current = $('#asssignNbraid').DataTable({
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
          data: response,
          columns: [
              { data: null},
              { data: 'name'}, // Added defaultContent and orderable for the index column
              { data: 'entryid' },
              { data: 'zone' },
              { data: 'machine' },
              {
                data: null,
                render: function (data, type, row) {
                  const id = data.id;
                  
                    return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="bx bx-trash-alt"></i></button>`
                
                },
              }
          
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
  
          setAssignList(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };
    fetchUsers();
  }
}, [history]); 

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/delete_assign_list/${id}`,
        method: 'DELETE',
        success: function (response) {
          alert(response);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Show List of work assign to operator</h5>
            <hr/>
             <div className='row'>
                <div className='col-md-12'>
                <table id="asssignNbraid" className="display">
                        <thead>
                            <tr>
                                <th>Slno</th>
                                <th>Name</th>
                                <th>EntryId</th>
                                <th>Zone</th>
                                <th>Machine</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
             </div>
        
          </div>
        </main>
      </section>
    </div>
  );
}

export default BraidAssignList;
