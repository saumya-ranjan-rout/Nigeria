import React, { useEffect, useState, useRef  } from 'react';
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
import AddNewComponent from './AddNewComponent';
import $ from 'jquery'; 
import { Link } from 'react-router-dom';

export function ItemCategoryComponent() {
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

  useEffect(() => {
    document.title = 'Item Category';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      // Fetch item categories from API
      $.ajax({
        url: 'http://192.168.29.243:4000/ic',
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
              { data: 'category_name' },
            ],
            columnDefs: [
              {
                targets: 0,
                render: function (data, type, row, meta) {
                  // Render the row index starting from 1
                  return meta.row + 1;
                }
              }
            ]
          });
        },
        error: function (xhr, status, error) {
          console.log(error);
        }
      });
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
        <h5 className="title">Item Category{' '}
           
            </h5>
        </div>
          
          <div className="container dt">

          
          <table id="example" class="display">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Category</th>
                </tr>
            </thead>
            
            <tfoot>
                <tr>
                    <th>#</th>
                    <th>Item Category</th>
                </tr>
            </tfoot>
        </table>
          
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default ItemCategoryComponent;
