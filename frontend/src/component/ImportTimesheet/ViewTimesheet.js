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
  import Sidebar from '../Sidebar';
  import Header from '../Header';
  import $ from 'jquery';
  import { Link } from 'react-router-dom';
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';

  export function ViewTimesheet() {
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
      if (name === 'fromdate') {
      setStartDate(new Date(value));
    } else if (name === 'todate') {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

// Define the handleHourChange function
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
    

  
useEffect(() => {

      document.title = 'View Timesheet';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        history.push('/login');
      } else {

      $.ajax({
      url: 'http://192.168.29.243:4000/viewtimesheet',
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setResponseDate(timesheet.length > 0 ? timesheet[0].date_time : ''); // Set the date_time value from the response



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
                            render: function (data, type, row) {
                              const workerDetails =
                                data.worker +
                                ' <b>' +
                                data.entry_id +
                                '</b>';
                              
                              return workerDetails;
                            }
                        },
                       {
                            data: 'HOUR1',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR2',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR3',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR4',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR5',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR6',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR7',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR8',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR9',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR10',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR11',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        
                          {
                            data: null,
                            render: function (data, type, row) {
                              if (type === 'display') {
                                // Calculate the total sum of hours for the current row
                                const totalSum = data.value_sum;
                                 

                                // Check if the total sum matches the target
                                if (totalSum == data.target) {
                                 
                                   return '<span class="bgsuccess">' + totalSum + '</span> <br><span class="bgsuccess">target completed</span>';
                                } else if (totalSum <= data.target) {
                                   return '<span class="bgdanger">' + totalSum + '</span> <br><span class="bgdanger">target pending</span>';
                                } else {
                                   return '<span class="bgwarning">' + totalSum + '</span> <br><span class="bgwarning">target exceed</span>';
                                }

                                // Return the calculated value with appropriate HTML formatting
                               // return '<span class="' + color + '">' + value + '</span>';
                              }

                              return data;
                            }
                          },

                          { 

                            data: null,
                                      render: function(data, type, row) {
                                          return '<span class="bgsuccess ">' + data.target+'</span>';
                                      }

                           },
                            {
                              data: null,
                              render: function (data, type, row) {
                                if (type === 'display') {
                                  // Calculate the total sum of hours for the current row
                                  const totalSum = data.value_sum;

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

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.item_description+'</b>';
                                    }

                            },
                            {

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.line+'</b>';
                                    }

                            },
                              { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.section_name+'</b>';
                                    }


                               },
                            { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.shift+'</b>';
                                    }


                               },
                           
                            { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.site+'</b>';
                                    }


                               },
                             
                              {

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.date_time+'</b>';
                                    }

                            },

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
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/workerdelete/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Item deleted:', data);
          // Refresh the list of items
          //fetchData();
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };
    

    return (
      <div className="container">
        <Sidebar />

        <section id="content">
          <Header />

          <main>
            <div className="container dt">
              <h5 className="title">View {' '}
             
              </h5>
              <br></br>
             
              
                
             
              <div className="table-responsive">
             

                <table id="example" className="display">
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
                      <th>Achievement</th>
                      <th>Target</th>
                      <th>Efficiency</th>
                      <th>Product</th>
                      <th>Line</th>
                      <th>Section</th>
                      <th>Shift</th>
                      <th>Site</th>
                      <th>Date</th>
                    </tr>
                  </thead>
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
                      <th>Achievement</th>
                      <th>Target</th>
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

  export default ViewTimesheet;
