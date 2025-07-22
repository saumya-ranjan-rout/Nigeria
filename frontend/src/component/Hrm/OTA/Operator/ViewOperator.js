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

export function ViewOperator() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [operator, setOperator] = useState([]);
  const toggleClass = () => {
    setActive(!isActive);
  };
  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

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
        url: `http://192.168.29.243:4000/ota/operator_data_single/${id}`,
        method: 'GET',
        success: function (response) {
            setOperator(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };

        fetchUsers();
  }
}, []); 


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Employee Details</h5>
            <hr></hr>
            
             <div className='row'>
                <div className='col-md-6' style={{textAlign:'center'}}>
                    <div className="" style={{ borderRight: '1px solid black',padding:'50px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                        Name : {operator.name + '[' + operator.entryid + ']'}
                    </div>
                    <br/>
                    {/* <div style={{ fontWeight: 'bold' }}>
                        {operator.username}
                    </div> */}
                    <hr/>
                    <div style={{ fontWeight: 'bold' }}>Email : {operator.email}</div>
                    </div>
                </div>
                <div className='col-md-6' style={{padding:'83px'}}>
                   <Link to={`/hrm/ota/editoperator/${id}`}>
                      <button className='btn btn-info' style={{ color: '#fff' }}>
                        <i className="bx bx-user"></i>
                        Edit Account
                      </button>
                    </Link>
                    &nbsp;
                    {operator.roleid === 3 && 
                    <Link to={`/hrm/ota/changepassword/${id}`}>
                      <button className="btn btn-info" style={{color:'#fff'}}>
                        <i class="bx bx-pen"></i> 
                        Change Password
                      </button>
                    </Link>
                  } 
                </div>
             </div>
        
          </div>
        </main>
      </section>
    </div>
  );
}

export default ViewOperator;
