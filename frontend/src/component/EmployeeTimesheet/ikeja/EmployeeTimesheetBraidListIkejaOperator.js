  import React, { useEffect, useState, useRef } from 'react';
  import { useHistory } from 'react-router-dom';
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
  import { Link } from 'react-router-dom';
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';

  export function EmployeeTimesheetBraidListIkejaOperator() {
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [itemCategories, setItemCategories] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const today = new Date();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [productOptions, setProductOptions] = useState([]);
    const [lineOptions, setLineOptions] = useState([]);
    const [data, setData] = useState([]);
    const [totalComplete, setTotalComplete] = useState(0);
    const [responseDate, setResponseDate] = useState('');
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');

     const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');


    const roleId = sessionStorage.getItem('roleid');
    const userid = sessionStorage.getItem('id');
    const token = sessionStorage.getItem('token');
    const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
    };
    // alert(token);
 //alert(userid);
     //alert(ptype);
     // alert(ctype);
    

    const toggleClass = () => {
      setActive(!isActive);
    };

    const toggleSubMenu = () => {
      setSubMenuOpen(!isSubMenuOpen);
    };

    const history = useHistory();

   const [formData, setFormData] = useState({
       fromdate: '',
       todate: '',
       
       product_name: '',
       site: '',
       shift: '',

     
    });

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      if (name === 'fromdate') {
      setStartDate(new Date(value));
    } else if (name === 'todate') {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  
// Function to handle hour change
const handleHourChange = (rowId, hourColumn, newValue) => {
  // Assuming "data" is a state variable representing the timesheet data
  const updatedData = data.map((row) =>
    row.id === rowId ? { ...row, [hourColumn]: newValue } : row
  );

  // Update the state with the modified data
  setData(updatedData);

  // Prepare the payload to be sent to the server
  const payload = {
    rowId: rowId,
    hourColumn: hourColumn,
    newValue: newValue,
  };

  // Send the updated data to the server using AJAX
  $.ajax({
    url: 'http://192.168.29.243:4000/updateHourValue', // Replace with the appropriate API endpoint
    method: 'POST', // Assuming you want to use the POST method to update the data on the server
    data: JSON.stringify(payload),
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Handle the success response if needed
    },
    error: function (error) {
      // Handle the error if needed
    },
  });
};
    
const handleEdit = (id) => {
    history.push(`/employeetimesheet/edittimesheetbraid/${id}`);
  };



const handleView = (id) => {
    history.push(`/employeetimesheet/comparision/${id}`);
  };


   const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: 'http://192.168.29.243:4000/getemployeetimesheetdata',
      method: "POST",
      data: jsonData,
        processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, fdate, tdate } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setFDate(fdate);
        setTDate(tdate);


        // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

           // Initialize the DataTable with the updated data
            tableRef.current = $('#example').DataTable({
              dom: 'Bfrtip',
              buttons: ['copy', 'csv'],
              data: response.timesheet, // Update the data option here
                    columns: [

                        {
                            data: null,
                            render: function (data, type, row, meta) {
                                return meta.row + 1; // Auto-incremented number
                            }
                        },
          		          
                        /*{
                            data: null,
                            render: function (data, type, row) {
                              const nameDetails =
                                data.name +
                                '[' +
                                data.entryid  + ']';

                             
                              return nameDetails;
                            }
                        },*/
                        {
                          data: null,
                          render: function (data, type, row) {
                            if (row.emp_id === 1) {
                              // If emp_id is 1, display "admin" with entryid in square brackets
                              return "Admin[]" ;
                            } else {
                              // Otherwise, display the name and entryid
                              const nameDetails = data.name + '[' + data.entryid + ']';
                              return nameDetails;
                            }
                          }
                        },
                        
                        /*{
                            data: null,
                            render: function (data, type, row) {
                              const workerDetails =
                                data.workertype +
                                ' /' +
                                data.shift;

                             
                              return workerDetails;
                            }
                        },*/
                        {
                          data: null,
                          render: function (data, type, row) {
                            const workerType = data.workertype !== null ? data.workertype : ''; // Use an empty string if data.workertype is null
                            const shift = data.shift || ''; // Use an empty string if data.shift is null
                            const workerDetails = workerType + ' / ' + shift;
                            return workerDetails;
                          }
                        },
                        
                        { data: 'item_description' },
                        { data: 'color_name' },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const zoneDetails =
                                data.zone +
                                '<br>' +
                                data.machine;

                             
                              return zoneDetails;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const hourDetails =
                                data.hr_start +
                                '-' +
                                data.hr_end;

                             
                              return hourDetails;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const fiber =
                                data.fiber +
                                ' kg' ;

                             
                              return fiber;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const fg_output =
                                data.fg_output +
                                ' pcs' ;

                             
                              return fg_output;
                            }
                        },
                       
                        {
                            data: null,
                            render: function (data, type, row) {
                              const wasteDetails =
                               'Short Length:(' + data.waste1 +
                                ')<br>1st Comb:(' +
                                data.waste2 +
                               ')<br>2nd Comb:(' +
                                data.waste3 +
                                ')<br>Total: ' + data.waste_weight +
                                ' gm';

                             
                              return wasteDetails;
                            }
                        },
                        { data: 'date' },
                        { data: 'site' },
                        {
                          targets: 12, // Render in the last column
                          render: function (data, type, row, meta) {
                              const id = row.id; // Assuming 'id' is the unique identifier for each row

                              return `
                                  <button class="btn btn-sm btn-success" onclick="handleView(${id})"><i class="bx bx-edit"></i> View</button>
                                  <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
                                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash"></i></button>
                              `;
                          },
                      }

                          
                         

            ],
            
            
    });
          },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    };


  
useEffect(() => {

      document.title = 'View';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        history.push('/login');
      } else {

      $.ajax({
      url: `http://192.168.29.243:4000/getdefaultemployeetimesheetdatabraidoplogin/${userid}`,
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setResponseDate(timesheet.length > 0 ? timesheet[0].date : ''); // Set the date_time value from the response



            // Destroy the existing DataTable instance (if it exists)
              if ($.fn.DataTable.isDataTable('#example')) {
                $('#example').DataTable().destroy();
              }
                  // Initialize the DataTable with the updated data
              tableRef.current = $('#example').DataTable({
                dom: 'Bfrtip',
                buttons: ['copy', 'csv'],
                data: response.timesheet, // Update the data option here
                      columns: [
                         
                        {
                            data: null,
                            render: function (data, type, row, meta) {
                                return meta.row + 1; // Auto-incremented number
                            }
                        },

                        /*{
                            data: null,
                            render: function (data, type, row) {
                              const nameDetails =
                                data.name +
                                '[' +
                                data.entryid  + ']';

                             
                              return nameDetails;
                            }
                        },*/
                        {
                          data: null,
                          render: function (data, type, row) {
                            if (row.emp_id === 1) {
                              // If emp_id is 1, display "admin" with entryid in square brackets
                              return "Admin[]" ;
                            } else {
                              // Otherwise, display the name and entryid
                              const nameDetails = data.name + '[' + data.entryid + ']';
                              return nameDetails;
                            }
                          }
                        },
                        
                        /*{
                            data: null,
                            render: function (data, type, row) {
                              const workerDetails =
                                data.workertype +
                                ' /' +
                                data.shift;

                             
                              return workerDetails;
                            }
                        },*/
                        {
                          data: null,
                          render: function (data, type, row) {
                            const workerType = data.workertype !== null ? data.workertype : ''; // Use an empty string if data.workertype is null
                            const shift = data.shift || ''; // Use an empty string if data.shift is null
                            const workerDetails = workerType + ' / ' + shift;
                            return workerDetails;
                          }
                        },
                        
                        { data: 'item_description' },
                        { data: 'color_name' },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const zoneDetails =
                                data.zone +
                                '<br>' +
                                data.machine;

                             
                              return zoneDetails;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const hourDetails =
                                data.hr_start +
                                '-' +
                                data.hr_end;

                             
                              return hourDetails;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const fiber =
                                data.fiber +
                                ' kg' ;

                             
                              return fiber;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                              const fg_output =
                                data.fg_output +
                                ' pcs' ;

                             
                              return fg_output;
                            }
                        },
                       
                        {
                            data: null,
                            render: function (data, type, row) {
                              const wasteDetails =
                               'Short Length:(' + data.waste1 +
                                ')<br>1st Comb:(' +
                                data.waste2 +
                               ')<br>2nd Comb:(' +
                                data.waste3 +
                                ')<br>Total: ' + data.waste_weight +
                                ' gm';

                             
                              return wasteDetails;
                            }
                        },
                        { data: 'date' },
                        { data: 'site' },
                        {
                          targets: 12, // Render in the last column
                          render: function (data, type, row, meta) {
                              const id = row.id; // Assuming 'id' is the unique identifier for each row

                              return `
                                  <button class="btn btn-sm btn-success" onclick="handleView(${id})"><i class="bx bx-edit"></i> View</button>
                                  
                              `;
                          },
                      }

                      ],
                     
              });

           },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
   

           
          }
   

      // Fetch shift options from API
      const fetchShiftOptions = () => {
        $.ajax({
          url: 'http://192.168.29.243:4000/getShiftOptions',
          method: 'GET',
          success: function (response) {
            setShiftOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

      fetchShiftOptions();

      // Fetch section options from API
      const fetchSectionOptions = () => {
        $.ajax({
          url: 'http://192.168.29.243:4000/getSectionOptions',
          method: 'GET',
          success: function (response) {
            setSectionOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
          },
        });
      };

      fetchSectionOptions();

      const fetchProductOptions = () => {
        $.ajax({
          url: 'http://192.168.29.243:4000/getProductOptions',
          method: 'GET',
          success: function (response) {
            setProductOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching product options:', error);
          },
        });
      };

      fetchProductOptions();


    const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' });
    const parts = date.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const newcurrentDate1 = `${day}-${month}-${year}`;
    //alert(newcurrentDate1);

    window.handleDelete = handleDelete;
window.handleView = handleView;
  window.handleEdit = handleEdit;  

      
    }, []);



    const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

      // Clear the session
      sessionStorage.removeItem('isLoggedIn');

      // Redirect to the login page
      history.push('/login');
    };

    
  const handleProductChange = (e) => {
      const selectedProduct = e.target.value;

      // Fetch line options based on the selected product
      $.ajax({
        url: `http://192.168.29.243:4000/getLineOptions/${selectedProduct}`,
        method: 'GET',
        success: function (response) {
          setLineOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching line options:', error);
        },
      });
    };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(`Do You Really Want To Delete This Record From Employee Timesheet???`);
    if (confirmDelete) {
      fetch('http://192.168.29.243:4000/emptimesheet_delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteid: id }),
      })
      //axios.post('http://192.168.29.243:4000/emptimesheet_delete', { deleteid: id })
        .then((response) => {
          console.log('Response:', response.data);

          if (response.data.status === 'Success') {
            setServerMessage(response.data.message);
            setServerMessageClass('alert alert-success');

            // Optionally, you can refresh your data here
            // Call a function or use state management to update your data

            setTimeout(() => {
              setServerMessage('');
              setServerMessageClass('');
              window.location.reload();
            }, 5000);
          } else {
            console.error('Error:', response.data.message);
          }
        })
        .catch((error) => {
          console.error('Error deleting item:', error.message);
        });
    }
  };
    

    return (
      <div className="container">
        <Sidebar />

        <section id="content">
          <Header />

          <main>
            <div className="container dt">
             {serverMessage && (
        <div className={serverMessageClass} style={{ padding: '5px', margin: '5px 0' }}>
          {serverMessage}
        </div>
      )}
              <h5 className="title">View {' '}
             
              </h5>
              <br></br>

              {roleId == 5 && (
             
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-2">
                    <span className="textgreen">Start Date</span>
                  <DatePicker
    className="form-control margin-bottom"
    selected={startDate}
    onChange={date => setStartDate(date)}
    dateFormat="dd-MM-yyyy"
    placeholderText="Select Start Date"
    name="fromdate"

  />
                  </div>
                  <div className="col-sm-2">
                    <span className="textgreen">To Date</span>
                   <DatePicker
    className="form-control margin-bottom"
    selected={endDate}
    onChange={date => setEndDate(date)}
     dateFormat="dd-MM-yyyy"
    placeholderText="Select End Date"
    name="todate"

  />
                  </div>
                  <div className="col-sm-2">
                    <span className="textgreen">Shift</span>
                    <select
                      id="shift"
                      className="form-control"
                      name="shift"
                       value={formData.shift} onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.nhrs}>
                          {shiftOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-sm-2">
                    <span className="textgreen">Product Name</span>
                    <select
                      className="form-control"
                      name="product_name"
                      id="product_name"
                     
                      value={formData.product_name}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleProductChange(e);
                      }}

                    >
                      <option value="">Select Product Name</option>
                      {productOptions.map((productOption) => (
                        <option
                          key={productOption.id}
                          value={productOption.id}
                        >
                          {productOption.item_description}
                        </option>
                      ))}
                    </select>
                    
                  </div>
                 <div className="col-sm-2">
                    <span className="textgreen">Site</span>
                    
                    <select id="site" className="form-control" name="site" value={formData.site} onChange={handleInputChange}>
                      <option value="">Select</option>
                       <option value="ota">ota</option>
                       <option value="ikeja">ikeja</option>
                     </select>  
                  </div>
                  
                  <div className="col-sm-1">
                    <button
                      type="submit"
                      className="btn btn-success btn-md"
                    >
                      View
                    </button>
                  </div>
                </div>
                
              </form>)}

              
              {/* Display Input Field Values */}
             
              <div>
              <h6 class="header-title text-center"> Showing Record: <span class="textred" >{responseDate}</span></h6>
              </div>
                
             
              <div className="table-responsive">
             

                <table id="example" className="display">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name<br/>EntryId</th>
                      <th>WorkerType<br/>Shift</th>
                      <th>Item</th>
                      <th>Color</th>
                      <th>Zone<br/>Machine</th>
                      <th>HR <br/>Start-End</th>
                      <th>Fiber</th>
                      <th>FG <br/>Output</th>
                      <th>Waste Weight</th>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                 <tfoot>
                      <tr>
                      <th>#</th>
                      <th>Name<br/>EntryId</th>
                      <th>WorkerType<br/>Shift</th>
                      <th>Item</th>
                      <th>Color</th>
                      <th>Zone<br/>Machine</th>
                      <th>HR <br/>Start-End</th>
                      <th>Fiber</th>
                      <th>FG <br/>Output</th>
                      <th>Waste Weight</th>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Action</th>
                    </tr>
                      </tfoot>
                </table>
              </div>
            </div>
          </main>
        </section>
      </div>
    );
  }

  export default EmployeeTimesheetBraidListIkejaOperator;
