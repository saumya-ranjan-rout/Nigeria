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

export function EditWorker() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [section, setSection] = useState([])
  const [lines, getLine] = useState([])
  const [roleid, setRoleid] = useState([])
  const [sectionname, setsectionName]=useState('')


  const toggleClass = () => {
    setActive(!isActive);
  };
  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };
 
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
        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `http://192.168.29.243:4000/ota/operator_data_single/${id}`,
            method: 'GET',
            success: function (response) {
                setFormData(response);
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
          url: 'http://192.168.29.243:4000/ota/getSection',
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

       // Fetch linemaster from API
       const fetchLine = () => {
        $.ajax({
        url: 'http://192.168.29.243:4000/ota/getlinemaster',
        method: 'GET',
        success: function (response) {
          getLine(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
        },
        });
        
    }
    fetchLine();

       // Fetch section type from API
       const fetchwty = (id) => {
        $.ajax({
        url: `http://192.168.29.243:4000/ota/get_role/${id}`,
        method: 'GET',
        success: function (response) {
            setRoleid(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
        },
        });
        
    }
   
    }
  }, []);
 
const [formData, setFormData] = useState({
  name: '',
  roleid:'',
  entryid: '',
  workertype: '',
  shift: '',
  line:'',
  id: '',
  section_id:'',
  usection_id:null,
  uline:null,
});

const [formErrors, setFormErrors] = useState({
  usection_id:'',
  uline:'',
  workertype: '',
  shift: '',

})
useEffect(() => {
  if (formData.section_id !== '') {
  $.ajax({
    // API URL for fetching shift options
    url: `http://192.168.29.243:4000/ota/getSectionName/${formData.section_id}`,
    method: 'GET',
    success: function (response) {
      setsectionName(response);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching section name:', error);
    },
  });
}
}, [formData.section_id]); // Add dependencies array to specify when the effect should run



  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
  event.preventDefault();
  //
  let errors = {}
  let isValid = true


  if (!formData.workertype.trim()) {
    errors.workertype = 'Worker type is required'
    isValid = false
  }
  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }
  if (!formData.uline) {
    errors.uline = 'Line is required';
    isValid = false;
  }
  if (!formData.usection_id) {
    errors.usection_id = 'Section is required';
    isValid = false;
  }
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
    const insertFormdata = { ...formData};
    const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: 'http://192.168.29.243:4000/ota/updateemployee',
    method: 'POST',
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
          history.push('/hrm/ota/nbraidemployees');
        },
    error: function (xhr, status, error){
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
             <h5>Edit Employee</h5>
             <hr/>
             <div className='row'>
                <div className='col-md-12'>
                    <p>Update Your Details ({formData.entryid})</p> 
                    <hr/>
                    <form onSubmit={handleSubmit} method='POST' >
                    <div className=" row space">
                        <div className="col-sm-6">
                        <span className="Password">User Role</span>
                        <select className="form-control"  name="roleid" value={formData.roleid} onChange={handleInputChange}>
                            {roleid.map((data) => (
                                <option key={data.id} value={data.name}>
                                {data.name}
                                </option>
                            ))}
                        </select>
                        </div>
                        <div className="col-md-6">
                            <span className="Name">Name</span>
                            <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} readOnly/>
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
                            <span className="Password">line</span>
                            <input type="text" className="form-control"  name="old_line"  value={formData.line} onChange={handleInputChange} readOnly />
                        </div>
                        <div class="col-sm-6">
                            <span className="Password">Section</span>
                            <input type="text" className="form-control"  name="old_section"  value={sectionname} onChange={handleInputChange} readOnly />
                        </div>
                      </div>
                      <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Change Line</span>
                          <select className="form-control"  name="uline" value={formData.uline} onChange={handleInputChange}>
                            <option value="">Select..</option>
                          {lines.map((data) => (
                          <option
                              key={data.id}
                              value={data.line_name}
                          >
                              {data.line_name}
                          </option>
                          ))}
                          </select>
                          {formErrors.uline && <span style={error}>{formErrors.uline}</span>}
                        </div>
                        <div className="col-sm-6">
                          <span className="section">Change Section </span>
                          <select className="form-control"  name="usection_id" value={formData.usection_id} onChange={handleInputChange}>
                          <option value="">Select..</option>
                          {section.map((data) => (
                          <option
                              key={data.id}
                              value={data.id}
                          >
                              {data.section_name}
                          </option>
                          ))}
                          </select>
                          {formErrors.usection_id && <span style={error}>{formErrors.usection_id}</span>}
                        </div>
                    </div>
                      
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

export default EditWorker;
