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
import { Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom'

export function AdminChangePassword() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [UserName, setUserName] = useState('');
  const [UserId, setUserId] = useState('');
  const [UserEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //const [adminId, setAdminId] = useState('');
   const [adminid, setAdminId] = useState(null);
  

 const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };
  // alert(token);
   //alert(userid);
     //alert(ptype);
     // alert(ctype);


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
        url: `http://192.168.29.243:4000/admin_data_username/${id}`,
        method: 'GET',
        success: function (response) {
          // Assuming the response structure is as mentioned
      const userData = response.data[0]; // Assuming it's an array with a single object

     // Extracting the required fields
      const Name = userData.name;
      const entryId = userData.entryid;
      const userEmail = userData.email;
      const adminid = userData.id;
    
      setUserName(Name);
      setUserId(entryId);
      setUserEmail(userEmail);
      setAdminId(adminid);
      //alert(adminid);
  
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
    entryid:id,
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
        setErrorMessage('Invalid password format And min length 6')
      } else {

        // Include adminid in formData
    const formDataWithAdminId = { ...formData, adminid: adminid };
        $.ajax({
            url: 'http://192.168.29.243:4000/admin_change_password',
            method: 'POST',
            data: formDataWithAdminId,
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
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/
    return passwordRegex.test(pass)
  }


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Update Your Password ({UserName}) [{UserId}] [{UserEmail}]</h5>
            <hr></hr>
            
             <div className='row'>
                <div className='col-md-3'>
                </div>
                <div className='col-md-6'>
                <form onSubmit={handleSubmit} method='POST' >
                    <div className="row space" >
                        <div className="col-sm-12">
                            <span className="Name">New Password <span className="textred">*</span></span>
                            <input type="text" className="form-control " name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleInputChange} />
                            {errorMessage && <span style={error}>{errorMessage}</span>}
                        </div>
                        <div className="col-sm-12">
                            <span className="UserName">ReNew Password <span className="textred">*</span></span>
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

export default AdminChangePassword;
