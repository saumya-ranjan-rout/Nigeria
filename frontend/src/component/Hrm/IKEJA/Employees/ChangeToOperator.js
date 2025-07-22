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

export function ChangeToOperator() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const[formPass,setFormPass] = useState('');

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

        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `http://192.168.29.243:4000/ikeja/operator_data_single/${id}`,
            method: 'GET',
            success: function (response) {
                setFormData(response);
                setFormPass(response.entryid);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching shift options:', error);
            },
            });
        };
        fetchUsers();

   
    }
  }, []);
  

const [formData, setFormData] = useState({
  name: '',
  entryid: '',
  section_id:'',
  workertype: '',
  shift: '',
  zone:'',
  machine:'',
  id: '',
  category_type:'',
  password:'',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });

  // Special handling for the "Password" field
  if (name === 'password') {
    setFormPass(value);
  }
};

  const a = formData.entryid;
  const b = "@gmail.com";
  const c = a +''+ b;

  const handleSubmit = (event) => {
  event.preventDefault();
  
  const insertFormdata = { ...formData,rlid:'3',unm:c,password: formPass};
  const jsonData = JSON.stringify(insertFormdata);
  if(formPass===""){
    alert('Password field can\'t be blank');
  }else if (!isValidPassword(formPass)) {
    alert('Invalid password format And min length 6')
  }else{
   
    $.ajax({
      url: 'http://192.168.29.243:4000/ikeja/changeEmpToOp',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response){
           alert(response.message);
            history.push('/hrm/ikeja/nbraidemployees');
          },
      error: function (xhr, status, error){
        console.log(error);
      },
    });
   
  }
 
};

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
             <p>Are you sure you want to Change Employee To Operator?<br/>
               <b>Then It will enable this account access to user.</b></p>
               <h5>Operator Details</h5>
             <hr/>
             <div className='row'>
                <div className='col-md-12'>
                    
                    <form onSubmit={handleSubmit} method='POST' >
                    <div className="row space">
                    <div className="col-md-6">
                            <span className="Name">Name</span>
                            <input type="text" className="form-control " name="name" value={formData.name} onChange={handleInputChange} readOnly />
                           
                        </div>
                        <div className="col-md-6">
                            <span className="Name">User Name</span>
                            <input type="text" className="form-control " name="username" value={c} onChange={handleInputChange} readOnly />
                            
                        </div>
                   </div>
                    <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Email</span>
                          <input type="text" className="form-control " name="email" value={c} onChange={handleInputChange} readOnly />

                        </div>
                        <div className="col-md-6">
                            <span className="Name">EntryId</span>
                            <input type="text" className="form-control " name="entryid" value={formData.entryid} onChange={handleInputChange} readOnly />
                        </div>
                    </div>
                    <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Password <span style={red}>(min length 6 | max length 20 | a-zA-Z 0-9 @ $)*</span></span>
                          <input type="text" className="form-control" name="password" value={formPass}  onChange={handleInputChange}/>
                      
                        </div>
                        <div className="col-md-6">
                            <span className="Name">Worker Type</span>
                            <input type="text" className="form-control " name="workertype" value={formData.workertype} onChange={handleInputChange} readOnly/>
                        </div>
                    </div>
                    <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Shift</span>
                          <input type="text" className="form-control " name="shift" value={formData.shift} onChange={handleInputChange} readOnly />
                          <input type="hidden" className="form-control" name="machine" value={formData.machine} onChange={handleInputChange} readOnly/>
                          <input type="hidden" className="form-control" name="zone" value={formData.zone} onChange={handleInputChange} />
                          <input type="hidden" className="form-control" name="type" value={formData.category_type} onChange={handleInputChange} />
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

export default ChangeToOperator;
