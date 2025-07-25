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

export function AddNewAdminComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
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
    document.title = 'Add Admin';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      

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
    name: '',
    entryid: '',
    email: '',
    password: '',
    
  });

   const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    email: '',
    password: '',
    

    })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();

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


   /* $.ajax({
      url: 'http://192.168.29.243:4000/addnewadmin',
      method: 'POST',
      data: formData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        //setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });*/


    // First, add the item master data to the "itemmaster" table
  if (isValid) {
    $.ajax({
      url: 'http://192.168.29.243:4000/addnewadmin',
      method: 'POST',
      data: formData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        //setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });
  }else {
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
    return passwordRegex.test(password)
  }
  

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
        <div className="container dt">
        <form onSubmit={handleSubmit} method='POST' >
        <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <h5>Admin Details</h5>
              <hr></hr>

              

               <div className="form-group row space">

                   <div className="col-sm-6">
                     <label className="col-sm-1 col-form-label"
                           for="section_name"><span className='textblack'>Name</span> <span className='textred'>*</span></label>
                        <input type="text" placeholder=" Name"
                               className="form-control margin-bottom  required" name="name" id="name" value={formData.name}  onChange={handleInputChange} required />
                    {formErrors.name && <span style={error}>{formErrors.name}</span>}
                    </div>
                   <div className="col-sm-6">
                     <label className="col-sm-1 col-form-label"
                           for="section_name"><span className='textblack'>Entryid </span> <span className='textred'>*</span></label>
                        <input type="text" placeholder="Entryid"
                               className="form-control margin-bottom  required" name="entryid" id="entryid" value={formData.entryid}  onChange={handleInputChange} required />
                     {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                    </div>
               </div>

               <div className="form-group row space">
                   <div className="col-sm-6">
                     <label className="col-sm-4 col-form-label"
                           for="section_name"><span className='textblack'>Email</span> <span className='textred'>(eg:xyz@gmail.com)*</span></label>
                        <input type="text" placeholder="Email"
                               className="form-control margin-bottom  required" name="email" id="email" value={formData.email}  onChange={handleInputChange} required />
                    {formErrors.email && <span style={error}>{formErrors.email}</span>}
                    </div>
                   <div className="col-sm-6">
                     <label className="col-sm-10 col-form-label"
                           for="section_name"><span className='textblack'>Password </span> <span className='textred'>(min length 6 | max length 20 | a-zA-Z 0-9 @ $) *</span></label>
                        <input type="text" placeholder=" Password"
                               className="form-control margin-bottom  required" name="password" id="password" value={formData.color_name}  onChange={handleInputChange} required />
                    {formErrors.password && <span style={error}>{formErrors.password}</span>}
                    </div>
               </div>
              
              
                
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Add Admin" data-loading-text="Adding..." style={{ width: '120px'  }}/>
                      
                  </div>
              </div>


              </form>
        </div>
          
        
        </main>
      </section>
      
    </div>
  );
}

export default AddNewAdminComponent;
