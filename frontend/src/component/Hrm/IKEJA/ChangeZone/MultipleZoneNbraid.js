import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, useLocation  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';

import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function MultipleChangeZoneNbraid() {

  const [entryIds, setEntryIds] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
  const history = useHistory();
  const [section, setSection] = useState([])
  const [lines, setLine] = useState([])
  const animatedComponents = makeAnimated();

  let error = {
    color: 'red',
    fontSize: '13px',
  }
  let red = {
    color: 'red',
    fontSize: '16px',
  }
 
 
  useEffect(() => {
    document.title = 'Change Multiple employee';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

   // Send the entryIdsArray in the API call
  const jsonData = JSON.stringify({ entryIds: entryIdsArray });

  $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/changeshift_entryid',
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

   // Fetch section type from API
   const fetchSection = () => {
    $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/getSection',
    method: 'GET',
    success: function (response) {
        setSection(response);
    },
    error: function (xhr, status, error) {
        console.error('Error fetching section options:', error);
    },
    });
    
   }
   fetchSection();

   // Fetch line type from API
   const fetchLine = () => {
    $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/getlinemaster',
    method: 'GET',
    success: function (response) {
        setLine(response);
    },
    error: function (xhr, status, error) {
        console.error('Error fetching section options:', error);
    },
    });
    
   }
   fetchLine();

}

  setFormData((prevFormData) => ({
    ...prevFormData,
    entryIds: entryIds,
  }));

 
  }, []);


  const [formData, setFormData] = useState({
    entryIds: '',
    line: '',
    section_id:'',
  });

  const [formErrors, setFormErrors] = useState({
    line: '',
    section_id:'',

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

  if (formData.line=="") {
    errors.line = 'Line is required'
    isValid = false
  }
  

  if (formData.section_id=="") {
    errors.section_id = 'Section is required'
    isValid = false
  }

  if (isValid) {
  $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/update_multiple_zone_nbraid',
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

const selectedOption = section.find((data) => data.id === formData.section_id);
const selectedOption1 = lines.find((data) => data.line_name === formData.line);

  return (
    <div className="container">
   <Sidebar />
   <section id="content">
      <Header />
      <main>
         <div className="container dt" style={{height:'550px'}}>
            <div className="row">
               <div className="col-sm-12">
                  {/* Show the server response message in this div */}
                  {serverMessage && 
                  <div className="alert alert-info">{serverMessage}</div>
                  }
               </div>
            </div>
            <h5 className="title">Multiple Change Employee</h5>
            <hr>
            </hr>
            <div style={{ fontWeight: 'bold' }} className='readmore'>
            <p className='c'>
               Changes for  <b>Employees :</b>
               <span style={{ color: 'green', fontWeight: 'bold' ,fontSize:'12px'}}> {entryIds}</span>
            </p>
         </div>
         <br></br>
         <form  onSubmit={handleSubmit} method='POST'>
            <div className="row space ">
               
            <div className="col-sm-4">
                <span className="textgreen">Line<span style={red}>*</span></span>
                    <Select
                    components={animatedComponents}
                    isSearchable
                    placeholder="Choose Section..."
                    value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line_name } : null}
                    onChange={(selectedOption1) => {
                      const newValue = selectedOption1 ? selectedOption1.value : '';
                      handleInputChange({ target: { name: 'line', value: newValue } });
                    }}
                    options={lines.map((data) => ({ value: data.line_name, label: data.line_name }))}
                  />
                    {formErrors.line && <span style={error}>{formErrors.line}</span>}
              </div>
        
              <div className="col-sm-4">
                <span className="textgreen">Section Name <span style={red}>*</span></span>
                <Select
                    components={animatedComponents}
                    isSearchable
                    placeholder="Choose Section..."
                    value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                    onChange={(selectedOption) => {
                      const newValue = selectedOption ? selectedOption.value : '';
                      handleInputChange({ target: { name: 'section_id', value: newValue } });
                    }}
                    options={section.map((data) => ({ value: data.id, label: data.section_name }))}
                  />
                {formErrors.section_id && <span style={error}>{formErrors.section_id}</span>}
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

export default MultipleChangeZoneNbraid;
