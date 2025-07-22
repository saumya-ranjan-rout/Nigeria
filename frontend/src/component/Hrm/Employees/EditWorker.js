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
import { useParams } from 'react-router-dom'

/* import Sidebar from '../Sidebar'; */
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import config from '../../../config';

export function EditWorker() {
  const { id } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [section, setSection] = useState([])
  const [machines, setMachines] = useState([])
  const [roleid, setRoleid] = useState([])
  const [subcat, setSubcat] = useState('');

  const [productOptions, setProductOptions] = useState([]);

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
  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }




  const history = useHistory();





  useEffect(() => {
    document.title = 'Edit Operator';
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
      //OPERATOR DATA
      const fetchUsers = () => {
        $.ajax({
          url: `${config.apiUrl}/operator/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {

            response.productc = response.product;
            response.section_idc = response.section_id;

            setFormData(response);
            console.log(response);
            fetchwty(response.roleid);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };
      fetchUsers();

      // Fetch section type from API
      const fetchSection = () => {
        $.ajax({
          url: `${config.apiUrl}/getSection`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            // alert(response);
            setSection(response);
          },
          error: function (xhr, status, error) {

            console.error('Error fetching section options:', error);
          },
        });

      }
      fetchSection();

      // Fetch section type from API
      const fetchwty = (id) => {
        $.ajax({
          url: `${config.apiUrl}/employee-role/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setRoleid(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching role options:', error);
          },
        });

      }

    }
  }, []);



  const [formData, setFormData] = useState({
    name: '',
    roleid: '',
    entryid: '',
    workertype: '',
    shift: '',
    id: '',
    product: '',
    section_id: '',
    productc: '',
    section_idc: '',

  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    roleid: '',
    entryid: '',
    workertype: '',
    shift: '',
    id: '',
    product: '',
    section_id: '',

  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {

    event.preventDefault();
    //
    let errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
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

    if (!formData.product.trim()) {
      errors.product = 'Product Name is required'
      isValid = false
    }


    // First, add the item master data to the "itemmaster" table
    if (isValid) {

      const insertFormdata = { ...formData };
      const jsonData = JSON.stringify(insertFormdata);
      $.ajax({
        url: `${config.apiUrl}/update_employee`,
        method: 'POST',
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          alert(response.message);
          history.push('/hrm/employees');

        },
        error: function (xhr, status, error) {
          console.log(error);

        },
      });
    } else {
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
            <h5>Edit Employee</h5>
            <hr />
            <div className='row'>
              <div className='col-md-12'>
                <p>Update Your Details ({formData.name})({formData.entryid})</p>
                <hr />
                <form onSubmit={handleSubmit} method='POST' >
                  <div className=" row space">
                    <div className="col-sm-6">
                      <span className="Password">User Role</span>
                      <select className="form-control" name="roleid" value={formData.roleid} onChange={handleInputChange}>
                        {roleid.map((data) => (
                          <option key={data.id} value={data.name}>
                            --{data.name}--
                          </option>
                        ))}
                        <option key={1} value={1}>Worker</option>
                        <option key={2} value={1}>Supervisor</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <span className="Name">Name</span>
                      <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                      {formErrors.name && <span style={error}>{formErrors.name}</span>}
                    </div>
                  </div>
                  <div className="row space">
                    <div className="col-sm-6">
                      <span className="Entryid">Entryid</span>
                      <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} readOnly />
                      {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                    </div>
                    <div className="col-sm-6" hidden>
                      <span className="section">Section Name </span>
                      <input type="hidden" className="form-control " name="section_idc" placeholder="Section_id" value={formData.section_idc} onChange={handleInputChange} readOnly />

                      <select className="form-control" name="section_id" value={formData.section_id} onChange={handleInputChange}>

                        {section.map((data) => (
                          <option
                            key={data.id}
                            value={data.id}
                          >
                            {data.section_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className=" row space">
                    <div className="col-sm-6">
                      <span className="Password">Worker Type</span>
                      <select className="form-control" name="workertype" value={formData.workertype} onChange={handleInputChange}>
                        <option value="">Choose</option>
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
                    <div className="col-sm-6">
                      <span className="Password">Shift</span>
                      <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                        <option value="">Choose</option>
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
                      <input
                        type="hidden"
                        id="inputEmail4"
                        name="id"
                        placeholder="Entry Id"
                        value={formData.id}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className='row space' hidden>
                    <div class="col-sm-6">
                      <span className="Password">Product Name</span>
                      <input type="hidden" className="form-control " name="productc" placeholder="Product" value={formData.productc} onChange={handleInputChange} readOnly />
                      <select
                        className="form-control"
                        name="product"
                        id="product"

                        value={formData.product}
                        onChange={(e) => {
                          handleInputChange(e);

                        }}

                      >
                        <option value="">Select Product Name</option>
                        {productOptions.map((productOption) => (
                          <option
                            key={productOption.id}
                            value={productOption.id}
                          >
                            {productOption.item_description}
                          </option>
                        ))}
                      </select>
                      {formErrors.product && <span style={error}>{formErrors.product}</span>}
                    </div>

                  </div>

                  <div className=" row space">
                    <div className="col-sm-6" hidden>
                      <button className='btn btn-success btn-md'>Update</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default EditWorker;
