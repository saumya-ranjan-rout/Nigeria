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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

export function WorkerEfficiencyReport() {
 
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
   const today = new Date(); // Get the current date
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  

const [startDate, setStartDate] = useState(oneMonthAgo);
const [endDate, setEndDate] = useState(today); // Use the current date as the default end date
    const [productOptions, setProductOptions] = useState([]);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(0);
    const [lineOptions, setLineOptions] = useState([]);

  const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
  const [sectionFromResponse, setSectionFromResponse] = useState('');
const [itemDescription, setItemDescription] = useState('');
const [line, setLine] = useState('');

    const history = useHistory();

    const [formData, setFormData] = useState({
        fromdate: '',
        todate: '',
        product_id: '',
        product_name: '',
        section_id: '',
        section_name: '',
        line_no: '',
       // line_name: '',
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
        } else {
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
            url: 'http://192.168.29.243:4000/get_workereff_search',
            method: "POST",
            data: jsonData,
            processData: false,
            contentType: 'application/json',
            success: function (response) {

                // Access the timesheet results from the response object
                const { timesheet, fdate, tdate, product, line, section } = response;

                // Update the component state with the timesheet data
                setData(timesheet);
                //initializeTable(response.timesheet);
                setFDate(fdate);
      setTDate(tdate);

       // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);

       setItemDescription(product);
       
        setSectionFromResponse(section);
        setLine(line);
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            },
        });
    };


    const initializeTable = (timesheet, formattedDate) => {
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
             buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID WORKER EFFICIENCY REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
            data: timesheet, // Update the data option here
            columns: [
                { data: 'worker', },
                { data: 'entry_id' },
                { data: 'item_description', },
                { data: 'section_name' },
                { data: 'line', },
                { data: 'target' },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const totalSum =
                                row.HOUR1 +
                                row.HOUR2 +
                                row.HOUR3 +
                                row.HOUR4 +
                                row.HOUR5 +
                                row.HOUR6 +
                                row.HOUR7 +
                                row.HOUR8 +
                                row.HOUR9 +
                                row.HOUR10 +
                                row.HOUR11 ;

                            // Return the total sum for display
                            return totalSum;
                        }
                        return data;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const totalSum =
                                row.HOUR1 +
                                row.HOUR2 +
                                row.HOUR3 +
                                row.HOUR4 +
                                row.HOUR5 +
                                row.HOUR6 +
                                row.HOUR7 +
                                row.HOUR8 +
                                row.HOUR9 +
                                row.HOUR10 +
                                row.HOUR11 ;

                            // Calculate the efficiency
                            const efficiency = (totalSum / row.target) * 100;
                            const formattedEfficiency = efficiency.toFixed(2);

                            // Return the formatted efficiency percentage for display
                            return formattedEfficiency + '%';
                        }
                        return data;
                    },
                },
                {
                    data: 'date_time',
                 
                  },

            ],
        });
    };




    useEffect(() => {

        document.title = 'Worker Efficiency Report';
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
                url: 'http://192.168.29.243:4000/get_workereff_default',
                method: "GET",
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
                   // Format the date as "DD-MM-YYYY"
          const formattedDate = date;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                },
            });
        }


      
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
        const fetchLineOptions = () => {
            $.ajax({
              url: 'http://192.168.29.243:4000/getindividualLineOptionss',
              method: 'GET',
              success: function (response) {
                setLineOptions(response);
              },
              error: function (xhr, status, error) {
                console.error('Error fetching Line options:', error);
              },
            });
          };
        
          fetchLineOptions();

    }, []);

   



    return (
        <div className="container">
            <Sidebar />

            <section id="content">
                <Header />

                <main>
                    <div className="container dt">
                        <h5 className="title">Worker Efficiency Report</h5>
                        <br></br>
                        <h5 className="title">Date Range</h5>
                        <hr></hr>
                        <form onSubmit={handleSubmit} method='POST'>
                            <div className="row space">
                                <div className="col-sm-6">
                                    <span className="textgreen">Start Date</span>
                                    <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                     dateFormat="dd-MM-yyyy"
                    placeholderText="Select Start Date"
                    name="fromdate"
                  />
                                </div>
                                <div className="col-sm-6">
                                    <span className="textgreen">To Date</span>
                                     <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                     dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                                </div>
                              

                                <div className="col-sm-3">
                                    <span className="textgreen">Product Name </span>
                                    <Select
                                      options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
                                      value={formData.product_id ? { value: formData.product_id, label: formData.item_description } : null}
                                      //value={productOptions.find(option => option.id === formData.product_name)} // Adjust this line
                                      onChange={(selectedOption) => {
                                        setFormData({ ...formData, product_id: selectedOption.value, item_description: selectedOption.label });
                                        
                                      }}
                                      isSearchable
                                      placeholder="Select Product Name"
                                    />
                                  </div>

                                <div className="col-sm-3">
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

                                <div className="col-sm-3">
                                  <span className="textgreen">Section  </span>
                                  <Select
                                  options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                                 value={formData.section_id ? { value: formData.section_id, label: formData.section_name } : null}
                                  onChange={(selectedOption) => {
                                    
                                    setFormData({ ...formData, section_id: selectedOption.value, section_name: selectedOption.label });
                                  }}
                                  isSearchable
                                  placeholder="Select Section"
                                />
                                </div>
                                <div className="col-sm-3">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-md"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>

                        </form>


                        

                          <div>
  {fdate && tdate ? (
    <>
      <h6 className="header-filter">
        <span class="textred" >[{fdate}] - [{tdate}]</span><span className="textgreen"> [{itemDescription}-{line}-{sectionFromResponse}]</span>
        
      </h6>
    </>
  ) : (
    <span className="textred">{currentDate}</span>
  )}
</div>


                        <div className="table-responsive">


                            <table id="example" className="display">
                                <thead>
                                    <tr>
                                        <th>Emp Name</th>
                                        <th>Emp ID</th>
                                        
                                        <th>Product Name</th>
                                         <th>Section</th>
                                        <th>Line</th>
                                       
                                        <th>Target</th>
                                        <th>Total Complete</th>
                                        <th>Efficiency</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                            </table>
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
}

export default WorkerEfficiencyReport;
