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
import { Link } from 'react-router-dom';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function Employees() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [zone, setZone] = useState([]) 
  const [machines, setMachines] = useState([])
  const[Defaultdate, setEmpDate]=useState('');
  const [secNm, setSecNm] = useState('');

  const tableRef = useRef(null);
  const history = useHistory();

  const handleView = (id) => {
    history.push(`/hrm/ota/viewemployeebraid/${id}`);
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

  // Define a function to format machine names with breaks
function formatMachineNames(machineNames) {
  const machinesArray = machineNames.split(',');
  const lines = [];

  for (let i = 0; i < machinesArray.length; i += 3) {
      const line = machinesArray.slice(i, i + 3).join(', ');
      lines.push(line);
  }

  return lines.join('<br>');
}
///////
const [formData, setFormData] = useState({
    shift:'',
    zone:'',
    machine:'',
    sectionId: '',
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const shift = formData.shift;
    const zone = formData.zone;
    const machine = formData.machine;
    const section = formData.sectionId;

    let where = `(employees_ota.roleid != '3' AND employees_ota.roleid !='5' AND employees_ota.passive_type='ACT' AND employees_ota.category_type='BRAID')`;

    if (zone !== '') {
        where += ` AND employees_ota.zone='${zone}'`;
    }

    if (shift !== '') {
        where += ` AND employees_ota.shift='${shift}'`;
    }

    if (machine !== '') {
      const machinec = machine.endsWith(',') ? machine : machine + ',';
      where += ` AND employees_ota.machine LIKE '%${machinec}%'`;
    }

    if (section !== '') {
      where += ` AND employees_ota.section_id='${section}'`;
    }

  const encodedWhere = encodeURIComponent(where);

    $.ajax({
        url: `http://192.168.29.243:4000/ota/get_employees?where=${encodedWhere}`,
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
          const formattedMachineNames = formatMachineNames(data.machine);  
          return data.zone + '<br><span style="font-size:12px;">(' + formattedMachineNames + ')<br>Section : <span style="color:green;">' + data.section_name+'</span></span>'
          },
      },
      { data: 'staff' },
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
          <button class="btn btn-sm btn-primary" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="ConvertToOp(${id})" title="Convert To Operator"><i class="bx bx-user"></i></button>
          <button class="btn btn-sm btn-info" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleView(${id})" title="View"><i class="bx bx-show-alt"></i></button>
          <button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleDelete('${id}')" title="Delete"><i class="bx bx-trash-alt"></i></button>
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
       //Default employees data fetch
    const fetchData = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/ota/get_employeess',
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
          url: 'http://192.168.29.243:4000/ota/get_employeess_date',
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
    fetchDate();
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
  

//Get changezone wise machine data
const handleZoneChange = (e) => {
  const selectedZone = e.target.value;
  $.ajax({
    url: `http://192.168.29.243:4000/ota/getMachines/${selectedZone}`,
    method: 'GET',
    success: function (response) {
      const machinesSplit = response.split(',');
      setMachines(machinesSplit);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching line options:', error);
    },
  });
};
  
const selectedOption = sectionName.find((data) => data.id === formData.sectionId);

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
                    name="shift"required
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
              
                     <span className="textgreen">Zone</span>
                     <select className="form-control"  name="zone" value={formData.zone} onChange={(e) => {
                      handleInputChange(e);
                      handleZoneChange(e);
                    }}>
                        <option value="">Choose</option>
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
                <div className='col-sm-2'>
                  <span className="textgreen">Machine</span>
                  <select
                    className="form-control"
                    name="machine"
                    value={formData.machine}
                    onChange={(e) => {
                      handleInputChange(e);
                    }}
                  >
                    <option value="">Select Machine</option>
                    {machines &&
                      machines.map((machine, index) =>
                        machine.trim() !== "" ? (
                          <option key={index} value={machine}>
                            {machine}
                          </option>
                        ) : null
                      )}
                  </select>
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
                        options={sectionName.map((data) => ({ value: data.id, label: data.section_name }))}
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
              <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>ZONE :<span style={{color:'green'}}>{formData.zone}</span> , SHIFT : <span style={{color:'green'}}>{formData.shift}</span>, SECTION : <span style={{color:'green'}}>{secNm}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{employess.length}</span></p>
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
                <th>Zone <br/> Machine <br/> Section</th>
                <th>Site</th>
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
                <th>Product <br/>(Line) <br/>Section</th>
                <th>Site</th>
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
