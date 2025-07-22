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

export function AddNewWorkerComponent() {

  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [sectionName, setSectionName] = useState([])
  const [productOptions, setProductOptions] = useState([]);

  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
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
    sectionId: '',
    product: '',
    entryid: '',
    workertype: '',
    shift: '',
    site: '',
    type: '',
    join_date: formattedToday,

  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    sectionId: '',
    product: '',
    entryid: '',
    workertype: '',
    shift: '',
    site: '',
    type: '',
    join_date: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  let error = {
    color: 'red',
    fontSize: '13px',
  }



  const history = useHistory();

  useEffect(() => {
    document.title = 'Add Worker';
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
          url: `${config.apiUrl}/shift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShift(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchshift();
      const fetchProductOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/item`,
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
    }
  }, []);




  const handleSubmit = (event) => {
    event.preventDefault();
    // alert(formData.join_date);
    const products = selectedProducts.map((product) => `${product.value}`).join(',');
    const sections = selectedSections.map((section) => `${section.value}`).join(',');
    const insertFormdata = { ...formData, sectionId: sections, product: products };
    const jsonData = JSON.stringify(insertFormdata);

    let errors = {}
    let isValid = true

    // alert(jsonData)
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!products.trim()) {
      errors.product = 'Product is required'
      isValid = false
    }

    if (!sections.trim()) {
      errors.sectionId = 'Section is required'
      isValid = false
    }

    if (!formData.entryid.trim()) {
      errors.entryid = 'Entryid is required'
      isValid = false
    }

    if (!formData.type.trim()) {
      errors.type = 'Type is required'
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
        url: `${config.apiUrl}/worker/add`,
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



  return (
     <div className="container-fluid">
      <div id="layout">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >
              <h5>Worker Details</h5>
              <hr>
              </hr>
              <div className=" row space" >
                <div className="col-sm-6">
                  <span className="Name">Name <span className='textred'>*</span></span>
                  <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                  {formErrors.name && <span style={error}>{formErrors.name}</span>}
                </div>
                <div className="col-sm-6">
                  <span className="Entryid">Entryid <span className='textred'>*</span> </span>
                  <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} />
                  {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                </div>
              </div>
              <div className=" row space">
                <div className="col-sm-6">
                  <span className="Password">Type <span className='textred'>*</span></span>
                  <select className="form-control" name="type" value={formData.type} onChange={handleInputChange}>

                    <option value="">select</option>
                    <option value="1">Casual</option>
                    <option value="2">Permanent</option>
                  </select>
                  {formErrors.type && <span style={error}>{formErrors.type}</span>}
                </div>

                <div className="col-sm-6">
                  <span className="Password">Worker Type <span className='textred'>*</span></span>
                  <select className="form-control" name="workertype" value={formData.workertype} onChange={handleInputChange}>
                    <option value="">Select Worker Type</option>
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

                <div class="col-sm-6">
                  <span className="Password">Product Name <span className='textred'>*</span></span>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    name="product"
                    options={productOptions.map((productOption) => ({
                      value: productOption.id,
                      label: `${productOption.item_description}`,
                    }))}
                    value={selectedProducts}
                    onChange={(selectedProducts) => {
                      setSelectedProducts(selectedProducts);
                    }}
                    isSearchable
                    placeholder="Choose Product"
                  />
                  {formErrors.product && <span style={error}>{formErrors.product}</span>}
                </div>
                <div className="col-sm-6">
                  <span className="Password">Shift <span className='textred'>*</span></span>
                  <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                    <option value="">Select Shift</option>
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

              </div>
              <div className=" row space">
                <div className="col-sm-6">
                  <span className="site">Site <span className='textred'>*</span></span>
                  <select
                    id="site"
                    className="form-control"
                    name="site"
                    value={formData.site}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="NAKURU">NAKURU</option>
                    <option value="LIKONI">LIKONI</option>
                    <option value="MLOLONGO">MLOLONGO</option>
                  </select>
                  {formErrors.site && <span style={error}>{formErrors.site}</span>}
                </div>

                <div className="col-sm-6">
                  <span className="Password">Section Name <span className='textred'>*</span></span>

                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents2}
                    isMulti
                    name="sectionId"
                    options={sectionName.map((sectionOption) => ({
                      value: sectionOption.id,
                      label: `${sectionOption.section_name}`,
                    }))}
                    value={selectedSections}
                    onChange={(selectedOptions) => {
                      setSelectedSections(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                    }}
                    isSearchable
                    placeholder="Choose Section"
                  />
                  {formErrors.sectionId && <span style={error}>{formErrors.sectionId}</span>}
                </div>
              </div>
              <div className=" row space">
                <div className="col-sm-6">
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
              </div>
              <div className=" row space">
                <div className="col-sm-6">
                  <button className='btn btn-success btn-md'>Add</button>
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

export default AddNewWorkerComponent;
