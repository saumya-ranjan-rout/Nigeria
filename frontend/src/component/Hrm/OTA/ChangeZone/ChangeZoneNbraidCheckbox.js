import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
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
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function ChangeZoneNbraidCheckbox() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [items ,setItems] = useState([]);
  const animatedComponents = makeAnimated();
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [lines, setLine] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmployees1, setSelectedEmployees1] = useState([]);
  
 
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();


    useEffect(() => {

       document.title = 'Add Assign Operator';
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
    fetchSectionOptions()
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
  }, []);


  //get items
  useEffect(() => {
   
      $.ajax({
        url: `http://192.168.29.243:4000/ota/getZonedataNbraid`,
        method: 'GET',
        success: function (response) {
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
   
  }, []);

 //submit assign data
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
    const entryid = selectedEmployees1.map((item) => item.value).join(',');
    let where = `(employees_ota.roleid != '3' AND employees_ota.roleid !='5' AND employees_ota.passive_type='ACT' AND employees_ota.category_type='NBRAID')`;
  
    if(entryid !==''){
        where += ` AND employees_ota.entryid IN (${entryid})`;
      }
    
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
      setItems(response);
    })
    .fail((error) => {
      console.log(error);
    });
  }


  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  //////////////
//Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}

const filteredData = items.filter((row) => {
  return row.name.toLowerCase().includes(searchValue.toLowerCase())
})
//For check box
const [checkedItems, setCheckedItems] = useState([])
const [isChecked, setIsEnabled] = useState(false)

const handleCheckAll = (event) => {
  const { checked } = event.target

  if (checked) {
    setIsEnabled(true)
    // Get the IDs of all items in your table and set them in the state
    const allItemIds = items.map((item) => item.id)
    setCheckedItems(allItemIds)
  } else {
    setIsEnabled(false)
    // Uncheck all items
    setCheckedItems([])
  }
}
//Variable set for send tomove
const [checkboxValue, setCheckboxValue] = useState('')

const handleCheckSingle = (event, itemId) => {
  const { checked } = event.target
  setCheckboxValue(itemId)
  if (checked) {
    setIsEnabled(true)
    // Add the item ID to the checkedItems array
    setCheckedItems((prevCheckedItems) => [...prevCheckedItems, itemId])
  } else {
    setIsEnabled(false)
    // Remove the item ID from the checkedItems array
    setCheckedItems((prevCheckedItems) => prevCheckedItems.filter((id) => id !== itemId))
  }
}
 

//move data to shift update
const handleMove = (entryIds) => {
    const queryParams = checkedItems.map((items) => `entryIds=${items}`).join('&');
    history.push(`/hrm/ota/multiplezoneNbraid?${queryParams}`);
  };


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Change Zone </h5>
            <hr></hr>
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
                    <select className="form-control"  name="line" value={formData.line} onChange={handleInputChange}>
                        <option value="">Choose Line</option>
                        {lines.map((data) => (
                        <option
                            key={data.id}
                            value={data.line_name}
                        >
                            {data.line_name}
                        </option>
                        ))}
                        </select>
                </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Section Name</span>
                  
                    <select id="inputState" 
                    name="sectionId" 
                    className="form-control" 
                    value={formData.sectionId}
                    onChange={handleInputChange}>
                      <option>Choose...</option>
                      {sectionName.map((data, index) => (
                      <option key={data.id} value={data.id}>
                          {data.section_name}
                      </option>
                      ))}
                  </select>
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Choose Employees</span>
                     <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="employees"
                      options={items.map((employee) => ({
                        value: employee.entryid,
                        label: `${employee.entryid} (${employee.name})`,
                      }))}
                      value={selectedEmployees1}
                      onChange={(selectedOptions) => {
                        setSelectedEmployees1(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                      }}
                      isSearchable
                      placeholder="Choose Employees"
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
          
             
            {/* Display Input Field Values */}
          
            <div style={{ display: 'flex' }}>
                  <input
                    className='form-control'
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    style={{ width: '80%' }}
                  /> &nbsp;&nbsp;
                  <button
                    className='btn btn-success'
                    style={{ color: '#fff' }}
                    disabled={!isChecked}
                    type="submit"
                    onClick={handleMove}
                  >
                    Move
                  </button>
                </div>


            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={handleCheckAll} />All</th>
                    <th>Entry ID</th>
                    <th>Name</th>
                    <th>User Role</th>
                    <th>WorkerType<br/>(Shift)</th>
                    <th>Line<br/>(section)</th>
                  </tr>
                </thead>
                <tbody>
                {filteredData.map((row, index) => (
                    <tr key={row.id}>
                      <td scope="row">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(row.id)}
                          onChange={(event) => handleCheckSingle(event, row.id)}
                          name="check[]"
                          value={row.id}
                        />
                      </td>
                      <td>{row.entryid}</td>
                      <td>{row.name}</td>
                      <td>{row.role}</td>
                      <td>
                          {row.workertype + '(' + row.shift + ')'}
                      </td>
                      <td>
                        
                        <span style={{ fontSize: '12px' }}>
                            {'('+row.line+')'}
                            <br />
                            <b>Section:</b>
                            <span style={{ color: 'green' }}>{row.section_name}</span>
                        </span>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default ChangeZoneNbraidCheckbox;
