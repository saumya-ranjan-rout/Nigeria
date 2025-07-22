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

export function EditWasteComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
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
    waste_name: '',
   
  });

  

  useEffect(() => {
    document.title = 'Edit Waste Master';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`http://192.168.29.243:4000/editwaste/${id}`)
          .then(response => response.json())
          .then(response => {
            const { name } = response; // Make sure the key matches the response data
          if (name) {
            setFormData(prevFormData => ({ ...prevFormData, waste_name: name }));
          }
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      waste_name: formData.waste_name,
    };
  
    $.ajax({
      url: 'http://192.168.29.243:4000/updatewaste',
      method: 'POST',
      data: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Waste already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.goBack();
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Waste already exists'); // Set the server message in state for other errors
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
              <h5>Edit Waste</h5>
              <hr></hr>
              <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="waste_name"><span className='textblack'>Name</span> <span className='textred'>*</span></label>
                <div class="col-sm-6">
                        <input type="text" placeholder=" Name"
                               class="form-control margin-bottom  " name="waste_name" id="waste_name" value={formData.waste_name}  onChange={handleInputChange} required/>
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

export default EditWasteComponent;