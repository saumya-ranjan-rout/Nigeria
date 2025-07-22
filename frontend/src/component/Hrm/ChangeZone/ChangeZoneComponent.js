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
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';

export function ChangeZoneComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  const [productOptions, setProductOptions] = useState([]);
  const [data, setData] = useState([]);
  const [itemDescriptionValue, setItemDescriptionValue] = useState('');
  const [sectionValue, setSectionValue] = useState('');
  const [shiftValue, setShiftValue] = useState('');
  const [siteValue, setSiteValue] = useState('');
  const [totalWorkerValue, setTotalWorkerValue] = useState('');

  const animatedComponents = makeAnimated();
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
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

  const [formData, setFormData] = useState({
    shift: '',
    product_name: '',
    site: '',
    section: '',


  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

  };


  const handleSubmit = (event) => {
    event.preventDefault();

    const site = formData.site;
    const shift = formData.shift;
    const product = formData.product_name;
    const section = formData.section;

    // Encode parameters before appending to the URL
    const encodedShift = encodeURIComponent(shift);
    const encodedSite = encodeURIComponent(site);
    const encodedSection = encodeURIComponent(section);
    const encodedProduct = encodeURIComponent(product);

    // Build the URL with encoded query parameters
    var url = `${config.apiUrl}/worker/zone?query=true`;

    if (product !== '' && product !== undefined && product != null) {
      url += `&product=${encodedProduct}`;
    }
    if (site !== '' && site !== undefined && site != null) {
      url += `&site=${encodedSite}`;
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      url += `&shift=${encodedShift}`;
    }
    if (section !== '' && section !== undefined && section != null) {
      url += `&section=${encodedSection}`;
    }

    setSelectedEmployees([]);
    //alert(url);
    setLoading(true);
    $.ajax({
      url: url,
      method: "GET",
      headers: customHeaders,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, row, site, shift, product_name, section } = response;

        // Update the component state with the timesheet data
        setData(timesheet);

        setEmployeeOptions(timesheet);
        // Use the find() method to get the product object with the matching ID
        const product = productOptions.find((product) => product.id == product_name);

        // Check if the product is found, and get the name if it exists
        const itemDescriptionValue = product ? product.item_description : '';

        // Set the item_description value in the state
        setItemDescriptionValue(itemDescriptionValue);

        const sec = sectionOptions.find((section1) => section1.id == section);
        const sectionValue = sec ? sec.section_name : '';
        // Set the item_description value in the state
        setSectionValue(sectionValue);

        // Set the item_description value in the state
        setShiftValue(shift);

        // Set the item_description value in the state
        setSiteValue(site);
        setTotalWorkerValue(timesheet.length);
        setLoading(false);
      },
      error: function (xhr, status, error) {
        setLoading(false);
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







  useEffect(() => {

    document.title = 'Employees List';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {
      setLoading(true);
      $.ajax({
        url: `${config.apiUrl}/worker/zone`,
        method: 'GET',
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response;

          // Update the component state with the timesheet data
          setData(timesheet);
          setEmployeeOptions(timesheet);
          setTotalWorkerValue(timesheet.length);
          setLoading(false);
        },
        error: function (xhr, status, error) {
          setLoading(false);
          console.error('Error:', error);
        },
      });



    }


    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
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

  }, []);

  const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    history.push('/login');
  };




  const [searchValue, setSearchValue] = useState('');


  const handleSearch = (event) => {
    setSearchValue(event.target.value);
    //alert(event.target.value);
  };



  const filteredData = data.filter((item) => {
    return (
      (item.name && item.name.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.entryid && item.entryid.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.product && item.product.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.site && item.site.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.section && item.section.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.hour && item.hour.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.target && item.target.toLowerCase().includes(searchValue.toLowerCase()))
    );
  });





  // Add these lines to define the missing variables and functions
  const [checkedItems, setCheckedItems] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);


  const handleCheckAll = (event) => {
    const { checked } = event.target;

    if (checked) {
      setIsEnabled(true);
      setIsChecked(true); // Update the isChecked state to true when selecting all
      // Get the IDs of all items in your table and set them in the state
      const allItemIds = data.map((item) => item.id);
      setCheckedItems(allItemIds);
    } else {
      setIsEnabled(false);
      setIsChecked(false); // Update the isChecked state to false when deselecting all
      // Uncheck all items
      setCheckedItems([]);
    }
  };

  const handleMove = (entryIds, timesheet) => {
    // Redirect to the "Multiple Change" page with the selected entryid(s) as query parameters
    //const queryParams = checkedItems.map((id) => `entryIds=${id}`).join('&');
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
    //alert(JSON.stringify(checkedItems));
    //alert(queryParams);
    //alert(JSON.stringify(selectedEmployees));
    history.push(`/hrm/multiplechangezone?${queryParams}`, { timesheet });
  };


  const handleCheckSingle = (event, itemId, entryId) => {
    const { checked } = event.target;

    if (checked) {
      setIsChecked(true);
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, itemId]);
      setSelectedEntryId(entryId); // Set the selected entryid
    } else {
      setIsChecked(false);
      setCheckedItems((prevCheckedItems) => prevCheckedItems.filter((id) => id !== itemId));
      setSelectedEntryId(''); // Clear the selected entryid if unchecked
    }
  };








  return (
    <>
      {
        loading ? (
          <div className="loader-overlay" >
            <div className="loader"></div>
          </div>
        ) : (
          <div>{/* Render your content */}</div>
        )
      }
          <div className="container-fluid">
      <div id="layout">
        <Sidebar />

        <section id="content">
          <Header />

          <main>
            <div className="container dt">
              <h5 className="title">Change Zone[Filter]</h5>
              <hr></hr>
              <form onSubmit={handleSubmit} method='POST'>

                <div className="row space ">
                  <div className="col-sm-2">
                    <span className="textgreen">Site</span>
                    <select className="form-control" name="site" id="site" value={formData.site} onChange={handleInputChange}>
                      <option value=""> Select</option>
                      <option value="NAKURU"> NAKURU</option>
                      <option value="LIKONI"> LIKONI</option>
                      <option value="MLOLONGO"> MLOLONGO</option>
                    </select>
                  </div>
                  <div className="col-sm-2">
                    <span className="textgreen">Shift</span>
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
                  <div className="col-sm-3">
                    <span className="textgreen">Product Name</span>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable
                      name="product_name"
                      placeholder="Choose Product"
                      // options={productOptions.map((productOption) => ({
                      //   value: productOption.id,
                      //   label: `${productOption.item_description}`,
                      // }))}
                      options={[
                        { value: '', label: 'Select' }, // Add this line for the "Select" option
                        ...productOptions.map((productOption) => ({
                          value: productOption.id,
                          label: `${productOption.item_description}`,
                        }))
                      ]}

                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        setFormData((prevFormData) => ({ ...prevFormData, product_name: selectedValue }));
                      }}
                    />
                  </div>

                  <div className="col-sm-3">
                    <span className="textgreen">Section</span>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable
                      name="section"
                      placeholder="Choose Section"
                      // options={sectionOptions.map((sectionOption) => ({
                      //   value: sectionOption.id,
                      //   label: `${sectionOption.section_name}`,
                      // }))}

                      options={[
                        { value: '', label: 'Select' }, // Add this line for the "Select" option
                        ...sectionOptions.map((sectionOption) => ({
                          value: sectionOption.id,
                          label: `${sectionOption.section_name}`,
                        }))
                      ]}

                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        setFormData((prevFormData) => ({ ...prevFormData, section: selectedValue }));
                      }}
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
              <hr></hr>
              <div className="row space">
                <div className="col-sm-4"> <input className="form-control" id="myInput" type="text" placeholder="Search.." value={searchValue}
                  onChange={handleSearch} />
                </div>
                <div className="col-sm-2">
                </div>
                <div className="col-sm-4">
                  {/* <span className="textgreen">Choose Operator*</span> */}
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    required
                    name="employees_id"
                    options={employeeOptions.map((employeeOption) => ({
                      value: employeeOption.id,
                      label: `${employeeOption.entryid} (${employeeOption.name})`,
                    }))}
                    value={selectedEmployees}
                    onChange={(selectedOptions) => {
                      setSelectedEmployees(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                    }}
                    isSearchable
                    placeholder="Choose Employees"
                  />


                </div>

                <div className="col-sm-2">
                  <input
                    className="btn btn-success btn-sm"
                    value="Multiple Change"
                    id="btnw"
                    readOnly=""
                    style={{ width: '150px', color: '#fff' }}
                    //onClick={() => handleMove(selectedEntryId)}
                    onClick={() => handleMove(selectedEmployees, data)}
                    disabled={selectedEmployees.length == 0}
                  />
                </div>

              </div>

              {/* Display Input Field Values */}

              <div>
                <h6 class="header-title"> Product : <span class="textgreen" >{itemDescriptionValue}</span>, Site : <span class="textgreen">{siteValue}</span>, Section Name : <span class="textgreen">{sectionValue}</span>, Shift : <span class="textgreen">{shiftValue}</span>,<span class="textred"> Total No of Worker </span> :{totalWorkerValue}</h6>
              </div>




              <div class="fixTableHead" style={{ overflow: 'scroll' }}>
                <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
                  <thead>
                    <tr style={{ backgroundColor: '#fff' }}>
                      {/* <th><input type="checkbox" onChange={handleCheckAll} />All</th> */}
                      <th>Entryid</th>
                      <th>Name</th>
                      <th>Site</th>
                      <th>UserRole</th>
                      <th>Worker Type<br />(Shift)</th>
                      <th>Product Name<br />Section</th>

                    </tr>
                  </thead>
                  <tbody>
                    {
                      filteredData.map((item, index) => (
                        <tr key={item.id}> {/* Use the id as the key */}
                          {/* <td><input
                          type="checkbox"
                          checked={checkedItems.includes(item.id)}
                          onChange={(e) => handleCheckSingle(e, item.id)}
                          name="check[]"
                          value={item.id}
                        /></td> */}

                          <td>{item.entryid}</td>
                          <td>{item.name}</td>
                          <td>{item.site}</td>
                          <td>{item.emptype}</td>
                          <td>{item.workertype}<br />({item.shift})</td>
                          <td> {item.item_names}
                            <br />
                            <b>Section :</b><span style={{ color: 'green' }}> {item.section_names}</span></td>


                        </tr>
                      ))}
                  </tbody>

                </table>
              </div>
            </div>
          </main>
        </section>
      </div>
      </div>
    </>
  );
}

export default ChangeZoneComponent;
