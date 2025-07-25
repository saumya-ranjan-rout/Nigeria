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

  /* import Sidebar from '../Sidebar'; */
  import Sidebar from '../../../Sidebar';
  import Header from '../../../Header';
  import $ from 'jquery'; 

  export function AddOperatorComponent() {
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [worker_type, setWorker] = useState([])
    const [shift, setShift] = useState([])
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
    let star = {
      color: 'red',
      fontSize: '15px',
    }
    let error = {
      color: 'red',
      fontSize: '13px',
    }

     

    const history = useHistory();

    useEffect(() => {
      document.title = 'Add Operator';
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
    
      }
    }, []);
    //Get changezone wise machine data
    const handleZoneChange = (e) => {
      const selectedZone = e.target.value;
      $.ajax({
        url: `http://192.168.29.243:4000/ikeja/getMachines/${selectedZone}`,
        method: 'GET',
        success: function (response) {
          setMachines(response);
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
      username: '',
      email: '',
      entryid: '',
      password: '',
      workertype: '',
      shift: '',
      zone:'',
      machine:'',
      type:'BRAID',     
    });

    const [formErrors, setFormErrors] = useState({
      name: '',
      username: '',
      email: '',
      entryid: '',
      password: '',
      workertype: '',
      shift: '',
      zone:'',

    })

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = (event) => {
    event.preventDefault();
    //
    const insertFormdata = { ...formData, machiness: subcat};
    const jsonData = JSON.stringify(insertFormdata);

    let errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format'
      isValid = false
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
      isValid = false
    } else if (!isValidEmail(formData.username)) {
      errors.username = 'Invalid username format'
      isValid = false
    }

    if (!formData.entryid.trim()) {
      errors.entryid = 'Entryid is required'
      isValid = false
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required'
      isValid = false
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Invalid password format And Min length 6 to 20'
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

    if(formData.type=="BRAID"){
      if (!formData.zone.trim()) {
        errors.zone = 'Zone is required'
        isValid = false
      }
    
      if (!subcat.trim()) {
        errors.machiness = 'Machines is required'
        isValid = false
      }
    }


    // First, add the item master data to the "itemmaster" table
    if (isValid) {
    $.ajax({
      url: 'http://192.168.29.243:4000/ikeja/add_operator',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response){
        if (response.status === 409) {
          // Handle conflict (entry id already exists) scenario
          alert(response.message);
        } else if (response.status === 200) {
          // Handle successful scenario
          alert(response.message);
          history.push('/hrm/ikeja/operator');
        }
           
          },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  }else {
    setFormErrors(errors)
  }
    
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  const isValidPassword = (password) => {
    // Password validation criteria: Only numeric characters and length between 6 and 20
    const passwordRegex = /^\d{6,20}$/;
    return passwordRegex.test(password);
  }
  
    return (
      <div className="container">
   <Sidebar />
   <section id="content">
      <Header />
      <main>
         <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >
               <h5>Operator Details</h5>
               <hr>
               </hr>
               <div className=" row space" >
                  <div className="col-sm-6">
                     <span className="Name">Name <span style={star}>*</span></span>
                     <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                     {formErrors.name && <span style={error}>{formErrors.name}</span>}
                  </div>
                  <div className="col-sm-6">
                     <span className="UserName">UserName <span style={star}>*</span><span style={red}>(eg. abc@xyz.com )</span></span>
                     <input type="text" className="form-control " name="username" placeholder="username" value={formData.username} onChange={handleInputChange}/>
                     { formErrors.username && <span style={error}>{formErrors.username}</span>} 
                  </div>
               </div>
               <div className=" row space">
                  <div className="col-sm-6">
                     <span className="Email">Email <span style={star}>*</span><span style={red}>(eg. abc@xyz.com )</span></span>
                     <input type="text" className="form-control " name="email" placeholder="email" value={formData.email} onChange={handleInputChange} />
                     {formErrors.email && <span style={error}>{formErrors.email}</span>}
                  </div>
                  <div className="col-sm-6">
                     <span className="Entryid">Entryid <span style={star}>*</span></span>
                     <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} />
                     {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                  </div>
               </div>
               <div className=" row space">
                  <div className="col-sm-6">
                     <span className="Password">Password <span style={star}>*</span> <span style={red}>(min length 6 | max length 20 | a-zA-Z 0-9 @ $)</span></span>
                     <input type="number" className="form-control " name="password" placeholder="password" value={formData.password} onChange={handleInputChange} />
                     {formErrors.password && <span style={error}>{formErrors.password}</span>}
                  </div>
                  <div className="col-sm-6">
                     <span className="Password">Worker Type <span style={star}>*</span></span>
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
               </div>
               <div className=" row space">
                  <div className="col-sm-6">
                     <span className="Password">Shift <span style={star}>*</span></span>
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
                  </div>
                  {formData.type === 'BRAID' &&
                  <div className="col-sm-6">
                     <span className="Password">Zone <span style={star}>*</span></span>
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
                     {formErrors.zone && <span style={error}>{formErrors.zone}</span>}
                  </div>
                  }
               </div>
               {formData.type === 'BRAID' &&
               <div className="row space">
                  <div className='col-sm-6'>
                  <span className="Password">Choose Machine</span>
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
                  <div className='col-sm-6'>
                  <span className="Password">Machines <span style={star}>*</span></span>
                  <input type="text" className="form-control"  name="machiness" value={subcat} onChange={handleInputChange} readOnly/>
                  {formErrors.machiness && <span style={error}>{formErrors.machiness}</span>}
                  </div>
               </div>
                }
               <div className="row space">
                  <div className='col-sm-6'  style={{ display: 'inline-flex' }}>
                  <input
                    type="radio"
                    name="type"
                    value="BRAID"
                    onChange={() => setFormData({ ...formData, type: 'BRAID' })}
                    checked={formData.type === 'BRAID'} style={{width:'3%'}}
                  /> BRAID
                  <input
                    type="radio"
                    name="type"
                    value="NBRAID"
                    onChange={() => setFormData({ ...formData, type: 'NBRAID' })}
                    checked={formData.type === 'NBRAID'} style={{width:'3%'}}
                  /> NBRAID
                    
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
    );
  }

  export default AddOperatorComponent;
