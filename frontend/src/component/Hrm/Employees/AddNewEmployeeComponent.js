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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
/* import Sidebar from '../Sidebar'; */
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';
import dateUtils from '../../../utils/dateUtils';

export function AddNewEmployeeComponent() {

  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [sectionName, setSectionName] = useState([])
  const [productOptions, setProductOptions] = useState([]);

  const [selectedSections, setSelectedSections] = useState([]);
   const [showStaffDropdown , setShowStaffDropdown] = useState(false);
      const [showBraidFields , setShowBraidFields] = useState(false);
         const [showNonbraidFields , setShowNonbraidFields] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
    const [lines, setLine] = useState([]);
        const [machines, setMachine] = useState([]);
  const animatedComponents = makeAnimated();
  const animatedComponents2 = makeAnimated();

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const today = dateUtils.getCurrentDateTime();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");

  const [endDate, setEndDate] = useState(today);

  const [formData, setFormData] = useState({
    name: '',
    entryid: '',
    workertype: '',
    shift: '',
    site: '',
    type: '',
    join_date: formattedToday,
    employee_type: 'Contract',
      staff: '',
      product: 0,
      line: '',
      sectionId: '',

  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    workertype: '',
    shift: '',
    site: '',
    type: '',
    join_date: '',
    employee_type: '',
    staff: '',
    product: '',
    line: '',
    sectionId: '',
  })

  // const handleInputChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData({ ...formData, [name]: value });
  //     // const jsonData = JSON.stringify(formData);
  //     //     alert(jsonData)
  // };

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};

  let error = {
    color: 'red',
    fontSize: '13px',
  }



  const history = useHistory();

  useEffect(() => {
    document.title = 'Add Employee';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {


      // Fetch worker type from API
      const fetchworkerType = () => {
        $.ajax({
          url: `${config.apiUrl}/worker-type`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setWorker(response);
              if (response.length > 0 && formData.workertype === '') {
          setFormData(prev => ({
            ...prev,
            workertype: response[0].name,
          }));
        }
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchworkerType();

      // Fetch Shift type from API
      const fetchshift = () => {
        $.ajax({
          url: `${config.apiUrl}/getshift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShift(response);
             if (response.length > 0 && formData.shift === '') {
          setFormData(prev => ({
            ...prev,
            shift: response[0].name,
          }));
        }
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchshift();
      const fetchProductOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/getitemmaster`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setProductOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching product options:', error);
          },
        });
      };

      fetchProductOptions();
      const fetchSectionOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/section`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSectionName(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
          },
        });
      };

      fetchSectionOptions();

       const fetchLine = () => {
              $.ajax({
              url: `${config.apiUrl}/ikeja/getlinemaster`,
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
  }, []);




  const handleSubmit = (event) => {
    event.preventDefault();
    // alert(formData.join_date);
    // const products = selectedProducts.map((product) => `${product.value}`).join(',');
    // const sections = selectedSections.map((section) => `${section.value}`).join(',');
    const insertFormdata = { ...formData}; //, sectionId: sections, product: products 
    const jsonData = JSON.stringify(insertFormdata);

    let errors = {}
    let isValid = true

     alert(jsonData)
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!formData.sectionId) {
      errors.sectionId = 'Section is required'
      isValid = false
    }

    // if (!sections.trim()) {
    //   errors.sectionId = 'Section is required'
    //   isValid = false
    // }

    if (!formData.entryid.trim()) {
      errors.entryid = 'Entryid is required'
      isValid = false
    }

    if (!formData.type.trim()) {
      errors.type = 'Type is required'
      isValid = false
    }
        if (!formData.employee_type.trim()) {
      errors.employee_type = 'Employee type is required'
      isValid = false
    }

    if (!formData.workertype.trim()) {
      errors.workertype = 'Worker type is required'
      isValid = false
    }

    if (!formData.shift.trim()) {
      errors.shift = 'Shift is required'
      isValid = false
    }
    if (!formData.site.trim()) {
      errors.site = 'Site is required'
      isValid = false
    }
    // First, add the item master data to the "itemmaster" table
    if (isValid) {

      $.ajax({
        url: `${config.apiUrl}/employee/add`,
        method: 'POST',
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          alert(response.message);
          if (response.status == 'Success') {
            history.push('/hrm/employees');
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
    } else {
      //alert(errors);
      setFormErrors(errors)

    }

  };
const handleSiteChange = (e) => {
  handleInputChange(e);  // ✅ Updates formData.site via existing logic

  const selectedSite = e.target.value;

  // ✅ Conditional logic based on selected value
  if (selectedSite === 'ota') {
    setShowStaffDropdown(true);   // ✅ Show staff dropdown if site is "ota"
  } else {
    setShowStaffDropdown(false);  // ✅ Hide for other sites
  }
};

const handleTypeChange = (e) => {
  handleInputChange(e);  // ✅ Updates formData.site via existing logic

  const selectedSite = e.target.value;

  // ✅ Conditional logic based on selected value
  if (selectedSite === 'BRAID') {
    setShowNonbraidFields(false);   // ✅ Show staff dropdown if site is "ota"
     setShowBraidFields(true); 
  } else if( selectedSite === 'NBRAID') {
   setShowBraidFields(false);   // ✅ Show staff dropdown if site is "ota"
     setShowNonbraidFields(true); 
  }else {
    setShowNonbraidFields(false);   // ✅ Show staff dropdown if site is "ota"
     setShowBraidFields(false); 
  }
};

const handleZoneChange = (e) => {
  handleInputChange(e);  // ✅ Updates formData.site via existing logic

  const selectedZone = e.target.value;

              $.ajax({
              url: `${config.apiUrl}/ikeja/getMachinebyzone/${selectedZone}`,
              method: 'GET',
              success: function (response) {
              
console.log(typeof uniqueMachines); 
  setMachine(uniqueMachines);
              },
              error: function (xhr, status, error) {
                  console.error('Error fetching section options:', error);
              },
              })
  
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
              <h5>Add Employee Details</h5>
              <hr>
              </hr>
              <div className=" row space" >
                <div className="col-sm-3">
                  <span className="Name">Name <span className='textred'>*</span></span>
                  <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                  {formErrors.name && <span style={error}>{formErrors.name}</span>}
                </div>
                <div className="col-sm-3">
                  <span className="Entryid">Entryid <span className='textred'>*</span> </span>
                  <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} />
                  {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                </div>
                 <div className="col-sm-3">
                  <span className="Password">Join Date <span className='textred'>*</span></span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={date => {
                      const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                      const updatedEvent = { target: { value: formattedDate, name: 'join_date' } };
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

                       <div className="col-sm-3">
                  <span className="Password">Worker Type <span className='textred'>*</span></span>
                  <select className="form-control" name="workertype" value={formData.workertype} onChange={handleInputChange}>
                
                    {worker_type.map((workertyp) => (
                      <option
                        key={workertyp.id}
                        value={workertyp.name}
                      >
                        {workertyp.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.workertype && <span style={error}>{formErrors.workertype}</span>}
                </div>
              </div>
              <div className=" row space">

                  <div className="col-sm-3">
                  <span className="Password">Shift <span className='textred'>*</span></span>
                  <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                    {shift.map((shiftnm) => (
                      <option
                        key={shiftnm.id}
                        value={shiftnm.name}
                      >
                        {shiftnm.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.shift && <span style={error}>{formErrors.shift}</span>}
                </div>

                <div className="col-sm-3">
                  <span className="Password">Employee Type <span className='textred'>*</span></span>
                  <select className="form-control" name="employee_type" value={formData.employee_type} onChange={handleInputChange}>
                     <option value="Contract">Contract</option>
                    <option value="Casual">Casual</option>
                    <option value="Outsourcing">Outsourcing</option>
                     <option value="Staff">Staff</option>
                  </select>
                  {formErrors.employee_type && <span style={error}>{formErrors.employee_type}</span>}
                </div>

          <div className="col-sm-3">
                  <span className="site">Site <span className='textred'>*</span></span>
                  <select
                    id="site"
                    className="form-control"
                    name="site"
                    value={formData.site}
                   onChange={handleSiteChange}
                   
                  >
                    <option value="">Select Site</option>
                    <option value="ikeja">ikeja</option>
                    <option value="ota">ota</option>
                   
                  </select>
                  {formErrors.site && <span style={error}>{formErrors.site}</span>}
                </div>

                {showStaffDropdown && (
   <div className="col-sm-3">
                  <span className="site">Staff </span>
    <select className="form-control" name="staff" onChange={handleInputChange}>
       <option value="">select</option>
                <option value="LORNA">LORNA</option>
                <option value="RIL">RIL</option>
    </select>
     {formErrors.staff && <span style={error}>{formErrors.staff}</span>}
  </div>
)}
                         <div className="col-sm-3">
                  <span className="Password">Type <span className='textred'>*</span></span>
                  <select className="form-control" name="type" value={formData.type}  onChange={handleTypeChange}>
                     <option value="">Select Type</option>
                     <option value="BRAID">BRAID</option>
                    <option value="NBRAID">NON-BRAID</option>
                   
                  </select>
                  {formErrors.type && <span style={error}>{formErrors.type}</span>}
                </div>

{showNonbraidFields && (
   <>
    <div className="col-sm-3">
                  <span className="Password">Product Name <span className='textred'>*</span></span>
                  <Select
  components={animatedComponents}
  name="product"
  options={productOptions.map((productOption) => ({
    value: productOption.id,
    label: productOption.item_description,
  }))}
  // value={selectedProducts}
  onChange={(selectedOption) => {
    // setSelectedProducts(selectedOption); // keep for UI
    handleInputChange({
      target: {
        name: 'product',
        value: selectedOption?.value || '',
      }
    });
  }}
  isSearchable
  placeholder="Choose Product"
/>

                  {formErrors.product && <span style={error}>{formErrors.product}</span>}
                </div>

                                  <div className="col-sm-3">
                                    <span className="Password">Line</span>
                                      <Select
  components={animatedComponents}
  name="line"
  isSearchable
  placeholder="Choose Line..."
 // value={selectedOption1}
  onChange={(option) => {
   // setSelectedOption1(option);
    handleInputChange({
      target: {
        name: 'line',
        value: option?.value || '',
      }
    });
  }}
  options={lines.map((data) => ({
    value: data.line_name,
    label: data.line_name,
  }))}
/>

             {/* {formErrors.line && <span style={error}>{formErrors.line}</span>}                           */}
                                  </div>


</>                
)}
{(showBraidFields || showNonbraidFields) && (
  <div className="col-sm-3">
    <span className="Password">Section</span>
    <Select
      components={animatedComponents2}
      name="sectionId"
      options={sectionName.map((sectionOption) => ({
        value: sectionOption.id,
        label: sectionOption.section_name,
      }))}
      // value={formData.sectionId} // optional: bind if needed
      onChange={(selectedOption) => {
        handleInputChange({
          target: {
            name: 'sectionId',
            value: selectedOption?.value || '',
          }
        });
      }}
      isSearchable
      placeholder="Choose Section"
    />
    {formErrors.sectionId && (
      <span style={error}>{formErrors.sectionId}</span>
    )}
  </div>
)}

{showBraidFields && (
   <>
           <div className="col-sm-3">
                    <span className="password">Zone <span className="textred">*</span></span>
                        <select
                            className="form-control"
                            name="zone"
                            id="zone"
                            value={formData.zone}
                             onChange={handleZoneChange}
                             
                          >
                            <option value="">Select ZONE</option>
                               <option value="ZONE1">ZONE1</option>
                               <option value="ZONE2">ZONE2</option>
                               <option value="ZONE3">ZONE3</option>
                               <option value="ZONE4">ZONE4</option>
                               <option value="ZONE5">ZONE5</option>
                               <option value="ZONE6">ZONE6</option>
                               <option value="ZONE7">ZONE7</option>
                               <option value="ZONE8">ZONE8</option>
                               <option value="ZONE9">ZONE9</option>
                               <option value="ZONE10">ZONE10</option>
                               <option value="ZONE11">ZONE11</option>
                               <option value="ZONE12">ZONE12</option>
                               <option value="ZONE13">ZONE13</option>
                               <option value="ZONE14">ZONE14</option>
                               <option value="ZONE15">ZONE15</option>
                               <option value="ZONE16">ZONE16</option>
                               <option value="ZONE17">ZONE17</option>
                               <option value="ZONE18">ZONE18</option>
                               <option value="ZONE19">ZONE19</option>
                               <option value="ZONE20">ZONE20</option>
                        </select>
                   
                </div>

                  <div className="col-sm-3">
                    <span className="Password">Machine</span>
                    <select
  className="form-control"
  name="machine"
  id="machine"
  value={formData.machine}
  onChange={handleInputChange}
>
  <option value="">Select MACHINE</option>
  {machines.map((mach, index) => (
    <option key={index} value={mach}>
      {mach}
    </option>
  ))}
</select>
</div>
</>                
)}




              </div>
     
              <div className=" row space">
                <hr/>
                <div className="col-sm-6">
                  <button className='btn btn-success btn-md'>Add Employee</button>
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

export default AddNewEmployeeComponent;
