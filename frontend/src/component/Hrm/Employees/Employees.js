import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'jszip';
import 'pdfmake';
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';

export function Employees() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [productOptions, setProductOptions] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const animatedComponents = makeAnimated();
  const animatedComponents2 = makeAnimated();
  const tableRef = useRef(null);
  const history = useHistory();


  const [nakuruTotalWorkers, setNakuruTotalWorkers] = useState(0);
  const [nakuruTotalWorkersP, setNakuruTotalWorkersP] = useState(0);
  const [nakuruTotalWorkersA, setNakuruTotalWorkersA] = useState(0);

  const [likoniTotalWorkers, setLikoniTotalWorkers] = useState(0);
  const [likoniTotalWorkersP, setLikoniTotalWorkersP] = useState(0);
  const [likoniTotalWorkersA, setLikoniTotalWorkersA] = useState(0);

  const [mgoTotalWorkers, setMgoTotalWorkers] = useState(0);
  const [mgoTotalWorkersP, setMgoTotalWorkersP] = useState(0);
  const [mgoTotalWorkersA, setMgoTotalWorkersA] = useState(0);
  const [loading, setLoading] = useState(false);


  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const handleView = (id) => {
    history.push(`/hrm/viewemployee/${id}`);
  };
  const ConvertToOp = (id) => {
    history.push(`/hrm/change_to_op/${id}`);
  };
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };


  ///////
  const [formData, setFormData] = useState({
    product: '',
    shift: '',
    sectionId: '',
    site: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    const site = formData.site;
    const shift = formData.shift;
    //const product = formData.product;
    //const section = formData.sectionId;
    const products = selectedProducts.map((product) => `${product.value}`).join(',');
    const sections = selectedSections.map((section) => `${section.value}`).join(',');
    //alert(sections);

    // Encode parameters before appending to the URL
    const encodedShift = encodeURIComponent(shift);
    const encodedSite = encodeURIComponent(site);
    const encodedSections = encodeURIComponent(sections);
    const encodedProducts = encodeURIComponent(products);

    // Build the URL with encoded query parameters
    var url = `${config.apiUrl}/worker?query=true`;

    if (products !== '' && products !== undefined && products != null) {
      url += `&products=${encodedProducts}`;
    }
    if (site !== '' && site !== undefined && site != null) {
      url += `&site=${encodedSite}`;
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      url += `&shift=${encodedShift}`;
    }
    if (sections !== '' && sections !== undefined && sections != null) {
      url += `&sections=${encodedSections}`;
    }

    //alert(url);

    setLoading(true);
    $.ajax({
      url: url,
      method: 'GET',
      headers: customHeaders,
    })
      .done((response) => {
        // Set the fetched data in the state
        setEmployees(response);
        setLoading(false);
      })
      .fail((error) => {
        setLoading(false);
        console.log(error);
      });
  }


  // Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#employee')) {
    $('#employee').DataTable().destroy();
  }

  // Initialize the DataTable with the updated data
  tableRef.current = $('#employee').DataTable({
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'copy',
        exportOptions: {
          columns: ':not(.action-column)', // Exclude columns with class 'action-column'
        },
      },
      {
        extend: 'csv',
        filename: 'Employees Details',
        exportOptions: {
          columns: ':not(.action-column)',
        },
      },
    ],
    data: employess,
    columns: [
      { data: null },
      { data: 'entryid' },
      { data: 'name' },
      { data: 'emptype' },
      {
        data: null,
        render: function (data, type, row) {
          if (row.status === 'P') {
            return (
              data.workertype +
              '<br>(' +
              data.shift +
              ')<br><span style="color: blue;">Present</span>'
            )
          } else {
            return (
              data.workertype +
              '<br>(' +
              data.shift +
              ')<br><span style="color: red;">Absent</span>'
            )
          }
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          return data.item_names + '<br>Section : <span style="color:green;">' + data.section_names + '</span></span>'
        },
      },
      { data: 'site' },
      { data: null, className: 'action-column' }, // Add class 'action-column' to the action column
    ],
    columnDefs: [
      {
        targets: 0,
        render: function (data, type, row, meta) {
          // Render the row index starting from 1
          return meta.row + 1
        },
      },
      {
        targets: 7,
        render: function (data, type, row, meta) {
          const id = row.id
          // return `
          // <span style="display:grid"> 

          // <button class="btn btn-sm btn-info" style="color:#fff;font-size:10px;padding:2px 3px;margin-bottom:2px;" onclick="handleView(${id})">View</button>
          // <button class="btn btn-sm btn-danger" style="color:#fff;font-size:10px;padding:2px 3px;margin-bottom:2px;" onclick="handleDelete('${id}')">Delete</button>
          //  </span>
          // `;

          return `
          <span>
          <button class="btn btn-sm btn-info" style="color:#fff;" onclick="handleView(${id})"><i class="bx bxs-show"></i></button>
          <button class="btn btn-sm btn-danger"  onclick="handleDelete('${id}')"><i class="bx bxs-trash"></i></button>
           </span>
          `;
        },
      },
    ],
  });
  //////////////////////////////////////    <button class="btn btn-sm btn-primary" style="color:#fff;font-size:10px;padding:2px 3px;margin-bottom:2px;" onclick="ConvertToOp(${id})">Convert</button>


  useEffect(() => {
    document.title = 'Employees List';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
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
      //Default employees data fetch
      const fetchData = () => {
        setLoading(true);
        $.ajax({
          url: `${config.apiUrl}/worker`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            // Set the fetched data in the state
            setEmployees(response);
            setLoading(false);
          },
          error: function (xhr, status, error) {
            setLoading(false);
            console.log(error);
          },
        });
      };
      fetchData();



      fetchNakuruTotalWorkers();
      fetchNakuruTotalWorkersPresent();
      fetchNakuruTotalWorkersAbsent();

      fetchLikoniTotalWorkers();
      fetchLikoniTotalWorkersPresent();
      fetchLikoniTotalWorkersAbsent();

      fetchMgoTotalWorkers();
      fetchMgoTotalWorkersPresent();
      fetchMgoTotalWorkersAbsent();


    }

    // Attach the functions to the window object
    window.handleDelete = handleDelete;
    window.handleView = handleView;
    //  window.ConvertToOp = ConvertToOp;
  }, []);


  const fetchNakuruTotalWorkers = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-count/NAKURU`, { headers: customHeaders });
      const data = response.data;
      setNakuruTotalWorkers(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchNakuruTotalWorkersPresent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-present/NAKURU`, { headers: customHeaders });
      const data = response.data;
      setNakuruTotalWorkersP(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchNakuruTotalWorkersAbsent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-absent/NAKURU`, { headers: customHeaders });
      const data = response.data;
      setNakuruTotalWorkersA(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const fetchLikoniTotalWorkers = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-count/LIKONI`, { headers: customHeaders });
      const data = response.data;
      setLikoniTotalWorkers(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchLikoniTotalWorkersPresent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-present/LIKONI`, { headers: customHeaders });
      const data = response.data;
      setLikoniTotalWorkersP(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchLikoniTotalWorkersAbsent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-absent/LIKONI`, { headers: customHeaders });
      const data = response.data;
      setLikoniTotalWorkersA(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };




  const fetchMgoTotalWorkers = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-count/MLOLONGO`, { headers: customHeaders });
      const data = response.data;
      setMgoTotalWorkers(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchMgoTotalWorkersPresent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-present/MLOLONGO`, { headers: customHeaders });
      const data = response.data;
      setMgoTotalWorkersP(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchMgoTotalWorkersAbsent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/worker/total-absent/MLOLONGO`, { headers: customHeaders });
      const data = response.data;
      setMgoTotalWorkersA(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const handleDelete = (id) => {
    //  alert(id);
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/worker/delete/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
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

            <div class="row ">
              {roleId == 5 && (
                <div class="col-xl-4 col-sm-6 col-12">
                  <div class="card">
                    <div class="card-content">
                      <div class="card-body">
                        <div class="media d-flex">
                          <div class="align-self-center">
                            <i className="bx bxs-group display-2 text-success"></i>
                          </div>
                          <div class="media-body text-end m-0 w-100">
                            <h5>Nakuru</h5>
                            <h5> <Link to="#" className="text-success">
                              {nakuruTotalWorkers}
                            </Link></h5>
                            <span className='textgreen'>P:{nakuruTotalWorkersP}</span> <span className='textred'> A:{nakuruTotalWorkersA}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {roleId == 5 && (
                <div class="col-xl-4 col-sm-6 col-12">
                  <div class="card">
                    <div class="card-content">
                      <div class="card-body">
                        <div class="media d-flex">
                          <div class="align-self-center">
                            <i className="bx bxs-group display-2 text-info"></i>
                          </div>
                          <div class="media-body text-end m-0 w-100">
                            <h5>Likoni</h5>
                            <h5> <Link to="#" className="text-info">
                              {likoniTotalWorkers}
                            </Link></h5>
                            <span className='textgreen'>P:{likoniTotalWorkersP}</span> <span className='textred'> A:{likoniTotalWorkersA}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {roleId == 5 && (
                <div class="col-xl-4 col-sm-6 col-12">
                  <div class="card">
                    <div class="card-content">
                      <div class="card-body">
                        <div class="media d-flex">
                          <div class="align-self-center">
                            <i className="bx bxs-group display-2 text-warning"></i>
                          </div>
                          <div class="media-body text-end m-0 w-100">
                            <h5>Mlolongo</h5>
                            <h5><Link to="#" className="text-warning">{mgoTotalWorkers}</Link></h5>
                            <span className='textgreen'>P:{mgoTotalWorkersP}</span> <span className='textred'> A:{mgoTotalWorkersA}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div >

            <div className="container dt">
              {/* <h3 className="title">
              <Link to="/hrm/addnewworker" className="btn btn-success btn-md rounded">
                Add New Worker
              </Link>
            </h3> */}

              <h6>Filter</h6>
              <hr />
              <div className='row'>
                <div className='col-md-12'>
                  <form onSubmit={handleSubmit} method='POST'>


                    <div className='row space'>

                      <div className="col-sm-2">
                        <span className="textgreen">Shift</span>
                        <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                          <option value="">Choose</option>
                          {shiftOptions.map((shiftnm) => (
                            <option
                              key={shiftnm.id}
                              value={shiftnm.name}
                            >
                              {shiftnm.name}
                            </option>
                          ))}
                        </select>
                      </div>



                      <div class="col-sm-3">
                        <span className="textgreen">Product Name</span>


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

                      </div>

                      <div className="col-sm-3">
                        <span className="textgreen">Section Name</span>
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


                      </div>

                      <div className="col-sm-2">
                        <span className="textgreen">Site</span>
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
                      </div>

                      <div className="col-sm-2">
                        <button
                          type="submit"
                          className="btn btn-success btn-md"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <hr />
              <br /><br />

              <table id="employee" className="display">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Entry Id</th>
                    <th>Name</th>
                    <th>User Role</th>
                    <th>Worker Type<br />(Shift)</th>
                    <th>Product Name <br /> Section</th>
                    <th>Site</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {itemCategories.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.category_name}</td>
                  <td>{item.subcategory_name}</td>
                  <td>{item.item_group}</td>
                  <td>{item.item_description}</td>
                  <td>
                  </td>
                </tr>
              ))} */}
                </tbody>
                <tfoot>
                  <tr>
                    <th>#</th>
                    <th>Entry Id</th>
                    <th>Name</th>
                    <th>User Role</th>
                    <th>Worker Type<br />(Shift)</th>
                    <th>Product Name <br /> Section</th>
                    <th>Site</th>
                    <th>Action</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </main>
        </section>

      </div>
      </div>
    </>
  );
}

export default Employees;
