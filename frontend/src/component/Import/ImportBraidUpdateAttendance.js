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
import Sidebar from '../Sidebar';
import Header from '../Header';
import $ from 'jquery'; 
import { Link } from 'react-router-dom';

export function ImportBraidUpdateAttendance() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const tableRef = useRef(null);

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

   

  const history = useHistory();



  useEffect(() => {
    document.title = 'Import Employee';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      
    }
  }, []);


  


  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  }; 


/*const handleBackup = (event) => {
   event.preventDefault();
  $.ajax({
    url: 'http://192.168.29.243:4000/downloademployeebackup',
    method: 'GET',
    success: function (response) {
      // Handle the response data or perform any necessary actions
      console.log(response);
    },
    error: function (error) {
      // Handle any errors
      console.error(error);
    },
  });
};*/

const handleBackup = (event) => {
    event.preventDefault();
    $.ajax({
      url: 'http://192.168.29.243:4000/downloademployeebackupBraid',
      method: 'GET',
      xhrFields: {
        responseType: 'blob' // Set the response type to blob
      },
      success: function (data, status, xhr) {
        // Create a Blob object from the response data
        const blob = new Blob([data], { type: xhr.getResponseHeader('Content-Type') });
  
         // Get the current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/:/g, '-').substring(0, 19); // Format the date and time

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Employee-Master-${formattedDate}.csv`;
        document.body.appendChild(link);
  
        // Trigger the download
        link.click();
  
        // Remove the link from the DOM
        document.body.removeChild(link);
      },
      error: function (error) {
        // Handle any errors
        console.error(error);
      },
    });
  };



  

  const handleSubmit = (event) => {
  event.preventDefault();

  if (!selectedFile) {
    return;
  }

  const formData = new FormData();
  formData.append('userfile', selectedFile);

  $.ajax({
      url: 'http://192.168.29.243:4000/updateattendancebraid',
      method: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      xhr: function () {
        const xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
          }
        });
        return xhr;
      },
      success: function (response) {
        console.log(response); // File uploaded and data inserted
        setImportStatus('Data Imported Successfully!');
      },
      error: function (error) {
        console.error(error);
        setImportStatus('Import Error! Please check your file and its content.');
      },
    });
  };


  const baseUrl = 'http://192.168.29.243:3000'; // Replace with your base URL
  const templatePath = '/importfiles/Employee-Master.csv';
  const templateURL = baseUrl + templatePath;

  return (
    <div className="container">
    <Sidebar />

      <section id="content">
      <Header />

        <main>
        <div className="container dt">
        <h5 className="title">Update Employee Attendance For Ikeja{' '}
            
            </h5>
        </div>
          
          <div className="container dt">

          
        
         

             <div className="centered-container">
             <form onSubmit={handleBackup}>
                 
                  <p>
                   
                    Click here{' '} 
                    <button type="submit" className="btn btn-success">
                      Export File
                    </button>
                  {' '} to download the employee master with <span class="textblue">Passive Type ACT worker</span> only.</p>
                </form>
                 
             
                  <hr></hr>
                <p>
                 <span style={{ color: 'red' }}>
                  *Date will automatically update as current date.<br/>
Upload only downloaded format{' '}</span>
                  
                </p>
              </div>
             <br></br>
        <form onSubmit={handleSubmit} method='POST' encType="multipart/form-data">
             <div className="form-group row">

                                <label className="col-sm-2 col-form-label" for="name">File
                                </label>

                                <div class="col-sm-6">
                                    <input type="file" name="userfile" onChange={handleInputChange} />(.csv format only)
                                </div>
              </div>
                
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Import Employee" data-loading-text="Adding..." />
                     
                  </div>
              </div>
              <br></br>
               <br></br>
             {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {`${uploadProgress}%`}
                      </div>
                    </div>
                  )}

                  {uploadProgress === 100 && importStatus && (
                    <div>
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-success"
                          role="progressbar"
                          style={{ width: '100%' }}
                          aria-valuenow="100"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          100%
                        </div>
                      </div>
                      <span className="text-success">{importStatus}</span>
                    </div>
                  )}

              </form >
          
        </div>
        </main>
      </section>
      
    </div>
  );
}

export default ImportBraidUpdateAttendance;
