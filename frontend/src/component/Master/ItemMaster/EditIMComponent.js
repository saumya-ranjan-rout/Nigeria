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

export function EditIMComponent(props) {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemData, setItemData] = useState([]);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    category_id: itemData.length > 0 ? itemData[0].category_id : '',
    item_group: itemData.length > 0 ? itemData[0].item_group : '',
    item_description: itemData.length > 0 ? itemData[0].item_description : '',
  });

  useEffect(() => {

    document.title = 'Edit Item Master';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match?.params?.id;
      const { item_description } = location.state || {};

      // Fetch item data
      $.ajax({
        url: `http://192.168.29.243:4000/edititemmaster/${itemId}`,
        method: 'GET',
        success: function (response) {
          setItemData(response);

          // Populate input fields with fetched data
          if (response.length > 0) {
            const { category_id, item_group, item_description, tppp, net_weight, targeted_waste } = response[0];
            setFormData((prevFormData) => ({
              ...prevFormData,
              category_id,
              item_group,
              item_description,
              tppp,
              net_weight,
              targeted_waste,

            }));
          }

         
        },

        error: function (xhr, status, error) {
          console.error('Error fetching item data:', error);
        },
      });


      // Fetch item categories from API
      $.ajax({
        url: 'http://192.168.29.243:4000/itemcategories', // Replace with your API endpoint
        method: 'GET',
        success: function (response) {
          setCategories(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });

      
    }
  }, [history, props.match, location.state]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const itemId = props.match.params.id;
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `http://192.168.29.243:4000/updateitemmaster/${itemId}`,
      method: 'POST',
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
         setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Section already exists' ? 'alert alert-warning' : 'alert alert-success');
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
          setServerMessage('An error occurred'); // Set the server message in state for other errors
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
            <form  onSubmit={handleSubmit}  method="POST">
              <h5>Item Master Edit</h5>
              <hr></hr>

              <div className="form-group row space">
                <div className="col-md-4">
                       
                        <span className="textgreen">Category Name <span className="textred">*</span></span>
                       
                          <select
                            className="form-control"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.category_name}
                              </option>
                            ))}
                          </select>
                        
                </div>
                <div className="col-md-4">
                     <span className="textgreen">ETA Code <span className="textred">*</span></span>
                       
                          <input
                    type="text"
                    className="form-control margin-bottom "
                    name="item_group"
                    value={formData.item_group}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">

                       <span className="textgreen">Item Name <span className="textred">*</span></span>
                       
                           <input
                    type="text"
                    className="form-control margin-bottom "
                    name="item_description"
                    value={formData.item_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
             <div className="form-group row space">
                <div className="col-md-4">
                       
                         <span className="textgreen">Targeted PPP <span className="textred">*</span></span>
                       
                           <input
                    type="text"
                    className="form-control margin-bottom "
                    name="tppp"
                    value={formData.tppp}
                    onChange={handleInputChange}
                    required
                  />
                        
                </div>
                <div className="col-md-4">
                     <span className="textgreen">Net Weight  <span className="textred">*</span></span>
                       
                          <input
                    type="text"
                    className="form-control margin-bottom "
                    name="net_weight"
                    value={formData.net_weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4">

                         <span className="textgreen">Targeted Waste <span className="textred">*</span></span>
                       
                           <input
                    type="text"
                    className="form-control margin-bottom "
                    name="targeted_waste"
                    value={formData.targeted_waste}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>


              

              <div className="form-group row">
                <label className="col-sm-11 col-form-label"></label>
                <div className="col-sm-11">
                  
                </div>
                <div className="col-sm-1">
                  <input type="submit" id="submit-data" className="btn btn-success margin-top" value="Edit" data-loading-text="Updating..." />
                </div>
              </div>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditIMComponent;
