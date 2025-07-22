import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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

export function EditItemCodeComponent(props) {
  const [sections, setSections] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
 const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  

  useEffect(() => {
    document.title = 'Edit Item Description';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match.params.id;
      const { item_description } = location.state || {};

      $.ajax({
        url: `http://192.168.29.243:4000/getsections/${itemId}`,
        method: 'GET',
        success: function (response) {
          setSections(response);
          
          const itemDescription = item_description || (response.length > 0 ? response[0].item_description : '');
          setFormData((prevFormData) => ({
            ...prevFormData,
            item_description: itemDescription,
          }));
        },
        error: function (xhr, status, error) {
          console.error('Error fetching sections:', error);
        },
      });

      // Fetch item data
$.ajax({
  url: `http://192.168.29.243:4000/getitemcodedata/${itemId}`,
  method: 'GET',
  success: function (response) {
    setItemData(response);
  
    // Populate input fields with fetched data
    if (response.length > 0) {
      const { product_code, product_des, color_id } = response[0];
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_code,
        product_des,
        color_id,
      }));
    }
  
    const table = tableRef.current;
    table.clear().rows.add(response).draw();
  },
  
  error: function (xhr, status, error) {
    console.error('Error fetching item data:', error);
  },
});

      $.ajax({
        url: `http://192.168.29.243:4000/getcolors`,
        method: 'GET',
        success: function (response) {
          setColorOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching colors:', error);
        },
      });

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, []);

  

 

  const getColorName = (colorId) => {
    const color = colorOptions.find((color) => color.id === colorId);
    return color ? color.color_name : '';
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    product_code: itemData.length > 0 ? itemData[0].product_code : '',
    product_des: itemData.length > 0 ? itemData[0].product_des : '',
    color_id: itemData.length > 0 ? itemData[0].color_id : '',
  });
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const itemId = props.match.params.id;
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `http://192.168.29.243:4000/updateitemcolor/${itemId}`,
      method: 'POST',
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        history.goBack();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('Failed to update ItemMaster Color'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
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
           <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
        {serverMessage && <div className="alert">{serverMessage}</div>}
      </div>
            <form onSubmit={handleSubmit} method="POST">
              <h5>Edit Item Description</h5>
              <hr />

              <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Product Code <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <input
                    type="text"
                    className="form-control margin-bottom required"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Product Description <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <input
                    type="text"
                    className="form-control margin-bottom required"
                    name="product_des"
                    value={formData.product_des}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Color <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <select
                    className="form-control"
                    id="color"
                    name="color_id"
                    value={formData.color_id}
                    onChange={handleInputChange}
                  >
                    <option>Select color</option>
                    {colorOptions.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.color_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-3 col-form-label"></label>

                <div className="col-sm-4">
                  <input
                    type="submit"
                    id="submit-data"
                    className="btn btn-success margin-bottom"
                    value="Update"
                    data-loading-text="Updating..."
                  />
                </div>
              </div>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditItemCodeComponent;
