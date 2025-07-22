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
import $ from 'jquery'; 

export function AddNewISCComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [serverMessage, setServerMessage] = useState('');
  const tableRef = useRef(null);

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

   

  const history = useHistory();

  useEffect(() => {
    document.title = 'Add Item Subcategory';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

       // Fetch item categories from API
       $.ajax({
        url: 'http://192.168.29.243:4000/itemcategories', // Replace with your API endpoint
        method: 'GET',
        success: function (response) {
          setCategories(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });

      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, []);


  const [formData, setFormData] = useState({
    subcategory_name: '',
    category_id: '', // New field for storing the selected category ID
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    $.ajax({
      url: 'http://192.168.29.243:4000/additemsubcategory',
      method: "POST",
      data: formData,
      success: function (response) {
       // console.log(response);
        // Redirect to ItemCategoryComponent after successful addition
      //history.push('/master/item-subcategory');
      setServerMessage(response.message);

      // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
      }
      
    });
    //alert("Added Item Subcategory Successfully..");
  };

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
       <Header />

        <main>
        <div className="container dt">
        <div className="row">
            <div className="col-sm-12">
              {/* Show the server response message in this div */}
              {serverMessage && <div className="alert alert-info">{serverMessage}</div>}
            </div>
          </div>
        <form onSubmit={handleSubmit} method='POST' >

              <h5>Add New Item Subcategory</h5>
              <hr></hr>

              <div class="form-group row space">

                    <label class="col-sm-2 col-form-label"
                           for="category">Category Name</label>

                    <div class="col-sm-6">
                    <select
                    class="form-control"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                    </div>
                </div>
              
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"
                        for="product_catname">Subcategory Name</label>

                  <div className="col-sm-6">
                      <input type="text" placeholder=" Name"
                            className="form-control margin-bottom  required" name="subcategory_name"  value={formData.subcategory_name} onChange={handleInputChange} required/>
                  </div>
              </div>
                
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Add" data-loading-text="Adding..." />
                      
                  </div>
              </div>


              </form>
        </div>
          
        
        </main>
      </section>
      
    </div>
  );
}

export default AddNewISCComponent;
