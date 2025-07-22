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
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function MultipleSectionAssign() {
  const animatedComponents = makeAnimated();
  const { id1, id2 } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [users, setUsers] = useState([])

  const uid = id1;
  const array = id2.split(',');

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
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    history.push('/login');
  } else {
    const fetchUsers = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/ota/get_users',
        method: 'GET',
        success: function (response) {
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
    const productPromises = array.map((value) => {
      const where = `id='${value}'`;
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `http://192.168.29.243:4000/ota/assign_check?where=${where}`,
          method: 'GET',
          success: (response) => {
            if (response.length === 1) {
              $.ajax({
                url: `http://192.168.29.243:4000/ota/update_assign_operator/${formData.user}?where=${where}`,
                method: 'GET',
                success: () => {
                  resolve();
                },
                error: (error) => {
                  reject(error);
                },
              });
            } else {
              resolve();
            }
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    });
  
    Promise.all(productPromises)
      .then(() => {
        alert('Move successfully');
        history.push(`/hrm/ota/operator`)
      })
      .catch((error) => {
        // Handle error
        console.error('Error:', error);
      });
  }

  const selectedOption = users.find((data) => data.id === formData.user);

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt" style={{height:'500px'}}>
            <h5 className="title">Move Product,Line,Section To:</h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-8">
                  <span className="textgreen">Operator <span style={{color:'red'}}>*</span></span>
                  {/* <select
                    id="users"
                    className="form-control"
                    name="user"
                     value={formData.user} onChange={handleInputChange}
                  >
                    <option >Select Operator</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select> */}
                  <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Operator..."
                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'user', value: newValue } });
                        }}
                        options={users.map((data) => ({ value: data.id, label: data.name }))} required
                      />
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
  );
}

export default MultipleSectionAssign;
