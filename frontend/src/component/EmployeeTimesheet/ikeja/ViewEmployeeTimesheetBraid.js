import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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

export function ViewEmployeeTimesheetBraid(props) {
  const [isActive, setActive] = useState(false);
  const [sections, setSections] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
   const [sectionOptions, setSectionOptions] = useState([]);
    const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const [itemId, setItemId] = useState('');
const [results, setResults] = useState([]);
const [employees, setEmployees] = useState([]);
  

 

  useEffect(() => {
    document.title = 'View Comparison';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match.params.id;
      const { item_description } = location.state || {};


        setItemId(itemId);
      

      $.ajax({
        url: `http://192.168.29.243:4000/getviewcomparisonbraid/${itemId}`,
        method: 'GET',
        success: function (response) {

          // Access the timesheet results from the response object
          const { comparison } = response;
          setSections(comparison);

           // Show an alert with the data from the response
          //alert('Received Data:\n' + JSON.stringify(response));

           // Extract the 'id' from the first response
        const firstResponseId = comparison.id;

        // Second API request with the 'id' from the first response
        $.ajax({
          url: `http://192.168.29.243:4000/getemployeeproductivity/${firstResponseId}`, // Replace with your second API URL
          method: 'GET',
          success: function (response) {
            // Handle the second API response here
            // You can set another state variable to store the data, e.g., setSecondData(secondApiResponse);

            // Access the timesheet results from the response object
           const { results} = response;
          setResults(results);
          //setEmployees(employeeData);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching data from second API:', error);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error('Error fetching sections:', error);
      },
    });

    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv'],
      });
    });
  }
}, []);

 

  const [formData, setFormData] = useState({
   //id: '',
    section: '',
    target: '', 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  

  return (
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>

        <div className="container dt">
            

          <div className="form-group row space">
          <h5>View Comparison</h5>
          <div align="center"><b>Item Name : </b><span className="textred">
          
          {sections.item_description}     
            
            
            </span>&nbsp;&nbsp;&nbsp;
      <b>Zone & Machine:</b><span className="textgreen"> {sections.zone}[{sections.machine}]</span>&nbsp;&nbsp;&nbsp;
    <b> Color:</b><span className="textblue"> {sections.color}</span></div>
           <table id="" class="table table-striped table-bordered zero-configuration">
    <thead>
        <tr>
            <th></th>
            <th>Fiber</th>
            <th>FG Output</th>
            <th>Waste Weight</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style={{ fontWeight: 'bold' }}>Targeted</td>
            <td>40 kg</td>
           <td>{Math.round((40 * 1000) / (parseInt(sections.net_weight, 10) + parseInt(sections.targeted_waste, 10)))} Pcs</td>


            <td>{(40 *1000) - (parseInt(sections.net_weight, 10) * (Math.round((40 * 1000) / (parseInt(sections.net_weight, 10) + parseInt(sections.targeted_waste, 10))))) } gm</td>
        </tr>
        <tr>
            <td style={{ fontWeight: 'bold' }}>Expected</td>
            <td>{sections.fiber} Kg</td>
            <td>{sections.fg_output} Pcs</td>
            <td>{(parseInt(sections.fiber, 10) *1000) - (parseInt(sections.net_weight, 10) * parseInt(sections.fg_output, 10)) } gm</td>
        </tr>
        <tr>
            <td style={{ fontWeight: 'bold' }}>Inputted</td>
            <td> {sections.fiber} Kg</td>
            <td>{sections.fg_output} Pcs</td>
            <td>Short Length : ({sections.waste1})<br/>First Comb: ({sections.waste2})<br/>2nd Comb: ({sections.waste3})<br/>Total : {sections.waste_weight} gm</td>
        </tr>
    </tbody>
</table>



          </div>


        <div className="form-group row space">
           <h5><b>QC Details</b></h5>
           <hr></hr>
          <h5><span className="textgreen">Upper Roller Temp :</span> {sections.upper}</h5>
          <h5><span className="textgreen">Lower Roller Temp. :</span> {sections.lower}</h5>
          <h5><span className="textgreen">Perheating Chamber Temp. :</span> {sections.perheating}</h5>
          <h5><span className="textgreen">Machine speed :</span> {sections.machine_speed}</h5>
          <h5><span className="textgreen">Tension (Nm) :</span> {sections.tension}</h5>
          <h5><span className="textgreen">Spreading of fiber (cm) :</span> {sections.spreading}</h5>
          <br></br>
        </div>
        <div className="form-group row space">
          <h5><b>Employee Productivity</b></h5>
          <table id="" class="table table-striped table-bordered zero-configuration">
            <thead>
                <tr>
                    <th>EntryId</th>
                    <th>Section</th>
                    <th>Employee</th>
                    <th>Target</th>
                    <th>Achievement</th>
                </tr>
            </thead>
            <tbody>
      {results.map((item) => (


        <tr key={item.id}>
          <td>{item.empid}</td>
          <td style={{ fontWeight: 'bold' }}>{item.sectionName}</td>
          <td>{item.emp}</td>
          <td>{item.target}</td>
         <td>{parseInt(item.complete.split(',')[0], 10)}</td>

        </tr>
      ))}
    </tbody>
        </table>

        </div>
        </div>

        </main>
      </section>
    </div>
  );
}

export default ViewEmployeeTimesheetBraid;
