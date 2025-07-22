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

export function ItemSubCategoryComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const handleEdit = (id) => {
    history.push(`/master/edit-itemsubcategory/${id}`);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/iscdelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Item deleted:', data);
          // Refresh the list of items
          fetchData();
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };

  const fetchData = () => {
    $.ajax({
      url: 'http://192.168.29.243:4000/isc',
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
            { data: 'category_id' },
            { data: 'subcategory_name' },
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
              targets: 3,
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
    document.title = 'Item Subcategory';
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
        <h5 className="title">Item Subcategory{' '}
            <Link to="/master/add-itemsubcategory" className="btn btn-success btn-sm rounded">
              Add new
            </Link>
            </h5>
        </div>
          
          <div className="container dt">

          
          <table id="example" class="display">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Category</th>
                    <th>Item Subcategory</th>
                    <th>Action</th>
                </tr>
            </thead>
            
            <tfoot>
                <tr>
                <th>#</th>
                    <th>Item Category</th>
                    <th>Item Subcategory</th>
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

export default ItemSubCategoryComponent;
