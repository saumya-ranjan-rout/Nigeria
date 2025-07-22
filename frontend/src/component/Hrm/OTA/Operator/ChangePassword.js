import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
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
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom'

export function ChangePassowrd() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUserName] = useState()
  const [errorMessage, setErrorMessage] = useState('')
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
  document.title = 'Employee Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    history.push('/login');
  } else {
    const fetchUsers = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/ota/operator_data_username/${id}`,
        method: 'GET',
        success: function (response) {
             //alert(JSON.stringify(response));
          setFormData(prevState => ({
        ...prevState,
        id: response[0].id, // Assuming the id is available in the first element of the response array
      }));
           setOpUserName(response[0].username);

        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };
    fetchUsers();
  }
}, [id,history]); 


  const [formData, setFormData] = useState({
    newPassword:'',
    confirmPassword: '',
    id:id,
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage("Passwords don't match")
      } else if (formData.newPassword == '' || formData.confirmPassword == '') {
        setErrorMessage('Password Required')
      } else if (!isValidPassword(formData.newPassword) || !isValidPassword(formData.confirmPassword)) {
        setErrorMessage('Invalid password format And min length 6 to 12')
      } else {
        $.ajax({
            url: 'http://192.168.29.243:4000/ota/change_password',
            method: 'POST',
            data: formData,
            success: function (response){
                 alert(response.message);
                  // Redirect to SectionComponent after successful addition\
                  window.location.reload();
                },
            error: function (xhr, status, error) {
              console.log(error);
            },
          });
      }
  }

  const isValidPassword = (pass) => {
    // Password validation criteria
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,12}$/;
   return passwordRegex.test(pass)
  }

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Update Your Password ({OpUserName})</h5>
            <hr></hr>
            
             <div className='row'>
                <div className='col-md-3'>
                </div>
                <div className='col-md-6'>
                <form onSubmit={handleSubmit} method='POST' >
                    <div className="row space" >
                        <div className="col-sm-12">
                            <span className="Name">New Password <span style={red}>(a-zA-Z 0-9 @ $)</span></span>
                            <input type="text" className="form-control " name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleInputChange} />
                            {errorMessage && <span style={error}>{errorMessage}</span>}
                        </div>
                        <div className="col-sm-12">
                            <span className="UserName">Re-Enter Password </span>
                            <input type="text" className="form-control " name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} />
                            {errorMessage && <span style={error}>{errorMessage}</span>}
                        </div>
                        <div className="col-sm-12">
                            <button className='btn btn-success btn-md'>Update Password</button>
                        </div>
                    </div>
                    </form>
                </div>
                <div className='col-md-3'>
                </div>
             </div>
        
          </div>
        </main>
      </section>
    </div>
  );
}

export default ChangePassowrd;
