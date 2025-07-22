import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
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
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';

export function MultipleZoneChange() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);

  const [data, setData] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const [entryIds, setEntryIds] = useState('');
  // State variable to hold the server response message
  const [serverMessage, setServerMessage] = useState('');

  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
  const [isEntryIdExpanded, setEntryIdExpanded] = useState(false);
  //const entryIdsArray = entryIds.split(',');

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const animatedComponents = makeAnimated();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  const location = useLocation();
  // const { timesheet } = location.state;


  // Extract product and section values from the first item in the timesheet data
  //const products = timesheet.length > 0 ? timesheet[0].product : '';
  //const sections = timesheet.length > 0 ? timesheet[0].section_id : '';

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const history = useHistory();

  const [formData, setFormData] = useState({
    product_name: '',
    section: '',
    entryIds: '',


  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });

  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedProductIds = selectedProducts.map((product) => `${product.value}`).join(',');
    const selectedSectionIds = selectedSections.map((section) => `${section.value}`).join(',');
    const updatedFormData = { ...formData };
    updatedFormData.product_name = selectedProductIds;
    updatedFormData.section = selectedSectionIds;

    // Include the product, and section values from hidden fields in the formData
    //updatedFormData.oldproduct = products;
    //updatedFormData.oldsectionid = sections;

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);
    //return;
    $.ajax({
      url: `${config.apiUrl}/worker/zone/update`,
      method: "PUT",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Display the success message from the server response
        // alert(response.message);

        // Set the server response message in the state variable
        setServerMessage(response.message);

        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          history.goBack();
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
        // Display the error message or handle errors as needed
      },
    });
  };




  useEffect(() => {

    document.title = 'Change Multiple Employee';
    //alert('Extracted entryIdsArray: ' + entryIdsArray);
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      // Send the entryIdsArray in the API call
      //const jsonData = JSON.stringify({ entryIds: entryIdsArray });

      $.ajax({
        url: `${config.apiUrl}/worker/workers/${entryIdsArray}`,
        method: 'GET', // Change the method to POST for sending the entryIdsArray
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          // Access the timesheet results from the response object
          const timesheetData = response;

          // Update the component state with the timesheet data
          setData(timesheetData);

          // Extract the entry IDs from the response
          const entryIds = timesheetData.map((item) => item.entryid).join(',');

          // Update the entryIds state with the formatted string
          setEntryIds(entryIds);

          // Convert the entryIdsArray into a comma-separated string
          const entryIdsString = entryIdsArray.join(',');

          // Set the formData state including entryIds
          setFormData((prevFormData) => ({
            ...prevFormData,
            entryIds: entryIdsString,
          }));

          // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Initialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            // DataTable options...
          });
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });



      // Fetch shift options from API
      const fetchShiftOptions = () => {
        $.ajax({
          // API URL for fetching shift options
          url: `${config.apiUrl}/shift`,
          method: 'GET',
          headers: customHeaders,
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
          url: `${config.apiUrl}/section`,
          method: 'GET',
          headers: customHeaders,
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
          url: `${config.apiUrl}/item`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setProductOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching product options:', error);
          },
        });
      };

      fetchProductOptions();


    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      entryIds: entryIds,
    }));


  }, []);



  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };

  const toggleRM = () => {
    setEntryIdExpanded((prevExpanded) => !prevExpanded);
  };


  return (
       <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">

            <div className="row">
              <div className="col-sm-12">
                {/* Show the server response message in this div */}
                {serverMessage && <div className="alert alert-info">{serverMessage}</div>}
              </div>
            </div>
            <h5 className="title">Multiple Change Employee</h5>
            <hr></hr>

            <div style={{ fontWeight: 'bold' }} className='readmore'>
              <p className='c'>

                Changes for :<br />
                <b>Employees :</b>


                {isEntryIdExpanded ? (
                  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}> {entryIds}</span>
                ) : (
                  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}> {entryIds.slice(0, 150) + '...'}</span>
                )}
                <a href="javascript:void(0);" onClick={toggleRM}>
                  {isEntryIdExpanded ? 'Show Less EntryId' : 'Show More EntryId'}
                </a>
              </p>
            </div>

            <br></br>
            <form onSubmit={handleSubmit} method='POST'>

              <div className="row space ">
                <input type="hidden" name="entryIds" value={formData.entryIds} />
                {/* Input elements to store the product, and section values */}
                {/* <input type="text" name="products" value={products} /> */}
                {/* <input type="text" name="sections" value={sections} /> */}

                <div className="col-sm-3">
                  <span className="textgreen">Product Name<span className='textred'> *</span></span>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    required
                    name="product_name"
                    id="product_name"
                    options={productOptions.map((productOption) => ({
                      value: productOption.id,
                      label: `${productOption.item_description}`,
                    }))}
                    value={selectedProducts}
                    onChange={(selectedOptions) => {
                      setSelectedProducts(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                    }}
                    isSearchable
                    placeholder="Choose Products"
                  />
                </div>

                <div className="col-sm-3">
                  <span className="textgreen">Section Name <span className='textred'> *</span></span>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    required
                    name="section"
                    id="section"
                    options={sectionOptions.map((sectionOption) => ({
                      value: sectionOption.id,
                      label: `${sectionOption.section_name}`,
                    }))}
                    value={selectedSections}
                    onChange={(selectedOptions) => {
                      setSelectedSections(selectedOptions);
                    }}
                    isSearchable
                    placeholder="Choose Sections"
                  />
                </div>

                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
            <hr style={{ paddingBottom: '300px' }}></hr>




          </div>
        </main>
      </section>
    </div>
    </div>
  );
}

export default MultipleZoneChange;
