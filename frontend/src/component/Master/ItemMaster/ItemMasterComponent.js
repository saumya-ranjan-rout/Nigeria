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

export function ItemMasterComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const handleView = (id, item_description) => {
    history.push(`/master/view-itemmaster/${id}`, { itemId: id, item_description: item_description });
  };

  const handleAdd = (id, item_description) => {
    history.push(`/master/add-coloritemmaster/${id}`, { itemId: id, item_description: item_description });
  };

  const handleEdit = (id) => {
    history.push(`/master/edit-itemmaster/${id}`);
  };

 

const handleDelete = (id) => {
  const confirmDelete = window.confirm('Delete this item carefully because it will affect your dependency');
  if (confirmDelete) {
    fetch(`http://192.168.29.243:4000/itemmasterdelete/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Item deleted:', data);
        // Set the server message and style it
        setServerMessage('Item deleted successfully');
        setServerMessageClass('alert alert-success');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
        }, 5000);
        // Refresh the list of items
        fetchData();
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        // Set the server error message and style it
        setServerMessage('An error occurred while deleting item');
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
      url: 'http://192.168.29.243:4000/getitemmaster',
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
          // buttons: ['copy', 'csv'],
          buttons: [
            {
              extend: 'copy',
              text: 'Copy',
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5, 6], // Include only the first and second columns in copying
              },
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                 columns: [0, 1, 2, 3, 4, 5, 6], // Include only the first and second columns in CSV
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
            { data: 'category_name' },
            { data: 'item_group' },
             { data: 'item_description' },
            { data: 'tppp' },
            { data: 'net_weight' },
            { data: 'targeted_waste' },
           
            { data: 'category_id' },
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
              targets: 7,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                 <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})" title="Item Edit"><i class="bx bx-edit"></i></button>
                  <button class="btn btn-sm btn-info" onclick="handleView(${id}, '${row.item_description}')" title="Add Section target"><i class="bx bx-show-alt"></i> </button>
                  <button class="btn btn-sm btn-success" onclick="handleAdd(${id}, '${row.item_description}')" title="Add Color Code"><i class="bx bx-plus-medical"></i> </button>
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash" title="Delete"></i></button>
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
    document.title = 'Item Master';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      // Fetch item categories from API
      fetchData();
    }

     // Component unmount cleanup - destroy the DataTable instance
  /*return () => {
    if (tableRef.current) {
      tableRef.current.destroy();
    }
  };*/


    // Attach the functions to the window object
    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
    window.handleView = handleView;
    window.handleAdd = handleAdd;
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
         <div className={serverMessageClass} style={{ padding: '5px', margin: '5px 0' }}>
                {serverMessage}
              </div>
        <h5 className="title">Item Master{' '}
            <Link to="/master/add-itemmaster" className="btn btn-success btn-sm rounded">
              Add new
            </Link>
            </h5>
        </div>
          
          <div className="container dt">

          
          <table id="example" className="display">
  <thead>
    <tr>
      <th>#</th>
      <th>Item Category</th>
      <th>ETA Code</th>
      <th>Product Name</th>
      <th>Targeted PPP</th>
      <th>Net Weight</th>
      <th>Targeted Waste</th>
      <th>Action</th>
    </tr>
  </thead>
  
  <tfoot>
    <tr>
     <th>#</th>
      <th>Item Category</th>
      <th>ETA Code</th>
      <th>Product Name</th>
      <th>Targeted PPP</th>
      <th>Net Weight</th>
      <th>Targeted Waste</th>
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

export default ItemMasterComponent;
