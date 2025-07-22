import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

export function EditFgOutputComponentOtaNbraid() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [colorcodeOptions, setColorCodeOptions] = useState([]);
  const [data, setData] = useState([]);
   const [line, setLine] = useState('');
  const [totalComplete, setTotalComplete] = useState(0);
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

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    
    id: id,
    product_name: '',
    color_description: '',
    code: '',
    fromdate: '',
    hour: '',
    fgoutput: '',
     line_no: '',
      shift: '',
  });



   const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFgOutputChange = (event) => {
    const { value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      fgoutput: value,
    }));
  };

  const handleHourChange = (event) => {
    const { value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      hour: value,
    }));
  };



const handleDateChange = (date) => {
  // Adjust the date by adding 1 day
  const adjustedDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));


  // Update the formData state
  setFormData((prevFormData) => ({
    ...prevFormData,
    date: date,
  }));

  // Update the DatePicker state
  setStartDate(date);
};
  

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    //alert(JSON.stringify(updatedFormData));

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: 'http://192.168.29.243:4000/fg_output_update_ota_nbraid',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
       console.log(response);

      setServerMessage(response.message);
      if (response.status === 'Success') {
        setServerMessage(response.message);
        setServerMessageClass('alert alert-success');

        // Redirect after showing the success message
        setTimeout(() => {
          console.log('Navigating back...');
          history.goBack();
        }, 3000);
      } else {
        // Handle other UI updates for non-success cases
        setServerMessage(response.message);
        setServerMessageClass('alert alert-warning');
      }
      },
      error: function (xhr, status, error) {
      console.log(error);

      if (xhr.status === 409) {
        setServerMessage(xhr.responseJSON.message);
        setServerMessageClass('alert alert-danger');
      } else {
        setServerMessage(xhr.responseJSON.message);
        setServerMessageClass('alert alert-danger');
      }
    },
  });
};

  const handleDeleteRow = (index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
  };



const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
  };




 useEffect(() => {
    document.title = 'Edit FG Output';

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      //alert(id);

      $.ajax({
        url: `http://192.168.29.243:4000/getfgoutputDataOtanbraid/${id}`, // Replace with your API endpoint URL
        method: 'GET',
        success: function (response) {
          const { product_name, color_description, code, line, date, hour, fgoutput, shift } = response;
          //alert(JSON.stringify(response));

           setInitialProductId(product_name);

          // Update the form data state with the fetched values
          setFormData({
            ...formData,
            product_name,
            color_description: response.product_code,
            code: response.pcode,
            line_no: response.line,
            shift: response.shift,
            date,
            hour,
            fgoutput: response.fg_output, // Replace response.fgoutput with the correct property from the API response,
          });

          // Fetch color options based on the product_code
        fetchColorOptions(response.product_code);


         // Fetch line options based on the line_no
        //fetchLineOptions(response.line);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching data:', error);
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

    

    const fetchProductOptions = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getProductOptionsnbraid',
        method: 'GET',
        success: function (response) {
          setProductOptions(response);
          setColorOptions(response); // Update colorOptions state here
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchProductOptions();

    const fetchColorOptions = (productCode) => {
    $.ajax({
      url: `http://192.168.29.243:4000/getColorOptionsedit/${productCode}`,
      method: 'GET',
      success: function (response) {
        setColorOptions(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching color options:', error);
      },
    });
  };

    fetchColorOptions();

      /*const fetchLineOptions = (line) => {
    $.ajax({
      url: `http://192.168.29.243:4000/getLineOptions/${line}`,
      method: 'GET',
      success: function (response) {
        setLineOptions(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching Line options:', error);
      },
    });
  };

  fetchLineOptions();*/

  }, [history, id]);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  

   
 const [selectedOption, setSelectedOption] = useState(null);
  const [initialProductId, setInitialProductId] = useState(null);
  
  useEffect(() => {
    // Set the selected option based on the initialProductId
    // alert(JSON.stringify(productOptions));
    //alert(initialProductId);
    const initialOption = productOptions.find(option => option.id == initialProductId);
    //alert(JSON.stringify(initialOption));
    if (initialOption) {
      // alert("mkkk");
      setSelectedOption({ value: initialOption.id, label: initialOption.item_description });
    }
  }, [initialProductId, productOptions]);


  const handleProductChange = (e) => {
    const selectedProduct = e.value;
    getColorDescriptions(selectedProduct);
  };
  function getColorDescriptions(selectedProduct) {
    // Fetch color options based on the selected product
    $.ajax({
      url: `http://192.168.29.243:4000/getcolordescription/${selectedProduct}`,
      method: 'GET',
      success: function (response) {
        setColorOptions(response);
        //alert(JSON.stringify(response));
      },
      error: function (xhr, status, error) {
        console.error('Error fetching color options:', error);
      },
    });
  }

  const handleColorChange = (e) => {
    const selectedColor = e.target.value;
    if (!(selectedColor > 0)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        code: '',
      }));
      return;
    }
    // Make an API request based on the selected color description
    $.ajax({
    url: `http://192.168.29.243:4000/getproductcode/${selectedColor}`, // Replace with your API endpoint URL
    method: 'GET',
    success: function (response) {
      // Handle the response data
      console.log(response);
       setColorCodeOptions(response);
       //alert(JSON.stringify(response));
       const productCode = response; // Assuming the API response contains a property named "product_code"
       //alert(JSON.stringify(response));
      if (response.length > 0) {
        const productCode = response[0].product_code;
        const cleanedProductCode = productCode.replace(/"/g, '');
        // Update the formData state
          setFormData((prevFormData) => ({
            ...prevFormData,
            code: cleanedProductCode,
          }));
        //alert(cleanedProductCode);
        //console.log(productCode); // Log the product code for debugging
         setTimeout(function() {
          $('input[name="code"]').val(cleanedProductCode).prop('readonly', true); // Set the value of the input field
            }, 100); // Delay in milliseconds
        } else {
            console.log('Product code not found in API response.');
        }
    },
      error: function (xhr, status, error) {
        console.error('Error fetching data:', error);
      },
    });
  };


  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">FG Output Edit
            </h5>
            <hr></hr>
            <form  onSubmit={handleSubmit} method='POST'>
             <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
              <div className="row space">
                
                
               {/* <div className="col-sm-3">
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
                </div>*/}

                <div className="col-sm-3">
                    <span className="textgreen">Product Name </span>
                    

                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable
                      name="product_name"
                      placeholder="Select"
                      required
                      options={[
                        
                        ...productOptions.map((productOption) => ({
                          value: productOption.id,
                          label: `${productOption.item_description}`,
                        }))
                      ]}
                      value={selectedOption}
                      onChange={(selectedOption) => {
                        setSelectedOption(selectedOption);
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        setFormData((prevFormData) => ({ ...prevFormData, product_name: selectedValue, color_description: '', code: '' }));

                        if (selectedValue > 0) {
                          handleProductChange(selectedOption);
                        }
                        else {
                          setColorOptions([]);
                        }
                      }}
                    />

                  </div>

             
                

                <div className="col-sm-3">
                  <span className="textgreen">Color Description</span>
                <select
                  className="form-control"
                  name="color_description"
                  id="color_description"
                  value={formData.color_description}
                  onChange={(e) => {
                    handleInputChange(e);
                   handleColorChange(e);
                  }}
                >
                  
                  {colorOptions.map((colorOption) => (
                    <option key={colorOption.id} value={colorOption.id}>
                      {colorOption.product_des}
                    </option>
                  ))}
                </select>
                </div>


                <div class="col-sm-3">
                  <span class="textgreen">Color Code</span>
                  <input
                  type="text"
                  className="form-control margin-bottom required"
                  name="code"
                  id="code"
                  disabled
                  value={formData.code}
                />
                </div>
    
            {/*{roleId == 5 && (       
                <div className="col-sm-3">
                  <span className="textgreen">Line</span>
                  <select
                    name="line_no"
                    className="form-control subcat"
                    id="line_no"
                    value={formData.line_no}
                    onChange={handleInputChange}
                  >
                    
                    {lineOptions.map((lineOption) => (
                      <option key={lineOption.id} value={lineOption.id}>
                        {lineOption.line_name}
                      </option>
                    ))}
                  </select>
                </div>

                )}*/}

                
                <div className="col-sm-3">
                  <span className="textgreen">Line</span>
                  <select
                    name="line_no"
                    className="form-control subcat"
                    id="line_no"
                    value={formData.line_no}
                    onChange={handleInputChange}
                  >
                    <option value={formData.line_no}>{formData.line_no}</option>
                  </select>
                </div>
             
                

                 <div className="col-sm-2">
                  <span className="textgreen">Shift </span>
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

               
                
                <div class="form-group col-md-3" >
             <span className="textgreen">Hour</span>
               <select className="form-control" name="hour" id="hour" required="" value={formData.hour} onChange={handleInputChange}>
                 <option value="HOUR1">HOUR1</option>
                 <option value="HOUR2">HOUR2</option>
                 <option value="HOUR3">HOUR3</option>
                 <option value="HOUR4">HOUR4</option>
                 <option value="HOUR5">HOUR5</option>
                 <option value="HOUR6">HOUR6</option>
                 <option value="HOUR7">HOUR7</option>
                 <option value="HOUR8">HOUR8</option>
                 <option value="HOUR9">HOUR9</option>
                 <option value="HOUR10">HOUR10</option>
                 <option value="HOUR11">HOUR11</option>
                 
            
               </select>
             </div>

             <div class="col-sm-3 ">

                <span className="textgreen">Fg Output <span className="textred">*</span></span>
                        <input
                          type="text"
                          className="form-control margin-bottom required"
                          name="fgoutput"
                          placeholder=""
                          value={formData.fgoutput}
                          onChange={handleInputChange}
                          required
                        />
                   
                </div>

                <div className="col-sm-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Edit
                  </button>
                </div>
              </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>
               <div className="row space">
               </div>

          </form> 
      
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditFgOutputComponentOtaNbraid;
