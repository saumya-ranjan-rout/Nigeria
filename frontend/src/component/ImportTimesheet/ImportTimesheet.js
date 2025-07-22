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

export function ImportTimesheet() {
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
    document.title = 'Import Timesheet';
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



  

  const handleSubmit = (event) => {
  event.preventDefault();

  if (!selectedFile) {
    return;
  }

  const formData = new FormData();
  formData.append('userfile', selectedFile);

  $.ajax({
      url: 'http://192.168.29.243:4000/uploadtimesheet',
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
        <h5 className="title">Import Worker Timesheet{' '}
            
            </h5>
        </div>
          
          <div className="container dt">

          
        
         

             
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
                            value="Import Worker Timesheet" data-loading-text="Adding..." />
                     
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

export default ImportTimesheet;
