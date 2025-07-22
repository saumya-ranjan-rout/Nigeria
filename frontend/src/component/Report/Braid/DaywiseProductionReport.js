import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "jquery/dist/jquery.min.js";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import $ from "jquery";
import "jszip";
import "pdfmake";
import '../Loader.css';


function DaywiseProduction() {
  const [loading, setLoading] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [resultData, setTfooterData] = useState([]);
  const [resultData1, setTbodyData] = useState([]);
  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
  const [formData, setFormData] = useState({
    fromdate: "",
    todate: "",
    shift: "",
  });

  //date formats 1
  const currentDate1 = new Date(fdate);
  const day1 = currentDate1.getDate().toString().padStart(2, '0');
  const month1 = (currentDate1.getMonth() + 1).toString().padStart(2, '0');
  const year1 = currentDate1.getFullYear();
  const fdate1 = `${day1}-${month1}-${year1}`;
  
//date formats 1
  const currentDate2 = new Date(tdate);
  const day2 = currentDate2.getDate().toString().padStart(2, '0');
  const month2 = (currentDate2.getMonth() + 1).toString().padStart(2, '0');
  const year2 = currentDate2.getFullYear();
  const tdate1 = `${day2}-${month2}-${year2}`;
  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;



  const history = useHistory();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "fromdate") {
      setStartDate(new Date(value));
    } else if (name === "todate") {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: "http://192.168.29.243:4000/braid/get_daywise_production_search",
      method: "POST",
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response.tfgData);
        try {
          setMonthsArray(response.resultData[0].dates);
          setFDate(response.resultData[0].fdate);
          setTDate(response.resultData[0].tdate);
          setTfooterData(response.resultData);
          setTbodyData(response.tfgData);
        } catch (error) {
          console.error("Error handling new data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [defaultData, shiftOptions] = await Promise.all([
          $.ajax({
            url: "http://192.168.29.243:4000/braid/get_daywise_production_default",
            method: "GET",
            processData: false,
            contentType: "application/json",
          }),
          $.ajax({
            url: 'http://192.168.29.243:4000/getShiftOptions',
            method: 'GET',
          }),
        ]);

        setTfooterData(defaultData.resultData);
        setShiftOptions(shiftOptions);
        setTbodyData(defaultData.tfgData);

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [history]);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    history.push("/login");
  };

  const formatDate = (dateString) => {
    const currentDate = dateString ? new Date(dateString) : new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();

    return { day, month, year };
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
              <h5 className="title">Daywise Production Summary</h5>
              <br />
              <h5 className="title">Date Range</h5>
              <hr></hr>
              <form onSubmit={handleSubmit} method="POST">
                <div className="row space">
                  <div className="col-sm-3">
                    <span className="textgreen">Start Date</span>
                    <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Start Date"
                      name="fromdate"
                    />
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">To Date</span>
                    <DatePicker
                      className="form-control margin-bottom"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select End Date"
                      name="todate"
                    />
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Shift</span>
                    <select
                      id="shift"
                      className="form-control"
                      name="shift" 
                      value={formData.shift} onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.name}>
                          {shiftOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-2">
                    <button type="submit" className="btn btn-success btn-md">
                      View
                    </button>
                  </div>
                </div>
              </form>

              <div>
                <h6 className="header-title">
                  <span className="textgreen">
                    {fdate !== '' ? `From [${fdate1}] to [${tdate1}]` : null}
                  </span>
                </h6>
              </div>
             
              <table className="table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Color Name</th>

                    {monthsArray && monthsArray.length > 0 ? (
                      monthsArray.map((monthName, index) => (
                        <th key={monthName}>{monthName}</th>
                      ))
                    ) : (
                      <th>{formattedDate}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {resultData1 && resultData1.length > 0 ? (
                    resultData1.map((rowData, rowIndex) => (
                      <tr key={rowIndex}>
                        <td style={{ color: 'red' }}>{rowData.item}</td>
                        <td style={{ color: 'red' }}>{rowData.color}</td>
                        {rowData.tfg && rowData.tfg.length > 0 ? (
                          rowData.tfg.map((value, index) => (
                            <td key={index}>{value}</td>
                          ))
                        ) : (
                          <td>{rowData.tfg}</td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={monthsArray.length + 2}>No data available</td>
                    </tr>
                  )}
         
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total FG</td>
                    <td></td>
                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index}>{dataItem.totalFG}</td>
                      ))
                    ) : (
                      <td></td>
                    )}
                  </tr>
                  <tr>
                    <td>Total Active Worker</td>
                    <td></td>
                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index}>{dataItem.totalActiveWorker}</td>
                      ))
                    ) : (
                      <td>0</td>
                    )}
                  </tr>
                  <tr>
                    <td>Daily PPP</td>
                    <td></td>
                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index}>{dataItem.dailyPPP}</td>
                      ))
                    ) : (
                      <td>x</td>
                    )}
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

export default DaywiseProduction;
