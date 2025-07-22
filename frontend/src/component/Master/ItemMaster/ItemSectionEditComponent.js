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

export function ItemSectionEditComponent(props) {
  const [isActive, setActive] = useState(false);
  const [sections, setSections] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const handleEdit = (id) => {
    history.push(`/master/edit-itemsubcategory/${id}`);
  };

  useEffect(() => {
    document.title = 'Edit Target';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match.params.id;
      //alert(itemId);

      $.ajax({
        url: `http://192.168.29.243:4000/getsectionandtarget/${itemId}`,
        method: 'GET',
        success: function (response) {
          const { sectionName, targetUnit, target } = response;
        
          setFormData({
            sectionName: sectionName,
            targetUnit: targetUnit,
            target: target,
          });
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section and target:', error);
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
    window.handleEdit = handleEdit;
  }, []);
  
  const initializeTable = (data) => {
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }

      if (data.length > 0) {
        tableRef.current = $('#example').DataTable({
          data: data,
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
          columns: [
            { data: null },
            { data: 'section_name' },
            { data: 'target_unit' },
            { data: 'target' },
            { data: null },
          ],
          
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              },
            },
            {
              targets: 4,
              render: function (data, type, row, meta) {
                const id = row.id;
            
                return `
                  <button class="btn btn-sm btn-primary" onclick="window.handleEdit(${id})">Edit</button>
                `;
              },
            },
          ],
        });
      }
    });
  };

  const [formData, setFormData] = useState({
    sectionName: '',
    targetUnit: '',
    target: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  /*const handleSubmit = (event) => {
    event.preventDefault();
    const itemId = props.match.params.id; // Assuming the item ID is obtained from the route parameter
  
    const updatedData = {
      id: itemId,
      updatedtarget: formData.target,
    };
  
    fetch(`http://192.168.29.243:4000/updatesectiontarget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Updated data:', data);
        history.push('/master/item-master');
        // Perform any additional actions after successful update
        // For example, show a success message or redirect to another page
      })
      .catch((error) => {
        console.log(error);
        // Handle the error case
        // For example, show an error message to the user
      });
  };
*/

const handleSubmit = (event) => {
    event.preventDefault();
     const itemId = props.match.params.id; // Assuming the item ID is obtained from the route parameter
  
     const updatedData = {
      id: itemId,
      updatedtarget: formData.target,
    };
    $.ajax({
      url: 'http://192.168.29.243:4000/updatesectiontarget',
      method: 'POST',
      data: updatedData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Target already exists' ? 'alert alert-warning' : 'alert alert-success');
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
          <form onSubmit={handleSubmit} method="POST">
              <h5>Edit Target</h5>
              <hr />
              <div className="form-group row space">

                    <label className="col-sm-2 col-form-label" for="name"> Section Name</label>

                    <div class="col-sm-8">
                    <input
                  type="text"
                  className="form-control margin-bottom required"
                  name="sectionName"
                  value={formData.sectionName}
                  readOnly
                />
                    </div>
              </div>
              <div className="form-group row space">

                    <label className="col-sm-2 col-form-label" for="name"> UOM</label>

                    <div className="col-sm-8">
                    <input
                  type="text"
                  className="form-control margin-bottom required"
                  name="targetUnit"
                  value={formData.targetUnit}
                  readOnly
                />
                    </div>
              </div>

              <div className="form-group row space">

                    <label className="col-sm-2 col-form-label" for="name"> Target(Hourly) <span className="textred">*</span></label>

                    <div className="col-sm-8">
                    <input
                  type="text"
                  className="form-control margin-bottom"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                />
                    </div>
              </div>
              <div className="form-group row">

                    <label className="col-sm-2 col-form-label"></label>

                    <div className="col-sm-4">
                        <input type="submit" id="submit-data" class="btn btn-success margin-bottom"
                               value="Update" data-loading-text="Updating..." />
                        
                    </div>
              </div>

              </form>
            
          </div>
        </main>
      </section>
    </div>
  );
}

export default ItemSectionEditComponent;

