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

export function EditNewISCComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const { id } = useParams();

  const [formData, setFormData] = useState({
    subcategory_name: '',
    category_id: '',
  });

  

  useEffect(() => {
    document.title = 'Edit Item Subcategory';

    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      
     // Fetch item categories from API
    fetch('http://192.168.29.243:4000/itemcategories')
    .then(response => response.json())
    .then(response => {
      setCategories(response);
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => {
      // Once the categories are fetched and set, fetch the subcategory by ID
      if (id) {
        console.log('Subcategory ID:', id);
        fetch(`http://192.168.29.243:4000/itemsubcategory/${id}`)
          .then(response => response.json())
          .then(response => {
            const { subcategory_name, category_id } = response;
            setFormData({ subcategory_name, category_id });
          })
          .catch(error => {
            console.log(error);
          });
      }
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
  }, [history, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      category_id: formData.category_id,
      subcategory_name: formData.subcategory_name,
     
    };
  
    fetch(`http://192.168.29.243:4000/updateitemsubcategory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Updated data:', data);
        history.push('/master/item-subcategory');
        // Perform any additional actions after successful update
        // For example, show a success message or redirect to another page
      })
      .catch((error) => {
        console.log(error);
        // Handle the error case
        // For example, show an error message to the user
      });
  };

  return (
    <div className="container">
      <Sidebar />
      <section id="content">
      <Header />
        <main>
          <div className="container dt">
            <form onSubmit={handleSubmit} method="POST">
              <h5>Edit Item Subcategory</h5>
              <hr></hr>
              <div className="form-group row space">
                <label className="col-sm-2 col-form-label" htmlFor="category">
                  Category Name
                </label>
                <div className="col-sm-6">
                  {categories.length > 0 ? (
                    <select className="form-control" name="category_id" value={formData.category_id} onChange={handleInputChange}>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>Loading categories...</p>
                  )}
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label" htmlFor="subcategory_name">
                  Subcategory Name
                </label>
                <div className="col-sm-6">
                  <input
                    type="text"
                    placeholder=" Name"
                    className="form-control margin-bottom required"
                    name="subcategory_name"
                    value={formData.subcategory_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label"></label>
                <div className="col-sm-4">
                  <input type="submit" id="submit-data" className="btn btn-success margin-top" value="Update" data-loading-text="Updating..." />
                </div>
              </div>
            </form>
          </div>
        </main>
      </section>
    </div>
  );
}

export default EditNewISCComponent;
