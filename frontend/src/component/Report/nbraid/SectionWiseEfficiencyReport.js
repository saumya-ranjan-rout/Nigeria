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

import Sidebar from '../Sidebar';
import Header from '../Header';
import $ from 'jquery';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function SectionWiseEfficiencyReport() {
  
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [productOptions, setProductOptions] = useState([]);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(0);
   // const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected

   

    const history = useHistory();

    const [formData, setFormData] = useState({
        fromdate: '',
        todate: '',
        category: '',
        category_name:'',
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
        } 
        else if (name === 'category') {
            const selectedCategory = categoryOptions.find(category => String(category.id) === value);
            const categoryName = selectedCategory ? selectedCategory.category_name : '';
            setFormData((prevFormData) => ({
                ...prevFormData,
                category: value,
                category_name: categoryName,
            }));
        } 
        
        
        
        
        else {
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
            url: 'http://192.168.56.1:4000/getsectionwiseefficiencyreportData',
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
                { data: 'category_name' },
                { data: 'item_description' },

                { data: 'section_name', },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const complete = row.comp;
                            if (complete != 0) {
                                const st = row.actual_target * row.tt;
                                // Calculate the efficiency
                                const efficiency = (complete / st) * 100;
                                const formattedEfficiency = efficiency.toFixed(2);

                                // Return the formatted efficiency percentage for display
                                return formattedEfficiency + '%';
                            }
                            else {
                                return "N/A";
                            }

                        }
                        return data;
                    },
                },
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


            ],
        });
    };




    useEffect(() => {

        document.title = 'SectionWise Efficiency Report';
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
                url: 'http://192.168.56.1:4000/getsectionwiseefficiencyreportData',
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


        // Fetch category options from API
        const fetchCategoryOptions = () => {
            $.ajax({
                url: 'http://192.168.56.1:4000/ic',
                method: 'GET',
                success: function (response) {
                    setCategoryOptions(response);
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching category options:', error);
                },
            });
        };

        fetchCategoryOptions();

        // Fetch section options from API
        const fetchSectionOptions = () => {
            $.ajax({
                url: 'http://192.168.56.1:4000/getSectionOptions',
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
                url: 'http://192.168.56.1:4000/getProductOptions',
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
                        <h5 className="title">Sectionwise Efficiency</h5>
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
                                 
                                <div className="col-sm-2">
                                    <span className="textgreen">Category</span>
                                    <select
                                        id="category"
                                        className="form-control"
                                        name="category"
                                        value={formData.category} onChange={handleInputChange}
                                    >
                                        <option value="">Select Category</option>
                                        {categoryOptions.map((categoryOption) => (
                                            <option key={categoryOption.id} value={categoryOption.id}>
                                                {categoryOption.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-3">
                                    <span className="textgreen">Product Name</span>
                                    <select
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



                                <div className="col-sm-2">
                                    <span className="textgreen">Section</span>
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
                            <h4 class="header-filter"> <span class="textred" >{startDate && endDate ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{startDate && endDate ? `[${formData.category_name}-${formData.product_name}-${formData.section_name}]` : ""}</span></h4>
                        </div>


                        <div className="table-responsive">


                            <table id="example" className="display">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Product</th>
                                        <th>Section</th>
                                        <th>Productivity %</th>
                                        <th>Date (d/m/Y)</th>
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

export default SectionWiseEfficiencyReport;
