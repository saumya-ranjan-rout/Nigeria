import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';

import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';

export function ChangeShiftOperaor() {

  //const [itemCategories, setItemCategories] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const animatedComponents = makeAnimated();
  const history = useHistory();
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [loading, setLoading] = useState(false);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const [formData, setFormData] = useState({
  });

  useEffect(() => {
    document.title = 'Change Shift Operator';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {


      const fetchOperatorOptions = () => {
        setLoading(true);
        $.ajax({
          url: `${config.apiUrl}/operator`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setOperatorData(response);
            setLoading(false);
          },
          error: function (xhr, status, error) {
            setLoading(false);
            console.error('Error fetching operator options:', error);
          },
        });
      };

      fetchOperatorOptions();
    }


  }, []);

  const handleMove = (entryIds) => {
    const queryParams = selectedOperators.map((employee) => `entryIds=${employee.value}`).join('&');
    history.push(`/hrm/multiplechangeshiftop?${queryParams}`);
  };
  return (
    <>
      {
        loading ? (
          <div className="loader-overlay" >
            <div className="loader"></div>
          </div>
        ) : (
          <div>{/* Render your content */}</div>
        )
      }
          <div className="container-fluid">
      <div id="layout">
        <Sidebar />

        <section id="content">
          <Header />

          <main>


            <div className="container dt">
              <form method='POST'>
                <div className="row space">
                  <div className="col-sm-5"></div>
                  <div className="col-sm-4">
                    <span className="textgreen">Choose Operator <span className='textred'>*</span></span>
                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="operator_id"
                      options={operatorData.map((operatorOption) => ({
                        value: operatorOption.id,
                        label: `${operatorOption.entryid} (${operatorOption.name})`,
                      }))}
                      value={selectedOperators}
                      onChange={(selectedOptions) => {
                        setSelectedOperators(selectedOptions);
                        // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                        //  alert(sectionIds);
                      }}
                      isSearchable
                      placeholder="Choose Operator"
                    />


                  </div>

                  <div className="col-sm-3"><br />
                    <input
                      className="btn btn-success btn-sm"
                      value="Multiple Change"
                      id="btnw"
                      readOnly=""
                      style={{ width: '150px', color: '#fff' }}
                      //onClick={() => handleMove(selectedEntryId)}
                      onClick={() => handleMove(selectedOperators)}
                      disabled={selectedOperators.length == 0}
                    />
                  </div>

                </div>

              </form>

              <table class='display-table'>
                <thead>
                  <tr>
                    <th>Entry ID</th>
                    <th>Name</th>
                    <th>User Role</th>
                    <th>Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorData.map((item, index) => (
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
      </div>
    </>
  );
}

export default ChangeShiftOperaor;
