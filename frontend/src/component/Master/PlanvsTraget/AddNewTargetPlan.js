import React, { useEffect, useState, useRef } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import config from '../../../config';
import dateUtils from '../../../utils/dateUtils';

export function AddNewTargetPlan() {

  const [items, setItems] = useState([]); // Define sections state variable
  const [cls, setCls] = useState(''); // Define cls state variable

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const [targetPlanss, setTargetPlanss] = useState({});

  const today = dateUtils.getCurrentDateTime();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
  const [endDate, setEndDate] = useState(today);

  const history = useHistory();

  useEffect(() => {
    document.title = 'Add New Target Plan';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      //alert("hi");
      // Fetch section data from the API
      $.ajax({
        url: `${config.apiUrl}/item`, // Replace 'your-api-endpoint' with the actual endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          const items = response; // Assuming the response data is an array of section objects
          // Update the state with the fetched section data
          // alert(items);
          setItems(items);
        },
        error: function (xhr, status, error) {
          alert('Error fetching item data:', error);
        },
      });
    }
  }, []);


  const [formData, setFormData] = useState({
    date: formattedToday,

  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const date = formData.date;
    const targetplans = items.map((item) => ({
      product_id: item.id,
      date: date,
      plan: targetPlanss[item.id] || 0,
    }));

    //alert(JSON.stringify(targetplans));
    //return;
    $.ajax({
      url: `${config.apiUrl}/target-plan/add`,
      method: 'POST',
      headers: customHeaders,
      data: JSON.stringify(targetplans),
      contentType: 'application/json',
      success: function (response) {
        alert(response.message);
        if (response.status == 'Success') {
          history.push('/master/plan_vs_target');
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
      },
    });


  };



  const handleDelete = (index) => {
    // Perform deletion logic based on the index or other identifier
    // Remove the corresponding section from the sections array

    // Create a copy of the sections array
    const updatedSections = [...items];
    // Remove the section at the specified index
    updatedSections.splice(index, 1);
    // Update the state with the modified sections array
    setItems(updatedSections);
  };


  return (
    <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >

              <h5>Add New Target Plan</h5>
              <hr></hr>


              <div className=" row space">



                <div className="col-sm-6">
                  <span className="color">Date <span className='textred'>*</span></span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={date => {
                      const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                      const updatedEvent = { target: { value: formattedDate, name: 'date' } };
                      handleInputChange(updatedEvent);
                      setEndDate(date);
                    }}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Date"
                    name="date"
                    id="date"
                    required
                  />

                </div>

              </div>



              <h5>Enter Employee Productivity</h5>
              <hr></hr>

              <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
                <thead>
                  <tr style={{ backgroundColor: '#adb5bd' }}>
                    <th>#</th>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Plan <span className='textred'>*</span></th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="item-section">
                  {items.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.item_group}</td>
                      <td>{row.item_description}</td>

                      <td>
                        <input
                          type="number"
                          className={`tar${row.id} ${cls}`}
                          name="target"
                          id={`ach${row.id}`}
                          value={targetPlanss[row.id] || ''} // Change itemTargets to targetPlanss
                          required
                          onChange={(e) => {
                            const updatedTargetPlans = {
                              ...targetPlanss,
                              [row.id]: e.target.value,
                            };
                            setTargetPlanss(updatedTargetPlans);
                          }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}

                          style={{ color: 'red' }}
                        >
                          <i class="bx bxs-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>


              <div className="form-group row">

                <label className="col-sm-11 col-form-label"></label>

                <div className="col-sm-1">
                  <input type="submit" id="submit-data" className="btn btn-success margin-top"
                    value="Add" data-loading-text="Adding..." />

                </div>
              </div>


            </form>
          </div>


        </main>
      </section>

    </div>
    </div>
  );
}

export default AddNewTargetPlan;
