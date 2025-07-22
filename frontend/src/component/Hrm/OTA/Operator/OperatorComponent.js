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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';

export function OperatorComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [operators,setOperatorData] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
 // All action buttons//
 const ConvertToCategory = (id) => {
  history.push(`/hrm/ota/convert_category_op/${id}`);
}
  const handleView = (id) => {
    history.push(`/hrm/ota/viewoperator/${id}`);
  };

  const assignOperator = (id) => {
    history.push(`/hrm/ota/addassignoperator/${id}`);
  };

  const assignOp_ndraid = (id) => {
    history.push(`/hrm/ota/addassign_nbraid/${id}`);
  };

  const DeleteOperator = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
        $.ajax({
        url: `http://192.168.29.243:4000/ota/operator_delete/${id}`,
        method: 'DELETE',
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };

  const Convert = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to convert this employee from Operator to Worker?');
    if (confirmDelete) {
        $.ajax({
        url: `http://192.168.29.243:4000/ota/convert/${id}`,
        method: 'DELETE',
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
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
    $.ajax({
      url: 'http://192.168.29.243:4000/ota/operator_data_view',
      method: 'GET',
      success: function (response) {
        // Set the fetched data in the state
        setOperatorData(response);

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
                const id = row.id;
                if(row.category_type == "BRAID"){
                  return data.category_type + '<br><span style="background-color:#5ed45e;border-radius:15px;color:#fff;font-size:10px;padding:2px;cursor: pointer;" onclick="ConvertToCategory(' + id + ')">Convert to NBRAID</span>'
                }else{
                  return data.category_type + '<br><span style="background-color:#ff6262;border-radius:15px;color:#fff;font-size:10px;padding:2px;cursor: pointer;" onclick="ConvertToCategory(' + id + ')">Convert to BRAID</span>'
                }
              },
            },
            { data: 'empname' },
            
            {
              data: null,
              render: function (data, type, row) {
                if(data.status == "P"){
                  return data.workertype + '<br>(' + data.shift + ')<br><span style="color:blue">Present</span>'
                }else{
                  return data.workertype + '<br>(' + data.shift + ')<br><span style="color:red">Absent</span>'
                }
              
              },
            },
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
                if(row.category_type == "NBRAID"){
                   btn="primary"
                   lnk="assignOp_ndraid("+id+")"
                }else{
                  btn="warning"
                  lnk="assignOperator("+id+")";
                }
                return `
                <span style="display:inline;">
                  <button class="btn btn-sm btn-`+btn+`" style="color:#fff;font-size:13px;padding:auto;margin-bottom:2px;width :30px;" onclick="`+lnk+`" title="Assign Work"><i class="bx bx-plus-medical"></i></button>
                  <button class="btn btn-sm btn-info" style="color:#fff;font-size:13px;padding:auto;margin-bottom:2px;width :30px;" onclick="handleView(${id})" title="View"><i class="bx bx-show-alt"></i></button>
                  <button class="btn btn-sm btn-danger" style="color:#fff;font-size:13px;padding:auto;margin-bottom:2px;width :30px;" onclick="DeleteOperator('${id}')" title="Delete"><i class="bx bx-trash-alt"></i></button>
                  <button class="btn btn-sm" style="color:#fff;font-size:13px;padding:auto;margin-bottom:2px;width :30px;background-color:purple;" onclick="Convert('${id}')" title="Convert"><i class="bx bx-sort" style="transform: rotate(90deg);"></i></button>
                  </span>  
              `
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
    document.title = 'Employees List';
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
    window.ConvertToCategory = ConvertToCategory;
    window.assignOp_ndraid = assignOp_ndraid;
    window.assignOperator = assignOperator;
    window.DeleteOperator = DeleteOperator;
    window.handleView = handleView;
    window.Convert = Convert;
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
        <h5 className="title">Operator{' '}
            <Link to="/hrm/ota/addoperator" className="btn btn-success btn-sm rounded">
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
                <th>Assigned Category</th>
                <th>Role</th>
                <th>Worker Type(Shift)</th>
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
                <th>Assigned Category</th>
                <th>Role</th>
                <th>Worker Type(Shift)</th>
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

export default OperatorComponent;
