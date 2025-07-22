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

export function EditNewISCComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
 const [sectiontypeOptions, setSectionTypeOptions] = useState([]);
 const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const { id } = useParams();

  const [formData, setFormData] = useState({
    section_name: '',
    target_unit: '', 
     section_type: '',
  });

  

  useEffect(() => {
    document.title = 'Edit Item Section';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`http://192.168.29.243:4000/getsection/${id}`)
          .then(response => response.json())
          .then(response => {
            const { section_name, target_unit, section_type } = response;
            setFormData({ section_name, target_unit, section_type });
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
  }, [history, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      section_name: formData.section_name,
      target_unit: formData.target_unit,
      section_type: formData.section_type,
     
    };
  
    $.ajax({
      url: 'http://192.168.29.243:4000/updatesection',
      method: 'POST',
      data: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Section already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.goBack();
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Section already exists'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
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
            <form onSubmit={handleSubmit} method="POST">
             <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <h5>Edit Section</h5>
              <hr></hr>
              <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Section Name</span></label>
                <div class="col-sm-6">
                        <input type="text" placeholder=" Name"
                               class="form-control margin-bottom  required" name="section_name" id="section_name" value={formData.section_name}  onChange={handleInputChange} required/>
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
                  <input type="submit" id="submit-data" className="btn btn-success margin-top" value="Update" data-loading-text="Updating..." style={{ width: '100px'  }}/>
                </div>
              </div>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditNewISCComponent;
