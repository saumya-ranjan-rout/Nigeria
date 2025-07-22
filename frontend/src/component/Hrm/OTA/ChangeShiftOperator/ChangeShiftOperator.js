import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


export function ChangeShiftOperaor() {
 
  //const [itemCategories, setItemCategories] = useState([]);
  const [employeedata, setEmployeeData] = useState([]);
  const animatedComponents = makeAnimated();
  const history = useHistory();
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    document.title = 'Change Shift Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
        const fetchOperatorData = () => {
            fetch('http://192.168.29.243:4000/ota/getEmployees')
              .then((response) => response.json())
              .then((data) => setEmployeeData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
      
          fetchOperatorData();
    }

   
  }, []);

  //move data to shift update
  const handleMove = (entryIds) => {
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
    history.push(`/hrm/ota/multiplechangeshiftop?${queryParams}`);
  };

  //Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}
const filteredData = employeedata.filter((row) => {
  return row.name.toLowerCase().includes(searchValue.toLowerCase())
});


  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
          <div className="container dt">
          <h5 className="title">Change Shift Operator</h5>
            <hr/>
          <form method='POST'>
          <div className="row space">
          <div className="col-sm-5">
          <br/>
          <input
              className='form-control'
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search..."
              style={{ width: '100%' }}
            /> 
          </div>
          <div className="col-sm-4">
                  <span className="textgreen">Choose Employees*</span>
                  <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="section_id"
                      options={employeedata.map((employee) => ({
                        value: employee.id,
                        label: `${employee.entryid} (${employee.name})`,
                      }))}
                      value={selectedEmployees}
                      onChange={(selectedOptions) => {
                        setSelectedEmployees(selectedOptions)
                      }}
                      isSearchable
                      placeholder="Choose Operator"
                    />
                </div>
             
                    <div className="col-sm-2"><br/>
                    <input
                      className="btn btn-success btn-sm"
                      value="Multiple Change"
                      id="btnw"
                      readOnly=""
                      style={{ width: '150px', color: '#fff' }}
                      onClick={() => handleMove(selectedEmployees)}
                      disabled={selectedEmployees.length == 0}
                    />
                  </div>
                  
                  </div>
                </form>
          
          <table class='table display-table'>
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Name</th>
                <th>User Role</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
            {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.entryid}</td>
                  <td>{item.name}</td>
                  <td>{item.role}</td>
                  <td>{item.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default ChangeShiftOperaor;
