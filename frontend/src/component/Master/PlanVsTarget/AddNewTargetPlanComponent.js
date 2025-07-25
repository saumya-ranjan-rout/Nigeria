import React, { useEffect, useState, useRef } from 'react';
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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function AddNewTargetPlanComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [items, setItems] = useState([]); // Define sections state variable
  const [cls, setCls] = useState(''); // Define cls state variable
  const [itemTargets, setTargetPlans] = useState({});
  //const [Date, setEndDate] = useState(null);
  const [targetPlanss, setTargetPlanss] = useState({});

  const tableRef = useRef(null);
const today = new Date();
 const [startDate, setStartDate] = useState(today);
 const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');


  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };



  const history = useHistory();

  useEffect(() => {
    document.title = 'Add New Target Plan';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      //alert("hi");
      // Fetch section data from the API
      $.ajax({
        url: 'http://192.168.29.243:4000/gettargetplan', // Replace 'your-api-endpoint' with the actual endpoint URL
        method: 'GET',
        success: function (response) {
          const items = response.data; // Assuming the response data is an array of section objects
          // Update the state with the fetched section data
          // alert(items);
          setItems(items);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching item data:', error);
        },
      });




      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, []);


  const [formData, setFormData] = useState({
    fromdate: '',

  });

   const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'fromdate') {
    setStartDate(new Date(value));
  } else {
    setFormData({ ...formData, [name]: value });
  }
};


  const handleSubmit = (event) => {
    event.preventDefault();
    const date = startDate.toLocaleDateString('en-US');

  const parts = date.split('/');
  const day = parts[1].padStart(2, '0');
  const month = parts[0].padStart(2, '0');
  const year = parts[2];

  const currentMonth = `${month}-${year}`;
  const currentDate = `${day}-${month}-${year}`;
    const fd2 = Math.floor(new Date(date).getTime() / 1000);
    var newfd = fd2;


    const targetplans = items.map((item) => ({
      item: item.id,
      date: currentDate,
      target: targetPlanss[item.id] || 0,
      time: newfd,
    }));

    //alert('targetplans:' + JSON.stringify(targetplans));

    $.ajax({
      url: 'http://192.168.29.243:4000/addtargetplan',
      method: 'POST',
      data: JSON.stringify(targetplans),
      contentType: 'application/json',
      success: function (response) {
      
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Target already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });
  };



  const handleDelete = (index) => {
    // Perform deletion logic based on the index or other identifier
    // Remove the corresponding section from the sections array

    // Create a copy of the sections array
    const updatedSections = [...items];
    // Remove the section at the specified index
    updatedSections.splice(index, 1);
    // Update the state with the modified sections array
    setItems(updatedSections);
  };


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method='POST' >
 <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <h5>Add New Target Plan</h5>
              <hr></hr>


              <div className=" row space">



                <div className="col-sm-6">
                  <span className="textgreen">Date</span>
                  <DatePicker
                  className="form-control margin-bottom"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select Start Date"
                  name="fromdate"

                />

                </div>

              </div>



              <h5>Enter Employee Productivity</h5>
              <hr></hr>

              <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
                <thead>
                  <tr style={{ backgroundColor: '#adb5bd' }}>
                    <th>#</th>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Plan</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="item-section">
                  {items.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.product_code}</td>
                      <td>{row.product_des}</td>

                      <td>
                        <input
                          type="text"
                          className={`tar${row.id} ${cls} bordered-input` }
                          name="target"
                          id={`ach${row.id}`}
                          value={targetPlanss[row.id] || ''} // Change itemTargets to targetPlanss
                          onChange={(e) => {
                            const updatedTargetPlans = {
                              ...targetPlanss,
                              [row.id]: e.target.value,
                            };
                            setTargetPlanss(updatedTargetPlans);
                          }}
                        />
                      </td>
                      
                       <td>
                        <div 
                          onClick={() => handleDelete(index)}
                          className="remCF"
                          style={{ color: 'red', cursor: 'pointer' }} // Add cursor style
                        >
                          <i className="bx bxs-trash"></i>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>


              <div className="form-group row">

                <label className="col-sm-11 col-form-label"></label>

                <div className="col-sm-1">
                  <input type="submit" id="submit-data" className="btn btn-success margin-top"
                    value="Add" data-loading-text="Adding..." />

                </div>
              </div>


            </form>
          </div>


        </main>
      </section>

    </div>
  );
}

export default AddNewTargetPlanComponent;
