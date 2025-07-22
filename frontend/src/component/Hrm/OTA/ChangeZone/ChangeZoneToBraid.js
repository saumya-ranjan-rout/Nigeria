import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';


export function ChangeZoneToBraid() {
  const [zoneData, setZoneNBraidData] = useState([]);
  const animatedComponents = makeAnimated();
  const history = useHistory();
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [lines, setLine] = useState([])
  const tableRef = useRef(null);
 
// Define a function to format machine names with breaks
function formatMachineNames(machineNames) {
  if (machineNames) {
    const machinesArray = machineNames.split(',');
    const lines = [];

    for (let i = 0; i < machinesArray.length; i += 3) {
      const line = machinesArray.slice(i, i + 3).join(', ');
      lines.push(line);
    }

    return lines.join('<br>');
  } else {
    return ''; // or any other appropriate default value
  }
}


// Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#changezone')) {
    $('#changezone').DataTable().destroy();
  }

// Initialize the DataTable with the updated data
tableRef.current = $('#changezone').DataTable({
  dom: 'Bfrtip',
  buttons: [
      {
          extend: 'copy',
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
      {
          extend: 'csv',
          filename: 'Employees_Details', // Removed space in filename
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
  ],
  data: zoneData,
  columns: [
      { data: null}, // Added defaultContent and orderable for the index column
      { data: 'entryid' },
      { data: 'name' },
      { data: 'role' },
      {
          data: null,
          render: function (data, type, row) {
              return data.workertype + '(' + data.shift + ')';
          },
      },
      {
          data: null,
          render: function (data, type, row) {
            const formattedMachineNames = formatMachineNames(data.machine);
              return ('('+data.line+')<br><b>Section:</b> <span style="color:green;">' +
                  data.section_name +
                  '</span>'
              );
          },
      },
  ],
  columnDefs: [
      {
          targets: 0,
          render: function (data, type, row, meta) {
              // Render the row index starting from 1
              return meta.row + 1; // Changed to use meta.row for the index
          },
      },
  ],
});

  useEffect(() => {
    document.title = 'Change Zone Employees list';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
        //fetch all employee data
        const fetchOperatorData = () => {
            fetch('http://192.168.29.243:4000/ota/getZonedataNbraid')
              .then((response) => response.json())
              .then((data) => setZoneNBraidData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
          fetchOperatorData();

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
        //Get section data
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
        //Get line Data
        // Fetch line type from API
    const fetchLine = () => {
        $.ajax({
        url: 'http://192.168.29.243:4000/ota/getlinemaster',
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

 
  //move data to update
  const handleMove = (entryIds) => {
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
    history.push(`/hrm/ota/multiplezoneBraid?${queryParams}`);
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
      url: `http://192.168.29.243:4000/ota/get_zoneNbraid_search?where=${where}`,
      method: 'GET',
  })
  .done((response) => {
    // Set the fetched data in the state
    setZoneNBraidData(response);
  })
  .fail((error) => {
    console.log(error);
  });
}


const selectedOption = sectionName.find((data) => data.id === formData.sectionId);
const selectedOption1 = lines.find((data) => data.line_name === formData.line);

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
          <div className="container dt">
          <h5 className="title">Change Zone[filter]</h5>
          <p style={{color:'red',fontWeigh:'900'}}>All the employees are working on <span style={{color:'green'}}>NBRAID</span> category.Here you can convert employees from nbraid to <span style={{color:'blue'}}>BRAID</span></p>
          <hr/>
          <div className='row'>
            <div className='col-md-12'>
              <form  onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-3">
                    <span className="textgreen">Shift</span>
                    <select
                      id="shift"
                      className="form-control"
                      name="shift" required
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
                  <div className="col-sm-3">
                <span className="textgreen">Line</span>
                    <Select
                    components={animatedComponents}
                    isSearchable
                    placeholder="Choose Line..."
                    value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line_name } : null}
                    onChange={(selectedOption1) => {
                      const newValue = selectedOption1 ? selectedOption1.value : '';
                      handleInputChange({ target: { name: 'line', value: newValue } });
                    }}
                    options={lines.map((data) => ({ value: data.line_name, label: data.line_name }))}
                  />
                 
              </div>
        
              <div className="col-sm-3">
                <span className="textgreen">Section Name </span>
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

          <br/>
          <hr/>
      
      <form method='POST'>
        <div className="row space">
          <div className="col-sm-6">
            <span className="textgreen">Choose Employees*</span>
            <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                required
                name="section_id"
                options={zoneData.map((employee) => ({
                  value: employee.id,
                  label: `${employee.entryid} (${employee.name})`,
                }))}
                value={selectedEmployees}
                onChange={(selectedOptions) => {
                  setSelectedEmployees(selectedOptions);
                // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                //  alert(sectionIds);
                }}
                isSearchable
                placeholder="Choose Employees"
              />
          </div>
             
          <div className="col-sm-2"><br/>
          <input
            className="btn btn-success btn-sm"
            value="Multiple Change"
            id="btnw"
            readOnly=""
            style={{ width: '150px', color: '#fff' }}
            //onClick={() => handleMove(selectedEntryId)}
            onClick={() => handleMove(selectedEmployees)}
            disabled={selectedEmployees.length == 0}
          />
        </div>
                  
      </div>
   </form>
          
          <table id="changezone" className="display">
            <thead>
              <tr>
                <th>Slno</th>
                <th>Entry ID</th>
                <th>Name</th>
                <th>User Role</th>
                <th>WorkerType<br/>(Shift)</th>
                <th>Line<br/>(section)</th>
               
              </tr>
            </thead>
            <tbody>
           
            </tbody>
          </table>
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default ChangeZoneToBraid;
