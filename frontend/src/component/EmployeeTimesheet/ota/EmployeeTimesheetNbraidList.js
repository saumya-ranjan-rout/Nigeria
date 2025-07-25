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
import Select from 'react-select';

export function EmployeeTimesheetNbraidList() {
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
  const [date, setDate] = useState('');
  const [totalComplete, setTotalComplete] = useState(0);

  const [isDefaultFetch, setIsDefaultFetch] = useState(false);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [editableCell, setEditableCell] = useState({ rowIndex: null, field: null });
  // New state variable to hold the search query
  const [searchQuery, setSearchQuery] = useState('');

  
 

  const [responseDate, setResponseDate] = useState('');
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');
    const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  


   const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };
  // alert(token);
   //alert(roleId);
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
       line_no: '',
       section: '',
       shift: '',

     
    });



  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (id) => {
    history.push(`/employeetimesheet/editotalist/${id}`);
  };


  

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: 'http://192.168.29.243:4000/getemployeetimesheetdatanbraidota',
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


         // Initialize the DataTable with the updated data and filename
          //initializeTable(timesheet);
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
      //url: 'http://192.168.29.243:4000/getdefaultemployeetimesheetdatanbraidota',
      //url: `http://192.168.29.243:4000/getdefaultemployeetimesheetdatanbraidota?roleId=${roleId}&userid=${userid}`,
      url: `http://192.168.29.243:4000/getdefaultemployeetimesheetdatanbraidota/${roleId}/${userid}`,
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setResponseDate(timesheet.length > 0 ? timesheet[0].date_time : ''); // Set the date_time value from the response

        // Initialize the DataTable with the updated data and filename
          //initializeTable(timesheet);

           

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

      // Fetch line options from API
      const fetchLineOptions = () => {

      $.ajax({
        url: `http://192.168.29.243:4000/getindividualLineOptionss`,
        method: 'GET',
        success: function (response) {
          setLineOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching line options:', error);
        },
      });
      };

      fetchLineOptions();

      const fetchProductOptions = () => {
        $.ajax({
          url: 'http://192.168.29.243:4000/getProductOptionsnbraidotalist',
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
    window.handleEdit = handleEdit;
    

      
    }, []);

  
 const handleDelete = (id) => {
  const confirmDelete = window.confirm('Do You Really Want To Delete This Record From Employee Timesheet???');

  if (confirmDelete) {
    $.ajax({
      url: `http://192.168.29.243:4000/workerdelete/${id}`,
      method: 'DELETE',
      success: function (data) {
        console.log('Item deleted:', data);
        // Update the component state or perform any other necessary actions
        // Set the server message and style it
          setServerMessage('Worker deleted successfully');
          setServerMessageClass('alert alert-success');
           setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
             window.location.reload();
          }, 5000);
      },
      error: function (xhr, status, error) {
        console.error('Error deleting item:', error);
        // Handle the error, show an error message, or perform any other necessary actions
      },
    });
  }
};



  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };


  

  const renderTableData = () => {
    // Filter data based on the search query (case-insensitive)
    const filteredData = data.filter(row =>
    row.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof row.entry_id === 'number' && row.entry_id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );
    return filteredData.map((row, index) => {
     

      const totalSum = row.value_sum;


      // Calculate the target status
      let targetStatus;
      if (totalSum == row.target) {
        targetStatus = `<span class="bgsuccess">${totalSum}</span><br><span class="bgsuccess">target completed</span>`;
      } else if (totalSum <= row.target) {
        targetStatus = `<span class="bgdanger">${totalSum}</span><br><span class="bgdanger">target pending</span>`;
      } else {
        targetStatus = `<span class="bgwarning">${totalSum}</span><br><span class="bgwarning">target exceed</span>`;
      }

     // Initialize the count of hour columns
      let hourColumnsCount = 0;

      // Loop through the columns and check for hour values
      for (let i = 1; i <= 11; i++) {
        const hourColumnName = `HOUR${i}`;
        if (typeof row[hourColumnName] === 'number' && row[hourColumnName] !== 0) {
          hourColumnsCount++;
        }
      }



      // Return the table row with updated cell values
      return (
        <tr key={index}>
          <td>{row.worker}<b> {row.entry_id}</b>
           <a
            href=""
            style={{ fontSize: '12px', color: '#009c9f', paddingLeft: '2px' }}
            onClick={(event) => {
              event.preventDefault(); // Prevent the default behavior
              handleEdit(row.id);
            }}
          >
            Edit
          </a>
          <a
            href=""
            style={{ fontSize: '12px', color: 'red', paddingLeft: '2px' }}
            onClick={(event) => {
              event.preventDefault(); // Prevent the default behavior
              handleDelete(row.id);
            }}
          >
            Delete
          </a>
          
           </td>
          
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR1')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR1'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR1')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR1" // Add a data attribute for field name
          >
            {row.HOUR1}
          </td>

          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR2')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR2'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR2')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR2" // Add a data attribute for field name
          >
            {row.HOUR2}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR3')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR3'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR3')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR3" // Add a data attribute for field name
          >
            {row.HOUR3}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR4')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR4'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR4')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR4" // Add a data attribute for field name
          >
            {row.HOUR4}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR5')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR5'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR5')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR5" // Add a data attribute for field name
          >
            {row.HOUR5}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR6')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR6'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR6')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR6" // Add a data attribute for field name
          >
            {row.HOUR6}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR7')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR7'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR7')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR7" // Add a data attribute for field name
          >
            {row.HOUR7}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR8')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR8'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR8')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR8" // Add a data attribute for field name
          >
            {row.HOUR8}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR9')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR9'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR9')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR9" // Add a data attribute for field name
          >
            {row.HOUR9}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR10')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR10'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR10')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR10" // Add a data attribute for field name
          >
            {row.HOUR10}
          </td>
          <td
            onDoubleClick={() => handleDoubleClick(index, 'HOUR11')}
            onBlur={handleBlur}
            contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR11'}
            onInput={(e) => handleInputChange2(e, index, 'HOUR11')}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name="HOUR11" // Add a data attribute for field name
          >
            {row.HOUR11}
          </td>
         
          
          <td><span class="bgsuccess ">{row.target}</span></td>
          <td dangerouslySetInnerHTML={{ __html: targetStatus }}></td>
          <td>{((totalSum / (row.target * hourColumnsCount)) * 100).toFixed(2)}%</td>
          <td><b>{row.item_description}</b></td>
          <td><b>{row.line}</b></td>
          <td><b>{row.section_name}</b></td>
          <td><b>{row.shift}</b></td>
          <td><b>{row.site}</b></td>
          <td><b>{row.date_time}</b></td>
          {/* <td><div className="fixed-width-remark">{row.remark}</div></td>
          <td>{waste_sum}gm</td> */}

        </tr>
      );
    });
  };

  const handleDoubleClick = (index, field) => {
    setEditableCell({ rowIndex: index, field });
  };

  const handleBlur = (event) => {
    // Assuming you have a way to identify the relevant data, e.g., row.id
    const rowId = event.currentTarget.dataset.rowId;

    // Find the field name from the HTML element
    const fieldName = event.currentTarget.dataset.fieldName;

    // Get the new value from the input field
    const newValue = event.currentTarget.textContent;

    // Construct the data to send to the server
    const dataToSend = {
      id: rowId,
      field: fieldName,
      value: newValue,
    };

    // Make an AJAX request to update the database
    $.ajax({
      url: 'http://192.168.29.243:4000/updatetimesheet',
      method: 'POST',
      data: JSON.stringify(dataToSend),
      contentType: 'application/json',
      success: function (response) {
        setEditableCell({ rowIndex: null, field: null });
        alert("updated successfully");
        window.location.reload();
      },
      error: function (error) {
        console.error('Failed to update data.');
        // Handle error or display an error message
      },
    });
  };

  const handleInputChange2 = (e, index, field) => {
    // alert(id);
    const updatedData = [...data];
    updatedData[index][field] = e.target.textContent;
  };

  return (
      <div className="container">
        <Sidebar />

        <section id="content">
          <Header />

          <main>
            <div className="container dt">
             <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <h5 className="title">View {' '}
             
              </h5>
              <br></br>
             
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
                  <div className="col-sm-1">
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
                <span className="textgreen">Product Name </span>
                <Select
                  options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
                  value={formData.product_name ? { value: formData.product_name, label: formData.item_description } : null}
                  onChange={(selectedOption) => {
                    setFormData({ ...formData, product_name: selectedOption.value, item_description: selectedOption.label });
                    
                  }}
                  isSearchable
                  placeholder="Select Product"
                />
              </div>


                  <div className="col-sm-2">
                  <span className="textgreen">Line </span>
                  <Select
                    options={lineOptions.map(option => ({ value: option.id, label: option.line_name }))}
                     value={formData.line_no ? { value: formData.line_no, label: formData.line_name } : null}
                   
                    onChange={(selectedOption) => {
                    
                    setFormData({ ...formData, line_no: selectedOption.value, line_name: selectedOption.label });
                  }}
                    isSearchable
                    placeholder="Select Line No"
                  />
                </div>

                  <div className="col-sm-2">
                  <span className="textgreen">Section Name </span>
                  <Select
                  options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                 value={formData.section ? { value: formData.section, label: formData.section_name } : null}
                  onChange={(selectedOption) => {
                    
                    setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
                  }}
                  isSearchable
                  placeholder="Select Section"
                />
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
                
              </form>


            {/* Display Input Field Values */}
            <div>
              <h4 class="header-title">

                <span class="textred">{isDefaultFetch ? date : ''}</span>
                <span class="textred">{isSearchFetch ? `[${formData.fromdate}-${formData.todate}]` : ''}</span>
                <span class="textgreen">
                  {isSearchFetch ? `[` : ''}
                  {isSearchFetch && formData.shift ? `${formData.shift}HRS-` : ''}
                  {isSearchFetch && formData.line_no ? `${formData.line_no}-` : ''}
                  {isSearchFetch && formData.product_id ? `${formData.product_name}-` : ''}
                  {isSearchFetch && formData.section_id ? `${formData.section_name}` : ''}
                  {isSearchFetch ? `]` : ''}
                </span>

              </h4>
            </div>

            {/* Add the search box */}
            <div className="col-sm-4">
              <input
                type="text"
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for name..."
              />
            </div>


            <div className="table-responsive">
              <table className="table table-striped table-bordered zero-configuration bordered ts">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>HR1</th>
                    <th>HR2</th>
                    <th>HR3</th>
                    <th>HR4</th>
                    <th>HR5</th>
                    <th>HR6</th>
                    <th>HR7</th>
                    <th>HR8</th>
                    <th>HR9</th>
                    <th>HR10</th>
                    <th>HR11</th>
                    <th>Target</th>
                    <th>Achievement</th>
                    <th>Efficiency</th>
                    <th>Product</th>
                    <th>Line</th>
                    <th>Section</th>
                    <th>Shift</th>
                    <th>Site</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableData()}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Name</th>
                    <th>HR1</th>
                    <th>HR2</th>
                    <th>HR3</th>
                    <th>HR4</th>
                    <th>HR5</th>
                    <th>HR6</th>
                    <th>HR7</th>
                    <th>HR8</th>
                    <th>HR9</th>
                    <th>HR10</th>
                    <th>HR11</th>
                    <th>Target</th>
                    <th>Achievement</th>
                    <th>Efficiency</th>
                    <th>Product</th>
                    <th>Line</th>
                    <th>Section</th>
                    <th>Shift</th>
                    <th>Site</th>
                    <th>Date</th>
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

export default EmployeeTimesheetNbraidList;
