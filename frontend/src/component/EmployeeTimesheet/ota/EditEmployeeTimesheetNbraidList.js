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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function EditEmployeeTimesheetNbraidList() {
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
  const [totalComplete, setTotalComplete] = useState(0);
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');

  //alert(roleId);
   //alert(userid);

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    
   
    product_name: '',
    line_no: '',
    section: '',
    eid: '',
    
  });



   const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

 
  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    //alert(JSON.stringify(updatedFormData));

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: 'http://192.168.29.243:4000/updatenbraidotadata',
      method: 'POST',
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        //setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.push('/employeetimesheet/otalist');
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Record Not Updated'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
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
    document.title = 'Timesheet Edit';

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      //alert(id);

      $.ajax({
        url: `http://192.168.29.243:4000/getnbraidotadata/${id}`, // Replace with your API endpoint URL
        method: 'GET',
        success: function (response) {
          //const { timesheet } = response;
          //alert(JSON.stringify(response));
           //setData(timesheet);
           const { worker, item_description, section_name, line, entry_id, id} = response[0]; 

           
           setFormData({ worker, item_description, section_name, line, entry_id, id });
          
          
        },
        error: function (xhr, status, error) {
          console.error('Error fetching data:', error);
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
          setColorOptions(response); // Update colorOptions state here
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchProductOptions();

    

  }, [history, id]);

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

 

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Update Your Details (<span className="textred">{formData.worker}</span>)  (<span className="textred">{formData.entry_id}</span>)
            </h5>
            <hr></hr>

             
            <br></br>
            <form  onSubmit={handleSubmit} method='POST'>
             <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
            <div className="row space">

              <div className="col-sm-4">
                  <span >Name </span>
                   
                </div>
                <div className="col-sm-8">
                    
                    <input type="text" class="form-control"  name="name"  value={formData.worker} disabled/>
                  </div>

                
               

               </div>
              <div className="row space">

              <div className="col-sm-4">
                  <span >Product Name </span>
                    <input type="text" class="form-control"  name="productc"  value={formData.item_description} disabled/>
                </div>
                <div className="col-sm-4">
                    <span >Line No </span>
                    <input type="text" class="form-control"  name="linec"  value={formData.line} disabled/>
                  </div>

                 <div className="col-sm-4">
                    <span >Section </span>
                    <input type="text" class="form-control"  name="sectionc"  value={formData.section_name } disabled/>
                  </div>
               

               </div>
               <span className="textred">Change Product->Section->line</span>
              <div className="row space">
                <input type="hidden" class="form-control"  name="eid"  value={formData.id } readonly/>
                
                <div className="col-sm-4">
                  <span >Product Name <span className="textred">*</span></span>
                    <select
                  className="form-control"
                  name="product_name"
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => {
                    handleInputChange(e);
                    
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
                <div className="col-sm-4">
                    <span >Line No <span className="textred">*</span></span>
                    <select
                      name="line_no"
                      className="form-control subcat"
                      id="line_no"
                       value={formData.line_no} onChange={handleInputChange}
                    >
                      <option value="">Select Line No</option>
                      {lineOptions.map((lineOption) => (
                        <option key={lineOption.id} value={lineOption.id}>
                          {lineOption.line_name}
                        </option>
                      ))}
                    </select>
                  </div>

                 <div className="col-sm-4">
                    <span >Section <span className="textred">*</span></span>
                    <select
                      id="section"
                      className="form-control"
                      name="section"
                       value={formData.section} onChange={handleInputChange}
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
                    Update
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
              <div className="row space">
               </div>

          </form> 
      
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditEmployeeTimesheetNbraidList;
