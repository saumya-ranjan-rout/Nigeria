import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';

import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import config from '../../../config';

export function MultipleShiftChange() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const tableRef = useRef(null);

  const [data, setData] = useState([]);

  const [entryIds, setEntryIds] = useState('');
  // State variable to hold the server response message
  const [serverMessage, setServerMessage] = useState('');

  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
  const [isEntryIdExpanded, setEntryIdExpanded] = useState(false);
  //const entryIdsArray = entryIds.split(',');

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

  const [formData, setFormData] = useState({
    shift: '',
    entryIds: '',


  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });

  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/worker/shift/update`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Display the success message from the server response
        // alert(response.message);

        // Set the server response message in the state variable
        setServerMessage(response.message);

        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.goBack();
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
        // Display the error message or handle errors as needed
      },
    });
  };




  useEffect(() => {

    document.title = 'Change Multiple Employee';
    //alert('Extracted entryIdsArray: ' + entryIdsArray);
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      // Send the entryIdsArray in the API call
      //const jsonData = JSON.stringify({ entryIds: entryIdsArray });

      $.ajax({
        url: `${config.apiUrl}/worker/workers/${entryIdsArray}`,
        method: 'GET', // Change the method to POST for sending the entryIdsArray
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          // Access the timesheet results from the response object
          const timesheetData = response;

          // Update the component state with the timesheet data
          setData(timesheetData);

          // Extract the entry IDs from the response
          const entryIds = timesheetData.map((item) => item.entryid).join(',');

          // Update the entryIds state with the formatted string
          setEntryIds(entryIds);

          // Convert the entryIdsArray into a comma-separated string
          const entryIdsString = entryIdsArray.join(',');

          // Set the formData state including entryIds
          setFormData((prevFormData) => ({
            ...prevFormData,
            entryIds: entryIdsString,
          }));

          // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Initialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            // DataTable options...
          });
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });



      // Fetch shift options from API
      const fetchShiftOptions = () => {
        $.ajax({
          // API URL for fetching shift options
          url: `${config.apiUrl}/shift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShiftOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

      fetchShiftOptions();

    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      entryIds: entryIds,
    }));


  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const toggleRM = () => {
    setEntryIdExpanded((prevExpanded) => !prevExpanded);
  };

  return (
        <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">

            <div className="row">
              <div className="col-sm-12">
                {/* Show the server response message in this div */}
                {serverMessage && <div className="alert alert-info">{serverMessage}</div>}
              </div>
            </div>
            <h5 className="title">Multiple Change Employee</h5>
            <hr></hr>

            <div style={{ fontWeight: 'bold' }} className='readmore'>
              <p className='c'>

                Changes for :<br />
                <b>Employees :</b>


                {isEntryIdExpanded ? (
                  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}> {entryIds}</span>
                ) : (
                  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}> {entryIds.slice(0, 150) + '...'}</span>
                )}
                <a href="javascript:void(0);" onClick={toggleRM}>
                  {isEntryIdExpanded ? 'Show Less EntryId' : 'Show More EntryId'}
                </a>
              </p>
            </div>

            <br></br>
            <form onSubmit={handleSubmit} method='POST'>

              <div className="row space ">
                <div className="col-sm-4">
                  <span className="textgreen">Shift<span className='textred'> *</span></span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                    required
                    value={formData.shift} onChange={handleInputChange}
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
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
            <hr></hr>




          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default MultipleShiftChange;
