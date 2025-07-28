import React, { useEffect, useState, useRef  } from 'react';
import { useHistory, Link, useLocation  } from 'react-router-dom';

export function Sidebar() {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMasterMenuOpen, setMasterMenuOpen] = useState(false);
  const [isHRMMenuOpen, setHRMMenuOpen] = useState(false);
  const [isFGOutputMenuOpen, setFGOutputMenuOpen] = useState(false);
 

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
    const ptype = sessionStorage.getItem('production_type');
    const ctype = sessionStorage.getItem('category_type');
    //alert(roleId);
     //alert(ptype);
     // alert(ctype);


  const [isActive, setActive] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null); // Reference to the sidebar DOM element
  
  const history = useHistory();

 const [isIKEJAMenuOpen, setIKEJAMenuOpen] = useState(false);
  const [isOTAMenuOpen, setOTAMenuOpen] = useState(false);

  const handleFGOutputClick = () => {
    // Toggle the visibility of FGOUTPUT submenu
    setIKEJAMenuOpen(false);
    setOTAMenuOpen(false);
  };

  const handleIKEJAClick = () => {
    // Toggle the visibility of IKEJA submenu
    setIKEJAMenuOpen(!isIKEJAMenuOpen);
    setOTAMenuOpen(false);
  };

  const handleOTAClick = () => {
    // Toggle the visibility of OTA submenu
    setOTAMenuOpen(!isOTAMenuOpen);
    setIKEJAMenuOpen(false);
  };

  const [isBraidTimesheetMenuOpen, setBraidTimesheetMenuOpen] = useState(false);
  const [isNonBraidTimesheetMenuOpen, setNonBraidTimesheetMenuOpen] = useState(false);

  const handleTimesheetClick = () => {
    // Toggle the visibility of Employee Timesheet submenu
    setBraidTimesheetMenuOpen(false);
    setNonBraidTimesheetMenuOpen(false);
  };

  const handleBraidTimesheetClick = () => {
    // Toggle the visibility of Braid submenu
    setBraidTimesheetMenuOpen(!isBraidTimesheetMenuOpen);
    setNonBraidTimesheetMenuOpen(false);
  };

  const handleNonBraidTimesheetClick = () => {
    // Toggle the visibility of Non-Braid submenu
    setNonBraidTimesheetMenuOpen(!isNonBraidTimesheetMenuOpen);
    setBraidTimesheetMenuOpen(false);
  };

  const [isBraidDataReportsMenuOpen, setBraidDataReportsMenuOpen] = useState(false);
  const [isNonBraidDataReportsMenuOpen, setNonBraidDataReportsMenuOpen] = useState(false);

  const handleDataReportsClick = () => {
    // Toggle the visibility of Data & Reports submenu
    setBraidDataReportsMenuOpen(false);
    setNonBraidDataReportsMenuOpen(false);
  };

  const handleBraidDataReportsClick = () => {
    // Toggle the visibility of Braid submenu under Data & Reports
    setBraidDataReportsMenuOpen(!isBraidDataReportsMenuOpen);
    setNonBraidDataReportsMenuOpen(false);
  };

  const handleNonBraidDataReportsClick = () => {
    // Toggle the visibility of Non-Braid submenu under Data & Reports
    setNonBraidDataReportsMenuOpen(!isNonBraidDataReportsMenuOpen);
    setBraidDataReportsMenuOpen(false);
  };

  const [isIKEJAHrmMenuOpen, setIKEJAHrmMenuOpen] = useState(false);
  const [isOTAHrmMenuOpen, setOTAHrmMenuOpen] = useState(false);

  const handleHRMClick = () => {
    // Toggle the visibility of HRM submenu
    setIKEJAHrmMenuOpen(false);
    setOTAHrmMenuOpen(false);
  };

  const handleIKEJAHrmClick = () => {
    // Toggle the visibility of IKEJA submenu under HRM
    setIKEJAHrmMenuOpen(!isIKEJAHrmMenuOpen);
    setOTAHrmMenuOpen(false);
  };

  const handleOTAHrmClick = () => {
    // Toggle the visibility of OTA submenu under HRM
    setOTAHrmMenuOpen(!isOTAHrmMenuOpen);
    setIKEJAHrmMenuOpen(false);
  };

  const [isBraidDataExportMenuOpen, setBraidDataExportMenuOpen] = useState(false);
  const [isNonBraidDataExportMenuOpen, setNonBraidDataExportMenuOpen] = useState(false);

  const handleDataExportClick = () => {
    // Toggle the visibility of Data Export Import submenu
    setBraidDataExportMenuOpen(false);
    setNonBraidDataExportMenuOpen(false);
  };

  const handleBraidDataExportClick = () => {
    // Toggle the visibility of Braid submenu under Data Export Import
    setBraidDataExportMenuOpen(!isBraidDataExportMenuOpen);
    setNonBraidDataExportMenuOpen(false);
  };

  const handleNonBraidDataExportClick = () => {
    // Toggle the visibility of Non-Braid submenu under Data Export Import
    setNonBraidDataExportMenuOpen(!isNonBraidDataExportMenuOpen);
    setBraidDataExportMenuOpen(false);
  };

   

 return (
  <section id="sidebar" ref={sidebarRef} className={isActive ? 'hide' : null}>
  <a href="#" className="brand">
        <img src="https://tz.godrejeta.com/userfiles/theme/logo-header.png" alt="ETA Logo" className="logo-image" style={{ width: '60%', marginTop: '10px'  }} />
  </a>
       
<div class="container-fluid">
  <div class="row flex-nowrap">
    <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
      <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start " id="menu">
      <li class="nav-item">
            <a href="/dashboard" class="nav-link align-middle px-0">
               <i className="bx bxs-tachometer"></i>
              <span class="ms-1 d-none d-sm-inline">Dashboard</span>
            </a>
          </li>

 {roleId == 5 && (         
        <li>
          <a href="#submenu1" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
           <i className="bx bxs-dashboard"></i>
            <span class="ms-1 d-none d-sm-inline">Master</span>
             <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          <ul class="collapse nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
            <li class="w-100">
              <a href="/master/color-master" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bxl-microsoft"></i> Color Master</span> 
              </a>
            </li>
            <li class="w-100">
              <a href="/master/line-master" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-move-vertical"></i> Line Master</span> 
              </a>
            </li>
            <li class="w-100">
              <a href="/master/section" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bxs-folder"></i> Section</span>
              </a>
            </li>
            <li class="w-100">
              <a href="/master/machine-master" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-cog"></i> Machine Master</span> 
              </a>
            </li>
            <li class="w-100">
              <a href="/master/waste-master" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bxs-flask"></i> Waste Master</span> 
              </a>
            </li>
            <li class="w-100">
              <a href="/master/item-master" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bxs-file-plus"></i> Item Master</span> 
              </a>
            </li>
            <li class="w-100">
              <a href="/master/plan-vs-target" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bxs-check-square"></i> Plan Vs Target</span> 
              </a>
            </li>
          </ul>
        </li>

)}

{roleId == 5 && (
         <li>
                <a href="#submenu2" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleHRMClick} >
                  <i className="bx bxs-user-plus"></i>
                  <span className="ms-1 d-none d-sm-inline">HRM</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isIKEJAHrmMenuOpen || isOTAHrmMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu2" data-bs-parent="#menu">
                  <li class="w-100">
                    <a href="/hrm/admin/" class="nav-link px-0">
                      <span class="d-none d-sm-inline">Admin</span> 
                    </a>
                  </li>

                    <li class="w-100">
                    <a href="/hrm/addemployee/" class="nav-link px-0">
                      <span class="d-none d-sm-inline">Add Employee</span> 
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isIKEJAHrmMenuOpen ? 'show' : ''}`} onClick={handleIKEJAHrmClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> IKEJA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isIKEJAHrmMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/hrm/ikeja/operator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> Operator</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ikeja/assignlist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Assign Operator Work</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/hrm/ikeja/changeshiftoperator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-reply-all"></i> Change Shift[ Operator ]</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ikeja/employeelist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user"></i> Employees</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/hrm/ikeja/zonetypes" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-transfer-alt"></i> Change Zone</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ikeja/changeshift" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Change Shift</span>
                            </a>
                          </li>
                           <li>
                            <a href="/hrm/ikeja/changeWorker" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Change WorkerType</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ikeja/employeeFda" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Emp(FDA)</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isOTAHrmMenuOpen ? 'show' : ''}`} onClick={handleOTAHrmClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> OTA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isOTAHrmMenuOpen && (
                        <ul className="nav flex-column ms-1">
                           <li className="w-100">
                            <a href="/hrm/ota/operator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> Operator</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ota/assignlist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Assign Operator Work</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/hrm/ota/changeshiftoperator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-reply-all"></i> Change Shift[ Operator ]</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ota/employeelist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user"></i> Employees</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/hrm/ota/zonetypes" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-transfer-alt"></i> Change Zone</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ota/changeshift" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Change Shift</span>
                            </a>
                          </li>
                           <li>
                            <a href="/hrm/ota/changeWorker" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Change WorkerType</span>
                            </a>
                          </li>
                          <li>
                            <a href="/hrm/ota/employeeFda" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-slider-alt"></i> Emp(FDA)</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>
)}

{roleId == 5 && (
        <li>
                <a href="#submenu3" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleFGOutputClick}>
                   <i className="bx bx-line-chart"></i>
                  <span className="ms-1 d-none d-sm-inline">FGOUTPUT</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isIKEJAMenuOpen || isOTAMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu3" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isIKEJAMenuOpen ? 'show' : ''}`} onClick={handleIKEJAClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> IKEJA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isIKEJAMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/fgoutput/fg_output" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> braid fgoutput</span>
                            </a>
                          </li>
                          <li>
                            <a href="/fgoutput/fg_outputnbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> nonbraid fgoutput</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isOTAMenuOpen ? 'show' : ''}`} onClick={handleOTAClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> OTA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isOTAMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/fgoutput/fg_outputbraidota" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> braid fgoutput</span>
                            </a>
                          </li>
                          <li>
                            <a href="/fgoutput/fg_outputotanbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> nonbraid fgoutput</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>

)}


{ ptype == 'ikeja' && ctype == 'BRAID' && (
        <li>
                <a href="#submenu3" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleFGOutputClick}>
                   <i className="bx bx-line-chart"></i>
                  <span className="ms-1 d-none d-sm-inline">FGOUTPUT</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isIKEJAMenuOpen || isOTAMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu3" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isIKEJAMenuOpen ? 'show' : ''}`} onClick={handleIKEJAClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> IKEJA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isIKEJAMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/fgoutput/fg_output" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> braid fgoutput</span>
                            </a>
                          </li>
                          
                        </ul>
                      )}
                    </a>
                  </li>
                  
                </ul>
              </li>

)}

{ ptype == 'ota' && ctype == 'NBRAID' && (
        <li>
                <a href="#submenu3" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleFGOutputClick}>
                   <i className="bx bx-line-chart"></i>
                  <span className="ms-1 d-none d-sm-inline">FGOUTPUT</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isIKEJAMenuOpen || isOTAMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu3" data-bs-parent="#menu">
                  
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isOTAMenuOpen ? 'show' : ''}`} onClick={handleOTAClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> OTA</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isOTAMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li>
                            <a href="/fgoutput/fg_outputotanbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-user-circle"></i> nonbraid fgoutput</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>

)}

{roleId == 5 && (
        <li>
                <a href="#submenu4" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleTimesheetClick}>
                   <i className="bx bx-time-five"></i>
                  <span className="ms-1 d-none d-sm-inline">Employee Timesheet</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidTimesheetMenuOpen || isNonBraidTimesheetMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu4" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isBraidTimesheetMenuOpen ? 'show' : ''}`} onClick={handleBraidTimesheetClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isBraidTimesheetMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/employeetimesheet/addtimesheetbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-user"></i> Add</span>
                            </a>
                          </li>
                          <li>
                            <a href="/employeetimesheet/list" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> List</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isNonBraidTimesheetMenuOpen ? 'show' : ''}`} onClick={handleNonBraidTimesheetClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> Non-Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isNonBraidTimesheetMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/employeetimesheet/addtimesheetnbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-user"></i> Add</span>
                            </a>
                          </li>
                          <li>
                            <a href="/employeetimesheet/otalist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> List</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>
)}

{  ctype == 'BRAID' && (
        <li>
                <a href="#submenu4" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleTimesheetClick}>
                   <i className="bx bx-time-five"></i>
                  <span className="ms-1 d-none d-sm-inline">Employee Timesheet</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidTimesheetMenuOpen || isNonBraidTimesheetMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu4" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isBraidTimesheetMenuOpen ? 'show' : ''}`} onClick={handleBraidTimesheetClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isBraidTimesheetMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/employeetimesheet/addtimesheetbraidikejaoperator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-user"></i> Add</span>
                            </a>
                          </li>
                          <li>
                            <a href="/employeetimesheet/emptimesheetbraidikejaoperatorlist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> List</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                  
                </ul>
              </li>
)}

{  ctype == 'NBRAID' && (
        <li>
                <a href="#submenu4" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleTimesheetClick}>
                   <i className="bx bx-time-five"></i>
                  <span className="ms-1 d-none d-sm-inline">Employee Timesheet</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidTimesheetMenuOpen || isNonBraidTimesheetMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu4" data-bs-parent="#menu">
                 
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isNonBraidTimesheetMenuOpen ? 'show' : ''}`} onClick={handleNonBraidTimesheetClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> Non-Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isNonBraidTimesheetMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/employeetimesheet/addtimesheetnbraidotaoperator" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-user"></i> Add</span>
                            </a>
                          </li>
                          <li>
                            <a href="/employeetimesheet/emptimesheetnbraidotaoperatorlist" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> List</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>
)}

{roleId == 5 && (

         <li>
                <a href="#submenu5" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleDataReportsClick}>
                   <i className="bx bxs-pie-chart-alt-2"></i>
                  <span className="ms-1 d-none d-sm-inline">Data & Reports</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidDataReportsMenuOpen || isNonBraidDataReportsMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu5" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isBraidDataReportsMenuOpen ? 'show' : ''}`} onClick={handleBraidDataReportsClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isBraidDataReportsMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/report/braid/performanceEffindividual" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Prf.Eff(Individual)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/planvstarget" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Plan Vs Actual</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/mtd_ppp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> MTD AVG PPP</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/employee_timesheet" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Employee Timesheet</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/performance_efficiency" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Efficiency</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/ppp_itemwise" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Production Breakdown</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/daywise_production" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Daywise Production</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/wastage" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Wastage</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/wastage_per_item" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Wastage % Per Item</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/production_dashboard" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Production Dashboard</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/ppp_overall" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> PPP(Overall)</span>
                            </a>
                          </li>
                          
                          <li>
                            <a href="/report/braid/machine_downtime" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Downtime</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/machine_eff_fgoutput" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (FGOutput)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/machine_eff_waste" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (WASTE)</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/machine_eff_ppm" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (PPM)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/machine_hours" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Hours</span>
                            </a>
                          </li>

                        </ul>
                      )}
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isNonBraidDataReportsMenuOpen ? 'show' : ''}`} onClick={handleNonBraidDataReportsClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> Non-Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isNonBraidDataReportsMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/report/nbraid/attendance" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Attendance Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Fg_monthly" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> FG Monthly</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/performance_eff_individual" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Prf.Eff(Individual)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/planvstarget" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Plan Vs Actual</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/mtd_ppp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> MTD AVG PPP</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Efficiency_overview" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Efficiency Overview</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/Performance_efficiency" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Efficiency</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Performance_Overview" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Overview</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/Productivity_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Productivity Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/reportemp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> EmployeeTimesheet Report</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/ppp_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> PPP Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/fg_output_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Fg Output Report</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/product_line_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Productive Manpower</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/worker_efficiency_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Worker Efficiency</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/supervisor_efficiency_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Supervisor Efficiency</span>
                            </a>
                          </li>
                          

                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>
)}

{  ctype == 'BRAID' && (     

         <li>
                <a href="#submenu5" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleDataReportsClick}>
                   <i className="bx bxs-pie-chart-alt-2"></i>
                  <span className="ms-1 d-none d-sm-inline">Data & Reports</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidDataReportsMenuOpen || isNonBraidDataReportsMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu5" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isBraidDataReportsMenuOpen ? 'show' : ''}`} onClick={handleBraidDataReportsClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isBraidDataReportsMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/report/braid/performanceEffindividual" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Prf.Eff(Individual)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/planvstarget" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Plan Vs Actual</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/mtd_ppp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> MTD AVG PPP</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/employee_timesheet" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Employee Timesheet</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/performance_efficiency" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Efficiency</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/ppp_itemwise" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Production Breakdown</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/daywise_production" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Daywise Production</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/wastage" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Wastage</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/wastage_per_item" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Wastage % Per Item</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/production_dashboard" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Production Dashboard</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/ppp_overall" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> PPP(Overall)</span>
                            </a>
                          </li>
                          
                          <li>
                            <a href="/report/braid/machine_downtime" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Downtime</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/machine_eff_fgoutput" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (FGOutput)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/machine_eff_waste" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (WASTE)</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/braid/machine_eff_ppm" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Eff (PPM)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/braid/machine_hours" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Machine Hours</span>
                            </a>
                          </li>

                        </ul>
                      )}
                    </a>
                  </li>
                  
                </ul>
              </li>
)}

{  ctype == 'NBRAID' && (     

         <li>
                <a href="#submenu5" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleDataReportsClick}>
                   <i className="bx bxs-pie-chart-alt-2"></i>
                  <span className="ms-1 d-none d-sm-inline">Data & Reports</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidDataReportsMenuOpen || isNonBraidDataReportsMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu5" data-bs-parent="#menu">
                 
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isNonBraidDataReportsMenuOpen ? 'show' : ''}`} onClick={handleNonBraidDataReportsClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> Non-Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isNonBraidDataReportsMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/report/nbraid/attendance" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Attendance Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Fg_monthly" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> FG Monthly</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/performance_eff_individual" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Prf.Eff(Individual)</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/planvstarget" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Plan Vs Actual</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/mtd_ppp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> MTD AVG PPP</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Efficiency_overview" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Efficiency Overview</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/Performance_efficiency" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Efficiency</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report/nbraid/Performance_Overview" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Performance Overview</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report/nbraid/Productivity_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Productivity Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/reportemp" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> EmployeeTimesheet Report</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/ppp_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> PPP Report</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/fg_output_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Fg Output Report</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/product_line_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Productive Manpower</span>
                            </a>
                          </li>
                          <li>
                            <a href="/report_nbraid/worker_efficiency_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Worker Efficiency</span>
                            </a>
                          </li>
                          <li className="w-100">
                            <a href="/report_nbraid/supervisor_efficiency_report" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bx-list-ol"></i> Supervisor Efficiency</span>
                            </a>
                          </li>
                          

                        </ul>
                      )}
                    </a>
                  </li>
                </ul>
              </li>
)}

{roleId == 5 && (
        <li>
                <a href="#submenu6" data-bs-toggle="collapse" className="nav-link px-0 align-middle" onClick={handleDataExportClick}>
                   <i className="bx bxs-pie-chart-alt-2"></i>
                  <span className="ms-1 d-none d-sm-inline">Data Export Import</span>
                   <i className="bx bxs-chevron-right dropdown-icon"></i>
                </a>
                <ul className={`collapse ${isBraidDataExportMenuOpen || isNonBraidDataExportMenuOpen ? 'show' : ''} nav flex-column ms-1`} id="submenu6" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isBraidDataExportMenuOpen ? 'show' : ''}`} onClick={handleBraidDataExportClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-bottom"></i> Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isBraidDataExportMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/import/import-braidupdateattendance" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-right-arrow"></i> Update Attendance</span>
                            </a>
                          </li>
                         
                        </ul>
                      )}
                    </a>
                  </li>
                  <li className="w-100">
                    <a href="#" className={`nav-link px-0 ${isNonBraidDataExportMenuOpen ? 'show' : ''}`} onClick={handleNonBraidDataExportClick}>
                      <span className="d-none d-sm-inline"><i className="bx bxs-hourglass-top"></i> Non-Braid</span> <i className="bx bxs-chevron-right dropdown-icon"></i>
                      {isNonBraidDataExportMenuOpen && (
                        <ul className="nav flex-column ms-1">
                          <li className="w-100">
                            <a href="/import/import-nbraidupdateattendance" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-right-arrow"></i> Update Attendance</span>
                            </a>
                          </li>
                          <li>
                            <a href="/import/import-fgoutputnbraid" className="nav-link px-0">
                              <span className="d-none d-sm-inline"><i className="bx bxs-right-arrow"></i> Fg Output</span>
                            </a>
                          </li>
                        </ul>
                      )}
                    </a>
                  </li>
                  <li>
              <a href="/import/import-color" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Color Master</span> 
              </a>
            </li>
             <li>
              <a href="/import/import-line" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Line Master</span> 
              </a>
            </li>
             <li>
              <a href="/import/import-section" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Section</span> 
              </a>
            </li>
             <li>
              <a href="/import/import-item" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Item Master</span> 
              </a>
            </li>
             <li>
              <a href="/import/import-planvstarget" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Plan Vs Target</span> 
              </a>
            </li>
             <li>
              <a href="/import/import-itemcolorcode" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Item Color Code</span> 
              </a>
            </li>
                </ul>
              </li>      
  )}     
{roleId == 5 && (
        <li class="nav-item">
            <a href="/dashboard_new" class="nav-link align-middle px-0">
             <i className="bx bxs-tachometer"></i>
              <span class="ms-1 d-none d-sm-inline">Attendance Dashboard</span>
            </a>
          </li>
)}
        <li>
          <a href="#submenu7" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span class="ms-1 d-none d-sm-inline">Import Timesheet</span>
             <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          <ul class="collapse nav flex-column ms-1" id="submenu7" data-bs-parent="#menu">
            <li class="w-100">
              <a href="/import/import-addtimesheet" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Filter Timesheet</span>
              </a>
            </li>
            <li>
              <a href="/import/import-timesheet" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> Import Timesheet</span>
              </a>
            </li>
            <li>
              <a href="/import/import-viewtimesheet" class="nav-link px-0">
                <span class="d-none d-sm-inline"><i className="bx bx-right-arrow-circle"></i> View Timesheet</span>
              </a>
            </li>
            
          </ul>
        </li>
        
 
      </ul>
    </div>
  </div>
</div>

</section>
  );
};

export default Sidebar;
