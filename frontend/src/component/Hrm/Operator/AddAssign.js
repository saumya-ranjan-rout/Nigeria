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
import Sidebar from '../../Sidebar';
import Header from '../../Header';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom'

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import config from '../../../config';

export function AddAssign() {
  const { id } = useParams()
  const [operator, setOperator] = useState('')
  const [shift, setShift] = useState([])
  const [section, setSection] = useState([])
  const [user, setUser] = useState('');
  const [items, setItems] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const roleId = localStorage.getItem('roleid');
  const userid = localStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const animatedComponents = makeAnimated();
  const animatedComponents2 = makeAnimated();

  const history = useHistory();



  useEffect(() => {

    document.title = 'Add Assign Operator';
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

      const fetchUserName = () => {
        $.ajax({
          url: `${config.apiUrl}/operator/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {

            setOperator(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
      fetchUserName();

      // Fetch Shift type from API
      const fetchshift = () => {
        $.ajax({
          url: `${config.apiUrl}/shift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShift(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchshift();

      // Fetch section type from API
      const fetchSection = () => {
        $.ajax({
          url: `${config.apiUrl}/section`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSection(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
          },
        });
      }
      fetchSection();
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
  }, []);

  //get user id
  useEffect(() => {
    if (operator && operator.entryid) {
      $.ajax({
        url: `${config.apiUrl}/user/${operator.entryid}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setUser(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('operator or entryid is undefined.');
    }
  }, [operator]);

  //get items
  useEffect(() => {
    if (user && user.id) {
      $.ajax({
        url: `${config.apiUrl}/operator/assignment/${user.id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('operator or entryid is undefined.');
    }
  }, [user]);

  //submit assign data
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
    const products = selectedProducts.map((product) => `${product.value}`).join(',');
    const sections = selectedSections.map((section) => `${section.value}`).join(',');
    const insertFormdata = { ...formData, id: user.id, product_name: products, section: sections, selectedProducts: selectedProducts, selectedSections: selectedSections };
    const jsonData = JSON.stringify(insertFormdata);
    $.ajax({
      url: `${config.apiUrl}/operator/assign-work`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        alert(response.message);
        if (response.success) {
          window.location.reload();
        }
      },
      error: function (xhr, status, error) {
        console.log(error);
        alert(error);
      },
    });
  }


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/operator/assignment/delete/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response.message);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  //////////////
  //Data table filter search
  const [searchValue, setSearchValue] = useState('')
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value)
  }

  const filteredData = items.filter((row) => {
    // Check if row.section_name is not null or undefined before calling toLowerCase
    return row.section_name && row.section_name.toLowerCase().includes(searchValue.toLowerCase());
  })
  //For check box
  const [checkedItems, setCheckedItems] = useState([])
  const [isChecked, setIsEnabled] = useState(false)

  const handleCheckAll = (event) => {
    const { checked } = event.target

    if (checked) {
      setIsEnabled(true)
      // Get the IDs of all items in your table and set them in the state
      const allItemIds = items.map((item) => item.id)
      setCheckedItems(allItemIds)
    } else {
      setIsEnabled(false)
      // Uncheck all items
      setCheckedItems([])
    }
  }
  //Variable set for send tomove
  const [checkboxValue, setCheckboxValue] = useState('')

  const handleCheckSingle = (event, itemId) => {
    const { checked } = event.target
    setCheckboxValue(itemId)
    if (checked) {
      setIsEnabled(true)
      // Add the item ID to the checkedItems array
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, itemId])
    } else {
      setIsEnabled(false)
      // Remove the item ID from the checkedItems array
      setCheckedItems((prevCheckedItems) => prevCheckedItems.filter((id) => id !== itemId))
    }
  }

  const handleMove = () => {
    const id = user.id;
    const chkvalue = checkedItems.join(',');
    const redirectURL = `/hrm/multipleassign/${id}/${chkvalue}`;
    history.push(redirectURL);
  };
  return (
        <div className="container-fluid">
      <div id="layout">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Add New Section For   <span style={{ color: 'red' }}>{operator.name}</span></h5>
            <hr></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Site <span className='textred'>*</span></span>
                  <select
                    id="site"
                    required
                    className="form-control"
                    name="site"
                    value={formData.site}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="NAKURU">NAKURU</option>
                    <option value="LIKONI">LIKONI</option>
                    <option value="MLOLONGO">MLOLONGO</option>
                  </select>
                </div>
                <div className="col-sm-2">
                  <span className="textgreen">Shift <span className='textred'>*</span></span>
                  <select className="form-control" name="shift" value={formData.shift} required onChange={handleInputChange}>
                    <option value="">Choose</option>
                    {shift.map((shiftnm) => (
                      <option
                        key={shiftnm.id}
                        value={shiftnm.name}
                      >
                        {shiftnm.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-3">
                  <span className="textgreen">Product Name <span className='textred'>*</span></span>


                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    required
                    name="product_name"
                    options={productOptions.map((productOption) => ({
                      value: productOption.id,
                      label: `${productOption.item_description}`,
                    }))}
                    value={selectedProducts}
                    onChange={(selectedProducts) => {
                      setSelectedProducts(selectedProducts);
                    }}
                    isSearchable
                    placeholder="Choose Product"
                  />
                </div>


                <div className="col-sm-3">
                  <span className="textgreen"> Section Name <span className='textred'>*</span></span>


                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents2}
                    isMulti
                    required
                    name="section"
                    options={section.map((sectionOption) => ({
                      value: sectionOption.id,
                      label: `${sectionOption.section_name}`,
                    }))}
                    value={selectedSections}
                    onChange={(selectedOptions) => {
                      setSelectedSections(selectedOptions);
                    }}
                    isSearchable
                    placeholder="Choose Section"
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


            {/* Display Input Field Values */}
            <div style={{ display: 'flex' }}>
              <input
                className='form-control'
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search..."
                style={{ width: '80%' }}
              /> &nbsp;&nbsp;
              <button
                className='btn btn-success'
                style={{ color: '#fff' }}
                disabled={!isChecked}
                type="submit"
                onClick={handleMove}
              >
                Move
              </button>
            </div>


            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={handleCheckAll} />All</th>
                    <th>#</th>
                    <th>Product name</th>
                    <th>Section name</th>
                    <th>Shift</th>
                    <th>Site</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={row.id}>
                      <td scope="row">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(row.id)}
                          onChange={(event) => handleCheckSingle(event, row.id)}
                          name="check[]"
                          value={row.id}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{row.item_description}</td>

                      <td>{row.section_name}</td>

                      <td>{row.shift}</td>
                      <td>{row.site}</td>
                      <td>
                        <button className="btn btn-danger" style={btnStyle} onClick={() => handleDelete(row.id)}>
                          <i class="bx bxs-trash"></i>
                        </button>
                      </td>
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
  );
}

export default AddAssign;
