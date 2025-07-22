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
import { useParams } from 'react-router-dom'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

export function AddAssignOperatorNbraid() {
  const animatedComponents = makeAnimated();
  const { id } = useParams()
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUser] = useState('') 
  const [shift, setShift] = useState([])
  const [line, setLine] = useState([])
  const [section, setSection] = useState([])
  const [userId ,setUserid] = useState('');
  const [items ,setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const tableRef = useRef(null);
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
      window.handleDelete = handleDelete;
      const fetchUserName = () => {
        $.ajax({
          url: `http://192.168.29.243:4000/ikeja/operator_data_single/${id}`,
          method: 'GET',
          success: function (response) {
            setOpUser(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
      fetchUserName();
     
      // Fetch Shift type from API
        const fetchshift = () => {
            $.ajax({
            url: 'http://192.168.29.243:4000/getShiftOptions',
            method: 'GET',
            success: function (response) {
                setShift(response);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching shift options:', error);
            },
            });
        }
        fetchshift();

        // Fetch line type from API
        const fetchLine = () => {
            $.ajax({
            url: 'http://192.168.29.243:4000/ikeja/getlinemaster',
            method: 'GET',
            success: function (response) {
                setLine(response);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching line options:', error);
            },
            });
        }
        fetchLine();

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
     
    }
  }, []);

 //get user id
 useEffect(() => {
    if (OpUserName && OpUserName.entryid) {
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/getuserid/${OpUserName.entryid}`,
        method: 'GET',
        success: function (response) {
          setUserid(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [OpUserName]);

  //get items
  useEffect(() => {
    if (userId && userId.id) {
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/getSectionitem/${userId.id}`,
        method: 'GET',
        success: function (response) {
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [userId]);

 //submit assign data
 const [formData, setFormData] = useState({
  shift: '',
  line:'',
  section:'',
  
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const insertFormdata = { ...formData, id: userId.id};
  const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/addSectionOp',
    method: 'POST',
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
         window.location.reload();
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/delete_section_assign/${id}`,
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


  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  let star = {
    color: 'red',
    fontSize: '15px',
  }
  //////////////
  //Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}



 // Destroy the existing DataTable instance (if it exists)
 if ($.fn.DataTable.isDataTable('#asssignnbraid')) {
  $('#asssignnbraid').DataTable().destroy();
}

// Initialize the DataTable with the updated data
tableRef.current = $('#asssignnbraid').DataTable({
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
data: items,
columns: [
    { data: null},
    { data: 'line'}, // Added defaultContent and orderable for the index column
    { data: 'section_name' },
    { data: 'shift' },
    {
      data: null,
      render: function (data, type, row) {
        const id = data.id;
        
          return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="bx bx-trash-alt"></i></button>`
       
      },
    }
 
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


const handleMove = () => {
  const ids = selectedItems.map((items) => `${items.value}`).join(',');
  const id=userId.id;
  const redirectURL = `/hrm/ikeja/multiplesectionassign/${id}/${ids}`;
  history.push(redirectURL);
};

const selectedOption = section.find((data) => data.id === formData.section);
const selectedOption1 = line.find((data) => data.line_name === formData.line);

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Add New Section For   <span style={{color:'red'}}>{OpUserName.name}</span></h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-3">
                    <span className="textgreen">Shift <span style={star}>*</span></span>
                    <select className="form-control"  name="shift" value={formData.shift} onChange={handleInputChange} required>
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
                </div>
                
                <div className="col-sm-4">
                    <span className="textgreen">Line <span style={star}>*</span></span>
                        <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Section..."
                        value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line_name } : null}
                        onChange={(selectedOption1) => {
                          const newValue = selectedOption1 ? selectedOption1.value : '';
                          handleInputChange({ target: { name: 'line', value: newValue } });
                        }}
                        options={line.map((data) => ({ value: data.line_name, label: data.line_name }))} required
                      />
                      
                  </div>
            
                  <div className="col-sm-4">
                    <span className="textgreen">Section Name <span style={star}>*</span></span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Section..."
                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'section', value: newValue } });
                        }}
                        options={section.map((data) => ({ value: data.id, label: data.section_name }))} required
                      />
                  
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

            <form method='POST'>
              <div className="row space">
                <div className="col-sm-6">
                  <span className="textgreen">Choose Line And Section*</span>
                  <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="section_id"
                      options={items.map((item) => ({
                        value: item.id,
                        label: `${item.line} (${item.section_name})`,
                      }))}
                      value={selectedItems}
                      onChange={(selectedOptions) => {
                        setSelectedItems(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                      }}
                      isSearchable
                      placeholder="Choose Line and sec"
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
                  onClick={() => handleMove(selectedItems)}
                  disabled={selectedItems.length == 0}
                />
              </div>
                        
            </div>
            </form>
            <table id="asssignnbraid" className="display">
                <thead>
                  <tr>
                    <th>slno</th>
                    <th>line</th>
                    <th>Section name</th>
                    <th>Shift</th>
                    <th>Action</th>
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

export default AddAssignOperatorNbraid;
