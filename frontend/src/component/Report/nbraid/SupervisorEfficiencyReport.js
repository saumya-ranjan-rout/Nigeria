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

export function SupervisorEfficiencyReport() {

    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const today = new Date(); // Get the current date
  

  const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(null);
    const [productOptions, setProductOptions] = useState([]);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(0);
    const [searchDate, setSearchDate] = useState([]);

    
   

    const history = useHistory();

    const [formData, setFormData] = useState({
        fromdate: '',
        
       
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'section_id') {
            //console.log("section_id" + value);
            //console.log(sectionOptions);
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
        //alert(jsonData);
        $.ajax({
            url: 'http://192.168.29.243:4000/get_supervisor_search',
            method: "POST",
            data: jsonData,
            processData: false,
            contentType: 'application/json',
            success: function (response) {

                // Access the timesheet results from the response object
                const { timesheet, date } = response;

                // Update the component state with the timesheet data
                setData(timesheet);
                setSearchDate(date);
                // Format the date as "DD-MM-YYYY"
          const formattedDate = date;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
                //initializeTable(response.timesheet);

                
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
        filename: `NON-BRAID SUPERVISOR EFFICIENCY REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
            data: timesheet, // Update the data option here
            columns: [
            
                { data: 'operator_name' },
               
                { data: 'item_description' },
                { data: 'line' },
                { data: 'section_name', },
                
                {
                    data: 'num_rows',
                    render: function(data, type, row) {
                        // If the rendering is for display, wrap the data in <strong> tag for bold
                        return type === 'display' ? '<strong>' + data + '</strong>' : data;
                    }
                },
                { data: 'totalTarget1' },
              
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const complete = row.value_sum;
                            const totalComplete = complete;
                            // Return the total sum for display
                            return totalComplete;
                        }
                        return data;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            const complete = row.value_sum;
                            if (complete != 0) {
                                const st = row.totalTarget1;
                                const efficiency = (complete / st) * 100;
                                const formattedEfficiency = efficiency.toFixed(2);
                                return formattedEfficiency + '%';
                            }
                            else {
                                return "N/A";
                            }

                        }
                        return data;
                    },
                },
                
            ],
        });
    };




    useEffect(() => {

        document.title = 'Supervisor Efficiency Report';
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
                url: 'http://192.168.29.243:4000/get_supervisoreff_default',
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
                    setSearchDate(date);

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

    }, []);

    const handleLogout = () => {
        // Perform any necessary logout actions here
        // For example, clearing session storage, removing tokens, etc.

        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        history.push('/login');
    };

 

    return (
        <div className="container">
            <Sidebar />

            <section id="content">
                <Header />

                <main>
                    <div className="container dt">
                        <h5 className="title">Supervisor Efficiency</h5>
                        <br></br>
                       <h5 className="title">Date Range</h5>
                        <hr></hr>
                        <form onSubmit={handleSubmit} method='POST'>
                            <div className="row space">
                               
                                        <div className="col-sm-6">
                                            <span className="textgreen">Date</span>
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
  {searchDate ? (
    <h6 className="header-filter">
      <span className="textred">{searchDate}</span>
    </h6>
  ) : (
    <span className="textred">{currentDate}</span>
  )}
</div>


                        <div className="table-responsive">


                            <table id="example" className="display">
                                <thead>
                                    <tr>
                                        <th>Supervisor Name</th>
                                        
                                        <th>Product Name</th>
                                        <th>Line</th>
                                        <th>Section</th>
                                        
                                        <th>Worker</th>
                                        <th>Item/Supervisor Target</th>
                                     
                                        <th>Complete</th>
                                        <th>Efficiency</th>
                                       
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

export default SupervisorEfficiencyReport;
