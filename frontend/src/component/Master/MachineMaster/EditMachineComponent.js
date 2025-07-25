import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';

export function EditMachineComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
 const [selectedMachines, setSelectedMachines] = useState([]);
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const { id } = useParams();

  const [formData, setFormData] = useState({
    zone: '',
    machine: '',
    
  });

  

  useEffect(() => {
    document.title = 'Edit Machine';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`http://192.168.29.243:4000/editmachine/${id}`)
          .then(response => response.json())
          .then(response => {
          
           const { zone, machine } = response;
            //alert('Zone:'+ zone); // Check the zone value in the console
           //alert('Machine:' + machine); // Check the machine value in the console
            setFormData(prevFormData => ({
              ...prevFormData,
              zone, // Set the zone value from the response
              machine,
            }));
             setSelectedMachines(machine.split(',')); // Convert the comma-separated string to an array
        })
         
          .catch(error => {
            console.log(error);
          });
      }
    

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, [history, id]);

/*const handleInputChange = (event) => {
  const { name, value } = event.target;
  
  if (name === 'machine1' && value) {
    setSelectedMachines((prevSelectedMachines) => [...prevSelectedMachines, value]);
    setFormData({ ...formData, machine: value }); // Update the machine field in formData
  } else {
    setFormData({ ...formData, [name]: value });
  }
};*/

const handleInputChange = (event) => {
  const { name, value } = event.target;

  if (name === 'machine1' && value) {
    // Check if the selected machine is already in the array
    if (!selectedMachines.includes(value)) {
      setSelectedMachines((prevSelectedMachines) => [...prevSelectedMachines, value]);
    }
    // Update the machine field in formData
    setFormData({ ...formData, machine: selectedMachines.join(',') });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};



const renderSelectedMachines = () => {
  return selectedMachines.join(', ');
};


  const handleSubmit = (event) => {
    event.preventDefault();
  
   

    const postData = {
       id: id,
      zone: formData.zone,
      machine: selectedMachines.join(','), // Join the selected machines array into a comma-separated string
    };

    const jsonData = JSON.stringify(postData);

  //alert(jsonData); // Check if the JSON data is correctly formatted
  
    $.ajax({
      url: 'http://192.168.29.243:4000/updatemachine',
      method: 'POST',
      data: jsonData,
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Machine already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.goBack();
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('An error occurred'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
      },
    });
  };
 
  const clearSelectedMachines = () => {
    setSelectedMachines([]); // Clear the selected machines array
    setFormData((prevFormData) => ({
      ...prevFormData,
      machine: '', // Clear the machine field in formData
    }));
  }; 

 return (
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <form  onSubmit={handleSubmit}  method="POST">
            <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <h5>Edit Machine</h5>
              <hr></hr>
                 <div className="form-group row space">

              <label className="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Zone </span> <span className='textred'>*</span></label>

                    <div className="col-sm-6">
                        <select
                            className="form-control"
                            name="zone"
                            value={formData.zone}
                             onChange={handleInputChange}
                             required
                          >
                            <option value=""disable>Select ZONE</option>
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
                </div>

                
              
              <div className="form-group row space">

              <label className="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Machine</span> </label>

                    <div className="col-sm-6">
                        <select
                            className="form-control"
                            name="machine1"
                            value={formData.machine1}
                             onChange={handleInputChange}
                          >
                            <option value=""disable>Select Machine</option>
                           
                               <option value="MACH1">MACH1</option>
                               <option value="MACH2">MACH2</option>
                               <option value="MACH3">MACH3</option>
                               <option value="MACH4">MACH4</option>
                               <option value="MACH5">MACH5</option>
                               <option value="MACH6">MACH6</option>
                               <option value="MACH7">MACH7</option>
                               <option value="MACH8">MACH8</option>
                               <option value="MACH9">MACH9</option>
                               <option value="MACH10">MACH10</option>
                               
                                <option value="MACH11">MACH11</option>
                               <option value="MACH12">MACH12</option>
                               <option value="MACH13">MACH13</option>
                               <option value="MACH14">MACH14</option>
                               <option value="MACH15">MACH15</option>
                               <option value="MACH16">MACH16</option>
                               <option value="MACH17">MACH17</option>
                               <option value="MACH18">MACH18</option>
                               <option value="MACH19">MACH19</option>
                               <option value="MACH20">MACH20</option>
                        </select>
                    </div>
                </div>

                 <div class="form-group row space">

                   <label className="col-sm-2 col-form-label"
                           for="section_name"></label>
                    <div class="col-sm-6">
                        <input type="text" className="gentxt1 subcat form-control " name="machine" readonly  value={renderSelectedMachines()} required style={{ background: '#ECEFF1'  }}/>
                        
                    </div>
                    <div class="col-sm-4" style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={clearSelectedMachines}
                          >
                            Clear Machines
                          </button>
                        </div>
                </div>
              
                
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Update" data-loading-text="Updating..." style={{ width: '100px'  }}/>
                      
                  </div>
              </div>

              

         </form>
             
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditMachineComponent;