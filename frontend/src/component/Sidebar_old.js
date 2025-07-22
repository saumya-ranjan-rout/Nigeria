import React, { useEffect, useState, useRef  } from 'react';
import { useHistory, Link, useLocation  } from 'react-router-dom';



export function Sidebar() {

 /*  const [isCollapsed, setCollapsed] = useState(false);
  const [isMasterMenuOpen, setMasterMenuOpen] = useState(false);
  const [isFGOutputMenuOpen, setFGOutputMenuOpen] = useState(false); */
   
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [isDataReportsSubMenuOpen, setDataReportsSubMenuOpen] = useState(false);
    const [isFgOutputsSubMenuOpen, setFgOutputsSubMenuOpen] = useState(false);
    const [isHrmSubMenuOpen, setHrmSubMenuOpen] = useState(false);
    const [isEmpTimesheetsSubMenuOpen, setEmpTimesheetsSubMenuOpen] = useState(false);
    const [isImportSubMenuOpen, setImportSubMenuOpen] = useState(false);
    const [isImportTimesheetOpen, setImportTimesheetOpen] = useState(false);
    const [isActive, setActive] = useState(false);
    const location = useLocation();
    const history = useHistory();

    const sidebarRef = useRef(null); // Reference to the sidebar DOM element

    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setSubMenuOpen(false);
          setDataReportsSubMenuOpen(false);
          setFgOutputsSubMenuOpen(false);
          setHrmSubMenuOpen(false);
          setEmpTimesheetsSubMenuOpen(false);
          setImportSubMenuOpen(false);
          setImportTimesheetOpen(false);
        }
      };
  
      document.body.addEventListener('click', handleOutsideClick);
  
      return () => {
        document.body.removeEventListener('click', handleOutsideClick);
      };
    }, []);
  
    const toggleSubMenu = () => {
      setSubMenuOpen(!isSubMenuOpen);
      setHrmSubMenuOpen(false); // Close the HRM menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setImportSubMenuOpen(false); // Close the Import menu
      setFgOutputsSubMenuOpen(false); // Close the FgOutput menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleDataReportsSubMenu = () => {
      setDataReportsSubMenuOpen(!isDataReportsSubMenuOpen);
      setHrmSubMenuOpen(false); // Close the HRM menu
      setSubMenuOpen(false); // Close the Master menu
      setImportSubMenuOpen(false); // Close the Import menu
      setFgOutputsSubMenuOpen(false); // Close the FgOutput menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleHrmSubMenu = () => {
      setHrmSubMenuOpen(!isHrmSubMenuOpen);
      setSubMenuOpen(false); // Close the Master menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setImportSubMenuOpen(false); // Close the Import menu
      setFgOutputsSubMenuOpen(false); // Close the FgOutput menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleImportSubMenu = () => {
      setImportSubMenuOpen(!isImportSubMenuOpen);
      setSubMenuOpen(false); // Close the Master menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setHrmSubMenuOpen(false); // Close the Hrm menu
      setFgOutputsSubMenuOpen(false); // Close the FgOutput menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleFGOutputSubMenu = () => {
      setFgOutputsSubMenuOpen(!isFgOutputsSubMenuOpen);
      setSubMenuOpen(false); // Close the Master menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setHrmSubMenuOpen(false); // Close the Hrm menu
      setImportSubMenuOpen(false); // Close the Import menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleEmpTimesheetSubMenu = () => {
      setEmpTimesheetsSubMenuOpen(!isEmpTimesheetsSubMenuOpen);
      setSubMenuOpen(false); // Close the Master menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setHrmSubMenuOpen(false); // Close the Hrm menu
      setImportSubMenuOpen(false); // Close the Import menu
      setFgOutputsSubMenuOpen(false); // Close the FGOutput menu
      setImportTimesheetOpen(false); // Close the Import Timesheet menu
    };

    const toggleImportEmpTimesheet = () => {
      setImportTimesheetOpen(!isImportTimesheetOpen);
      setSubMenuOpen(false); // Close the Master menu
      setDataReportsSubMenuOpen(false); // Close the Report menu
      setHrmSubMenuOpen(false); // Close the Hrm menu
      setImportSubMenuOpen(false); // Close the Import menu
      setFgOutputsSubMenuOpen(false); // Close the FGOutput menu
      setEmpTimesheetsSubMenuOpen(false); // Close the EmployeeTimesheet menu
    };

    
   

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

  return (
    <section id="sidebar" ref={sidebarRef} className={isActive ? 'hide' : null}>
        <a href="#" className="brand">
        <img src="https://tz.godrejeta.com/userfiles/theme/logo-header.png" alt="ETA Logo" className="logo-image" style={{ width: '60%', marginTop: '10px'  }} />
          
        </a>
        <ul className="side-menu top pl">

          
          <li >
          <Link to="/dashboard"> {/* Use Link component to navigate to /dashboard */}
            <i className="bx bxs-tachometer"></i>
            <span className="text">Dashboard</span>
          </Link>
          </li>

          {roleId == 5 && (

          <li className={isSubMenuOpen ? 'active' : null}>
            <a href="#" onClick={toggleSubMenu}>
              <i className="bx bxs-dashboard"></i>
              <span className="text">Master</span>
              <i className="bx bxs-chevron-right dropdown-icon"></i>
            </a>
            {isSubMenuOpen && (
              <ul className="sub-menu">
                          <li>
                          <Link to="/master/color-master">Color Master</Link>
                          </li>
                          <li>
                          <Link to="/master/line-master">Line Master</Link>
                          </li>
                          <li>
                          <Link to="/master/section">Section</Link>
                          </li>

                          <li>
                          <Link to="/master/machine-master">Machine Master</Link>
                          </li>

                          <li>
                          <Link to="/master/waste-master">Waste Master</Link>
                          </li>
                          
                          <li>
                          <Link to="/master/item-master">Item Master</Link>
                          </li>

                          <li>
                          <Link to="/master/plan-vs-target">Plan Vs Target</Link>
                          </li>          
              </ul>
            )}
          </li> )}

          {roleId == 5 && (
          
          <li className={isHrmSubMenuOpen ? 'active' : null}>
            <a href="#" onClick={toggleHrmSubMenu}>
              <i className="bx bxs-shopping-bag-alt"></i>
              <span className="text">HRM</span>
              <i className="bx bxs-chevron-right dropdown-icon"></i>
            </a>
            {isHrmSubMenuOpen && (
            <ul className="sub-menu">
              <li>
                   <Link to="/hrm/admin/">Admin</Link>
                 </li>
              <li>
                <Link to="/hrm/ikeja/operator">IKEJA/Operator</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/assignlist">IKEJA/Assign Operator List</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/changeshiftoperator">IKEJA/Change Shift[ Operator ]</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/employeelist">IKEJA/Employees</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/zonetypes">IKEJA/Change Zone</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/changeshift">IKEJA/Change Shift</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/changeWorker">IKEJA/Change Worker</Link>
              </li>
              <li>
                <Link to="/hrm/ikeja/employeeFda">IKEJA/Employee FDA</Link>
              </li>
              <li>
                <Link to="/hrm/ota/operator">OTA/Operator</Link>
              </li>
              <li>
                <Link to="/hrm/ota/assignlist">OTA/Assign Operator List</Link>
              </li>
              <li>
                <Link to="/hrm/ota/changeshiftoperator">OTA/Change Shift[ Operator ]</Link>
              </li>
              <li>
                <Link to="/hrm/ota/employeelist">OTA/Employees</Link>
              </li>
              <li>
                <Link to="/hrm/ota/zonetypes">OTA/Change Zone</Link>
              </li>
              <li>
                <Link to="/hrm/ota/changeshift">OTA/Change Shift</Link>
              </li>
              <li>
                <Link to="/hrm/ota/changeWorker">OTA/Change Worker</Link>
              </li>
              <li>
                <Link to="/hrm/ota/employeeFda">OTA/Employee FDA</Link>
              </li>
              
            </ul>
          )}
          </li>)}

      {roleId == 5 && (

        <li className={isFgOutputsSubMenuOpen ? 'active' : null}>
            <a href="#" onClick={toggleFGOutputSubMenu}>
              <i className="bx bxs-pie-chart-alt-2"></i>
              <span className="text">FG Output</span>
              <i className="bx bxs-chevron-right dropdown-icon"></i>
            </a>
            {isFgOutputsSubMenuOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/fgoutput/fg_output">braid fgoutput(ikeja)</Link>
                </li>
                <li>
                  <Link to="/fgoutput/fg_outputnbraid">nonbraid fgoutput(ikeja)</Link>
                </li>
                <li>
                  <Link to="/fgoutput/fg_outputbraidota">braid fgoutput(ota)</Link>
                </li>
                <li>
                  <Link to="/fgoutput/fg_outputotanbraid">nonbraid fgoutput(ota)</Link>
                </li>
                
              </ul>
            )}
        </li>)}

{ ptype == 'ikeja' && ctype == 'BRAID' && (


<li className={isFgOutputsSubMenuOpen ? 'active' : null}>
    <a href="#" onClick={toggleFGOutputSubMenu}>
      <i className="bx bxs-pie-chart-alt-2"></i>
      <span className="text">FG Output</span>
      <i className="bx bxs-chevron-right dropdown-icon"></i>
    </a>
    {isFgOutputsSubMenuOpen && (
      <ul className="sub-menu">
        <li>
          <Link to="/fgoutput/fg_output">braid fgoutput(ikeja)</Link>
        </li>
       
        
      </ul>
    )}
</li>)}

{ ptype == 'ota' && ctype == 'NBRAID' && (


<li className={isFgOutputsSubMenuOpen ? 'active' : null}>
    <a href="#" onClick={toggleFGOutputSubMenu}>
      <i className="bx bxs-pie-chart-alt-2"></i>
      <span className="text">FG Output</span>
      <i className="bx bxs-chevron-right dropdown-icon"></i>
    </a>
    {isFgOutputsSubMenuOpen && (
      <ul className="sub-menu">
        <li>
                  <Link to="/fgoutput/fg_outputotanbraid">nonbraid fgoutput(ota)</Link>
                </li>
       
        
      </ul>
    )}
</li>)}



{roleId == 5 && (

        <li className={isEmpTimesheetsSubMenuOpen ? 'active' : null}>
          <a href="#" onClick={toggleEmpTimesheetSubMenu}>
          <i className="bx bx-time-five"></i>
            <span className="text">Employee Timesheet</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isEmpTimesheetsSubMenuOpen && (
            <ul className="sub-menu">
              <li>
                <Link to="/employeetimesheet/addtimesheetbraid">braid Add(ikeja)</Link>
              </li>
              <li>
                <Link to="/employeetimesheet/list">braid List(ikeja)</Link>
              </li>
              <li>
                <Link to="/employeetimesheet/addtimesheetnbraid">nbraid Add(ota)</Link>
              </li>
              <li>
                <Link to="/employeetimesheet/otalist">nbraid List(ota)</Link>
              </li>
              
            </ul>
          )}
        </li>)}

{  ctype == 'BRAID' && (

<li className={isEmpTimesheetsSubMenuOpen ? 'active' : null}>
  <a href="#" onClick={toggleEmpTimesheetSubMenu}>
  <i className="bx bx-time-five"></i>
    <span className="text">Employee Timesheet</span>
    <i className="bx bxs-chevron-right dropdown-icon"></i>
  </a>
  {isEmpTimesheetsSubMenuOpen && (
    <ul className="sub-menu">
      <li>
        <Link to="/employeetimesheet/addtimesheetbraidikejaoperator">braid Add(ikeja)</Link>
      </li>
      <li>
        <Link to="/employeetimesheet/emptimesheetbraidikejaoperatorlist">braid List(ikeja)</Link>
      </li>
      
      
    </ul>
  )}
</li>)}     


{  ctype == 'NBRAID' && (

<li className={isEmpTimesheetsSubMenuOpen ? 'active' : null}>
  <a href="#" onClick={toggleEmpTimesheetSubMenu}>
  <i className="bx bx-time-five"></i>
    <span className="text">Employee Timesheet</span>
    <i className="bx bxs-chevron-right dropdown-icon"></i>
  </a>
  {isEmpTimesheetsSubMenuOpen && (
    <ul className="sub-menu">
      <li>
                <Link to="/employeetimesheet/addtimesheetnbraidotaoperator">nbraid Add(ota)</Link>
              </li>
              <li>
                <Link to="/employeetimesheet/emptimesheetnbraidotaoperatorlist">nbraid List(ota)</Link>
              </li>
      
      
    </ul>
  )}
</li>)}  
          
{roleId == 5 && (       
        <li className={isDataReportsSubMenuOpen ? 'active' : null}>
          <a href="#" onClick={toggleDataReportsSubMenu}>
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span className="text">Data & Reports</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isDataReportsSubMenuOpen && (
            <ul className="sub-menu">
              <li><Link to="/report/braid/performanceEffindividual">Braid/Prf.Eff(Individual)</Link></li>
              <li><Link to="/report/braid/planvstarget">Braid/Plan Vs Actual</Link></li>
              <li><Link to="/report/braid/mtd_ppp">Braid/MTD AVG PPP </Link></li>
              <li><Link to="/report/braid/employee_timesheet">Braid/Employee Timesheet</Link></li>
              <li><Link to="/report/braid/performance_efficiency">Braid/Performance Efficiency</Link></li>
              <li>
                <Link to="/report/braid/ppp_itemwise">Braid/Production Breakdown</Link>
              </li>
              <li><Link to="/report/braid/daywise_production">Braid/Daywise Production</Link></li>
              <li>
                <Link to="/report/braid/wastage">Braid/Wastage</Link>
              </li>
              <li><Link to="/report/braid/wastage_per_item">Braid/Wastage Per Item</Link></li>
              <li>
                <Link to="/report/braid/ppp_overall">Braid/PPP(Overall)</Link>
              </li>
              <li>
                <Link to="/report/braid/production_dashboard">Braid/Production Dashboard</Link>
              </li>
              <li><Link to="/report/braid/machine_downtime">Braid/Machine Downtime</Link></li>
              <li><Link to="/report/braid/machine_eff_fgoutput">Braid/Machine Eff (FGOutput)</Link></li>
              <li><Link to="/report/braid/machine_eff_waste">Braid/Machine Eff (WASTE)</Link></li>
              <li><Link to="/report/braid/machine_eff_ppm">Braid/Machine Eff (PPM)</Link></li>
              <li><Link to="/report/braid/machine_hours">Braid/Machine Hours</Link></li>
              
              
{/* Non Braid */}

              <li><Link to="/report/nbraid/attendance">NBraid/Attendance</Link></li>
              <li><Link to="/report/nbraid/Fg_monthly">NBraid/FG Monthly</Link></li>
              <li><Link to="/report/nbraid/performance_eff_individual">NBraid/Performance Eff Indi</Link></li>
              <li><Link to="/report/nbraid/planvstarget">NBraid/Plan Vs Actual</Link></li>
              <li><Link to="/report/nbraid/mtd_ppp">NBraid/MTD AVG PPP</Link></li>
              <li><Link to="/report/nbraid/Efficiency_overview">NBraid/Efficiency Overview</Link></li>
              <li><Link to="/report/nbraid/Performance_efficiency">NBraid/Performance Efficiency</Link></li>
              <li><Link to="/report/nbraid/Performance_Overview">NBraid/Performance Overview</Link></li>
              <li><Link to="/report/nbraid/Productivity_report">NBraid/Productivity Report</Link></li>
              <li>
                <Link to="/report_nbraid/reportemp">NBraid/EmployeeTimesheet Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/ppp_report">NBraid/PPP Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/fg_output_report">NBraid/Fg Output Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/product_line_report">NBraid/Productive Manpower</Link>
              </li>
              <li>
                <Link to="/report_nbraid/worker_efficiency_report">NBraid/Worker Efficiency</Link>
              </li>
              <li>
                <Link to="/report_nbraid/supervisor_efficiency_report">NBraid/Supervisor Efficiency</Link>
              </li>

              
              
            </ul>
          )}
        </li>)}  


  {  ctype == 'NBRAID' && (     
        <li className={isDataReportsSubMenuOpen ? 'active' : null}>
          <a href="#" onClick={toggleDataReportsSubMenu}>
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span className="text">Data & Reports</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isDataReportsSubMenuOpen && (
            <ul className="sub-menu">
              <li><Link to="/report/nbraid/attendance">NBraid/Attendance</Link></li>
              <li><Link to="/report/nbraid/Fg_monthly">NBraid/fg_monthly</Link></li>
              <li><Link to="/report/nbraid/performance_eff_individual">NBraid/Performance Eff Indi</Link></li>
              <li><Link to="/report/nbraid/planvstarget">NBraid/Plan Vs Target</Link></li>
              <li><Link to="/report/nbraid/mtd_ppp">NBraid/MTD PPP Average</Link></li>
              <li><Link to="/report/nbraid/Efficiency_overview">NBraid/Efficiency Overview</Link></li>
              <li><Link to="/report/nbraid/Performance_efficiency">NBraid/Performance Efficiency</Link></li>
              <li><Link to="/report/nbraid/Performance_Overview">NBraid/Performance Overview</Link></li>
              <li><Link to="/report/nbraid/Productivity_report">NBraid/Productivity Report</Link></li>
              <li>
                <Link to="/report_nbraid/reportemp">NBraid/EmployeeTimesheet Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/ppp_report">NBraid/PPP Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/fg_output_report">NBraid/Fg Output Report</Link>
              </li>
              <li>
                <Link to="/report_nbraid/product_line_report">NBraid/Productive Manpower</Link>
              </li>
              <li>
                <Link to="/report_nbraid/worker_efficiency_report">NBraid/Worker Efficiency</Link>
              </li>
              <li>
                <Link to="/report_nbraid/supervisor_efficiency_report">NBraid/Supervisor Efficiency</Link>
              </li>
              
              
              
            </ul>
          )}
        </li>)} 

        {  ctype == 'BRAID' && (     
        <li className={isDataReportsSubMenuOpen ? 'active' : null}>
          <a href="#" onClick={toggleDataReportsSubMenu}>
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span className="text">Data & Reports</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isDataReportsSubMenuOpen && (
            <ul className="sub-menu">
              <li><Link to="/report/braid/performanceEffindividual">Braid/Prf.Eff(Individual)</Link></li>
              <li><Link to="/report/braid/planvstarget">Braid/Plan Vs Actual</Link></li>
              <li><Link to="/report/braid/mtd_ppp">Braid/MTD AVG PPP </Link></li>
              <li><Link to="/report/braid/employee_timesheet">Braid/Employee Timesheet</Link></li>
              <li><Link to="/report/braid/performance_efficiency">Braid/Performance Efficiency</Link></li>
              <li>
                <Link to="/report/braid/ppp_itemwise">Braid/Production Breakdown</Link>
              </li>
              <li><Link to="/report/braid/daywise_production">Braid/Daywise Production</Link></li>
              <li>
                <Link to="/report/braid/wastage">Braid/Wastage</Link>
              </li>
              <li><Link to="/report/braid/wastage_per_item">Braid/Wastage Per Item</Link></li>
              <li>
                <Link to="/report/braid/ppp_overall">Braid/PPP(Overall)</Link>
              </li>
              <li>
                <Link to="/report/braid/production_dashboard">Braid/Production Dashboard</Link>
              </li>
              <li><Link to="/report/braid/machine_downtime">Braid/Machine Downtime</Link></li>
              <li><Link to="/report/braid/machine_eff_fgoutput">Braid/Machine Eff (FGOutput)</Link></li>
              <li><Link to="/report/braid/machine_eff_waste">Braid/Machine Eff (WASTE)</Link></li>
              <li><Link to="/report/braid/machine_eff_ppm">Braid/Machine Eff (PPM)</Link></li>
              <li><Link to="/report/braid/machine_hours">Braid/Machine Hours</Link></li>
              
              
              
            </ul>
          )}
        </li>)}      

        {roleId == 5 && (

        <li className={isImportSubMenuOpen ? 'active' : null}>
          <a href="#" onClick={toggleImportSubMenu}>
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span className="text">Data Export Import</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isImportSubMenuOpen && (
            <ul className="sub-menu" >
              <li>
                <Link to="/import/import-braidupdateattendance">Update Attendance(Braid)</Link>
              </li>
              <li>
                <Link to="/import/import-nbraidupdateattendance">Update Attendance(NBraid)</Link>
              </li>
              <li>
                <Link to="/import/import-fgoutputnbraid">Fg Output(NBraid)</Link>
              </li>
              <li>
                <Link to="/import/import-color">Color Master</Link>
              </li>
              <li>
                <Link to="/import/import-line">Line Master</Link>
              </li>
              <li>
                <Link to="/import/import-section">Section Master</Link>
              </li>
              <li>
                <Link to="/import/import-item">Item Master</Link>
              </li>
              <li>
                <Link to="/import/import-planvstarget">Plan Vs Target</Link>
              </li>
              <li>
                <Link to="/import/import-itemcolorcode">Item Color Code</Link>
              </li>
            </ul>
          )}
        </li>)}

        {roleId == 5 && (

        <li>
          <Link to="/dashboard_new"> {/* Use Link component to navigate to /dashboard */}
            <i className="bx bxs-tachometer"></i>
            <span className="text">Attendance Dashboard</span>
          </Link>
        </li>)}
         
        <li className={isImportTimesheetOpen ? 'active' : null}>
          <a href="#" onClick={toggleImportEmpTimesheet}>
            <i className="bx bxs-pie-chart-alt-2"></i>
            <span className="text">Import Timesheet</span>
            <i className="bx bxs-chevron-right dropdown-icon"></i>
          </a>
          {isImportTimesheetOpen && (
            <ul className="sub-menu" >
              <li>
                <Link to="/import/import-addtimesheet">Filter Timesheet</Link>
              </li>
              <li>
                <Link to="/import/import-timesheet">Import Timesheet</Link>
              </li>
              <li>
                <Link to="/import/import-viewtimesheet">View Timesheet</Link>
              </li>
              
            </ul>
          )}
        </li>
        
        </ul>

    
        
      </section>
  );
};

export default Sidebar;