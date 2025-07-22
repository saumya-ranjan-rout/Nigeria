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

export function AddColorIMComponent(props) {
  const [isActive, setActive] = useState(false);
  const [sections, setSections] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [colorOptions, setColorOptions] = useState([]); // Added state for color options
  const tableRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');

  const handleEdit = (id) => {
    history.push(`/master/edititemcode/${id}`);
  };

  useEffect(() => {
    document.title = 'Add section For Item';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      history.push('/login');
    } else {
      const itemId = props.match.params.id;
      //alert(itemId);
      const { item_description } = location.state || {};
      

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

      // Fetch item_code table data
      $.ajax({
        url: `http://192.168.29.243:4000/getdata/${itemId}`,
        method: 'GET',
        success: function (response) {

          setItemData(response);

          const table = tableRef.current;
          table.clear().rows.add(response).draw();
        },
        error: function (xhr, status, error) {
          console.error('Error fetching item data:', error);
        },
      });

      $.ajax({
        url: `http://192.168.29.243:4000/getcolors`, // Assuming this endpoint fetches the color options from the database
        method: 'GET',
        success: function (response) {
          setColorOptions(response); // Set the color options in the state
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
          buttons: ['copy', 'csv'],
        });
      });
    }
    window.handleEdit = handleEdit;
     window.handleDelete = handleDelete;
  }, []);

 const initializeTable = (data) => {
  if ($.fn.DataTable.isDataTable('#example')) {
    $('#example').DataTable().destroy();
  }

  if (data.length > 0) {
    tableRef.current = $('#example').DataTable({
      data: data.response,
      dom: 'Bfrtip',
      buttons: ['copy', 'csv'],
      columns: [
        { data: null },
        { data: 'item_group' },
        { data: 'item_description' },
        { data: 'product_code' },
        { data: 'product_des' },
        { data: 'color_name' },
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
          targets: 6, // Update this to 5 for the last column
          render: function (data, type, row, meta) {
            const id = row.id;

            return `
              <button class="btn btn-sm btn-warning" onclick="window.handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger" onclick="window.handleDelete(${id})"><i class="bx bxs-trash"></i></button>
            `;
          },
        },
      ],
    });
  }
};

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
    code: '',
    desc: '',
    color: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formDataWithItemId = { ...formData, item_id: props.match.params.id };

    $.ajax({
      url: `http://192.168.29.243:4000/additemcolor/${props.match.params.id}`,
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
         window.location.reload();
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('Color already exists'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });
  };
  

 

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do You Really Want To Delete color??');
    if (confirmDelete) {
      fetch(`http://192.168.29.243:4000/deleteitemcode/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(' deleted:', data);
         
         
          // Set the server message and style it
          setServerMessage('Deleted successfully');
          setServerMessageClass('alert alert-success');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
            window.location.reload();
          }, 5000);
        })
        .catch((error) => {
          console.error('Error deleting color:', error);
          // Set the server error message and style it
          setServerMessage('An error occurred while deleting color');
          setServerMessageClass('alert alert-danger');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
           
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
          <form onSubmit={handleSubmit} method='POST' >
            <h5>Add New Color Code For <span className="textred">{formData.item_description}</span></h5> {/* Updated line */}
            <hr></hr>
            <div className="row space">
				<div className="form-group col-sm-3 ">
					<span className="textgreen">Product Code<span className="textred">*</span> </span>
                   
                <input type="text" className="form-control" name="code"  value={formData.code}  onChange={handleInputChange}/>
                               
                </div>
                <div className="form-group col-sm-3 ">
               <span className="textgreen">Product Description <span className="textred">*</span> </span>
                    

                      <input type="text" className="form-control" name="desc" value={formData.desc}  onChange={handleInputChange} />
                    
                </div>
               

                <div className="form-group col-sm-3 ">
                                    <span className="textgreen">Color <span className="textred">*</span> </span>
                                    <Select
                                      options={colorOptions.map(option => ({ value: option.id, label: option.color_name }))}
                                      value={formData.color ? { value: formData.color, label: formData.color_name } : null}
                                      //value={productOptions.find(option => option.id === formData.product_name)} // Adjust this line
                                      onChange={(selectedOption) => {
                                        setFormData({ ...formData, color: selectedOption.value, color_name: selectedOption.label });
                                        
                                      }}
                                      isSearchable
                                      placeholder="Select Product Name"
                                    />
                                  </div>
 
            
                <div className="form-group col-sm-3 ">

                    <label className="col-sm-2 col-form-label"></label>

                    <div className="col-sm-4 ">

                        <input type="submit" id="submit-data" className="btn btn-success margin-bottom"
                               value="Add" data-loading-text="Adding..." />
                        
                    </div>
                </div>
</div>
</form>

<table id="example" className="table table-striped table-bordered zero-configuration bordered ts">
                    <thead>
                    <tr>
                        <th>#</th>
                         <th>ETA Code</th>
                <th>Product Name</th>
						  <th>Product Code</th>
						    <th>Product Description</th>
						      <th>Color</th>
                    <th>Action</th>
                      
                    </tr>
                    </thead>
                   

                    <tfoot>
                    <tr>
                        <th>#</th>
                         <th>ETA Code</th>
                <th>Product Name</th>
              <th>Product Code</th>
                <th>Product Description</th>
                  <th>Color</th>
                    <th>Action</th>
                    </tr>
                    </tfoot>
                </table>
            
            
            
            
          </div>
        </main>
      </section>
    </div>
  );
}

export default AddColorIMComponent;
