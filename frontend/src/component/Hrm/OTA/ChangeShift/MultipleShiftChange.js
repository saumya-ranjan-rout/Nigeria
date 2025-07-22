import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, useLocation  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';

import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';

export function MultipleChangeZone() {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [entryIds, setEntryIds] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');


  let error = {
    color: 'red',
    fontSize: '13px',
  }
  let red = {
    color: 'red',
    fontSize: '16px',
  }
  const history = useHistory();

  const [formData, setFormData] = useState({
    entryIds: '',
    shift: '',
  });

  const [formErrors, setFormErrors] = useState({
    shift: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
    setFormData({ ...formData, [name]: value });
 
};
  

 const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData};
  const jsonData = JSON.stringify(updatedFormData);
  //alert(jsonData);
  let errors = {}
  let isValid = true

  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }
 
  if (isValid) {
  $.ajax({
    url: 'http://192.168.29.243:4000/ota/update_multiple_shift',
    method: "POST",
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Display the success message from the server response
    
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
  }else{
    setFormErrors(errors)
  }
};
const [isEntryIdExpanded, setEntryIdExpanded] = useState(false);
 useEffect(() => {
      document.title = 'Change Shift For Multiple Employees';
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        history.push('/login');
      } else {

     // Send the entryIdsArray in the API call
    const jsonData = JSON.stringify({ entryIds: entryIdsArray });

    $.ajax({
      url: 'http://192.168.29.243:4000/ota/changeshift_entryid',
      method: 'POST', // Change the method to POST for sending the entryIdsArray
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Access the timesheet results from the response object
        const timesheetData = response;

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
       
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });


    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        // API URL for fetching shift options
        url: 'http://192.168.29.243:4000/getShiftOptions',
        method: 'GET',
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

 
  return (
    <div className="container">
   <Sidebar />
   <section id="content">
      <Header />
      <main>
         <div className="container dt">
            <div className="row">
               <div className="col-sm-12">
                  {/* Show the server response message in this div */}
                  {serverMessage && 
                  <div className="alert alert-info">{serverMessage}</div>
                  }
               </div>
            </div>
            <h5 className="title">Multiple Change Zone And Machine</h5>
            <hr>
            </hr>
            <div style={{ fontWeight: 'bold' }} className='readmore'>
            <p className='c'>
               Changes for  <b>Operators :</b>
               {isEntryIdExpanded ? (
               <span style={{ color: 'green', fontWeight: 'bold' ,fontSize:'12px'}}> {entryIds}</span>
               ) : (
               <span style={{ color: 'green', fontWeight: 'bold',fontSize:'12px' }}> {entryIds.slice(0, 150)}</span>
               )}
               
            </p>
         </div>
         <br></br>
         <form  onSubmit={handleSubmit} method='POST'>
            <div className="row space ">
              <div className="col-sm-4">
                  <span className="shift">Shift<span style={red}>*</span></span>
                  <select
                     id="shift"
                     className="form-control"
                     name="shift" 
                     value={formData.shift} onChange={handleInputChange}
                     >
                     <option value="">Select Shift</option>
                     {shiftOptions.map((shiftOption) => (
                     <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
                     </option>
                     ))}
                  </select>
                  {formErrors.shift && <span style={error}>{formErrors.shift}</span>}
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
         <hr>
         </hr>
</div>
</main>
</section>
</div>
  );
}

export default MultipleChangeZone;
