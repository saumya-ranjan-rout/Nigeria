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
import config from '../../../config';

export function AddShiftComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };



  const history = useHistory();

  useEffect(() => {
    document.title = 'Add Shift';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

    }
  }, []);


  const [formData, setFormData] = useState({
    shift_name: '',

  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    $.ajax({
      url: `${config.apiUrl}/shift/add`,
      method: "POST",
      headers: customHeaders,
      data: formData,
      success: function (response) {
        alert(response.message);
        if (response.status == 'Success') {
          history.push('/master/shift');
        }
      },
      error: function (xhr, status, error) {
        if (xhr.status === 409) {
          // If the status code is 409, alert the message from the server response
          alert(xhr.responseText);
        } else {
          // For other error cases, display a generic error message
          alert('Failed to communicate with the server. Please try again later.');
        }
      }

    });

  };

  return (
       <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >

              <h5>Add New Shift</h5>
              <hr></hr>

              <div className="form-group row">

                <label className="col-sm-2 col-form-label"
                  for="product_catname">Name <span className='textred'>*</span></label>

                <div className="col-sm-6">
                  <input type="number" placeholder=" Name"
                    className="form-control margin-bottom" name="shift_name" value={formData.shift_name} onChange={handleInputChange} required min={1} max={24} />
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
    </div>
  );
}

export default AddShiftComponent;
