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
import config from '../../../config';

export function ViewOperator() {
  const { id } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [operator, setOperator] = useState([]);

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
    document.title = 'Employee Details';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      const fetchUsers = () => {
        $.ajax({
          url: `${config.apiUrl}/operator/${id}`,
          method: 'GET',
          headers: customHeaders,
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
        <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Employee Details</h5>
            <hr></hr>

            <div className='row'>
              <div className='col-md-6' style={{ textAlign: 'center' }}>
                <div className="" style={{ borderRight: '1px solid black', padding: '83px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    Name : {operator.name + '[' + operator.entryid + ']'}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>Email : {operator.email}</div>
                </div>
              </div>
              <div className='col-md-6' style={{ padding: '83px' }}>
                {/* {operator.roleid === '3' ? (
                  <> */}
                <Link to={`/hrm/editoperator/${id}`}>
                  <button className='btn btn-info' style={{ color: '#fff' }}>
                    <i className="bx bx-user"></i>
                    Edit Account
                  </button>
                </Link>

                {/* </>
                 ) : (
                  <>
                    <Link to={`/hrm/editemployee/${id}`}>
                      <button className='btn btn-info' style={{ color: '#fff' }}>
                        <i className="bx bx-user"></i>
                        Edit Account3
                      </button>
                    </Link>
                  </>
                )} */}
                &nbsp;

                <Link to={`/hrm/changepassword/${operator.entryid}`}>
                  <button className="btn btn-info" style={{ color: '#fff' }}>
                    <i class="bx bx-pen"></i>
                    Change Password
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default ViewOperator;
