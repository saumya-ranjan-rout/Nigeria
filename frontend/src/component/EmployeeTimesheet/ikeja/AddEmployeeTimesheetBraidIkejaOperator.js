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

export function AddEmployeeTimesheetBraidIkejaOperator() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
   const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [product, setProduct] = useState('');
  const [line, setLine] = useState('');
  const [section, setSection] = useState('');
  const [hour, setHour] = useState('');
  //const [shiftt, setShift] = useState('');
  const [absentEntryIdsMessage, setAbsentEntryIdsMessage] = useState('');
   const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [colorcodeOptions, setColorCodeOptions] = useState([]);
const [shift, setShift] = useState([]);
const [id, setID] = useState(null); // Initialize id state to null

 const [sectionfilteredData, setSectionFilteredData] = useState([]);
   const [abValues, setAbValues] = useState([]);
    const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const [qcOptions, setQcOptions] = useState([]);

   const roleId = sessionStorage.getItem('roleid');
    const userid = sessionStorage.getItem('id');
    const token = sessionStorage.getItem('token');
    const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
    };
    // alert(token);
 /*const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');*/
  

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: today,
   
    shift: 'DAY',
    product_name: '',
    color_description: '',
    site: '',
    zone: '',
    machine: '',
    shour: '',
    ehour: '',
    fiber: '',
    fg_output: '',
    waste1: '',
    waste2: '',
    waste3: '',
    waste_weight: '',
    temp0: '',
    temp1: '',
    temp2: '',
    temp3: '',
    temp4: '',
    temp5: '',
  });

 const handleInputChange = (event) => {
  const { name, value } = event.target;

  // Check if the changed input is the "fromdate" DatePicker
  if (name === 'fromdate') {
    setStartDate(value); // Update the DatePicker state
    setFormData({ ...formData, [name]: value }); // Update the formData state
  } else if (name === 'todate') {
    setEndDate(value);
    setFormData({ ...formData, [name]: value });
  } else {
    // Update the form data state for other inputs
    setFormData({ ...formData, [name]: value });

    // Validate if "Zone" is selected without choosing "Item Master"
    if (name === 'zone' && !formData.product_name) {
      alert('Please select Item Master first.'); // Display alert
      return; // Exit the function to prevent further processing
    }

    // Make the API request for section data if the changed input is "zone"
    if (['zone', 'machine', 'site'].includes(name)) {
      const jsonData = JSON.stringify({ ...formData, [name]: value });

      $.ajax({
        url: 'http://192.168.29.243:4000/getsectionsforaddemployeeoplogin',
        method: 'POST',
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          try {
            // Split the response.pr string into an array of JSON strings
            const jsonStrings = response.pr.split('}{');

            // Add missing curly braces to make each string a valid JSON object
            const jsonArray = jsonStrings.map((jsonString, index) => {
              const jsonStringWithBraces =
                (index > 0 ? '{' : '') + jsonString + (index < jsonStrings.length - 1 ? '}' : '');
              return jsonStringWithBraces;
            });

            // Parse each JSON object and create an array of objects
            const responseDataArray = jsonArray.map((jsonString) => JSON.parse(jsonString));

            // Log the data for debugging
            console.log('Parsed Data:', responseDataArray);

            // Assuming you want to set the entire array in the state
            setSectionFilteredData(responseDataArray);

            // Split the 'ab' string into an array of values
            const abValues = response.ab;

            // Log the 'ab' values for debugging
            //alert('AB Values:' + abValues);

            // Create a string without commas for display
            //const abValuesString = abValues.join('');

            // Display the string without commas
            //alert('AB Values String:' + abValuesString);

            // Assuming you want to set the 'ab' values in the state
            setAbValues(abValues);

          } catch (error) {
            console.error('Error parsing response.pr:', error);
          }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section data:', error);
        },
      });
    }
  }
};

const handleProductChange = (e) => {
  const selectedProduct = e.target.value;

  // Fetch color options based on the selected product
  $.ajax({
    url: `http://192.168.29.243:4000/getcolordescription/${selectedProduct}`, // Corrected URL
    method: 'GET',
    success: function (response) {
      setColorOptions(response);
      //alert(JSON.stringify(response));
    },
    error: function (xhr, status, error) {
      console.error('Error fetching color options:', error);
    },
  });
};
  

  const handleSubmit = (event) => {
    event.preventDefault();
    //const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: 'http://192.168.29.243:4000/getaddemployeetimesheetfilterdata',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
         //alert(JSON.stringify(response));
        const { query3Results, target, hour, product, line, section, day_night, op_id, shiftt, tdate, productid, sectionid, absentEntryIds  } = response;

        // Set the product, line, and section in the state
          setProduct(product);
          setLine(line);
          setSection(section);
          setHour(hour);
          setShift(shiftt);



        setData(
          query3Results.map((item, index) => ({
            ...item,
            id: index, // Add a unique identifier to each item in the data array
            hour: hour,
            target: target,
            product: product,
            line: line,
            section: section,
            day_night: day_night,
            op_id: op_id,
            shiftt: shiftt,
            productid: productid,
            sectionid: sectionid,
          }))
        );
        // Access the absentEntryIds here and do whatever you want with them
      const message = absentEntryIds.length > 0
        ? 'Workers having' + JSON.stringify(absentEntryIds) + 'are absent'
        : ''; // If no absent entry IDs, set an empty string

      setAbsentEntryIdsMessage(message);
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };



const handleDeleteRow = (id) => {
  // Display an alert with the index of the row being deleted
  //alert(`Deleting row with index: ${id}`);
  
   setData((prevData) => {
    const newData = prevData.filter((item) => item.id !== id);
    return newData;
  });
};






const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
  };




    useEffect(() => {

      const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');

//alert(ptype);
      //alert(userid);

       document.title = 'Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {


// Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#example')) {
    $('#example').DataTable().destroy();
  }
      // Initialize the DataTable with the updated data
  tableRef.current = $('#example').DataTable({
    dom: 'Bfrtip',
    buttons: ['copy', 'csv', 'excel', 'pdf'],
    data: data, // Use the 'data' state variable here
    // ...rest of your options
  });

     
    }

    // Check conditions and display hi or hello
    if (ptype === 'ota' && ctype === 'BRAID') {

      const employee_detailso_nb = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/employee_detailso_nb/${userid}`,
        method: 'GET',
        success: function (response) {
          //setProductOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching zone options:', error);
        },
      });
    };

    employee_detailso_nb();


    const employee_details_nbraid = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/employee_details_nbraid/${userid}`,
        method: 'GET',
        success: function (response) {
          //setProductOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching zone options:', error);
        },
      });
    };

    employee_details_nbraid();


    } else if (ptype === 'ikeja' && ctype === 'BRAID') {
      const employee_detailso = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/employee_detailso/${userid}`,
        method: 'GET',
         success: function (data) {
        setResponse(data); // Update the response state with fetched data

        // Extract unique zones from the response
        const uniqueZones = [...new Set(data.map(item => item.zone))];

        // Update the options in the zone dropdown
        const zoneDropdown = document.querySelector('[name="zone"]');
        zoneDropdown.innerHTML = `<option value="" disabled>Select ZONE</option>`;

        uniqueZones.forEach(zone => {
          const option = document.createElement('option');
          option.value = zone;
          option.text = zone;
          zoneDropdown.add(option);
        });

        // Uncomment the following line if you want to set the initial value based on your formData
        // formData.zone && (zoneDropdown.value = formData.zone);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching zone options:', error);
      },
    });
  };

    employee_detailso();

    const employee_details = () => {
      $.ajax({
        url: `http://192.168.29.243:4000/employee_details/${userid}`,
        method: 'GET',
        success: function (response) {
           // Access the timesheet results from the response object
        const { timesheet} = response;

        // Check if the timesheet object exists and has the day property
      if (timesheet && timesheet.shift && timesheet.id) {
        // Extract the day property
        const { shift } = timesheet;
        const { id } = timesheet;

        // Update the component state with the extracted day
        setShift(shift);
         setID(id);
         //alert(id);
      } else {
        console.error('Invalid timesheet format or missing day property');
      }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching zone options:', error);
        },
      });
    };

    employee_details();
    }
    else{
      //alert('nothing');
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

     const fetchQC = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getqc',
        method: 'GET',
        success: function (response) {
          setQcOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchQC();

    
  }, []);


const handleSubmitnew = (event) => {
  event.preventDefault(); // Prevent the default form submission

  const tableRows = Array.from(document.querySelectorAll('table#tblCustomers tbody tr'));
  const dataToSend = []; // Create an array to store the data

   const operator = 1; // Create an array to store the data

    // Access id state here
    //alert('ID:' + id);

  // Include other form data...
  const formDataToSend = {
    emp_id: id,
    shift: formData.shift ,
    item: formData.product_name,
    color_id: formData.color_description ,
    zone: formData.zone ,
    machine: formData.machine ,
    machinec: formData.machine ,
    hr_start: formData.shour ,
    hr_end: formData.ehour ,
    fiber: formData.fiber ,
    fg_output: formData.fg_output ,
    waste1: formData.waste1 ,
    waste2: formData.waste2 ,
    waste3: formData.waste3 ,
    waste_weight: formData.waste_weight ,
    fdate: formData.fromdate,
    temp0: formData.temp0 ,
    temp1: formData.temp1 ,
    temp2: formData.temp2 ,
    temp3: formData.temp3 ,
    temp4: formData.temp4 ,
    temp5: formData.temp5 ,
    site: 'ikeja' ,
   
    
  };

  const formDataString = JSON.stringify(formDataToSend, null, 2);

//alert(formDataString);

  tableRows.forEach((row) => {
    const $row = $(row);
    const completes = $row.find('input[name^="achievement_"]').val();
    if (completes !== '') {
      const rowData = {
        emp_ids: $row.find('td:eq(0)').text(),
        worker_names: $row.find('td:eq(1)').text(),
        section: $row.find('td:eq(2)').text(),
        target: $row.find('td:eq(3)').text(),
        section_id: $row.find('td:eq(4)').text(),
        completes: $row.find('input[name^="achievement_"]').val(),
      };

      dataToSend.push(rowData); // Add the current row data to the array
    }
  });

  // Add form data to the array
  dataToSend.unshift(formDataToSend);

  // Send the data to the API server
  $.ajax({
    url: 'http://192.168.29.243:4000/insertemployeetimesheetfilterdataoplogin',
    type: 'POST',
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
      console.log('Data successfully posted to the API server.');
      // Handle any further actions or UI updates if needed

      if (response.success) {
      console.log('Success Message:', response.successMessage);
      setServerMessage(response.successMessage);
      setServerMessageClass('alert alert-success'); // Set your desired error class
      // Display success message to the user
      setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
            // Navigate back in the browser history after displaying the success message
            history.push('/employeetimesheet/emptimesheetbraidikejaoperatorlist');
          }, 5000);
      }
    },
    error: function (error) {
      console.error('Failed to post data to the API server.');
      // Handle error or display an error message
      // Check if the error response contains the specific message
      if (error.responseJSON && error.responseJSON.errorMessage) {
        const errorMessage = error.responseJSON.errorMessage;
        setServerMessage(errorMessage);
        setServerMessageClass('alert alert-danger'); // Set your desired error class
        setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
            history.goBack();
          }, 5000);
      } else {
        setServerMessage('An error occurred while processing your request.');
        setServerMessageClass('alert alert-danger'); // Set your desired error class
        setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
          }, 5000);
      }
    },
  });
};



 // State variable to hold the machine options
const [machineOptions, setMachineOptions] = useState([]);
const [response, setResponse] = useState([]);

// Zone change handler
const handleZoneChange = (event) => {
  const selectedZone = event.target.value;

  // Find the corresponding record based on the selected zone
  const selectedRecord = response.find(item => item.zone === selectedZone);

  // Log to check the selectedRecord
  console.log('Selected Record:', selectedRecord);

  // Update the machine options based on the selected record
  const machines = selectedRecord ? selectedRecord.machine.split(',') : [];
  setMachineOptions(machines);

  // Log to check the machines
  console.log('Machines:', machines);

  // Update the formData with the selected zone
  setFormData({
    ...formData,
    zone: selectedZone,
    machine: '', // Reset machine value when zone changes
    // Other form fields...
  });
};


  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

   const [achievementValue, setAchievementValue] = useState('');

 const handleAchievementChange = (index, value) => {
    setAchievementValue(value);
    const rows = document.querySelectorAll(`input[name^="achievement_${index}"]`);
    rows.forEach((row) => {
      row.value = value;
    });
  };
 

  

  const [searchValue, setSearchValue] = useState('');
  

  const handleSearch = (event) => {
     setSearchValue(event.target.value);
     //alert(event.target.value);
  };

  const filteredData = data.filter((item) => {
  return (
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.entryid.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.product.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.line.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.section.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.hour.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.target.toLowerCase().includes(searchValue.toLowerCase())
  );
});

     // Function to calculate and update waste_weight
const updateWasteWeight = () => {
  const { waste1, waste2, waste3 } = formData;

  // Parse values, treating empty fields as 0
  const value1 = parseFloat(waste1) || 0;
  const value2 = parseFloat(waste2) || 0;
  const value3 = parseFloat(waste3) || 0;

  const sum = value1 + value2 + value3;
  setFormData((prevFormData) => ({
    ...prevFormData,
    waste_weight: sum, // Adjust precision as needed
  }));
};

  // Call the function whenever waste1, waste2, or waste3 changes
  useEffect(() => {
    updateWasteWeight();
  }, [formData.waste1, formData.waste2, formData.waste3]);

 


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Employee Details
            </h5>
            <h6><span class="textred">* Choose Start Hour and End Hour in 24 Hour format [Ex: 01:00 PM -> 13:00]</span></h6>
            <hr></hr>
            <form  onSubmit={handleSubmitnew} method='POST'>
              <div className="row space">
                
                <div className="col-sm-4">
                  <span className="textgreen">Shift <span className="textred">*</span></span>
                  
                   <input type="text" placeholder="" class="form-control" name="shift" disabled value={shift} onChange={handleInputChange} />
                </div>

                <div className="col-sm-4">
                  <span className="textgreen">Item Master <span className="textred">*</span></span>
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
                    <option value="">Select Item </option>
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
                <div className="col-sm-4">
                  <span className="textgreen">Select Color <span className="textred">*</span></span>
                  <select
                    className="form-control"
                    name="color_description"
                    id="color_description"
                    value={formData.color_description}
                   onChange={(e) => {
                    handleInputChange(e);
                   
                  }}

                  >
                    <option value="">Select Color</option>
                    {colorOptions.map((colorOption) => (
                      <option key={colorOption.id} value={colorOption.id}>
                        {colorOption.product_des}
                      </option>
                    ))}
                  </select>
                </div>

                </div>
                <div className="row space">

                  <div className="col-sm-3">
                    <span className="textgreen">Zone <span className="textred">*</span></span>
                       <select
  className="form-control"
  name="zone"
  value={formData.zone}
  //onChange={handleZoneChange}
  onChange={(e) => {
                      handleInputChange(e);
                      handleZoneChange(e);
                    }}
>
  <option value="" disabled>Select ZONE</option>
  
</select>
                   
                </div>
                <div className="col-sm-3">
                 <span className="textgreen">Choose Machine <span className="textred">*</span></span>
                        
                        <select
  className="form-control"
  name="machine"
  value={formData.machine}
  onChange={handleInputChange}


>
  <option value="" disabled>Select MACHINE</option>
  {machineOptions.map(machine => (
    <option key={machine} value={machine}>{machine}</option>
  ))}
</select>
                   
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">Load Fiber <span className="textred">*</span></span>
                  <input type="text" name="fiber" id="fiber" class="form-control" placeholder="Fiber" value={formData.fiber}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">FG OUTPUT<span className="textred">*</span></span>
                  <input type="text" name="fg_output" id="fg_output" class="form-control" placeholder="FGOUTPUT" value={formData.fg_output}
                             onChange={handleInputChange} required />
                </div>
                </div>
                <div className="row space">
                <div class="col-sm-3 ">
                  <span className="textgreen">Start Hour <span className="textred">*</span></span>
                  <input type="text" name="shour" id="shour" class="form-control" placeholder="00.00"  value={formData.shour}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">End Hour <span className="textred">*</span></span>
                  <input type="text" name="ehour" id="ehour" class="form-control" placeholder="00.00" value={formData.ehour}
                             onChange={handleInputChange} required />
                </div>
                 <div class="col-sm-3 ">
                  <span className="textgreen">Short Length <span className="textred">*</span></span>
                  <input type="text" name="waste1" id="waste1" class="form-control" placeholder="WASTE TYPE1" value={formData.waste1}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">1st Comb <span className="textred">*</span></span>
                  <input type="text" name="waste2" id="waste2" class="form-control" placeholder="WASTE TYPE2" value={formData.waste2}
                             onChange={handleInputChange} required />
                </div>
                </div>
                <div className="row space">
                <div className="col-sm-3">
                    <span className="textgreen">Start Date<span className="textred">*</span></span>
                  <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                        dateFormat="dd-MM-yyyy"
                      placeholderText="Select Start Date"
                      name="fromdate"

                    />
                  </div>
                <div class="col-sm-3 "></div>
                 <div class="col-sm-3 ">
                  <span className="textgreen">2nd Comb <span className="textred">*</span></span>
                  <input type="text" name="waste3" id="waste3" class="form-control" placeholder="WASTE TYPE3" value={formData.waste3}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">WASTE WEIGHT<span className="textred">*</span></span>
                  <input type="text" name="waste_weight" id="waste_weight" class="form-control" placeholder="WASTE" value={formData.waste_weight}
                             onChange={handleInputChange} disabled />
                </div>
                </div>
                 
               
              <h5>Enter QC Parameter</h5>
              <hr></hr>
              {/*} <div className="row space">
                <div class="col-sm-3 ">
                  <span className="textgreen">Upper Roller Temp</span>
                  <input type="text" name="temp0" id="temp0" class="form-control" placeholder="00.00" value={formData.temp0 || "0.00"}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">Lower Roller Temp.</span>
                  <input type="text" name="temp1" id="temp1" class="form-control" placeholder="00.00" value={formData.temp1 || "0.00"}
                             onChange={handleInputChange} required />
                </div>
                 <div class="col-sm-3 ">
                  <span className="textgreen">Perheating Chamber Temp.</span>
                  <input type="text" name="temp2" id="temp2" class="form-control" placeholder="00.00" value={formData.temp2 || "0.00"}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">Machine speed</span>
                  <input type="text" name="temp3" id="temp3" class="form-control" placeholder="00.00"  value={formData.temp3 || "0.00"}
                             onChange={handleInputChange} required />
                </div>
                </div>
                 <div className="row space">
                 <div class="col-sm-3 ">
                  <span className="textgreen">Tension (Nm)</span>
                  <input type="text" name="temp4" id="temp4" class="form-control" placeholder="00.00" value={formData.temp4 || "0.00"}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">Spreading of fiber (cm)</span>
                  <input type="text" name="temp5" id="temp5" class="form-control" placeholder="00.00" value={formData.temp5|| "0.00"}
                             onChange={handleInputChange} required />
                </div>
                
                
              </div>*/}


<div className="row space">
                {qcOptions.map((q, index) => (
                  <div className="col-sm-3" key={index}>
                     <span style={{ color: '#474790', fontWeight: 'bold' }}>{q.name}</span>
                    <input
                      type="text"
                      className="form-control margin-bottom"
                      name={`temp${index}`}
                      id={`temp${index}`}
                      value={formData[`temp${index}`] || "0.00"}
                      onChange={handleInputChange} // Assuming you have a function handleInputChange to handle input changes
                      required
                    />
                  </div>
                ))}
              </div>


              
               <h5>Enter Employee Productivity</h5>
               <h5><span className="textgreen">{abValues}</span> are absent</h5>
              <hr></hr>
        

            
            <div className="message-container">
              {absentEntryIdsMessage && (
                <div className="absent-message">
                  {absentEntryIdsMessage}
                </div>
              )}
            </div>

            
              
    
    <div class="fixTableHead">
       <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
            <thead>
              <tr className='tableblack'>
                 <th>Entryid</th>
                  <th>Emp Name</th>
                  <th>Section</th>
                  
                  <th>Target</th>
                  <th>Achievement</th>
                </tr>
            </thead>
           <tbody>
    {sectionfilteredData.map((data, index) => (
      <tr key={index}>
        <td>{data.entryid}</td>
        <td>{data.name}</td>
        <td style={{ fontWeight: 'bold' }}><span className="textred">{data.section_name}</span></td>
        <td>{data.target}</td>
        <td hidden>{data.section_id}</td>
       
        <td>
          <input
            type="text"
            name={`achievement_${index}`}
            defaultValue={data.Achievement || 0}
            className="form-control margin-bottom"
            onChange={(e) => handleAchievementChange(index, e.target.value)}
          />
        </td>
      </tr>
    ))}
  </tbody>

    </table>
    </div>
              <div className="form-group row">

                  <label className="col-sm-11 col-form-label"></label>

                  <div className="col-sm-11">
                     
                      
                  </div>
                   <div className="col-sm-1">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Save" data-loading-text="Adding..." />
                      
                  </div>
              </div>
             
              </form> 
          </div>
        </main>
      </section>
    </div>
  );
}

export default AddEmployeeTimesheetBraidIkejaOperator;
