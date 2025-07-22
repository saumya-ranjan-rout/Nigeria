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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery'; 

export function AddNewSectionComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [sectiontypeOptions, setSectionTypeOptions] = useState([]);
  
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

   

  const history = useHistory();

  useEffect(() => {
    document.title = 'Add Section';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      

      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }

    // Fetch section type options from API
      const fetchSectionTypeOptions = () => {
        $.ajax({
          url: 'http://192.168.29.243:4000/getsectiontype',
          method: 'GET',
          success: function (response) {
            setSectionTypeOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

      fetchSectionTypeOptions();

  }, []);


  const [formData, setFormData] = useState({
    section_name: '',
    target_unit: '', 
    section_type: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    $.ajax({
      url: 'http://192.168.29.243:4000/addsection',
      method: 'POST',
      data: formData,
      success: function (response) {
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Section already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/section');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });
   
  };
  

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
        <div className="container dt">
        <form onSubmit={handleSubmit} method='POST' >
         <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>

              <h5>Add New Section</h5>
              <hr></hr>

              <div class="form-group row space">

              <label class="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Section Name</span> <span className='textred'>*</span></label>

                    <div class="col-sm-6">
                        <input type="text" placeholder=" Name"
                               class="form-control margin-bottom  required" name="section_name" id="section_name" value={formData.section_name}  onChange={handleInputChange} required />
                    </div>
                </div>
              
              <div className="form-group row space">

              <label class="col-sm-2 col-form-label"
                           for="target_unit"><span className='textblack'>Target Unit</span></label>

                    <div class="col-sm-6">
                    <select
                        name="target_unit"
                        className="form-control margin-bottom"
                        id="target_unit"
                        value={formData.target_unit}
                        onChange={handleInputChange}
                        required
                      >
                         <option value="">Select Target</option>
                        <option value="BUNDLE">BUNDLE</option>
                              <option value="%">%</option>
                            <option value="PCS">PCS</option>
                               <option value="CARTON">CARTON</option>
                      </select>
                    </div>
              </div>

               <div class="form-group row">

                    <label class="col-sm-2 col-form-label"
                           for="product_catname"><span className='textblack'>Section Type</span></label>

                    <div class="col-sm-6">
                    
                          <select
                          name="section_type"
                          className="form-control margin-bottom"
                          id="target_unit"
                          value={formData.section_type}
                          onChange={handleInputChange}
                          required>
          
                              <option value="">Select Section Type</option>
                                {sectiontypeOptions.map((sectiontypeOption) => (
                                  <option key={sectiontypeOption.id} value={sectiontypeOption.category_name}>
                                    {sectiontypeOption.category_name}
                                  </option>
                                ))}
                      </select>
                    </div>
                </div>
                
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Add" data-loading-text="Adding..." style={{ width: '100px'  }}/>
                      
                  </div>
              </div>


              </form>
        </div>
          
        
        </main>
      </section>
      
    </div>
  );
}

export default AddNewSectionComponent;
