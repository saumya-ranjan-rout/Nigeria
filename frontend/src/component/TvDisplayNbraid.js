import React, { useEffect, useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import logoImage from '../component/eta.png';

export function TvDisplayNbraid() {
  const history = useHistory();
  const tableRef = useRef(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPresentEmployees, setTotalPresentEmployees] = useState(0);
  const [totalAbsentEmployees, setTotalAbsentEmployees] = useState(0);
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);
  const [mtdFgOutput, setMtdFgOutput] = useState([]);
  const [totalFgOutput, setTotalFgOutput] = useState([]);
  const [shopfloorPpp, setShopfloorPpp] = useState([]);
  const [mtdPpp, setMtdPpp] = useState([]);
  const [fgslide, setFGSlide] = useState([]);
  const [pvtslide, setPVTSlide] = useState([]);
  const [iwpppslide, setIWPPPSlide] = useState([]);
  const [mtdpppslide, setMTDPPPSlide] = useState([]);
  const [twslide, setTWSlide] = useState([]);
  const [twmtdslide, setTWMTDSlide] = useState([]);
 
/*const mockData = [
  { product_desc: "Item 1", color_name: "Color 1", tar: 100 },
  { product_desc: "Item 2", color_name: "Color 2", tar: 200 },
  // Add more mock data items as needed
];
const [fgslide, setFGSlide] = useState(mockData);


*/

  function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[date.getDay()];

    return `${year}-${month}-${day} ${dayOfWeek}`;
  }

  const currentDate = getCurrentDate();
  const [carouselData, setCarouselData] = useState([]);

  useEffect(() => {
    document.title = 'PRODUCTIVITY DASHBOARD FOR OTA';
      fetchtotalemployees();
      fetchtotalpresentemployees();
      fetchtotalabsentemployees();
      fetchtotalactiveemployees();
      fetchmtdavgoutput();
      fetchtotalfgoutput();
      fetchshopfloorppp();
      fetchmtdppp();
      fetchfgoutputslide();
      fetchplanvstargetslide();
      fetchitemwisepppslide();
      fetchmtdpppslide();
      fetchTop10Workersslide();
      fetchTop10Workersmtdslide();
   
  }, []);

   useEffect(() => {
        const updatedCarouselData = [
            [
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display6.jpg',
        alt: 'Image 1',
        content: (
          <div className="container-fluid">
            <div className="cardslide1">
              <div className="cardslide1-header custom-card-header1">
                  <h5>FG OUTPUT</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide1-img-top" alt="Image 1" /> */}
                <div className="cardslide1-body">
                     <div class="row" >
                                 <div class="col-md-4" >
                                   <b style={{ color: '#e6771f' }}>ITEM DESCRIPTION</b>
                                  </div>
                                  <div class="col-md-4" >
                                   <b style={{ color: '#e6771f' }}>COLOR</b>
                                  </div>
                                  <div class="col-md-4"  >
                                   <b style={{ color: '#e6771f' }}>QTY</b>
                                  </div>
                      </div>
                 {fgslide.length > 0 ? (
                    // Render the data when it's available
                    fgslide.map((row1, index) => (
                        <div className="row" key={index}>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b>{row1.product_desc}</b>
                        </div>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b>{row1.color_name}</b>
                        </div>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b style={{ color: 'green' }}>{row1.tar}</b>
                        </div>
                        </div>
                    ))
                    ) : fgslide.length === 0 ? (
                    // Display a loading message while data is being fetched
                    <div style={{ color: '#000' }}>Loading...</div>
                    ) : (
                    // Display a message when there is no data available
                    <div style={{ color: '#000' }}>No data available</div>
                    )}
                </div>
              </div>
          </div>
        ),
      },
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display2.jpg',
        alt: 'Image 2',
        content: (
          <div className="container-fluid">
            <div className="cardslide2">
              <div className="cardslide2-header custom-card-header2">
                  <h5>Plan Vs Actual</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide2-img-top" alt="Image 1" /> */}
                <div className="cardslide2-body">
                  <div class="row" >
                                 <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>Product Description</b>
                                  </div>
                                  <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>Daily Plan</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>Current Production</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>Balance</b>
                                  </div>
                    </div>
                    {pvtslide.length > 0 ? (
                    // Render the data when it's available
                    pvtslide.map((row1, index) => (
                        <div className="row" key={index}>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b>{row1.itemCode}</b>
                        </div>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b>{row1.targetPlan}</b>
                        </div>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b style={{ color: 'green' }}>{row1.c}</b>
                        </div>
                        <div className="col-md-4" style={{ fontSize: '12px', color: '#000' }}>
                            <b style={{ color: 'green' }}>{row1.b}</b>
                        </div>
                        </div>
                    ))
                    ) : pvtslide.length === 0 ? (
                    // Display a loading message while data is being fetched
                    <div style={{ color: '#000' }}>Loading...</div>
                    ) : (
                    // Display a message when there is no data available
                    <div style={{ color: '#000' }}>No data available</div>
                    )}
                </div>
              </div>
          </div>
        ),
      },
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display3.jpg',
        alt: 'Image 1',
        content: (
          <div className="container-fluid">
            <div className="cardslide3">
              <div className="cardslide3-header custom-card-header3">
                  <h5>ITEMWISE PPP REPORT</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide3-img-top" alt="Image 1" /> */}
                <div className="cardslide3-body">
                  <div class="row" >
                  <div class="col-md-6">
                   <div class="row" >
                                <div class="col-md-3" >
                                   <b style={{ color: 'green' }}>PRODUCT NAME</b>
                                  </div>
                                  <div class="col-md-3" >
                                   <b style={{ color: 'green' }}>FG O/P</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: 'green' }}>BOM</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: 'green' }}>PPP</b>
                                  </div>
                  </div>
                  </div>
               
                  <div class="col-md-6">
                                <div class="row" >
                                <div class="col-md-3" >
                                   <b style={{ color: 'green' }}>PRODUCT NAME</b>
                                  </div>
                                  <div class="col-md-3" >
                                   <b style={{ color: 'green' }}>FG O/P</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: 'green' }}>BOM</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: 'green' }}>PPP</b>
                                  </div>
                  </div>
                  </div>
                  </div>
                  <div class="row">

                    {iwpppslide.length > 0 ? (
                        // Render the data when it's available
                        iwpppslide.map((row1, index) => (
                            <div class="col-md-6" key={index}>
                                <div className="row">
                                    <div className="col-md-3" style={{ fontSize: '12px', color: '#000' }}>
                                        {row1.itemDescription}
                                    </div>
                                    <div className="col-md-3" style={{ fontSize: '12px', color: '#000' }}>
                                        {row1.fgOutput}
                                    </div>
                                   
                                    <div className="col-md-3" style={{ fontSize: '12px', color: '#000' }}>
                                        {row1.tppp}
                                    </div>

                                    <div className="col-md-3" style={{ fontSize: '12px', color: '#000' }}>
                                        {row1.rew}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : iwpppslide.length === 0 ? (
                        // Display a loading message while data is being fetched
                        <div style={{ color: '#000' }}>Loading...</div>
                    ) : (
                        // Display a message when there is no data available
                        <div style={{ color: '#000' }}>No data available</div>
                    )}


                </div>
                </div>
              </div>
          </div>
        ),
      },
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display6.jpg',
        alt: 'Image 2',
        content: (
          <div className="container-fluid">
            <div className="cardslide4">
              <div className="cardslide4-header custom-card-header4">
                  <h5>MTD PPP REPORT</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide4-img-top" alt="Image 1" /> */}
                <div className="cardslide4-body">
                  <div class="row" >
                  <div class="col-md-6">
                   <div class="row" >
                                <div class="col-md-6" >
                                   <b style={{ color: 'green' }}>PRODUCT NAME</b>
                                  </div>
                                  <div class="col-md-2" >
                                   <b style={{ color: 'green' }}>FG O/P</b>
                                  </div>
                                  <div class="col-md-2"  >
                                   <b style={{ color: 'green' }}>BOM</b>
                                  </div>
                                  <div class="col-md-2"  >
                                   <b style={{ color: 'green' }}>PPP</b>
                                  </div>
                  </div>
                  </div>
                  <div class="col-md-6">
                                <div class="row" >
                                <div class="col-md-6" >
                                   <b style={{ color: 'green' }}>PRODUCT NAME</b>
                                  </div>
                                  <div class="col-md-2" >
                                   <b style={{ color: 'green' }}>FG O/P</b>
                                  </div>
                                  <div class="col-md-2"  >
                                   <b style={{ color: 'green' }}>BOM</b>
                                  </div>
                                  <div class="col-md-2"  >
                                   <b style={{ color: 'green' }}>PPP</b>
                                  </div>
                  </div>
                  </div>
                  </div>
                  <div class="row" >
                        {mtdpppslide !== undefined ? (
        mtdpppslide.length > 0 ? (
            // Render the data when it's available
            mtdpppslide.map((row1, index) => (
                <div class="col-md-6" key={index}>
                    <div className="row">
                        <div className="col-md-6" style={{ fontSize: '12px', color: '#000' }}>
                            {row1.itemDescription}
                        </div>
                        <div className="col-md-2" style={{ fontSize: '12px', color: '#000' }}>
                            {row1.sumk}
                        </div>
                        <div className="col-md-2" style={{ fontSize: '12px', color: '#000' }}>
                            {row1.tppp}
                        </div>
                        <div className="col-md-2" style={{ fontSize: '12px', color: '#000' }}>
                            {row1.rew}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            // Display a message when there is no data available
            <div style={{ color: '#000' }}>No data available</div>
        )
    ) : (
        // Display a loading message while data is being fetched
        <div style={{ color: '#000' }}>Loading...</div>
    )}

                    </div>
                </div>
              </div>
          </div>
        ),
      },
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display2.jpg',
        alt: 'Image 1',
        content: (
          <div className="container-fluid">
            <div className="cardslide5">
              <div className="cardslide5-header custom-card-header5">
                  <h5>Top 10 Best worker based on efficiency</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide5-img-top" alt="Image 1" /> */}
                <div className="cardslide5-body">
                  <div class="row" >
                                 <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>STAFF ID</b>
                                  </div>
                                  <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>STAFF NAME</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>SECTION</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>EFFICIENCY</b>
                                  </div>
                      </div>
                     

                        {twslide.length > 0 ? (
                            // Render the data when it's available
                            twslide.map((row1, index) => (
                              
                                    <div className="row" key={index}>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.entryId}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.worker}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.sectionName}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: 'green' }}>{row1.valueSum}</b>
                                        </div>
                                    </div>
                              
                            ))
                        ) : twslide.length === 0 ? (
                            // Display a loading message while data is being fetched
                            <div style={{ color: '#000' }}>Loading...</div>
                        ) : (
                            // Display a message when there is no data available
                            <div style={{ color: '#000' }}>No data available</div>
                        )}


                   
                </div>
              </div>
          </div>
        ),
      },
      {
        src: 'https://ng.godrejeta.com/nigeria/assets/images/display3.jpg',
        alt: 'Image 2',
        content: (
          <div className="container-fluid">
            <div className="cardslide6">
              <div className="cardslide6-header custom-card-header6">
                  <h5>Top 10 Best worker MTD</h5>
                </div>
                {/* <img src="image1.jpg" className="cardslide6-img-top" alt="Image 1" /> */}
                <div className="cardslide6-body">
                  <div class="row">
                                 <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>STAFF ID</b>
                                  </div>
                                  <div class="col-md-3" >
                                   <b style={{ color: '#e6771f' }}>STAFF NAME</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>SECTION</b>
                                  </div>
                                  <div class="col-md-3"  >
                                   <b style={{ color: '#e6771f' }}>EFFICIENCY</b>
                                  </div>
                      </div>
                      
                      {twmtdslide.length > 0 ? (
                            // Render the data when it's available
                            twmtdslide.map((row1, index) => (
                              
                                    <div className="row" key={index}>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.entryId}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.worker}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: '#000' ,fontSize:'12px',textAlign:'left' }}>{row1.sectionName}</b>
                                        </div>
                                        <div className="col-md-3" >
                                            <b style={{ color: 'green' }}>{row1.avv}</b>
                                        </div>
                                    </div>
                              
                            ))
                        ) : twmtdslide.length === 0 ? (
                            // Display a loading message while data is being fetched
                            <div style={{ color: '#000' }}>Loading...</div>
                        ) : (
                            // Display a message when there is no data available
                            <div style={{ color: '#000' }}>No data available</div>
                        )}

                </div>
              </div>
          </div>
        ),
      },
    ],
    
  ];
  setCarouselData(updatedCarouselData);
},[iwpppslide]);

 
 

const fetchtotalemployees = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchtotalemployees');
      const data = response.data;
      setTotalEmployees(data.total_emp);
    } catch (error) {
      console.error('Error fetching total employees:', error);
    }
  };

  const fetchtotalpresentemployees = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchtotalpresentemployees');
      const data = response.data;
      setTotalPresentEmployees(data.p_emp);
    } catch (error) {
      console.error('Error fetching total section:', error);
    }
  };

  const fetchtotalabsentemployees = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchtotalabsentemployees');
      const data = response.data;
      setTotalAbsentEmployees(data.a_emp);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchtotalactiveemployees = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchtotalactiveemployees');
      const data = response.data;
      setTotalActiveEmployees(data.actemp);
    } catch (error) {
      console.error('Error fetching total operators:', error);
    }
  };

  

  const fetchmtdavgoutput = async () => {
    try {
        const response = await axios.get('http://192.168.29.243:4000/fetchmtdavgoutput');
        const data = response.data;
        setMtdFgOutput(data.total_fg_outputK);
      } catch (error) {
        console.error('Error fetching category items:', error);
      }
    };

    const fetchtotalfgoutput = async () => {
      try {
          const response = await axios.get('http://192.168.29.243:4000/fetchtotalfgoutput');
          const data = response.data;
          setTotalFgOutput(data.total_fg_outputf);
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

      {/*const fetchshopfloorppp = async () => {
        try {
            const response = await axios.get('http://192.168.29.243:4000/fetchshopfloorppp');
            const data = response.data;
            setShopfloorPpp(data.shopfloorPpp);
          } catch (error) {
            console.error('Error fetching dates:', error);
          }
        };*/}

        const fetchshopfloorppp = async () => {
          try {
                const response1 = await axios.get('http://192.168.29.243:4000/fetchtotalfgoutput');
                const response2 = await axios.get('http://192.168.29.243:4000/fetchtotalactiveemployees');

                const data1 = response1.data;
                const data2 = response2.data;

                if (data1.total_fg_outputf > 0 && data2.actemp > 0) {
                    const spp = data1.total_fg_outputf / data2.actemp;
                    setShopfloorPpp(spp);
                } else {
                    // Handle case where either total_fg_outputf or actemp is not greater than 0
                    // You might want to set a default value or handle it according to your requirement
                    //alert('total_fg_outputf or actemp is not greater than 0');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchmtdppp = async () => {
          try {
              const response = await axios.get('http://192.168.29.243:4000/fetchmtdppp');
              const data = response.data;
              setMtdPpp(data.resk);
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

  const fetchfgoutputslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchfgoutputslide');
      const data = response.data;
      //alert('Data from the API:'+ JSON.stringify(data));
      setFGSlide(data);
      
    //alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

   const fetchplanvstargetslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchplanvstargetslide');
      const data = response.data;
      console.log('Data from the API:', data);
      setPVTSlide(data);

    //alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

  const fetchitemwisepppslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchitemwisepppslide');
      const data = response.data;
      console.log('Data from the API:', data);
      setIWPPPSlide(data);

    //alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

const fetchmtdpppslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchmtdpppslide');
      const data = response.data;
      console.log('Data from the API:-------------------', data);
      setMTDPPPSlide(data);

    alert(data.length);
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };


const fetchTop10Workersslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchTop10Workersslide');
      const data = response.data;
      console.log('Data from the API:', data);
      setTWSlide(data);

    //alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

const fetchTop10Workersmtdslide = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/fetchTop10Workersmtdslide');
      const data = response.data;
      console.log('Data from the API:', data);
      setTWMTDSlide(data);

    //alert(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

  const calculatePpp = () => {
        if (mtdFgOutput > 0 && mtdPpp > 0) {
            return (mtdFgOutput / mtdPpp).toFixed(2);
        } else {
            return "0.00";
        }
    };

 // Use this useEffect to see the updated state
useEffect(() => {
  //alert('fgslide:' + JSON.stringify(fgslide));
}, [fgslide]);

  return (
    <div>
     <header className="fixed-top bg-primary text-light p-4 jumb">
        <div className="d-flex flex-column align-items-center text-center">
          <img src={logoImage} alt="Logo" className="logotv" /><br />
          <h4 className="animate-charcter">PRODUCTIVITY DASHBOARD</h4>
          <h5 className="text-lightt"><b>Date</b> - {currentDate}</h5>
          <div className="container mt-1">
            <div className="row">
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                    <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">TOTAL EMPLOYEES</h5>
                      </div>
                      <div className="col-md-3">
                        <h5 className="text-dark"><b>{totalEmployees}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">PRESENT EMPLOYEES</h5>
                      </div>
                      <div className="col-md-3">
                       <h5 className="text-dark"><b>{totalPresentEmployees}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">ABSENT EMPLOYEES</h5>
                      </div>
                      <div className="col-md-3">
                       <h5 className="text-dark"><b>{totalAbsentEmployees}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">ACTIVE EMPLOYEES</h5>
                      </div>
                      <div className="col-md-3">
                       <h5 className="text-dark"><b>{totalActiveEmployees}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">MTD FG OUTPUT</h5>
                      </div>
                      <div className="col-md-3">
                       <h5 className="text-dark"><b>{mtdFgOutput}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">TOTAL FG OUTPUT</h5>
                      </div>
                      <div className="col-md-3">
                       <h5 className="text-dark"><b>{totalFgOutput}</b></h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                  <div className="cardtv" id="breathing-button">
                      <div className="cardtv-body">
                          <div className="row">
                              <div className="col-md-9">
                                  <h5 className="text-dark">SHOPFLOOR PPP</h5>
                              </div>
                              <div className="col-md-3">
                                  <h5 className="text-dark"><b>{totalActiveEmployees > 0 ? (shopfloorPpp === Infinity ? '0' : shopfloorPpp.toFixed(2)) : '0'}</b></h5>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="col-md-3">
                <div className="cardtv" id="breathing-button">
                  <div className="cardtv-body">
                   <div className="row">
                      <div className="col-md-9">
                       <h5 className="text-dark">MTD PPP</h5>
                      </div>
                      <div className="col-md-3">
                      <h5 className="text-dark">
                      <b>
            {mtdFgOutput === 0
                ? "0.00"
                : (mtdPpp === 0 && mtdFgOutput === 0)
                    ? "0.00"
                    : calculatePpp()}
        </b>
                    </h5>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid mt-5">
        {carouselData.map((carouselImages, index) => (
          <div key={index} id={`myCarousel${index}`} className="carousel slide" data-bs-ride="carousel" data-interval="3000">
            <ol className="carousel-indicators">
              {carouselImages.map((_, imageIndex) => (
                <li
                  key={imageIndex}
                  data-bs-target={`#myCarousel${index}`}
                  data-bs-slide-to={imageIndex}
                  className={imageIndex === 0 ? 'active' : ''}
                />
              ))}
            </ol>
            <div className="carousel-inner">
              {carouselImages.map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className={`carousel-item ${imageIndex === 0 ? 'active' : ''}`}
                >
                  <img className="d-block w-100" src={image.src} alt={image.alt} />
                  <div className="carousel-caption">
                    {image.content}
                  </div>
                </div>
              ))}
            </div>
            <a className="carousel-control-prev" href={`#myCarousel${index}`} role="button" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true" />
              <span className="visually-hidden">Previous</span>
            </a>
            <a className="carousel-control-next" href={`#myCarousel${index}`} role="button" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="visually-hidden">Next</span>
            </a>
          </div>
        ))}
      </div>
     
    </div>
  );
}
