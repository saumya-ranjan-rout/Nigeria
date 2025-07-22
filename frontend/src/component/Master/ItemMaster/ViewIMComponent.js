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
import Select from 'react-select';

export function ViewIMComponent(props) {
  const [isActive, setActive] = useState(false);
  const [sections, setSections] = useState([]);
  const tableRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
   const [sectionOptions, setSectionOptions] = useState([]);
    const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const [itemId, setItemId] = useState('');

  const handleEdit = (id) => {
    history.push(`/master/item-section-edit/${id}`);
  };

  useEffect(() => {
    document.title = 'Item Section';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match.params.id;
      const { item_description } = location.state || {};


        setItemId(itemId);
      

      $.ajax({
        url: `http://192.168.29.243:4000/getsections/${itemId}`,
        method: 'GET',
        success: function (response) {
          setSections(response);
          initializeTable(response);
          const itemDescription = item_description || (response.length > 0 ? response[0].item_description : '');
          setFormData((prevFormData) => ({
            ...prevFormData,
            item_description: itemDescription,
          }));
          //alert('Item Description: ' + itemDescription); // Alert the item description
        },
        error: function (xhr, status, error) {
          console.error('Error fetching sections:', error);
        },
      });
      

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv'],
        });
      });
    }
    window.handleEdit = handleEdit;
     window.handleDelete = handleDelete;
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
          buttons: ['copy', 'csv'],
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
                return meta.row + 1;
              },
            },
            {
              targets: 4,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="window.handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
               
                 <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="bx bxs-trash" title="Delete"></i></button>
               `;
              },
            },
          ],
        });
      }
    });
  };

  const [formData, setFormData] = useState({
   //id: '',
    section: '',
    target: '', 
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

    const itemId = props.match.params.id;
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `http://192.168.29.243:4000/addsectionitemmaster/${itemId}`,
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
        //history.goBack();
         window.location.reload();
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

  const handleDelete = (id) => {
  const confirmDelete = window.confirm('Delete Section');
  if (confirmDelete) {
    fetch(`http://192.168.29.243:4000/delete_target/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        // Set the server message and style it
        setServerMessage(data.message);
        setServerMessageClass('alert alert-success');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();
        }, 5000);

        // Fetch updated sections data after successful delete
        $.ajax({
          url: `http://192.168.29.243:4000/getsections/${itemId}`,
          method: 'GET',
          success: function (response) {
            setSections(response);
            // Reinitialize DataTable with updated data
            initializeTable(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching sections:', error);
          },
        });
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        // Set the server error message and style it
        setServerMessage('Invalid Request');
        setServerMessageClass('alert alert-danger');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();

        }, 3000);
      });
  }
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
                  <input
                    type="hidden"
                    className="form-control margin-bottom required"
                    name="id"
                    value={itemId}
                    onChange={handleInputChange}
                  />

          <div className="form-group row space">
          <h5>Add New Section for: <span className="textred">{formData.item_description}</span></h5>
          <hr></hr>
                
                

                <div className="col-sm-4">
                                  <span className="textgreen">Section Name <span className="textred">*</span></span>
                                  <Select
                                  options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                                 value={formData.section ? { value: formData.section, label: formData.section_name } : null}
                                  onChange={(selectedOption) => {
                                    
                                    setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
                                  }}
                                  isSearchable
                                  placeholder="Select Section"
                                  required
                                />
                                </div>

                <div className="col-md-4">

                       <span className="textgreen">Target(Hourly) <span className="textred">*</span></span>
                       
                           <input
                    type="text"
                    className="form-control margin-bottom "
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-1 mt-4">

                
                  <input type="submit" id="submit-data" className="btn btn-success margin-bottom" value="Add" data-loading-text="Updating..." />
               
                </div>
               
              </div>
               </form>
            <h5>Product Name: <span className="pdesc">{formData.item_description}</span></h5> {/* Updated line */}
            <div className="container dt">
              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>UOM</th>
                    <th>Target(Hourly)</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, index) => (
                    <tr key={section.id}>
                      <td>{index + 1}</td>
                      <td>{section.section_name}</td>
                      <td>{section.target_unit}</td>
                      <td>{section.target}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>UOM</th>
                    <th>Target(Hourly)</th>
                    <th>Edit</th>
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

export default ViewIMComponent;
