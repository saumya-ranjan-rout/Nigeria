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
import config from '../../../config';

export function OperatorComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const history = useHistory();
  // All action buttons//
  const ConvertToCategory = (id) => {
    history.push(`/hrm/convert_category_op/${id}`);
  }
  const handleView = (id) => {
    history.push(`/hrm/viewoperator/${id}`);
  };

  const assignOperator = (id) => {
    history.push(`/hrm/addassignoperator/${id}`);
  };

  const assignOp_ndraid = (id) => {
    history.push(`/hrm/addassign/${id}`);
  };

  const DeleteOperator = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/operator/delete/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {

          window.location.reload();
        },
        error: function (xhr, status, error) {
          alert(error);
          console.error('Error deleting', error);
        },
      });
    }
  };

  const DisableOperator = (id) => {
    const confirmDisable = window.confirm('Are you sure you want to disable this operator?');
    if (confirmDisable) {
      $.ajax({
        url: `${config.apiUrl}/operator/disable/${id}`,
        method: 'PUT',
        headers: customHeaders,
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          alert(error);
          console.error('Error in disable', error);
        },
      });
    }
  };


  const EnableOperator = (id) => {
    const confirmEnable = window.confirm('Are you sure you want to enable this operator?');
    if (confirmEnable) {
      $.ajax({
        url: `${config.apiUrl}/operator/enable/${id}`,
        method: 'PUT',
        headers: customHeaders,
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          alert(error);
          console.error('Error enabling', error);
        },
      });
    }
  };

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };





  const fetchData = () => {
    setLoading(true);
    $.ajax({
      url: `${config.apiUrl}/operator/${roleId}/${userid}`,
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
          buttons: [
            {
              extend: 'copy',
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5], // Specify the column indices you want to include in the export
              },
            },
            {
              extend: 'csv',
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5], // Specify the column indices you want to include in the export
              },
            },
            {
              extend: 'excel',
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5], // Specify the column indices you want to include in the export
              },
            },

          ],
          data: response,
          columns: [
            { data: null },
            {
              data: null,
              render: function (data, type, row) {
                return data.name + '<br>(' + data.entryid + ')<br>'
              },
            },
            { data: 'email' },

            {
              data: null,
              render: function (data, type, row) {
                if (data.status === "P") {
                  return data.emptype + '<br><span style="color:blue">Present</span>'
                } else {
                  return data.emptype + '<br><span style="color:red">Absent</span>'
                }

              },
            },
            {
              data: null,
              render: function (data, type, row) {
                return data.workertype + '<br>(' + data.shift + ')'
              },
            },
            { data: 'site' },
            { data: null, className: 'action-column' }, // Add class 'action-column' to the action column
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1
              },
            },
            {
              targets: 6,
              render: function (data, type, row, meta) {
                const id = row.id;
                const eid = row.entryid
                let btn;
                let lnk;
                if (row.category_type === "BRAID") {
                  btn = "primary"
                  lnk = "assignOperator(" + id + ")";
                } else {
                  btn = "success"
                  lnk = "assignOp_ndraid(" + id + ")"
                }

                let action_btns = `
                 
                  <button class="btn btn-sm btn-info" style="color:#fff;padding:3px;" onclick="handleView(${id})" title="View"><i class="bx bx-show"></i></button>
                 
                  
                 
              `;
                if (row.banned === 1) {
                  action_btns += `<button class="btn btn-sm btn-warning" style="color:#fff;padding:3px;" onclick="EnableOperator('${eid}')" title="Enable Operator"><i class="bx bx-toggle-left"></i></button>`;
                } else {
                  action_btns += ` 
                  <button class="btn btn-sm btn-`+ btn + `" onclick="` + lnk + `" style="color:#fff;padding:3px;" title="Asign Operator"><i class="bx bx-plus-medical"></i></button>
                  <button class="btn btn-sm btn-danger" style="color:#fff;padding:3px;" onclick="DeleteOperator('${eid}')" title="Delete Operator"><i class="bx bxs-trash"></i></button>`;
                }
                return action_btns;


                //   return `
                //    <button class="btn btn-sm btn-`+ btn + `" onclick="` + lnk + `" style="color:#fff;padding:3px;" title="Asign Operator"><i class="bx bx-plus-medical"></i></button>
                //     <button class="btn btn-sm btn-info" style="color:#fff;padding:3px;" onclick="handleView(${id})" title="View"><i class="bx bx-show"></i></button>
                //    
                //     <button class="btn btn-sm btn-warning" style="color:#fff;padding:3px;" onclick="EnableOperator('${eid}')" title="Enable Operator"><i class="bx bx-toggle-left"></i></button>
                //     <button class="btn btn-sm btn-success" style="color:#fff;padding:3px;" onclick="DisableOperator('${eid}')" title="Disable Operator"><i class="bx bx-toggle-right"></i></button>
                // `;
              },
            },
          ],
        });
        setLoading(false);
      },
      error: function (xhr, status, error) {
        setLoading(false);
        console.log(error);
      },
    });
  };

  useEffect(() => {
    document.title = 'Employees List';
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
    window.ConvertToCategory = ConvertToCategory;
    window.assignOp_ndraid = assignOp_ndraid;
    window.assignOperator = assignOperator;
    window.DeleteOperator = DeleteOperator;
    window.EnableOperator = EnableOperator;
    window.DisableOperator = DisableOperator;
    window.handleView = handleView;
  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  return (
    <>
      {
        loading ? (
          <div className="loader-overlay" >
            <div className="loader"></div>
          </div>
        ) : (
          <div>{/* Render your content */}</div>
        )
      }
    <div className="container-fluid">
      <div id="layout">
        <Sidebar />

        <section id="content">
          <Header />

          <main>
            <div className="container dt">
              <h5 className="title">Operator{' '}
                <Link to="/hrm/addoperator" className="btn btn-success btn-sm rounded">
                  Add new
                </Link>
              </h5>
            </div>

            <div className="container dt">


              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name/Entry Id</th>
                    <th>Email</th>

                    <th>Role</th>
                    <th>Worker Type(Shift)</th>
                    <th>Site</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
                <tfoot>
                  <tr>
                    <th>#</th>
                    <th>Name/Entry Id</th>
                    <th>Email</th>

                    <th>Role</th>
                    <th>Worker Type(Shift)</th>
                    <th>Site</th>
                    <th>Action</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </main>
        </section>

      </div>
      </div>
    </>
  );
}

export default OperatorComponent;
