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

export function AddOperatorComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');

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
    document.title = 'Add Operator';
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
            console.error('Error fetching shift options:', error);
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

    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    entryid: '',
    password: '',
    workertype: '',
    shift: '',
    site: '',

  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    username: '',
    email: '',
    entryid: '',
    password: '',
    workertype: '',
    shift: '',
    site: '',

  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name == 'email') {
      formData.username = value;
    }
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();

    //
    const insertFormdata = { ...formData };
    const jsonData = JSON.stringify(insertFormdata);
    //alert(jsonData);
    let errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format'
      isValid = false
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
      isValid = false
    } else if (!isValidEmail(formData.username)) {
      errors.username = 'Invalid username format'
      isValid = false
    }

    if (!formData.entryid.trim()) {
      errors.entryid = 'Entryid is required'
      isValid = false
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required'
      isValid = false
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Invalid password format And Min length 6'
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
      //alert("valid");
      $.ajax({
        url: `${config.apiUrl}/operator/add`,
        method: 'POST',
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          if (response.status) {
            alert(response.message);
            history.push('/hrm/operator');
          }
          else {
            alert(response.message);
          }
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });
    } else {
      //alert("invalid");
      setFormErrors(errors)
    }

  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }
  const isValidPassword = (password) => {
    // Password validation criteria
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/
    //return false;
    return passwordRegex.test(password)
  }

  return (
    <div className="container-fluid">
      <div id="layout">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >
              <h5>Operator Details</h5>
              <hr>
              </hr>
              <div className=" row space" >
                <div className="col-sm-6">
                  <span className="Name">Name <span className='textred'>*</span></span>
                  <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                  {formErrors.name && <span style={error}>{formErrors.name}</span>}
                </div>
                <div className="col-sm-6">
                  <span className="Email">Email <span className='textred'>*</span> <span style={red}>(eg. abc@xyz.com )</span></span>
                  <input type="text" className="form-control " name="email" placeholder="email" value={formData.email} onChange={handleInputChange} />
                  {formErrors.email && <span style={error}>{formErrors.email}</span>}
                </div>
              </div>
              <div className=" row space">
                <div className="col-sm-6">
                  <span className="UserName">UserName <span className='textred'>*</span> <span style={red}>(eg. abc@xyz.com )</span></span>
                  <input type="text" className="form-control " name="username" placeholder="username" value={formData.username} onChange={handleInputChange} readOnly />
                  {formErrors.username && <span style={error}>{formErrors.username}</span>}
                </div>
                <div className="col-sm-6">
                  <span className="Entryid">Entryid <span className='textred'>*</span></span>
                  <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} />
                  {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                </div>
              </div>
              <div className=" row space">
                <div className="col-sm-6">
                  <span className="Password">Password <span className='textred'>*</span> <span style={red}>(min length 6 | max length 20 | a-zA-Z 0-9 @ $)</span></span>
                  <input type="text" className="form-control " name="password" placeholder="password" value={formData.password} onChange={handleInputChange} />
                  {formErrors.password && <span style={error}>{formErrors.password}</span>}
                </div>
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
              </div>
              <div className=" row space">
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
                </div>
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
                  <button className='btn btn-success btn-md' title='Add Operator'>Add</button>
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

export default AddOperatorComponent;
