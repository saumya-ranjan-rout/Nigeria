  import React, { useEffect, useState, useRef  } from 'react';
  import { useHistory } from 'react-router-dom';
  import 'bootstrap/dist/css/bootstrap.css';
  import 'jquery/dist/jquery.min.js';
import Sidebar from './Sidebar';
import Header from './Header';
import $ from 'jquery';
import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';
  import axios from 'axios';
import config from '../config';
export function CompanySetting(props) {

  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }

 const [selectedLanguage, setSelectedLanguage] = useState('');
 const history = useHistory();
  const [cdetails, setCdetails] = useState('');
    const [file, setFile] = useState(null);


    const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
const handleUpload = async () => {
  if (file) {
    const formData = new FormData();
    formData.append('image', file);

    $.ajax({
      url: 'http://192.168.29.243:4000/company/upload-logo',
      method: 'POST',
      data: formData,
      processData: false, // Must be false
      contentType: false, // Must be false
      success: function (response) {
        alert(response.message);
        window.location.reload();
      },
      error: function (xhr, status, error) {
        alert('Failed to upload logo');
        console.error('Upload error:', error);
      },
    });
  } else {
    console.error('No file selected');
  }
};



 //form update
 const [formData, setFormData] = useState({
    cname: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postbox: '',
    taxid: '',
    foundation: '',
  });


  //form update
  const [formErrors, setFormErrors] = useState({
    cname: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postbox: '',
    taxid: '',
    foundation: '',
  })

  const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

  const handleSubmit =(event) => {
    event.preventDefault();

 // Perform form validation
    let errors = {}
    let isValid = true

    if (!formData.cname.trim()) {
      isValid = false
      errors.cname = 'red'
    }
    if (!formData.phone.trim()) {
      isValid = false
      errors.phone = 'red'
    }
    if (!formData.email.trim()) {
      isValid = false
      errors.email = 'red'
    }
    if (!formData.address.trim()) {
      isValid = false
      errors.address = 'red'
    }
    if (!formData.city.trim()) {
      isValid = false
      errors.city = 'red'
    }
    if (!formData.region.trim()) {
      isValid = false
      errors.region = 'red'
    }
    if (!formData.country.trim()) {
      isValid = false
      errors.country = 'red'
    }
    if (!formData.postbox.trim()) {
      isValid = false
      errors.postbox = 'red'
    }
    if (!formData.taxid.trim()) {
      isValid = false
      errors.taxid = 'red'
    }


    if (isValid) {

     const jsonData = JSON.stringify(formData);
     //alert(jsonData);
    // Make an AJAX request using $.ajax
    $.ajax({
      url: `http://192.168.29.243:4000/update_company`,
      method: 'POST',
      data: jsonData,
      contentType: 'application/json',
      success: function (response) {
        // Success: handle the successful update
     
      },
      error: function (xhr, status, error) {
        // Error: handle the error case
        //alert('Failed to update language', error);
      }
    });
  }else{
    setFormErrors(errors);
  }
  };

 useEffect(() => {

       document.title = 'Company Settings';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

         $.ajax({
        url: 'http://192.168.29.243:4000/company',
        method: 'GET',
        success: function (response) {

         
        const foundationValue = new Date(response.foundation);
        const formattedFoundationDate = `${foundationValue.getDate().toString().padStart(2, '0')}-${(foundationValue.getMonth() + 1).toString().padStart(2, '0')}-${foundationValue.getFullYear()}`;
    
         setFormData({ ...response, foundation: formattedFoundationDate });
          // Set the fetched data in the state
         //setFormData(response);

        }

        });



   }
 

    

    
  }, []);




  return (
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
         <h5> Edit Company Details</h5> 
         <hr></hr>
         <form onSubmit={handleSubmit} method='POST' >

                 <div className="row" >
                  <div className="col-md-7">
                  

                     <div className="form-group row">
                    


                        <div className="form-group row">

                               <label className="col-sm-2 col-form-label"
                                       for="name"><span className='textblack'>Company Name</span></label>

                                <div className="col-sm-10">
                                    <input type="text"  style={{ borderColor: formErrors.postbox === 'red' ? 'red' : '' }}
                                           className="form-control margin-bottom  required" name="cname"
                                          value={formData.cname} onChange={handleInputChange}/>
                                </div>
                            </div>


                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="address"><span className='textblack'> Address</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="address"  style={{ borderColor: formErrors.postbox === 'red' ? 'red' : '' }}
                                           className="form-control margin-bottom  required" name="address"
                                           value={formData.address} onChange={handleInputChange}/>
                                </div>
                            </div>
                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="city"><span className='textblack'>City</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="city"
                                           className="form-control margin-bottom  required" name="city"
                                           value={formData.city} onChange={handleInputChange}/>
                                </div>
                            </div>
                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="city"><span className='textblack'>Region</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="city"
                                           className="form-control margin-bottom  required" name="region"
                                          value={formData.region} onChange={handleInputChange}/>
                                </div>
                            </div>
                             <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="country"><span className='textblack'>Country</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="Country"
                                           className="form-control margin-bottom  required" name="country"
                                            value={formData.country} onChange={handleInputChange}/>
                                </div>
                            </div>

                           
                            <div className="form-group row">


                                <div className="col-sm-12"><label className=" col-form-label"
                                                              for="data_share"><span className='textblack'>Product Data Sharing with Other
                                        Locations</span></label><select name="data_share" className="form-control">

                                        <option value="1">** Yes **</option>                                        <option value="1">Yes</option>
                                        <option value="0">No</option>


                                    </select>

                                </div>
                            </div>

                                 

                            <br></br>
                           <div className="form-group row">

                                <label className="col-sm-2 col-form-label"></label>

                                <div className="col-sm-4 mt-4">
                                    <input type="submit" id="company_update" className="btn btn-success margin-bottom"
                                           value="Update Company"
                                           data-loading-text="Updating..." />
                                </div>
                            </div>
                    </div>

                      
                  </div>
                  <div className="col-md-5">
                    <form method="post" id="product_action" className="form-horizontal">
                                <div className="grid_3 grid_4">

                                    <h5>Company Logo</h5>
                                    <hr></hr>


                                    <input type="hidden" name="id" value="1"/>
                                    <div className="ibox-content no-padding border-left-right">
                                          <img alt="image" id="dpic" className="col" src={`${config.appUrl}/company/${formData.logo}`} />
                                        
                                    </div>

                                    <hr></hr>
                     <p>
                    <label for="fileupload"></label>
                    {/* <input id="fileupload" type="file" name="files[]"/> */}
                    <div>
                      <input type="file" name='image' onChange={handleFileChange} />
                      <button className='btn btn-primary' onClick={handleUpload}>Upload</button>
                    </div>
                  </p>
                  <pre>Recommended logo size is 500x200px.</pre>
                  <div id="progress" className="progress progress-sm mt-1 mb-0">
                    <div className="progress-bar bg-success" role="progressbar"
                      aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>

                                </div>
                            </form>
                  </div>
                 </div>   


                    


                    

           
            </form>
            
            



          </div>
        </main>
   </section>
    </div>
  );
}

export default CompanySetting;
