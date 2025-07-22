
import React, { useEffect, useState, useRef } from 'react';
import $ from 'jquery';
import {useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import './Loader.css' // Import the CSS file

const Header = ({ toggleClass }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEtaDropdownOpen, setIsEtaDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsEtaNotificationDropdownOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0); // New state for the alert count
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [userdetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsEtaDropdownOpen(false);
    setIsEtaNotificationDropdownOpen(false);
  };

  const handleEtaDropdownToggle = () => {
    setIsEtaDropdownOpen(!isEtaDropdownOpen);
    setIsDropdownOpen(false);
    setIsEtaNotificationDropdownOpen(false);
  };

  const handleEtaNotificationDropdownToggle = () => {
    setIsEtaNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsEtaDropdownOpen(false);
    setIsDropdownOpen(false);
  };
  const history = useHistory();

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');

    // Redirect to the login page
    history.push('/login');
  };

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');

  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
   //alert(roleId);
     //alert(ptype);
     // alert(ctype);

     //accurancy
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count

       //users
  const [showUserNotifications, setShowUserNotifications] = useState(false);
  const [users, setUsers] = useState([]); // State for notification count

  useEffect(() => {
         //getacurancy
         const updatedFormData = { userid: userid, roleid: roleId };
         const jsonData = JSON.stringify(updatedFormData);
          $.ajax({
           url: `http://192.168.29.243:4000/getusercount`,
           method: 'POST',
           data: jsonData,
           processData: false,
           contentType: 'application/json',
           success: function (response) {
             const { timesheet, date } = response;
             // Update the component state with the timesheet data
             setUsers(timesheet);
           },
           error: function (xhr, status, error) {
             console.error('Error:', error);
           },
         });

         $.ajax({
           url: `http://192.168.29.243:4000/getdataaccuracy`,
           method: 'POST',
           data: jsonData,
           processData: false,
           contentType: 'application/json',
           success: function (response) {
             const { timesheet, date } = response;
             // Update the component state with the timesheet data
             setNotificationCount(timesheet.length);
           },
           error: function (xhr, status, error) {
             console.error('Error:', error);
           },
         });

        $.ajax({
            url: 'http://192.168.29.243:4000/get_supervisoreff_default',
            method: "GET",
            data: [],
            processData: false,
            contentType: 'application/json',
            success: function (response) {

                // Access the timesheet results from the response object
                const { timesheet } = response;
                
                // Update the component state with the timesheet data
                setData(timesheet);
               
               
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            },
        });



         // Fetch data from your backend API or another source
           

         const fetchData = async () => {
          try {
            const response = await axios.get('http://192.168.29.243:4000/getnotificationbellcount');
            const data = response.data;

            // Display an alert with the notification output
             //alert(data.output);
            // alert(data.count);
        
            // Assuming data is an object with count and output properties
            setNotifications(data.output);
            setTaskCount(data.count);
          } catch (error) {
            console.error('Error fetching notification bell count:', error);
          }
        };

            fetchData();
     

}, []);

const handleNotificationClick = () => {
  // Navigate to the specified URL
  // history.push('/employeetimesheet/data-accuracy');
  setShowNotifications(!showNotifications);
};
const handleUserNotificationClick = () => {
  // Navigate to the specified URL
  // history.push('/employeetimesheet/data-accuracy');
  setShowUserNotifications(!showUserNotifications);
};

const [loadingUserDetails, setLoadingUserDetails] = useState(true);

useEffect(() => {
  setLoadingUserDetails(true);
  $.ajax({
    url: `http://192.168.29.243:4000/getuserbyid/${userid}`,
    method: 'GET',
    success: function (response) {
      setUserDetails(response);
      setLoadingUserDetails(false);
    }
  });
}, [userid]);

// Use loadingUserDetails to handle loading state in your component

const getAttendance = () => {
  setLoading(true);
  // Make your API call here
  fetch('http://192.168.29.243:4000/getattendance')
    .then(response => response.json())
    .then(data => {
      // Handle the API response data
      setLoading(false);
      if (data == 'Yes') {
        // If 'data' is equal to 'yes', navigate to the '/data' route
        history.push('/data');
      } else {
        // If 'data' is not equal to 'yes', navigate to the '/sorry' route
        history.push('/sorry');
      }


    })
    .catch(error => console.error('Error fetching attendance:', error));
};

const getAttendancebraid = () => {
  setLoading(true);
  // Make your API call here
  fetch('http://192.168.29.243:4000/getattendanceikeja')
    .then(response => response.json())
    .then(data => {
      // Handle the API response data
      setLoading(false);
      if (data == 'Yes') {
        // If 'data' is equal to 'yes', navigate to the '/data' route
        history.push('/data');
      } else {
        // If 'data' is not equal to 'yes', navigate to the '/sorry' route
        history.push('/sorry');
      }


    })
    .catch(error => console.error('Error fetching attendance:', error));
};




  return (
    <>
    {loading ? (
      <div className="loader-overlay">
        <div className="loader"></div>
      </div>
    ) : (
      <div>{/* Render your content */}</div>
    )}
    <nav>
     
      <i className="bx bx-menu" onClick={toggleClass}></i>
      {roleId == 5 && (
          <>
            <a href="#" className="nav-link" style={{ width: '14%', height: 'auto'}}>
              <button className='btn btn-info ' onClick={getAttendance}><i className="bx bx-calendar tw"></i><span className='tw'> Ota Attendance</span></button>
            </a>
            <a href="#" className="nav-link" style={{ width: '14%', height: 'auto' }}>
              <button className='btn btn-warning ' onClick={getAttendancebraid}><i className="bx bx-calendar tw "></i><span className='tw'> Ikeja Attendance</span></button>
            </a>
          </>
        )}

      <form action="#">
        <div className="form-input">
          
        </div>
      </form>
{roleId == 5 && (
  <div className="alert-icon">
    <span
      className="dropdown-trigger"
      onClick={handleUserNotificationClick}
      style={{ cursor: 'pointer' }}
    >
      <i className="bx bxs-bell bell-icon" style={{ color: 'yellow' }}></i>
      <span className="badge badge-pill badge-default badge-danger badge-default badge-up">
        {users.length}
      </span>
    </span>

    {showUserNotifications && (
      <div className="dropdown-content_setting2">
        <ul>
          <li>
            Online Users <span className="distance">NEW</span>
          </li>
 <li className="divider"></li> {/* Divider */}
          {users.length === 0 ? (
            <li>
              <p>No users are online today.</p>
            </li>
          ) : (
            <li>
              <p>{users.map((user) => user.entryid).join(', ')} is online and logged in today.</p>
            </li>
          )}

          <li className="divider"></li>

          <li className="tc">
            <Link to="/employeetimesheet/userStatus">More Details</Link>
          </li>
        </ul>
      </div>
    )}
  </div>
)}


      {roleId == 5 && (
      <div className="alert-icon">
            <span className="dropdown-trigger" onClick={handleNotificationClick} style={{ cursor: 'pointer' }}>
              <i className="bx bxs-bell bell-icon" style={{ color: 'yellow'}}></i>
            
                <span className="badge badge-pill badge-default badge-danger badge-default badge-up">{notificationCount}</span>
              
              </span>
              {showNotifications && (
                <div className="dropdown-content_setting2">
                  <ul>
                    <li>Data Accuracy <span className='distance'>NEW</span></li>
                    {notificationCount > 0 && (
                      <li>There are entries with efficiency greater than 150. Please check!</li>
                    )}
                    <li className="divider"></li> {/* Divider */}
                    <li >{notifications}</li>
                    <li className='tc'><Link to="/employeetimesheet/data-accuracy" >More Details</Link></li>
                  </ul>
                </div>
              )}

            </div>
    )}

{roleId == 5 && (

      <div className="">
        <span className="dropdown-trigger" onClick={handleEtaDropdownToggle} style={{ cursor: 'pointer' }}>
          <span >ETA Settings</span> <i className="bx bx-chevron-down"></i>
        </span>
        {isEtaDropdownOpen && (
          <div className="dropdown-content_setting">
            <ul>
            <Link to="/master/shift"><li><i className="bx bx-time-five"></i> Shift</li></Link>
            <Link to="/master/worker-type"> <li><i className="bx bxs-user"></i> Worker Type</li></Link>
            <Link to="/master/employee-role"><li><i className="bx bxs-user-check"></i> Employee Role</li></Link>
            <Link to="/master/item-category"><li><i className="bx bx-grid"></i> Item Category</li></Link>
            <Link to="/settings"><li><i className="bx bx-list-ol"></i> Company Settings</li></Link>
            <Link to="/master/qc-master"><li><i className="bx bxs-cube"></i> QC Master  </li></Link>
            </ul>
          </div>
        )}
      </div>

)}

{roleId == 5 && (

      <div className="alert-icon">
      <span className="dropdown-trigger" onClick={handleEtaNotificationDropdownToggle} style={{ cursor: 'pointer' }}>
        <i className="bx bxs-bell bell-icon"></i>
       
          <span className="badge badge-pill badge-default badge-danger badge-default badge-up">{taskCount}</span>
        
         </span>
        {isNotificationDropdownOpen && (
          <div className="dropdown-content_setting1">
            <ul>
              <li>QC Alert<span className='distance'>NEW</span></li>
              <li className="divider"></li> {/* Divider */}
              <li >{notifications}</li>
              <li className='tc'><Link to="/employeetimesheet/list" >More Details</Link></li>
            </ul>
          </div>
        )}

      </div>

)}
      <div className="profile">
        <img
          src="https://w7.pngwing.com/pngs/1008/377/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-black-hair-computer.png"
          alt="Profile"
          onClick={handleDropdownToggle} style={{ cursor: 'pointer' }}
        /><span onClick={handleDropdownToggle} style={{ cursor: 'pointer', color: 'white', paddingLeft: '5px' }}>Account <i className="bx bx-chevron-down"></i></span>
        {isDropdownOpen && (
          <div className="dropdown-content">
            {/* Dropdown content goes here */}
            <ul>
           
              {/* <li><i className="bx bxs-lock-alt"></i> Change Password</li> */}
              {roleId == 5 && (
               <li><i className="bx bxs-user"></i> Admin(Both)</li> )}
              {roleId == 3 && (<li><i className="bx bxs-user"></i> {userdetails.name}({userdetails.production_type})</li>)}
              <li className="divider"></li> {/* Divider */}
              <li onClick={handleLogout}><i className="bx bx-power-off"></i> Logout</li>
            </ul>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

export default Header;
