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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function Employees() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [lines, setLines] = useState([])
  const [secNm, setSecNm] = useState('');

  const[Defaultdate, setEmpDate]=useState('');

  const tableRef = useRef(null);
  const history = useHistory();

  const handleView = (id) => {
    history.push(`/hrm/ota/viewemployee/${id}`);
  };
  const ConvertToOp = (id) => {
    history.push(`/hrm/ota/change_to_op/${id}`);
  };
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };
///////
const [formData, setFormData] = useState({
    shift:'',
    line:'',
    sectionId: '',
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const shift = formData.shift;
    const line = formData.line;
    const section = formData.sectionId;

    $.ajax({
      url: `http://192.168.29.243:4000/ota/getSectionName/${formData.sectionId}`,
      method: 'GET',
      success: function (response) {
        setSecNm(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section options:', error);
      },
    });

    let where = `(employees_ota.roleid != '3' AND employees_ota.roleid !='5' AND employees_ota.passive_type='ACT' AND employees_ota.category_type='NBRAID')`;

    if (shift !== '') {
        where += ` AND employees_ota.shift='${shift}'`;
    }

    if (line !== '') {
        where += ` AND employees_ota.line='${line}'`;
    }

    if (section !== '') {
      where += ` AND employees_ota.section_id='${section}'`;
  }


    $.ajax({
        url: `http://192.168.29.243:4000/ota/get_employees_nbraid?where=${where}`,
        method: 'GET',
    })
    .done((response) => {
      // Set the fetched data in the state
      setEmployees(response);
    })
    .fail((error) => {
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
      { data: 'role' },
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
          return data.zone + '<br><span style="font-size:12px;">(' + data.line + ')<br>Section : <span style="color:green;">' + data.section_name+'</span></span>'
          },
      },
      {
        data: 'staff' 
      },
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
          return `
          <span style="display:inline"> 
          <button class="btn btn-sm btn-primary" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="ConvertToOp(${id})" title="Convert"><i class="bx bx-user"></i></button>
          <button class="btn btn-sm btn-info" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleView(${id})"  title="View"><i class="bx bx-show-alt"></i></button>
          <button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleDelete('${id}')"  title="Delete"><i class="bx bx-trash-alt"></i></button>
           </span>
          `
          },
      },
      ],
  });
//////////////////////////////////////
  useEffect(() => {
    document.title = 'Employees List';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
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

    const fetchSectionOptions = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getSectionOptions',
        method: 'GET',
        success: function (response) {
          setSectionName(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchSectionOptions();

    const fetchLines = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/ota/getlinemaster',
        method: 'GET',
        success: function (response) {
          setLines(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchLines();
       //Default employees data fetch
        const fetchData = () => {
        $.ajax({
            url: 'http://192.168.29.243:4000/ota/get_employeess_nbraid',
            method: 'GET',
            success: function (response) {
            // Set the fetched data in the state
            setEmployees(response);
            },
            error: function (xhr, status, error) {
            console.log(error);
            },
        });
        };
        fetchData();
         //Default employees date fetch
         const fetchDate = () => {
          $.ajax({
              url: 'http://192.168.29.243:4000/ota/get_employeess_nbraid_date',
              method: 'GET',
              success: function (response) {
              // Set the fetched data in the state
              setEmpDate(response.date);
              },
              error: function (xhr, status, error) {
              console.log(error);
              },
          });
        };
        fetchDate()
    }

    // Attach the functions to the window object
    window.handleDelete = handleDelete;
    window.ConvertToOp = ConvertToOp;
    window.handleView = handleView;
  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `http://192.168.29.243:4000/ota/delete_user/${id}`,
        method: 'DELETE',
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
  
  const selectedOption = sectionName.find((data) => data.id === formData.sectionId);
  const selectedOption1 = lines.find((data) => data.line_name === formData.line);

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
          
          <div className="container dt">
            <h6>Filter:</h6>
            <hr/>
          <div className='row'>
            <div className='col-md-12'>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                 <div className="col-sm-2">
                  <span className="textgreen">Shift</span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                     value={formData.shift} onChange={handleInputChange}
                  >
                    <option value="">Choose...</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-3">
                    <span className="textgreen">Line </span>
                        <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Line..."
                        value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line_name } : null}
                        onChange={(selectedOption1) => {
                          const newValue = selectedOption1 ? selectedOption1.value : '';
                          handleInputChange({ target: { name: 'line', value: newValue } });
                        }}
                        options={lines.map((data) => ({ value: data.line_name, label: data.line_name }))} required
                      />
                      
                  </div>
            
                  <div className="col-sm-3">
                    <span className="textgreen">Section Name</span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Section..."
                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'sectionId', value: newValue } });
                        }}
                        options={sectionName.map((data) => ({ value: data.id, label: data.section_name }))} required
                      />
                  
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

          <br/><br/>
          {formData.shift!="" && (
              <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>Line :<span style={{color:'green'}}>{formData.line}</span> , SHIFT : <span style={{color:'green'}}>{formData.shift}</span>, SECTION : <span style={{color:'green'}}>{secNm}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{employess.length}</span></p>
            )}
           <p style={{fontSize:'15px',fontWeight:'bold',color:'red',textAlign:'center'}}>Attendance Showing List <span style={{color:'green'}}>Date: {Defaultdate}</span></p>
          
          <table id="employee" className="display">
            <thead>
              <tr>
                <th>Slno</th>
                <th>Entry Id</th>
                <th>Name</th>
                <th>Role</th>
                <th>Worker Type<br/>(Shift)</th>
                <th>Line <br/> Section</th>
                <th>Staff</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
            <tfoot>
            <tr>
                <th>Slno</th>
                <th>Entry Id</th>
                <th>Name</th>
                <th>User Role</th>
                <th>Worker Type<br/>(Shift)</th>
                <th>Line <br/> Section</th>
                <th>Staff</th>
                <th>Action</th>
              </tr>
            </tfoot>
          </table>
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default Employees;
