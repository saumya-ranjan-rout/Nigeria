import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "jquery/dist/jquery.min.js";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import '../Loader.css' // Import the CSS file
import "jszip";
import "pdfmake";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import $ from "jquery";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from 'react-router-dom';
export function EfficiencyOverviewDetailsReport() {
  const { id1, id2 } = useParams();
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const [total_tar, setTargt] = useState('');
  const [total_sum, setSum] = useState('');
  const [total_eff, setEff] = useState('');
  const [date , setDate]= useState('');

  const tableRef = useRef(null);


  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const today= `${day}-${month}-${year}`;

  const toggleClass = () => {
    setActive(!isActive);
  };

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  
  const history = useHistory();
  
  
useEffect(() => {
  setLoading(true);
  document.title = "Efficiency Overview Details";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    history.push("/login");
  } else {
    $.ajax({
      url: `http://192.168.29.243:4000/Nbraid/get_efficiencyOverview_details_data/${id1}/${id2}`,
      method: "GET",
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setSum(response.tot_sum);
        setTargt(response.tot_tar);
        setEff(response.tot_eff);
        setDate(response.date);
        try {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          // Set the initial table data
           // Initialize the DataTable with the updated data
            tableRef.current = $("#example").DataTable({
              dom: "Bfrtip",
              buttons: [
                {
                  extend: "copy",
                  filename: `NON-BRAID EMPLOYEETIMESHEET REPORT ${response.date} `,
                },
                {
                  extend: "csv",
                  filename: `NON-BRAID EMPLOYEETIMESHEET REPORT ${response.date} `,
                  footer: true,
                },
                "excel",
                
              ],
              data: response.items, // Update the data option here
              columns: [
                { data: null, render: function (data) {
                  return data.worker + '[' + data.eid + ']';
                }},
                { data: 'prod'},
                { data: 'line'},
                { data: 'sec'},
                { data: 'target'},
                { data: 'h1'},
                { data: 'h2'},
                { data: 'h3'},
                { data: 'h4'},
                { data: 'h5'},
                { data: 'h6'},
                { data: 'h7'},
                { data: 'h8'},
                { data: 'h9'},
                { data: 'h10'},
                { data: 'h11'},
                { data: 'tar'},
                { data: 'sum'},
                { data: 'eff'},
              ],
            });
            setLoading(false);
        } catch (error) {
          console.error("Error handling initial data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  }
}, [history]);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    history.push("/login");
  };


  return (
    <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
    <div className="container">
      <Sidebar />
      <section id="content">
        <Header />
        <main>
          <div className="container dt">
            <h5 className="title">Efficiency Overview Details</h5>
            <br />
            <h5 className="title">Date Range</h5>
            <hr></hr>
  
            <br/>
            <br/>

            <div>
              <h6 className="header-title">
                <span className="textred">
                  {date}
                </span>
              </h6>
            </div>

            <table id="example" className="display">
            <thead>
            <tr>
              <th>Emp Name/Emp Id</th>
              <th>Product<br/>Name</th>
              <th>Line</th>
              <th>Section</th>
              <th>Target</th>
              <th>HR<br/>1</th>
              <th>HR<br/>2</th>
              <th>HR<br/>3</th>
              <th>HR<br/>4</th>
              <th>HR<br/>5</th>
              <th>HR<br/>6</th>
              <th>HR<br/>7</th>
              <th>HR<br/>8</th>
              <th>HR<br/>9</th>
              <th>HR<br/>10</th>
              <th>HR<br/>11</th>
              <th>Total Target</th>
              <th>TOTAL<br/>COMPLETE</th>
              <th>EFFICIENCY</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
            <tfoot style={{border:'1px solid red'}}>
              <tr>
                <th colSpan={16}> </th>
                <th>{total_tar}</th>
                <th>{total_sum}</th>
                <th>{total_eff}</th>
              </tr>
            </tfoot>
            </table>
           
          </div>
        </main>
      </section>
    </div>
    </>
  );
}

export default EfficiencyOverviewDetailsReport;
