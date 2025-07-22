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
import { useParams } from 'react-router-dom'

/* import Sidebar from '../Sidebar'; */
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import config from '../../../config';

export function EditOperator() {
  const { id } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [role, setRole] = useState([])
  const [section, setSection] = useState([])

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
  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }



  const history = useHistory();

  useEffect(() => {
    document.title = 'Edit Operator';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {


      // Fetch worker type from API
      const fetchworkerType = () => {
        $.ajax({
          url: `${config.apiUrl}/worker-type`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setWorker(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching worker options:', error);
          },
        });
      }
      fetchworkerType();

      // Fetch Shift type from API
      const fetchshift = () => {
        $.ajax({
          url: `${config.apiUrl}/shift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShift(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchshift();
      // Fetch role from API
      const fetchrole = () => {
        // alert("response");
        $.ajax({
          url: `${config.apiUrl}/employee-role/3`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            // alert(response);
            setRole(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching role options:', error);
          },
        });
      }

      fetchrole();
      //OPERATOR DATA
      const fetchUsers = () => {
        $.ajax({
          url: `${config.apiUrl}/operator/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setFormData(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching user options:', error);
          },
        });
      };
      fetchUsers();

      // Fetch section type from API
      const fetchSection = () => {
        $.ajax({
          url: `${config.apiUrl}/getSection`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSection(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
          },
        });
      }
      fetchSection();
    }
  }, []);



  const [formData, setFormData] = useState({
    name: '',
    entryid: '',
    email: '',
    workertype: '',
    shift: '',
    site: '',
    id: '',

  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    email: '',
    workertype: '',
    shift: '',
    site: '',
    id: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    //
    let errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!formData.workertype.trim()) {
      errors.workertype = 'Worker type is required'
      isValid = false
    }
    if (!formData.shift.trim()) {
      errors.shift = 'Shift is required'
      isValid = false
    }
    if (!formData.site.trim()) {
      errors.site = 'Site is required'
      isValid = false
    }
    // First, add the item master data to the "itemmaster" table
    if (isValid) {
      $.ajax({
        url: `${config.apiUrl}/operator/update`,
        method: 'PUT',
        headers: customHeaders,
        data: formData,
        success: function (response) {
          alert(response.message);
          if (response.status == 'Success') {
            history.push('/hrm/operator');
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
    } else {
      setFormErrors(errors)
    }

  };



  return (
     <div className="container-fluid">
      <div id="layout">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <h5>Edit Operator</h5>
            <hr />
            <div className='row'>
              <div className='col-md-12'>
                <p>Update Your Details ({formData.username}) ({formData.entryid})</p>
                <hr />
                <form onSubmit={handleSubmit} method='POST' >
                  <div className=" row space">
                    <div className="col-sm-6">
                      <span className="Password">User Role</span>
                      <select className="form-control" name="roleid" value={formData.roleid} onChange={handleInputChange}>
                        {role.map((data) => (
                          <option key={data.id} value={data.name}>
                            {data.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <span className="Name">Name <span className='textred'>*</span></span>
                      <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                      {formErrors.name && <span style={error}>{formErrors.name}</span>}
                    </div>
                  </div>
                  <div className="row space">
                    <div className="col-sm-6">
                      <span className="Entryid">Entryid</span>
                      <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} readOnly />
                      {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                    </div>
                    <div className="col-sm-6">
                      <span className="section">Email </span>
                      <input type="text" className="form-control " name="email" placeholder="entryid" value={formData.email} onChange={handleInputChange} readOnly />
                      {formErrors.email && <span style={error}>{formErrors.email}</span>}
                    </div>
                  </div>
                  <div className=" row space">
                    <div className="col-sm-6">
                      <span className="Password">Worker Type <span className='textred'>*</span></span>
                      <select className="form-control" name="workertype" value={formData.workertype} onChange={handleInputChange}>
                        <option value="">Select</option>
                        {worker_type.map((workertyp) => (
                          <option
                            key={workertyp.id}
                            value={workertyp.name}
                          >
                            {workertyp.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.workertype && <span style={error}>{formErrors.workertype}</span>}
                    </div>
                    <div className="col-sm-6">
                      <span className="Password">Shift <span className='textred'>*</span></span>
                      <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                        <option value="">Select</option>
                        {shift.map((shiftnm) => (
                          <option
                            key={shiftnm.id}
                            value={shiftnm.name}
                          >
                            {shiftnm.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.shift && <span style={error}>{formErrors.shift}</span>}
                      <input
                        type="hidden"
                        id="inputEmail4"
                        name="id"
                        placeholder="Entry Id"
                        value={formData.id}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row space">
                    <div className="col-sm-6">
                      <span className="site">Site <span className='textred'>*</span></span>
                      <select
                        id="site"
                        className="form-control"
                        name="site"
                        value={formData.site}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="NAKURU">NAKURU</option>
                        <option value="LIKONI">LIKONI</option>
                        <option value="MLOLONGO">MLOLONGO</option>
                      </select>
                      {formErrors.site && <span style={error}>{formErrors.site}</span>}
                    </div>
                  </div>



                  <div className=" row space">
                    <div className="col-sm-6">
                      <button className='btn btn-success btn-md'>Update</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default EditOperator;
