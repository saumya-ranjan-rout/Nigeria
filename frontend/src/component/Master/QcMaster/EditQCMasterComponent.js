import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';

export function EditQCMasterComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const history = useHistory();

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
   
  });

  

  useEffect(() => {
    document.title = 'Edit QC';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`http://192.168.29.243:4000/editqc/${id}`)
          .then(response => response.json())
          .then(response => {
            const { name, value } = response;
            setFormData({
            name,
            value: parseFloat(value).toFixed(2), // Parse the value as a float
          });
          })
          .catch(error => {
            console.log(error);
          });
      }
    

     
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
      name: formData.name,
      value: formData.value,
      
     
    };
  
    $.ajax({
      url: 'http://192.168.29.243:4000/updateqc',
      method: 'POST',
      data: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'QC already exists' ? 'alert alert-warning' : 'alert alert-success');
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
              <h5>Edit QC</h5>
              <hr></hr>
              <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="QC_name"><span className='textblack'>Name</span> <span className="textred" >*</span></label>
                <div class="col-sm-6">
                        <input type="text" 
                               class="form-control margin-bottom" name="name" id="name" value={formData.name} readOnly onChange={handleInputChange} required  />
                    </div>
              </div>

              <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="QC_name"><span className='textblack'>Value</span> <span className="textred" >*</span></label>
                <div class="col-sm-6">
                        <input type="text" 
                               class="form-control margin-bottom  " name="value" id="value" value={formData.value}  onChange={handleInputChange} required />
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

export default EditQCMasterComponent;
