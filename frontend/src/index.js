import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DashboardComponent } from './component/DashboardComponent';
import { DashboardAttritionComponent } from './component/DashboardAttritionComponent';
import {Dashboard} from './component/Dashboard.css';
import {LoginComponent} from './component/LoginComponent';
import {IndexPage} from './component/IndexPage';
import {SecondPage} from './component/SecondPage';
import {SiteDisplay} from './component/SiteDisplay';
import {TvDisplayNbraid} from './component/TvDisplayNbraid';
import {TvDisplayBraid} from './component/TvDisplayBraid';


import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {IndexComponent} from './component/IndexComponent.css';
import Sidebar from './component/Sidebar';
//import Sidebar1 from './component/Sidebar1';
import DataAccuracy from './component/EmployeeTimesheet/DataAccuracy';
import UserStatus from './component/UserStatusComponent';


import ItemCategoryComponent from './component/Master/ItemCategory/ItemCategoryComponent';
import AddNewComponent from './component/Master/ItemCategory/AddNewComponent';
import ItemSubCategoryComponent from './component/Master/ItemSubCategory/ItemSubCategoryComponent';
import AddNewISCComponent from './component/Master/ItemSubCategory/AddNewISCComponent';
import EditNewISCComponent from './component/Master/ItemSubCategory/EditNewISCComponent';
import EmployeeRoleComponent from './component/Master/EmployeeRole/EmployeeRoleComponent';
import ColorMasterComponent from './component/Master/ColorMaster/ColorMasterComponent';
import AddNewColorComponent from './component/Master/ColorMaster/AddNewColorComponent';
import EditColorComponent from './component/Master/ColorMaster/EditColorComponent';
import LineMasterComponent from './component/Master/LineMaster/LineMasterComponent';
import AddNewLineComponent from './component/Master/LineMaster/AddNewLineComponent';
import EditLineComponent from './component/Master/LineMaster/EditLineComponent';
import WasteMasterComponent from './component/Master/WasteMaster/WasteMasterComponent';
import AddNewWasteComponent from './component/Master/WasteMaster/AddNewWasteComponent';
import EditWasteComponent from './component/Master/WasteMaster/EditWasteComponent';
import MachineMasterComponent from './component/Master/MachineMaster/MachineMasterComponent';
import AddNewMachineComponent from './component/Master/MachineMaster/AddNewMachineComponent';
import EditMachineComponent from './component/Master/MachineMaster/EditMachineComponent';
import WorkerTypeComponent from './component/Master/WorkerType/WorkerTypeComponent';
import AddWTComponent from './component/Master/WorkerType/AddWTComponent';
import ShiftComponent from './component/Master/Shift/ShiftComponent';

import SectionComponent from './component/Master/Section/SectionComponent';
import AddNewSectionComponent from './component/Master/Section/AddNewSectionComponent';
import EditSectionComponent from './component/Master/Section/EditSectionComponent';
import ItemMasterComponent from './component/Master/ItemMaster/ItemMasterComponent';
import AddNewIMComponent from './component/Master/ItemMaster/AddNewIMComponent';
import EditIMComponent from './component/Master/ItemMaster/EditIMComponent';
import AddColorIMComponent from './component/Master/ItemMaster/AddColorIMComponent';
import EditItemCodeComponent from './component/Master/ItemMaster/EditItemCodeComponent';
import ViewIMComponent from './component/Master/ItemMaster/ViewIMComponent';
import ItemSectionEditComponent from './component/Master/ItemMaster/ItemSectionEditComponent';
import LanguagePage from './component/LanguagePage';
import CompanySetting from './component/CompanySetting';
import QCMasterComponent from './component/Master/QcMaster/QCMasterComponent';
import EditQCMasterComponent from './component/Master/QcMaster/EditQCMasterComponent';
import PlanVSTargetComponent from './component/Master/PlanVsTarget/PlanVSTargetComponent';
import AddNewTargetPlanComponent from './component/Master/PlanVsTarget/AddNewTargetPlanComponent';
import PlanViewComponent from './component/Master/PlanVsTarget/PlanViewComponent';





  
  
//HRM START//
import AdminComponent from './component/Hrm/ADMIN/AdminComponent';
import AddNewAdminComponent from './component/Hrm/ADMIN/AddNewAdminComponent';
import ViewAdmin from './component/Hrm/ADMIN/ViewAdmin';
import EditAdmin from './component/Hrm/ADMIN/EditAdmin';
import AdminChangePassword from './component/Hrm/ADMIN/AdminChangePassword';
//EKEJA START
//operator
import OperatorComponentIkeja from './component/Hrm/IKEJA/Operator/OperatorComponent';
import AddOperatorComponentIkeja from './component/Hrm/IKEJA/Operator/AddOperatorComponent';
import ConvertToCategory from './component/Hrm/IKEJA/Operator/ConvertToCategory';
import AddAssignOperator from './component/Hrm/IKEJA/Operator/AddAssignOperator';
import AddAssignOpNbraid from './component/Hrm/IKEJA/Operator/AddAssignNbraid';
import MultipleSectionAssign from './component/Hrm/IKEJA/Operator/MultipleSectionAssign';
import ViewOperator from './component/Hrm/IKEJA/Operator/ViewOperator';
import EditOperator from './component/Hrm/IKEJA/Operator/EditOperator';
import ChangePassword from './component/Hrm/IKEJA/Operator/ChangePassword';
//Assign operator
import AssignList from './component/Hrm/IKEJA/AssignOperator/AssignList';
import BraidList from './component/Hrm/IKEJA/AssignOperator/BraidList';
import NonBraidList from './component/Hrm/IKEJA/AssignOperator/NonBraidList';
//Change Shift operator
import ChangeShiftOp from './component/Hrm/IKEJA/ChangeShiftOperator/ChangeShiftOperator';
import MultipleShiftChangeOperator from './component/Hrm/IKEJA/ChangeShiftOperator/MultipleShiftChangeOperator';
//Employee
import EmployeeList from './component/Hrm/IKEJA/Employees/EmployeeList';
import Employees from './component/Hrm/IKEJA/Employees/Employees';
import ViewWorker from './component/Hrm/IKEJA/Employees/ViewWorker';
import EditWorker from './component/Hrm/IKEJA/Employees/EditWorker';
import ChangeToOperator from './component/Hrm/IKEJA/Employees/ChangeToOperator';
import NbraidEmployees from './component/Hrm/IKEJA/Employees/NbraidEmployees';
import EditWorkerNbraid from './component/Hrm/IKEJA/Employees/EditWorkerNbraid';
import ViewWorkerNbraid from './component/Hrm/IKEJA/Employees/ViewWorkerNbraid';
//Change zone
import ZoneType from './component/Hrm/IKEJA/ChangeZone/ZoneType';
import ChangeZone from './component/Hrm/IKEJA/ChangeZone/ChangeZone';
import ChangeZoneCheckbox from './component/Hrm/IKEJA/ChangeZone/ChangeZoneCheckbox';
import MultipleChangeZone from './component/Hrm/IKEJA/ChangeZone/MultipleZoneChange';
import ChangeZoneToNbraid from './component/Hrm/IKEJA/ChangeZone/ChangeZoneToNbraid';
import MultipleZoneToNbraid from './component/Hrm/IKEJA/ChangeZone/MultipleZoneToNbraid';
import ChangeZoneNbraid from './component/Hrm/IKEJA/ChangeZone/ChangeZoneNbraid';
import ChangeZoneNbraidCheckbox from './component/Hrm/IKEJA/ChangeZone/ChangeZoneNbraidCheckbox';
import MultipleZoneNbraid from './component/Hrm/IKEJA/ChangeZone/MultipleZoneNbraid';
import ChangeZoneToBraid from './component/Hrm/IKEJA/ChangeZone/ChangeZoneToBraid';
import MultipleZoneToBraid from './component/Hrm/IKEJA/ChangeZone/MultipleZoneToBraid';
//Change Shift
import ChangeShiftComponent from './component/Hrm/IKEJA/ChangeShift/ChangeShiftComponent';
import MultipleShiftChange from './component/Hrm/IKEJA/ChangeShift/MultipleShiftChange';
//Change worker
import ChangeWorkerComponent from './component/Hrm/IKEJA/ChangeWorker/ChangeWorker';
import MultipleWorkerTypeChange from './component/Hrm/IKEJA/ChangeWorker/MultipleWorkerChange';
//Employees fda
import EmployeesFdaComponent from './component/Hrm/IKEJA/EmployeeFda/FDA_EmployeeList';
//EKEJA END//
//OTA START//
 import OperatorComponentOta from './component/Hrm/OTA/Operator/OperatorComponent';    
 import AddOperatorComponentOta from './component/Hrm/OTA/Operator/AddOperatorComponent';  
 import ConvertToCategoryOta from './component/Hrm/OTA/Operator/ConvertToCategory';  
 import AddAssignOperatorOta from './component/Hrm/OTA/Operator/AddAssignOperator';
 import AddAssignOpNbraidOta from './component/Hrm/OTA/Operator/AddAssignNbraid';  
 import MultipleSectionAssignOta from './component/Hrm/OTA/Operator/MultipleSectionAssign';   
 import ViewOperatorOta from './component/Hrm/OTA/Operator/ViewOperator'; 
 import EditOperatorOta from './component/Hrm/OTA/Operator/EditOperator';    
 import ChangePasswordOta from './component/Hrm/OTA/Operator/ChangePassword';   
 
 //Assign operator
import AssignListOta from './component/Hrm/OTA/AssignOperator/AssignList';
import BraidListOta from './component/Hrm/OTA/AssignOperator/BraidList';
import NonBraidListOta from './component/Hrm/OTA/AssignOperator/NonBraidList';
//Change Shift operator
import ChangeShiftOpOta from './component/Hrm/OTA/ChangeShiftOperator/ChangeShiftOperator';
import MultipleShiftChangeOperatorOta from './component/Hrm/OTA/ChangeShiftOperator/MultipleShiftChangeOperator';
//Employee list
import EmployeeListOta from './component/Hrm/OTA/Employees/EmployeeList';
import EmployeesOta from './component/Hrm/OTA/Employees/Employees';
import ViewWorkerBraidOta from './component/Hrm/OTA/Employees/ViewWorkerBraids';
import EditWorkerBraidOta from './component/Hrm/OTA/Employees/EditWorkerBraid';
import ChangeToOperatorOta from './component/Hrm/OTA/Employees/ChangeToOperator';
import NbraidEmployeesOta from './component/Hrm/OTA/Employees/NbraidEmployees';
import ViewWorkerOta from './component/Hrm/OTA/Employees/ViewWorker';
import EditWorkerOta from './component/Hrm/OTA/Employees/EditWorker';
//Change zone
import ZoneTypeOta from './component/Hrm/OTA/ChangeZone/ZoneType';
import ChangeZoneOta from './component/Hrm/OTA/ChangeZone/ChangeZone';
import ChangeZoneCheckboxOta from './component/Hrm/OTA/ChangeZone/ChangeZoneCheckbox';
import MultipleChangeZoneOta from './component/Hrm/OTA/ChangeZone/MultipleZoneChange';
import ChangeZoneToNbraidOta from './component/Hrm/OTA/ChangeZone/ChangeZoneToNbraid';
import MultipleZoneToNbraidOta from './component/Hrm/OTA/ChangeZone/MultipleZoneToNbraid';
import ChangeZoneNbraidOta from './component/Hrm/OTA/ChangeZone/ChangeZoneNbraid';
import ChangeZoneNbraidCheckboxOta from './component/Hrm/OTA/ChangeZone/ChangeZoneNbraidCheckbox';
import MultipleZoneNbraidOta from './component/Hrm/OTA/ChangeZone/MultipleZoneNbraid';
import ChangeZoneToBraidOta from './component/Hrm/OTA/ChangeZone/ChangeZoneToBraid';
import MultipleZoneToBraidOta from './component/Hrm/OTA/ChangeZone/MultipleZoneToBraid';
//Change Shift
import ChangeShiftComponentOta from './component/Hrm/OTA/ChangeShift/ChangeShiftComponent';
import MultipleShiftChangeOta from './component/Hrm/OTA/ChangeShift/MultipleShiftChange';
//Change worker
import ChangeWorkerComponentOta from './component/Hrm/OTA/ChangeWorker/ChangeWorker';
import MultipleWorkerTypeChangeOta from './component/Hrm/OTA/ChangeWorker/MultipleWorkerChange';
//Employees fda
import EmployeesFdaComponentOta from './component/Hrm/OTA/EmployeeFda/FDA_EmployeeList';
//OTA END//

//HRM END//




//braid report

import BraidPerformanceEffIndividual from './component/Report/Braid/PerformanceEffIndividual';
import BraidPlanVsActualReport from './component/Report/Braid/PlanVsActualReport';
import BraidMTDPPPAverageReport from './component/Report/Braid/MTDPPPAverageReport';
import BraidEmployeeTimesheetReport from './component/Report/Braid/EmployeeTimesheetReport';
import BraidEmployeeTimesheetNewReport from './component/Report/Braid/EmployeeTimesheetNewReport';
import PerformanceEfficiencyReport from './component/Report/Braid/PerformanceEfficiencyReport';
import PerformanceEfficiencyNewReport from './component/Report/Braid/PerformanceEfficiencyNewReport';
import ProductionBreakdown from './component/Report/Braid/ProductionBreakdown';
import DaywiseProduction from './component/Report/Braid/DaywiseProductionReport';
import Wastage from './component/Report/Braid/Wastage';
import WastagePerItemReport from './component/Report/Braid/WastagePerItemReport';
import ProductionDashboardReport from './component/Report/Braid/ProductionDashboardReport';
import PPPOverall from './component/Report/Braid/PPPOverall';
import MachineDowntimeReport from './component/Report/Braid/MachineDowntimeReport';
import MachineEffFgoutputReport from './component/Report/Braid/MachineEffFgoutputReport';
import MachineEffWasteReport from './component/Report/Braid/MachineEffWasteReport';
import MachineEffPpmReport from './component/Report/Braid/MachineEffPpmReport';
import MachineHourReport from './component/Report/Braid/MachineHoursReport';

//nbraid report

import AttendanceReport from './component/Report/nbraid/AttendanceReport';
import FGMonthlyReport from './component/Report/nbraid/FGMonthlyReport';
import PerformanceEffIndividual from './component/Report/nbraid/PerformanceEffIndividual';
import PlanVsTargetReport from './component/Report/nbraid/PlanVsTargetReport';
import MTDPPPAverageReport from './component/Report/nbraid/MTDPPPAverageReport';
import EfficiencyOverviewReport from './component/Report/nbraid/EfficiencyOverviewReport';
import EfficiencyOverviewDetailsReport from './component/Report/nbraid/EfficiencyOverviewDetailsReport';
import PerformanceEfficiencyNBraidReport from './component/Report/nbraid/PerformanceEfficiencyNBraidReport';
import PerformanceOverviewNbraidReport from './component/Report/nbraid/PerformanceOverviewNbraidReport';
import ProductivityReport from './component/Report/nbraid/ProductivityReport';
import EmployeeTimesheetReport from './component/Report/nbraid/EmployeeTimesheetReport';
import PPPReport from './component/Report/nbraid/PPPReport';
import FGOutputReport from './component/Report/nbraid/FGOutputReport';
import ProductiveManpowerReport from './component/Report/nbraid/ProductiveManpowerReport';
import WorkerEfficiencyReport from './component/Report/nbraid/WorkerEfficiencyReport';
import SupervisorEfficiencyReport from './component/Report/nbraid/SupervisorEfficiencyReport'; 






import EmployeeTimesheetBraidList from './component/EmployeeTimesheet/ikeja/EmployeeTimesheetBraidList';
import AddEmployeeTimesheetBraid from './component/EmployeeTimesheet/ikeja/AddEmployeeTimesheetBraid';
import AddEmployeeTimesheetBraidIkejaOperator from './component/EmployeeTimesheet/ikeja/AddEmployeeTimesheetBraidIkejaOperator';
import EmployeeTimesheetBraidListIkejaOperator from './component/EmployeeTimesheet/ikeja/EmployeeTimesheetBraidListIkejaOperator';

import ViewEmployeeTimesheetBraid from './component/EmployeeTimesheet/ikeja/ViewEmployeeTimesheetBraid';
import EditEmployeeTimesheetBraid from './component/EmployeeTimesheet/ikeja/EditEmployeeTimesheetBraid';




import EmployeeTimesheetNbraidList from './component/EmployeeTimesheet/ota/EmployeeTimesheetNbraidList';
import EditEmployeeTimesheetNbraidList from './component/EmployeeTimesheet/ota/EditEmployeeTimesheetNbraidList';
import AddEmployeeTimesheetNbraid from './component/EmployeeTimesheet/ota/AddEmployeeTimesheetNbraid';
import AddEmployeeTimesheetNbraidOpLogin from './component/EmployeeTimesheet/ota/AddEmployeeTimesheetNbraidOpLogin';
import EmployeeTimesheetNbraidListopLogin from './component/EmployeeTimesheet/ota/EmployeeTimesheetNbraidListopLogin';


//Fg Output Module
//ikeja braid
import FgOutputComponent from './component/FgOutput/ikeja/braid/FgOutputComponent';

//ikeja nbraid
import FgOutputComponentNbraid from './component/FgOutput/ikeja/nbraid/FgOutputComponentNbraid';
import AddFgOutputComponentIkejaNbraid from './component/FgOutput/ikeja/nbraid/AddFgOutputComponentIkejaNbraid';
import EditFgOutputComponent from './component/FgOutput/ikeja/nbraid/EditFgOutputComponent';

//ota braid
import FgOutputComponentOtaBraid from './component/FgOutput/ota/braid/FgOutputComponentOtaBraid';

//ota nbraid
import FgOutputComponentOtaNbraid from './component/FgOutput/ota/nbraid/FgOutputComponentOtaNbraid';
import AddFgOutputComponentOtaNbraid from './component/FgOutput/ota/nbraid/AddFgOutputComponentOtaNbraid';
import EditFgOutputComponentOtaNbraid from './component/FgOutput/ota/nbraid/EditFgOutputComponentOtaNbraid';
//Fg Output Module

//Data Import module
import ImportOperator from './component/Import/ImportOperator';
import ImportEmployee from './component/Import/ImportEmployee';
import ImportColor from './component/Import/ImportColor';
import ImportLine from './component/Import/ImportLine';
import ImportSection from './component/Import/ImportSection';
import ImportItem from './component/Import/ImportItem';
import ImportPlanVsTarget from './component/Import/ImportPlanVsTarget';
import ImportItemColorCode from './component/Import/ImportItemColorCode';
import ImportBraidUpdateAttendance from './component/Import/ImportBraidUpdateAttendance';
import ImportNbraidUpdateAttendance from './component/Import/ImportNbraidUpdateAttendance';
import ImportFGOutput from './component/Import/ImportFGOutput';

//Import Timesheet
import FilterTimesheet from './component/ImportTimesheet/FilterTimesheet';
import ImportTimesheet from './component/ImportTimesheet/ImportTimesheet';
import ViewTimesheet from './component/ImportTimesheet/ViewTimesheet';

//Get Attendance
import SorryComponent from './component/SorryComponent.js';
import DataComponent from './component/DataComponent.js';

import TimePickerComponent from './component/TimePickerComponent.js';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename="/Nigeria"> 


  <React.StrictMode>
    <Route exact path="/" component={IndexPage} />
    <Route exact path="/second" component={SecondPage} />
    <Route exact path="/site-display" component={SiteDisplay} />
    <Route exact path="/tv-display-nbraid" component={TvDisplayNbraid} />
    <Route exact path="/tv-display-braid" component={TvDisplayBraid} />
   
    
    
   {/*  <Route exact path="/" component={LoginComponent} /> */}
    <Route exact path="/login" component={LoginComponent} />
    <Route exact path="/dashboard" component={DashboardComponent} />
    <Route exact path="/dashboard_new" component={DashboardAttritionComponent} />
    <Route exact path="/language" component={LanguagePage} /> {/* Add this route for the LanguagePage */}
    <Route exact path="/settings" component={CompanySetting} /> {/* Add this route for the LanguagePage */}
    <Route exact path="/employeetimesheet/data-accuracy" component={DataAccuracy} /> {/* Add this route for the data Accuracy page */}
     <Route exact path="/employeetimesheet/userStatus" component={UserStatus} /> {/* Add this route for the data Accuracy page */}
    
    <Route exact path="/master/item-category" component={ItemCategoryComponent} />
    <Route exact path="/master/add-itemcategory" component={AddNewComponent} />
    <Route exact path="/master/item-subcategory" component={ItemSubCategoryComponent} />
    <Route exact path="/master/add-itemsubcategory" component={AddNewISCComponent} />
    <Route exact path="/master/edit-itemsubcategory/:id" component={EditNewISCComponent} />
    <Route exact path="/master/section" component={SectionComponent} />
    <Route exact path="/master/add-section" component={AddNewSectionComponent} />
    <Route exact path="/master/edit-section/:id" component={EditSectionComponent} />
    <Route exact path="/master/shift" component={ShiftComponent} />
    
    <Route exact path="/master/worker-type" component={WorkerTypeComponent} />
    <Route exact path="/master/add-worker-type" component={AddWTComponent} />
    <Route exact path="/master/employee-role" component={EmployeeRoleComponent} />
    <Route exact path="/master/color-master" component={ColorMasterComponent} />
    <Route exact path="/master/add-color" component={AddNewColorComponent} />
    <Route exact path="/master/edit-color/:id" component={EditColorComponent} />
    <Route exact path="/master/line-master" component={LineMasterComponent} />
    <Route exact path="/master/add-line" component={AddNewLineComponent} />
    <Route exact path="/master/edit-line/:id" component={EditLineComponent} />
    <Route exact path="/master/item-master" component={ItemMasterComponent} />
    <Route exact path="/master/add-itemmaster" component={AddNewIMComponent} />
    <Route exact path="/master/edit-itemmaster/:id" component={EditIMComponent} />
    <Route exact path="/master/view-itemmaster/:id" component={ViewIMComponent} />
    <Route exact path="/master/add-coloritemmaster/:id" component={AddColorIMComponent} />
    <Route exact path="/master/edititemcode/:id" component={EditItemCodeComponent} />
    <Route exact path="/master/item-section-edit/:id" component={ItemSectionEditComponent} />
    <Route exact path="/master/waste-master" component={WasteMasterComponent} />
    <Route exact path="/master/add-waste" component={AddNewWasteComponent} />
    <Route exact path="/master/edit-waste/:id" component={EditWasteComponent} />
    <Route exact path="/master/machine-master" component={MachineMasterComponent} />
    <Route exact path="/master/add-machine" component={AddNewMachineComponent} />
    <Route exact path="/master/edit-machine/:id" component={EditMachineComponent} />
    <Route exact path="/master/qc-master" component={QCMasterComponent} />
    <Route exact path="/master/edit-qc/:id" component={EditQCMasterComponent} />
    <Route exact path="/master/plan-vs-target" component={PlanVSTargetComponent} />
    <Route exact path="/master/add-plan-target" component={AddNewTargetPlanComponent} />
    <Route exact path="/master/weekly-plan-view" component={PlanViewComponent} />



    
    {/* HRM START */}
    <Route exact path="/hrm/admin/" component={AdminComponent} />
    <Route exact path="/hrm/admin_add/" component={AddNewAdminComponent} />
    <Route exact path="/hrm/view_admin/:id" component={ViewAdmin} />
    <Route exact path="/hrm/update_admin/:id" component={EditAdmin} />
    <Route exact path="/hrm/updateadminpassword/:id" component={AdminChangePassword} />
    {/* IKEJA START */} 
    <Route exact path="/hrm/ikeja/operator" component={OperatorComponentIkeja} />
    <Route exact path="/hrm/ikeja/addoperator" component={AddOperatorComponentIkeja} />
    <Route exact path="/hrm/ikeja/convert_category_op/:id" component={ConvertToCategory} />
    <Route exact path="/hrm/ikeja/addassignoperator/:id" component={AddAssignOperator} />
    <Route exact path="/hrm/ikeja/addassign_nbraid/:id" component={AddAssignOpNbraid} />
    <Route exact path="/hrm/ikeja/multiplesectionassign/:id1/:id2" component={MultipleSectionAssign} />
    <Route exact path="/hrm/ikeja/viewoperator/:id" component={ViewOperator} />
    <Route exact path="/hrm/ikeja/editoperator/:id" component={EditOperator} />
    <Route exact path="/hrm/ikeja/changepassword/:id" component={ChangePassword} />
    <Route exact path="/hrm/ikeja/assignlist" component={AssignList} />
    <Route exact path="/hrm/ikeja/braidlist" component={BraidList} />
    <Route exact path="/hrm/ikeja/nonbraidlist" component={NonBraidList} />
    <Route exact path="/hrm/ikeja/changeshiftoperator" component={ChangeShiftOp} />
    <Route exact path="/hrm/ikeja/multiplechangeshiftop" component={MultipleShiftChangeOperator} />
    <Route exact path="/hrm/ikeja/employeelist" component={EmployeeList} />
    <Route exact path="/hrm/ikeja/employees" component={Employees} />
    <Route exact path="/hrm/ikeja/viewemployee/:id" component={ViewWorker} />
    <Route exact path="/hrm/ikeja/editemployee/:id" component={EditWorker} />
    <Route exact path="/hrm/ikeja/change_to_op/:id" component={ChangeToOperator} />
    <Route exact path="/hrm/ikeja/nbraidemployees" component={NbraidEmployees} />
    <Route exact path="/hrm/ikeja/viewemployeenbraid/:id" component={ViewWorkerNbraid} />
    <Route exact path="/hrm/ikeja/editemployeesnbraid/:id" component={EditWorkerNbraid} />
    <Route exact path="/hrm/ikeja/zonetypes" component={ZoneType} />
    <Route exact path="/hrm/ikeja/changezone" component={ChangeZone} />
    <Route exact path="/hrm/ikeja/changezoneCheckBox" component={ChangeZoneCheckbox} />
    <Route exact path="/hrm/ikeja/multiplechangezone" component={MultipleChangeZone} />
    <Route exact path="/hrm/ikeja/changezonetonbraid" component={ChangeZoneToNbraid} />
    <Route exact path="/hrm/ikeja/multiplezonetonbraid" component={MultipleZoneToNbraid} />
    <Route exact path="/hrm/ikeja/changezonenbraid" component={ChangeZoneNbraid} />
    <Route exact path="/hrm/ikeja/changezonenbraidCheckbox" component={ChangeZoneNbraidCheckbox} />
    <Route exact path="/hrm/ikeja/multiplezoneNbraid" component={MultipleZoneNbraid} />
    <Route exact path="/hrm/ikeja/changezonetobraid" component={ChangeZoneToBraid} />
    <Route exact path="/hrm/ikeja/multiplezoneBraid" component={MultipleZoneToBraid} />
    <Route exact path="/hrm/ikeja/changeshift" component={ChangeShiftComponent} />
    <Route exact path="/hrm/ikeja/multiplechangeshift" component={MultipleShiftChange} />
    <Route exact path="/hrm/ikeja/changeworker" component={ChangeWorkerComponent} />
    <Route exact path="/hrm/ikeja/multiplechangeWorker" component={MultipleWorkerTypeChange} />
    <Route exact path="/hrm/ikeja/employeeFda" component={EmployeesFdaComponent} />

    {/* IKEJA END */}
    {/* OTA START */}
    <Route exact path="/hrm/ota/operator" component={OperatorComponentOta} />  
    <Route exact path="/hrm/ota/addoperator" component={AddOperatorComponentOta} />
    <Route exact path="/hrm/ota/convert_category_op/:id" component={ConvertToCategoryOta} />
    <Route exact path="/hrm/ota/addassignoperator/:id" component={AddAssignOperatorOta} />
    <Route exact path="/hrm/ota/addassign_nbraid/:id" component={AddAssignOpNbraidOta} />
    <Route exact path="/hrm/ota/multiplesectionassign/:id1/:id2" component={MultipleSectionAssignOta} />
    <Route exact path="/hrm/ota/viewoperator/:id" component={ViewOperatorOta} />
    <Route exact path="/hrm/ota/editoperator/:id" component={EditOperatorOta} />
    <Route exact path="/hrm/ota/changepassword/:id" component={ChangePasswordOta} />
    <Route exact path="/hrm/ota/assignlist" component={AssignListOta} />
    <Route exact path="/hrm/ota/braidlist" component={BraidListOta} />
    <Route exact path="/hrm/ota/nonbraidlist" component={NonBraidListOta} />
    <Route exact path="/hrm/ota/changeshiftoperator" component={ChangeShiftOpOta} />
    <Route exact path="/hrm/ota/multiplechangeshiftop" component={MultipleShiftChangeOperatorOta} />

    <Route exact path="/hrm/ota/employeelist" component={EmployeeListOta} />
    <Route exact path="/hrm/ota/employees" component={EmployeesOta} />
    <Route exact path="/hrm/ota/viewemployeebraid/:id" component={ViewWorkerBraidOta} />
    <Route exact path="/hrm/ota/editemployeebraid/:id" component={EditWorkerBraidOta} />
    <Route exact path="/hrm/ota/change_to_op/:id" component={ChangeToOperatorOta} />
    <Route exact path="/hrm/ota/nbraidemployees" component={NbraidEmployeesOta} />
    <Route exact path="/hrm/ota/viewemployee/:id" component={ViewWorkerOta} />
    <Route exact path="/hrm/ota/editemployee/:id" component={EditWorkerOta} />

    <Route exact path="/hrm/ota/zonetypes" component={ZoneTypeOta} />
    <Route exact path="/hrm/ota/changezone" component={ChangeZoneOta} />
    <Route exact path="/hrm/ota/changezoneCheckBox" component={ChangeZoneCheckboxOta} />
    <Route exact path="/hrm/ota/multiplechangezone" component={MultipleChangeZoneOta} />
    <Route exact path="/hrm/ota/changezonetonbraid" component={ChangeZoneToNbraidOta} />
    <Route exact path="/hrm/ota/multiplezonetonbraid" component={MultipleZoneToNbraidOta} />
    <Route exact path="/hrm/ota/changezonenbraid" component={ChangeZoneNbraidOta} />
    <Route exact path="/hrm/ota/changezonenbraidCheckbox" component={ChangeZoneNbraidCheckboxOta} />
    <Route exact path="/hrm/ota/multiplezoneNbraid" component={MultipleZoneNbraidOta} />
    <Route exact path="/hrm/ota/changezonetobraid" component={ChangeZoneToBraidOta} />
    <Route exact path="/hrm/ota/multiplezoneBraid" component={MultipleZoneToBraidOta} />
    <Route exact path="/hrm/ota/changeshift" component={ChangeShiftComponentOta} />
    <Route exact path="/hrm/ota/multiplechangeshift" component={MultipleShiftChangeOta} />
    <Route exact path="/hrm/ota/changeworker" component={ChangeWorkerComponentOta} />
    <Route exact path="/hrm/ota/multiplechangeWorker" component={MultipleWorkerTypeChangeOta} />
    <Route exact path="/hrm/ota/employeeFda" component={EmployeesFdaComponentOta} />
    {/* OTA END */}                          
    {/* HRM END */}
    
   
   
    
    

    {/*  Report Braid */}
     <Route exact path="/report/braid/performanceEffindividual" component={BraidPerformanceEffIndividual} />
     <Route exact path="/report/braid/planvstarget" component={BraidPlanVsActualReport} />
     <Route exact path="/report/braid/mtd_ppp" component={BraidMTDPPPAverageReport} />
     <Route exact path="/report/braid/employee_timesheet" component={BraidEmployeeTimesheetReport} />
     <Route exact path="/report/braid/employee_timesheet_new" component={BraidEmployeeTimesheetNewReport} />
     <Route exact path="/report/braid/performance_efficiency" component={PerformanceEfficiencyReport} />
     <Route exact path="/report/braid/performance_eff_new" component={PerformanceEfficiencyNewReport} />
     <Route exact path="/report/braid/ppp_itemwise" component={ProductionBreakdown} />
     <Route exact path="/report/braid/daywise_production" component={DaywiseProduction} />
     <Route exact path="/report/braid/wastage" component={Wastage} />
     <Route exact path="/report/braid/wastage_per_item" component={WastagePerItemReport} />
     <Route exact path="/report/braid/production_dashboard" component={ProductionDashboardReport} />
     <Route exact path="/report/braid/ppp_overall" component={PPPOverall} />
     <Route exact path="/report/braid/machine_downtime" component={MachineDowntimeReport} />
     <Route exact path="/report/braid/machine_eff_fgoutput" component={MachineEffFgoutputReport} />
     <Route exact path="/report/braid/machine_eff_waste" component={MachineEffWasteReport} />
     <Route exact path="/report/braid/machine_eff_ppm" component={MachineEffPpmReport} />
     <Route exact path="/report/braid/machine_hours" component={MachineHourReport} />
     

 {/*  Report NBraid */}
    <Route exact path="/report/nbraid/attendance" component={AttendanceReport} />
    <Route exact path="/report/nbraid/Fg_monthly" component={FGMonthlyReport} />
    <Route exact path="/report/nbraid/performance_eff_individual" component={PerformanceEffIndividual} />
    <Route exact path="/report/nbraid/planvstarget" component={PlanVsTargetReport} />
    <Route exact path="/report/nbraid/mtd_ppp" component={MTDPPPAverageReport} />
    <Route exact path="/report/nbraid/Efficiency_overview" component={EfficiencyOverviewReport} />
    <Route exact path="/report/nbraid/Efficiency_overview_details/:id1/:id2" component={EfficiencyOverviewDetailsReport} />
    <Route exact path="/report/nbraid/Performance_efficiency" component={PerformanceEfficiencyNBraidReport} />
    <Route exact path="/report/nbraid/Performance_Overview" component={PerformanceOverviewNbraidReport} />
    <Route exact path="/report/nbraid/Productivity_report" component={ProductivityReport} />
    <Route exact path="/report_nbraid/reportemp" component={EmployeeTimesheetReport} />
    <Route exact path="/report_nbraid/ppp_report" component={PPPReport} />
    <Route exact path="/report_nbraid/fg_output_report" component={FGOutputReport} />
    <Route exact path="/report_nbraid/product_line_report" component={ProductiveManpowerReport} />
    <Route exact path="/report_nbraid/worker_efficiency_report" component={WorkerEfficiencyReport} />
    <Route exact path="/report_nbraid/supervisor_efficiency_report" component={SupervisorEfficiencyReport} />
    
    

    <Route exact path="/employeetimesheet/list" component={EmployeeTimesheetBraidList} />
    <Route exact path="/employeetimesheet/addtimesheetbraid" component={AddEmployeeTimesheetBraid} />
    <Route exact path="/employeetimesheet/addtimesheetbraidikejaoperator" component={AddEmployeeTimesheetBraidIkejaOperator} />
    <Route exact path="/employeetimesheet/emptimesheetbraidikejaoperatorlist" component={EmployeeTimesheetBraidListIkejaOperator} />
    
    
    <Route exact path="/employeetimesheet/comparision/:id" component={ViewEmployeeTimesheetBraid} />
    <Route exact path="/employeetimesheet/edittimesheetbraid/:id" component={EditEmployeeTimesheetBraid} />
    
    
    <Route exact path="/employeetimesheet/otalist" component={EmployeeTimesheetNbraidList} />
    <Route exact path="/employeetimesheet/editotalist/:id" component={EditEmployeeTimesheetNbraidList} />
    <Route exact path="/employeetimesheet/addtimesheetnbraid" component={AddEmployeeTimesheetNbraid} />
    <Route exact path="/employeetimesheet/addtimesheetnbraidotaoperator" component={AddEmployeeTimesheetNbraidOpLogin} />
    <Route exact path="/employeetimesheet/emptimesheetnbraidotaoperatorlist" component={EmployeeTimesheetNbraidListopLogin} />
    
    
    
   
    <Route exact path="/fgoutput/fg_output" component={FgOutputComponent} />
    <Route exact path="/fgoutput/fg_outputnbraid" component={FgOutputComponentNbraid} />
    <Route exact path="/fgoutput/add_fgoutput_ikeja_nbraid" component={AddFgOutputComponentIkejaNbraid} />
    <Route exact path="/fgoutput/edit_fgoutput/:id" component={EditFgOutputComponent} />
    <Route exact path="/fgoutput/fg_outputbraidota" component={FgOutputComponentOtaBraid} />
    <Route exact path="/fgoutput/fg_outputotanbraid" component={FgOutputComponentOtaNbraid} />
    <Route exact path="/fgoutput/add_fgoutput_ota_nbraid" component={AddFgOutputComponentOtaNbraid} />
    <Route exact path="/fgoutput/edit_fgoutputotanbraid/:id" component={EditFgOutputComponentOtaNbraid} />
    <Route exact path="/import/import-operator" component={ImportOperator} />
    <Route exact path="/import/import-employee" component={ImportEmployee} />
    <Route exact path="/import/import-color" component={ImportColor} />
    <Route exact path="/import/import-line" component={ImportLine} />
    <Route exact path="/import/import-section" component={ImportSection} />
    <Route exact path="/import/import-item" component={ImportItem} />
    <Route exact path="/import/import-planvstarget" component={ImportPlanVsTarget} />
    <Route exact path="/import/import-itemcolorcode" component={ImportItemColorCode} />
    <Route exact path="/import/import-braidupdateattendance" component={ImportBraidUpdateAttendance} />
    <Route exact path="/import/import-nbraidupdateattendance" component={ImportNbraidUpdateAttendance} />
    <Route exact path="/import/import-fgoutputnbraid" component={ImportFGOutput} />

    <Route exact path="/import/import-addtimesheet" component={FilterTimesheet} />
    <Route exact path="/import/import-timesheet" component={ImportTimesheet} />
    <Route exact path="/import/import-viewtimesheet" component={ViewTimesheet} />
    
    {/* Get Attendance */}
    <Route exact path="/data" component={DataComponent} />
    <Route exact path="/sorry" component={SorryComponent} />

    <Route exact path="/timepicker" component={TimePickerComponent} />
    
    
    
  </React.StrictMode>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
