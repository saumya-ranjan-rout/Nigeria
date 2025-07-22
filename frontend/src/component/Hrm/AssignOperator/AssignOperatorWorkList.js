import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min.js';
//Datatable Modules
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
import config from '../../../config';

export function AssignOperatorWorkList() {
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const tableRef = useRef(null);
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

    const fetchData = () => {
        setLoading(true);
        $.ajax({
            url: `${config.apiUrl}/operator/assignment`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {
                // Set the fetched data in the state
                setData(response);
                setLoading(false);
            },
            error: function (xhr, status, error) {
                setLoading(false);
                console.log(error);
            }
        });
    }


    useEffect(() => {

        document.title = 'Assign Operator Work List';
        // Check if the user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            // Redirect to the login page if not logged in
            history.push('/login');
        } else {
            // Fetch item categories from API
            fetchData();
        }

        // Attach the functions to the window object
        window.handleDelete = handleDelete;
    }, []);

    const handleDelete = (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
        if (confirmDelete) {
            fetch(`${config.apiUrl}/operator/assignment/delete/${id}`, {
                method: 'DELETE',
                headers: customHeaders,
            })
                .then((response) => response)
                .then((data) => {
                    console.log('Assign Operator Work List deleted:', data);
                    // Refresh the page on success
                    window.location.reload();
                })
                .catch((error) => console.error('Error deleting item:', error));
        }
    };
    const handleLogout = () => {
        // Perform any necessary logout actions here
        // For example, clearing session storage, removing tokens, etc.

        // Clear the session
        localStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        history.push('/login');
    };

    const renderTableData = () => {
        // Filter data based on the search query (case-insensitive)
        const filteredData = data.filter(row =>
            row.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return filteredData.map((row, index) => {
            return (
                <tr key={index}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.entryid}</td>
                    <td>{row.item_description}</td>
                    <td>{row.section_name}</td>
                    <td>{row.shift}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
                        <i className="bx bxs-trash"></i>
                    </button></td>
                </tr>
            );
        });
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
                            <div>Show List of work assign to operator</div>
                            <hr></hr>
                            <div className="col-sm-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for name..."
                                />
                            </div>
                            <table id="example" className="table table-striped table-bordered zero-configuration bordered ts">
                                <thead>
                                    <tr>
                                        <th>slno</th>
                                        <th>Name</th>
                                        <th>Entryid</th>
                                        <th>Product Name</th>
                                        <th>Section Name</th>
                                        <th>Shift</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {renderTableData()}
                                </tbody>
                            </table>

                        </div>
                    </main>
                </section>

            </div>
            </div>
        </>
    );
}

export default AssignOperatorWorkList;
