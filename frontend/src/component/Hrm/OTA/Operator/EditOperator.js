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

  const [formData, setFormData] = useState({
    name: '',
    entryid: '',
    email:'',
    workertype: '',
    shift: '',
    id: '',
  });


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
                console.error('Error fetching worker options:', error);
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
        
        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `http://192.168.29.243:4000/ota/operator_data_single/${id}`,
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
      

    }
  }, []);

useEffect(() => {

  if (formData && formData.roleid) {
        $.ajax({
          url: `http://192.168.29.243:4000/ota/get_role/${formData.roleid}`,
          method: 'GET',
          success: function (response) {
            setRole(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching role options:', error);
          },
        });
      }
  }, [formData]); // Empty dependency array ensures useEffect runs only once during component initialization

  
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    workertype: '',
    shift: '',
    email:'',
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
    url: 'http://192.168.29.243:4000/ota/update_operator',
    method: 'POST',
    data: formData,
    success: function (response){
         alert(response.message);
          history.push('/hrm/ota/operator');
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
                        <span className="Entryid">Email</span>
                          <input type="text" className="form-control " name="email" placeholder="email" value={formData.email} onChange={handleInputChange} readOnly />
                          {formErrors.email && <span style={error}>{formErrors.email}</span>}
                        </div>
                    </div>
                    <div className="row space">
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
                      <div className="row space">
                        <div className='col-sm-6'>
                        <span className="Password">Site</span>
                        <select className="form-control"  name="staff" value={formData.staff} onChange={handleInputChange}>
                            <option value="">Choose</option>
                            <option value="RIL">RIL </option>
                            <option value="LORNA">LORNA</option>
                        </select>
                        </div>
                      </div>
                      <div className="row space">
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
