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
import { useParams } from 'react-router-dom';
import config from '../../../config';

export function MultipleAssign() {
  const { id1, id2 } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const uid = id1;
  const assignment_ids = id2.split(',');

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();
  useEffect(() => {
    document.title = 'Assign Product to Operator';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      const fetchUsers = () => {
        $.ajax({
          url: `${config.apiUrl}/user?roleid=3`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            //alert(response);
            setUsers(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };
      fetchUsers();

    }
  }, []);
  const [formData, setFormData] = useState({
    user: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedFormData = { ...formData, ids: assignment_ids };
    //alert(JSON.stringify(updatedFormData));
    //return;
    $.ajax({
      url: `${config.apiUrl}/operator/assignment/update`,
      method: 'PUT',
      headers: customHeaders,
      data: updatedFormData,
      success: function (response) {
        alert(response.message);
        if (response.status == 'Success') {
          history.push(`/hrm/operator`);
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
  }

  return (
       <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Move Line,Section,Shift To:</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-8">
                  <span className="textgreen">Operator <span className='textred'>*</span></span>
                  <select
                    id="users"
                    className="form-control"
                    name="user"
                    required
                    value={formData.user} onChange={handleInputChange}
                  >
                    <option value="" >Select Operator</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>


            {/* Display Input Field Values */}

          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default MultipleAssign;
