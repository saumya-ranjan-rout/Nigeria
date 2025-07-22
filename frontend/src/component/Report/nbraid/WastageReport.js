import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';

import Sidebar from '../Sidebar';
import Header from '../Header';
import $ from 'jquery';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';


export function WastageReport() {
  
 
  const tableRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
  const [sectionOptions, setSectionOptions] = useState([]);

  

  const history = useHistory();

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
   
    product_id: '',
    product_name: '',

   section_id: '',
   section_name: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'section_id') {
        const selectedSection = sectionOptions.find(section => String(section.id) === value);
        const sectionName = selectedSection ? selectedSection.section_name : '';
        setFormData((prevFormData) => ({
          ...prevFormData,
          section_id: value,
          section_name: sectionName,
        }));
      }
    else if (name === 'product_id') {
      const selectedProduct = productOptions.find(product => String(product.id) === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: value,
        product_name: productName,
      }));
    }else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
 

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

     

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: 'http://192.168.56.1:4000/getWastageReportData',
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        initializeTable(response.timesheet);
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };


  const initializeTable = (timesheet) => {
    // Destroy the existing DataTable instance (if it exists)
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Initialize the DataTable with the updated data
    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv'],
      data: timesheet, // Update the data option here
      columns: [
       

       
        { data: 'item_description', },
       
       
        { data: 'section_name', },
       
       
      
       
        { data: 'wastage' },
     
      
        //{ data: 'remark' },
       // { data: 'waste' },
       {
        data: 'date_time',
        render: function (data) {
          // Parse the date from the "d-m-Y" format to Date object
          const [day, month, year] = data.split('-');
          const dateObj = new Date(`${year}-${month}-${day}`);

          // Format the date to "m-d-Y" format
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          });

          return formattedDate;
        },
      },
      
       // { data: 'site' },
      ],
      columnDefs: [


        {
        //  targets: [4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15], // Column indices for Hour 1 to Hour 12
          render: function (data, type, row) {
            if (type === 'display') {
              // Format the hour value to display decimal numbers
              const formattedHour = data.toFixed(4);
              return formattedHour;
            }
            return data;
          },
        },
      ],
    });
  };




  useEffect(() => {

    document.title = 'WASTAGE REPORT';
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
        buttons: ['copy', 'csv'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });

      $.ajax({
        url: 'http://192.168.56.1:4000/gettodayWastageData',
        method: "POST",
        data: [],
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response;
          const { date } = response;
          // Update the component state with the timesheet data
          setData(timesheet);
          setCurrentDate(date);
          initializeTable(response.timesheet);
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    }



    const fetchProductOptions = () => {
      $.ajax({
        url: 'http://192.168.56.1:4000/getWastageProductOptions',
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
 // Fetch section options from API
 const fetchSectionOptions = () => {
    $.ajax({
      url: 'http://192.168.56.1:4000/getWastageSection',
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


  }, []);

 

  const calculateSummary = () => {
    // Calculate total target and total completed
    let totalWt = 0;
    data.forEach((row) => {
      totalWt += row.tar;
    });
   // totalWt = totalWt.toFixed(2);
    return { totalWt };
  };


  const renderSummaryTable = () => {
    const { totalWt } = calculateSummary();
    return (
     <table className="summary-table">
      <thead>
        <tr>
          <th colSpan="9">Summary</th>
        
          <th colSpan="10">Total WASTAGE: <span className="total-completed">{totalWt}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="19"></td>
        </tr>
      </tbody>
    </table>
    );
  };

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">WASTAGE REPORT</h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    // onChange={date => setStartDate(date)}
                    onChange={date => {
                      const formattedDate = date.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      });
                      const updatedEvent = { target: { value: formattedDate, name: 'fromdate' } };
                      handleInputChange(updatedEvent);
                      setStartDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select Start Date"
                    name="fromdate"
                    required
                  />
                </div>
                <div className="col-sm-2">
                  <span className="textgreen">To Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    // onChange={date => {
                    //   setEndDate(date);
                    //   handleInputChange(date);
                    // }}
                    onChange={date => {
                      const formattedDate = date.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      });
                      const updatedEvent = { target: { value: formattedDate, name: 'todate' } };
                      handleInputChange(updatedEvent);
                      setEndDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select End Date"
                    name="todate"
                    required
                  />
                </div>
                <div className="col-sm-3">
                  <span className="textgreen">Product Name</span>

                  <Select
  closeMenuOnSelect={false}
  name="product_id"
  options={productOptions.map((productOption) => ({
    value: productOption.id,
    label: productOption.item_description,
  }))}
  value={selectedSections}
  onChange={(selectedOptions) => {
    setSelectedSections(selectedOptions);

    // Find the selected product from the options
    const selectedProduct = productOptions.find(
      (productOption) => productOption.id === selectedOptions.value
    );

    // Update the formData with the selected product's name
    setFormData((prevFormData) => ({
      ...prevFormData,
      product_id: selectedOptions.value,
      product_name: selectedProduct ? selectedProduct.item_description : '',
    }));
  }}
  isSearchable
  placeholder="Select Product"
/>

                 
                  <select hidden
                    className="form-control"
                    name="product_id"
                    id="product_id"

                    value={formData.product_id}
                    onChange={(e) => {
                      handleInputChange(e);
                      //handleProductChange(e);
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

                <div className="col-sm-3">
                  <span className="textgreen">Section Name</span>
                  <select
                      id="section_id"
                      className="form-control"
                      name="section_id"
                       value={formData.section_id} onChange={handleInputChange}
                    >
                      <option value="">Select Section</option>
                      {sectionOptions.map((sectionOption) => (
                        <option
                          key={sectionOption.id}
                          value={sectionOption.id}
                        >
                          {sectionOption.section_name}
                        </option>
                      ))}
                    </select>
                
                </div>
                <div className="col-sm-2">
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
              <h4 class="header-filter"> <span class="textred" >{startDate && endDate ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span>
              <span class="textgreen"> {startDate && endDate ? `[${formData.product_name}-${formData.section_name}]` : ""}</span></h4>
       
            </div>


            <div className="table-responsive">


              <table id="example" className="display">
              <thead>
                  <tr>
                   
                   
                    <th>Product Name</th>                 
                  <th>Section</th>  
              <th>Wastage</th>
                  <th>Date<br/>(m/d/Y)</th>  
                  </tr>
                </thead>

              </table>
            

                                    
            </div>
            {renderSummaryTable()}
          </div>
        </main>
      </section>
    </div>
  );
}

export default WastageReport;
