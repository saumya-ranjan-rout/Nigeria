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

export function AddAssignOperator() {
  const { id } = useParams()
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUser] = useState('') 
  const [zone, setZone] = useState([]) 
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');
  const [userId ,setUserid] = useState('');
  const [items ,setItems] = useState([]);

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

      const fetchUserName = () => {
        $.ajax({
          url: `http://192.168.29.243:4000/ota/operator_data_single/${id}`,
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
      //zone data get
      const fetchZone = () => {
        $.ajax({
          url: `http://192.168.29.243:4000/ota/getzone`,
          method: 'GET',
          success: function (response) {
            setZone(response);
           
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
  
      fetchZone();
      //user id
     // Assuming OpUserName is defined and has a valid entryid


     
    }
  }, []);
 //get user id
  useEffect(() => {
    if (OpUserName && OpUserName.entryid) {
      $.ajax({
        url: `http://192.168.29.243:4000/ota/getuserid/${OpUserName.entryid}`,
        method: 'GET',
        success: function (response){
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
        url: `http://192.168.29.243:4000/ota/getItems/${userId.id}`,
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


 //submit assign data
 const [formData, setFormData] = useState({
  zone: '',
  machine:'',
  id:'',
  machiness:'',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const insertFormdata = { ...formData, id: userId.id,machiness: subcat};
  const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: 'http://192.168.29.243:4000/ota/add_zone',
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
        url: `http://192.168.29.243:4000/ota/item_zone_delete/${id}`,
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
  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Assign Zone & Machine For  <span style={{color:'red'}}>{OpUserName.name}</span></h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
              <div className="col-sm-3">
              
                     <span className="Password">Zone</span>
                     <select className="form-control"  name="zone" value={formData.zone} onChange={(e) => {
                      handleInputChange(e);
                      handleZoneChange(e);
                    }}>
                       <option value="">Choose</option>
                       {zone.map((data, index) => (
                          <option key={index} value={data.zone}>
                            {data.zone}
                          </option>
                        ))}
                        </select>
                     {/* {formErrors.zone && <span style={error}>{formErrors.zone}</span>} */}
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
                  <div className='col-sm-4'>
                    <span className="Password">Change Machines</span>
                    <textarea className="form-control" value={subcat}  name="machiness" onChange={handleInputChange} readOnly>{subcat}</textarea>
                    {/* {formErrors.machiness && <span style={error}>{formErrors.machiness}</span>} */}
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

            
            {/* Display Input Field Values */}
            <p style={{color:'blue',fontWeight:'bold'}}>If you want to change the machine field of any particular ZONE what you have already inserted,Then change it in that same above form.The machine field will change</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>slno</th>
                    <th>Zone</th>
                    <th>Machines</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                {items.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.zone}</td>
                      <td>{row.machine}</td>
                      <td>
                        <button className="btn btn-danger" style={btnStyle} onClick={() => handleDelete(row.id)}>
                          <i class="bx bxs-trash"></i>
                        </button>
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

export default AddAssignOperator;
