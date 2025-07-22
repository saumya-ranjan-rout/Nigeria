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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom'
import config from '../../../config';

export function ChangePassowrd() {
  const { id } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUserName] = useState();
  const [userId, setUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    document.title = 'Employee Details';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      const fetchUserDetails = () => {
        $.ajax({
          url: `${config.apiUrl}/user/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {

            //alert(response.id);
            //alert(response.username);

            setUserId(response.id);
            setOpUserName(response.username);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching user id:', error);
          },
        });
      };
      fetchUserDetails();
    }
  }, [id, history]);


  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    entryid: id,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      userId: userId, // Include userId in the formData
    };
    if (formData.userId === '') {
      alert("User Id is missing");
    }
    else if (updatedFormData.newPassword !== updatedFormData.confirmPassword) {
      setErrorMessage("Passwords don't match")
    } else if (updatedFormData.newPassword == '' || updatedFormData.confirmPassword == '') {
      setErrorMessage('Password Required')
    } else if (!isValidPassword(updatedFormData.newPassword) || !isValidPassword(updatedFormData.confirmPassword)) {
      setErrorMessage('Invalid password format And min length 6')
    } else {
      $.ajax({
        url: `${config.apiUrl}/user/update-password`,
        method: 'PUT',
        headers: customHeaders,
        data: updatedFormData,
        success: function (response) {
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
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/
    return passwordRegex.test(pass)
  }


  return (
      <div className="container-fluid">
      <div id="layout">
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
                  <div className="row space">
                    <div className="col-sm-12" style={{ fontSize: 'small', color: 'red' }}>
                      <b>Password Rules</b><br></br>
                      Password must contain at least 1 Upper Case Letters.<br></br>
                      Password must contain at least 1 Lower Case Letters.<br></br>
                      Password must contain at least 1 Digits.<br></br>
                      Password must contain at least 6 characters but not more than 12 characters.<br></br>
                    </div>
                  </div>
                  <div className="row space" >
                    <div className="col-sm-12">
                      <span className="Name">New Password <span className='textred'>*</span> <span style={red}>(a-zA-Z 0-9 @ $)</span></span>
                      <input type="hidden" className="form-control " name="userId" placeholder="User Id" value={userId} />
                      <input type="text" className="form-control " name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleInputChange} />
                      {errorMessage && <span style={error}>{errorMessage}</span>}
                    </div>
                    <div className="col-sm-12">
                      <span className="UserName">Confirm Password <span className='textred'>*</span> </span>
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
    </div>
  );
}

export default ChangePassowrd;
