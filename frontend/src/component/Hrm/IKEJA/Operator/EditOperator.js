import React, { useEffect, useState, useRef  } from 'react';
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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery'; 

export function EditOperator() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [role, setRole] = useState([])
  const [section, setSection] = useState([])
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');

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
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

     
            // Fetch worker type from API
            const fetchworkerType = () => {
            $.ajax({
            url: 'http://192.168.29.243:4000/getworkertype',
            method: 'GET',
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
        // Fetch role from API
        const fetchrole = () => {
            $.ajax({
            url: `http://192.168.29.243:4000/get_role/3`,
            method: 'GET',
            success: function (response) {
                setRole(response);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching shift options:', error);
            },
            });
        }

        fetchrole();
        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `http://192.168.29.243:4000/ikeja/operator_data_single/${id}`,
            method: 'GET',
            success: function (response) {
                setFormData(response);
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
  //Get changezone wise machine data
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    $.ajax({
      url: `http://192.168.29.243:4000/ikeja/getMachines/${selectedZone}`,
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
 //Get Machine change 
 const handleMachineChange = (val) => {
  const data = val.target.value;
 
  if (subcat === '') {
    setSubcat(data + ',');
  } else {
    const ret = subcat.split(',');
    let d = '';
    let found = false;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i] === data) {
        found = true;
        break;
      }
    }
    if (found) {
      d = subcat;
    } else {
      d = subcat + data + ',';
    }
    setSubcat(d);
  }
};


  const [formData, setFormData] = useState({
    name: '',
    entryid: '',
    section_id:'',
    workertype: '',
    shift: '',
    zone:'',
    machine:'',
    id: '',
    machiness:'',
    
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    section_id:'',
    workertype: '',
    shift: '',
    zone:'',
    machine:'',
    id: '',
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
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
  $.ajax({
    url: 'http://192.168.29.243:4000/ikeja/update_operator',
    method: 'POST',
    data: formData,
    success: function (response){
         alert(response.message);
          history.push('/hrm/ikeja/operator');
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}else {
  setFormErrors(errors)
}
  
};



  return (
    <div className="container">
 <Sidebar />
 <section id="content">
    <Header />
    <main>
       <div className="container dt">
             <h5>Edit Operator</h5>
             <hr/>
             <div className='row'>
                <div className='col-md-12'>
                    <p>Update Your Details ({formData.username}) ({formData.entryid})</p> 
                    <hr/>
                    <form onSubmit={handleSubmit} method='POST' >
                    <div className=" row space">
                        <div className="col-sm-6">
                        <span className="Password">User Role</span>
                        <select className="form-control"  name="roleid" value={formData.roleid} onChange={handleInputChange}>
                            {role.map((data) => (
                                <option key={data.id} value={data.name}>
                                {data.name}
                                </option>
                            ))}
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
                        <div className="col-sm-6">
                          <span className="section">Section Name </span>
                          <select className="form-control"  name="section" value={formData.section_id} onChange={handleInputChange}>
                          
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
                        <select className="form-control"  name="workertype" value={formData.workertype} onChange={handleInputChange}>
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
                        <select className="form-control"  name="shift" value={formData.shift} onChange={handleInputChange}>
                            <option value="">Choose</option>
                        { shift.map((shiftnm) => (
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
                      
                      <div className='row space'>
                        <div class="col-sm-6">
                            <span className="Password">Current Zone</span>
                            <input type="text" className="form-control"  name="zone"  value={formData.zone} onChange={handleInputChange} readOnly />
                        </div>
                        <div class="col-sm-6">
                            <span className="Password">Current Machine</span>
                            <input type="text" className="form-control"  name="machine"  value={formData.machine} onChange={handleInputChange} readOnly />
                        </div>
                      </div>
                      {formData.roleid !='3' && 
                       <>
                      <div className='row space'>
                        <div className="col-sm-3">
                              <span className="Password">Zone</span>
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
                                </select>
                              
                        </div>
                        <div className='col-sm-3'>
                          <span className="Password">Machine</span>
                          <select className="form-control"  name="machine" value={formData.machine} onChange={(e) => {
                              handleInputChange(e);
                              handleMachineChange(e);
                            }}>
                            <option value="">Select Machine</option>
                            {machines.map((machine, index) => (
                              <option key={index} value={machine}>
                                {machine}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='row space'>
                        <div className='col-sm-6'>
                          <span className="Password">Change Machines</span>
                          <textarea className="form-control" value={subcat}  name="machiness" onChange={handleInputChange} readOnly>{subcat}</textarea>
                          {/* {formErrors.machiness && <span style={error}>{formErrors.machiness}</span>} */}
                        </div>
                      </div>
                      </>
                    }
                        <div className=" row space">
                            <div className="col-sm-6">
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
  );
}

export default EditOperator;
