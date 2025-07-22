  import React, { useEffect, useState, useRef  } from 'react';
  import { useHistory } from 'react-router-dom';
  import 'bootstrap/dist/css/bootstrap.css';
  import 'jquery/dist/jquery.min.js';
import Sidebar from './Sidebar';
import Header from './Header';
import $ from 'jquery';

export function LanguagePage(props) {

 const [selectedLanguage, setSelectedLanguage] = useState('');
 const history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Make an AJAX request using $.ajax
    $.ajax({
      url: `http://192.168.29.243:4000/changelanguage`,
      method: 'POST',
      data: JSON.stringify({ language: selectedLanguage }),
      contentType: 'application/json',
      success: function (response) {
        // Success: handle the successful update
       alert('Language updated successfully');
      },
      error: function (xhr, status, error) {
        // Error: handle the error case
        alert('Failed to update language', error);
      }
    });
  };

useEffect(() => {

       document.title = 'Language Settings';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

   }
 

    

    
  }, []);

  return (
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
         <h5> Change Language</h5> 
         <hr></hr>
         <form onSubmit={handleSubmit} method='POST' >

                   


                    <div className="form-group row space">

                        <label className="col-sm-2 col-form-label"
                               for="currency">Language</label>

                        <div className="col-sm-6">
                            <select
                    name="language"
                    className="form-control"
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                  >
                    <option value="">Select language</option>
                    <option value="english">English</option>
                    <option value="portuguese">Portuguese</option>
                  </select>
                        </div>
                    </div>


                    <div className="form-group row">

                        <label className="col-sm-2 col-form-label"></label>

                        <div className="col-sm-4">
                            <input type="submit" id="billing_update" className="btn btn-success margin-bottom"
                                   value="Update" data-loading-text="Updating..." />
                        </div>
                    </div>

           
            </form>
            
            



          </div>
        </main>
   </section>
    </div>
  );
}

export default LanguagePage;
