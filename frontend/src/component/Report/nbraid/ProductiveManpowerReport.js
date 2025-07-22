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

export function ProductiveManpowerReport() {
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
  const [lineOptions, setLineOptions] = useState([]);
  const history = useHistory();

   const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
const [product, setProduct] = useState('');
  const [line, setLine] = useState('');

  

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
    product_id: '',
    product_name: '',
    section_id: '',
    section_name: '',
    line_no: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'section_id') {
      const selectedSection = sectionOptions.find((section) => String(section.id) === value);
      const sectionName = selectedSection ? selectedSection.section_name : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        section_id: value,
        section_name: sectionName,
      }));
    } else if (name === 'product_id') {
      const selectedProduct = productOptions.find((product) => String(product.id) === value);
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
      url: 'http://192.168.29.243:4000/gethourlossreport',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        const { timesheet, fdate, tdate, product, line } = response;
        setData(timesheet);
        setFDate(fdate);
      setTDate(tdate);
       setProduct(product);
      setLine(line);

       // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

          // Initialize the DataTable with the updated data and filename
          initializeDataTable(timesheet, formattedDate);
      
        //initializeDataTable(timesheet);
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };

   const initializeDataTable = (timesheet, formattedDate) => {
  // Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#example')) {
    $('#example').DataTable().destroy();
  }

  //console.log('Initializing DataTable with data:', timesheet);

  // Initialize the DataTable with the updated data
  tableRef.current = $('#example').DataTable({
    dom: 'Bfrtip',
   buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID PRODUCTIVE MANPOWER REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
    data: timesheet, // Update the data option here
            columns: [
                {
                            data: null,
                            render: function (data, type, row) {
                              const workerDetails =
                                data.worker +
                                ' <b>[' +
                                data.entry_id +
                               ']</b>';

                             
                              return workerDetails;
                            }
              },
                { data: 'item_description', },
                { data: 'line', },
                {
                  data: 'regg',
                  render: function (data, type, row) {
                    // Check if 'row' and 'row.regg' are defined
                    if (row && row.regg) {
                      return row.regg;
                    } else {
                      return '';
                    }
                  }
                },

                 {
                  data: null,
                  render: function (data, type, row) {
                    // Assuming 'date_time' and 'regg' are in 'dd-mm-yyyy' format
                    const date1Parts = row.date_time.split('-');
                    const date2Parts = row.regg.split('-');
                    // Create Date objects by reversing the order of parts
                    const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
                    const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
                    // Calculate the time difference in milliseconds
                    const timeDiff = Math.abs(date2 - date1);
                    // Convert milliseconds to days
                    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    return daysDiff;
                  }
                },
                { data: 'section_name' },
                { data: 'target' },
                {
                  data: null,
                  render: function(data, type, row) {
                    var res = row.HOUR1 + row.HOUR2 + row.HOUR3 + row.HOUR4 + row.HOUR5 + row.HOUR6 + row.HOUR7 + row.HOUR8 + row.HOUR9 + row.HOUR10 + row.HOUR11;
                    if (res !== '') {
                      return `<span style="color:red;">${res}</span>`;
                    } else {
                      return 'NA';
                    }
                  }
                },
                {
                  data: null,
                  render: function(data, type, row) {
                    var res = row.HOUR1 + row.HOUR2 + row.HOUR3 + row.HOUR4 + row.HOUR5 + row.HOUR6 + row.HOUR7 + row.HOUR8 + row.HOUR9 + row.HOUR10 + row.HOUR11;
                    var target = row.target;
                    var bal = target - res;
                    return bal;
                  }
                },
                {
                  data: null,
                  render: function(data, type, row) {
                    const ht = row.target / 8;
                    const re = ht.toFixed(2);
                    return re;
                  }
                },                  
                {
                  data: null,
                  render: function(data, type, row) {
                    const com = row.HOUR1 + row.HOUR2 + row.HOUR3 + row.HOUR4 + row.HOUR5 + row.HOUR6 + row.HOUR7 + row.HOUR8 + row.HOUR9 + row.HOUR10 + row.HOUR11;
                    const ha = com / 8;
                    const formattedHa = ha.toFixed(2);
                    return formattedHa;
                  }
                },
                {
                  data: null,
                  render: function(data, type, row) {
                    const com = row.HOUR1 + row.HOUR2 + row.HOUR3 + row.HOUR4 + row.HOUR5 + row.HOUR6 + row.HOUR7 + row.HOUR8 + row.HOUR9 + row.HOUR10 + row.HOUR11;
                    const ht = row.target / 8;
                    const ha = com / 8;
                    const hl = ((ht - ha) / 60) * 8;
                    const formattedHl = hl.toFixed(2);
                    return formattedHl;
                  }
                },
                {
                    data: 'date_time',
                   
                  },

            ],
        });
    };




useEffect(() => {
  document.title = 'Performance Manpower';
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');

  const fetchAndInitializeData = async () => {
    try {
      const response = await fetch('http://192.168.29.243:4000/gethourlossreportdefault');
      const data = await response.json();
      setData(data.timesheet);
      setCurrentDate(data.date);
      // Format the date as "DD-MM-YYYY"
          const formattedDate = data.date;

      initializeDataTable(data.timesheet, formattedDate);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (!isLoggedIn) {
    history.push('/login');
  } else {
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }
    fetchAndInitializeData();

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

    fetchProductOptions();
    fetchLineOptions();
  }
}, [history]);

   



    return (
        <div className="container">
            <Sidebar />

            <section id="content">
                <Header />

                <main>
                    <div className="container dt">
                        <h5 className="title">Productive Manpower</h5>
                        <br></br>
                        <h5 className="title">Date Range</h5>
                        <hr></hr>
                        <form onSubmit={handleSubmit} method='POST'>
                            <div className="row space">
                                <div className="col-sm-2">
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
                                <div className="col-sm-2">
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


                         <div>
  {fdate && tdate ? (
    <>
      <h6 className="header-filter">
        <span className="textgreen">{product}</span>-><span className="textblue">{line}</span><span className="textred">[{fdate} - {tdate}]</span>
        
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
                                    <th>Worker name/id</th>
                                    <th>Product Name</th>
                                     <th>Line No</th>
                                    <th>Date of Joining</th>
                                    <th>Total No of Days</th>
                                      <th>Section</th>
                                      <th>Target</th>
                                      <th>Achieve</th>
                                      <th>Balance</th>
                                     <th>Hourly Target</th>
                                     <th>Hourly ACH</th>
                                     <th>Hour Loss</th>
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

export default ProductiveManpowerReport;
