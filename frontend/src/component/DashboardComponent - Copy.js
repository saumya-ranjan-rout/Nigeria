import React, { useEffect, useState, useRef  } from 'react';
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


import Sidebar from './Sidebar'; // Import the Sidebar component
import Header from './Header'; // Import the Header component
import $ from 'jquery'; 
import axios from 'axios';

export function DashboardComponent() {

  
  
  const [isActive, setActive] = useState(false);
  const tableRef = useRef(null);
  const toggleClass = () => {
    setActive(!isActive);
  }; 

  const history = useHistory();
  const [totalItem, setTotalItem] = useState(0);
  const [totalSection, setTotalSection] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalOperators, setTotalOperators] = useState(0);
  const [categories, setCategories] = useState([]);
  const [otadate, setOtadate] = useState([]);
  const [ikejadate, setIkejadate] = useState([]);
  const [items, setItems] = useState([]);
  const [rilTotalWorker, setRilTotalWorker] = useState([]);
  const [rilPresentWorker, setRilPresentWorker] = useState([]);
  const [rilAbsentWorker, setRilAbsentWorker] = useState([]);
  const [lornaTotalWorker, setLornaTotalWorker] = useState([]);
  const [lornaPresentWorker, setLornaPresentWorker] = useState([]);
  const [lornaAbsentWorker, setLornaAbsentWorker] = useState([]);
  const [ikejaTotalWorker, setIkejaTotalWorker] = useState([]);
  const [ikejaPresentWorker, setIkejaPresentWorker] = useState([]);
  const [ikejaAbsentWorker, setIkejaAbsentWorker] = useState([]);
  const [rilTotalOperator, setRilTotalOperator] = useState([]);
  const [lornaTotalOperator, setLornaTotalOperator] = useState([]);
  const [ikejaTotalOperator, setIkejaTotalOperator] = useState([]);
  //table data ota
  const [otaDirectExpectedDay, setOtaDirectExpectedDay] = useState([]);
    const [otaDirectPresentDay, setOtaDirectPresentDay] = useState([]);         
    const [otaDirectAbsentDay, setOtaDirectAbsentDay] = useState([]);          
    const [otaIndirectExpectedDay, setOtaIndirectExpectedDay] = useState([]);      
    const [otaIndirectPresentDay, setOtaIndirectPresentDay] = useState([]);       
    const [otaIndirectAbsentDay, setOtaIndirectAbsentDay] = useState([]);
    const [otaDirectExpectedNight, setOtaDirectExpectedNight] = useState([]);      
    const [otaDirectPresentNight, setOtaDirectPresentNight] = useState([]);       
    const [otaDirectAbsentNight, setOtaDirectAbsentNight] = useState([]);
    const [otaIndirectExpectedNight, setOtaIndirectExpectedNight] = useState([]);    
    const [otaIndirectPresentNight, setOtaIndirectPresentNight] = useState([]);     
    const [otaIndirectAbsentNight, setOtaIndirectAbsentNight] = useState([]); 
    //table data ikeja 
    const [ikejaDirectExpectedDay, setIkejaDirectExpectedDay] = useState([]);
    const [ikejaDirectPresentDay, setIkejaDirectPresentDay] = useState([]);         
    const [ikejaDirectAbsentDay, setIkejaDirectAbsentDay] = useState([]);          
    const [ikejaIndirectExpectedDay, setIkejaIndirectExpectedDay] = useState([]);      
    const [ikejaIndirectPresentDay, setIkejaIndirectPresentDay] = useState([]);       
    const [ikejaIndirectAbsentDay, setIkejaIndirectAbsentDay] = useState([]);
    const [ikejaDirectExpectedNight, setIkejaDirectExpectedNight] = useState([]);      
    const [ikejaDirectPresentNight, setIkejaDirectPresentNight] = useState([]);       
    const [ikejaDirectAbsentNight, setIkejaDirectAbsentNight] = useState([]);
    const [ikejaIndirectExpectedNight, setIkejaIndirectExpectedNight] = useState([]);    
    const [ikejaIndirectPresentNight, setIkejaIndirectPresentNight] = useState([]);     
    const [ikejaIndirectAbsentNight, setIkejaIndirectAbsentNight] = useState([]); 


  useEffect(() => {
    document.title = 'Dashboard';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

        // Fetch data from the server API
     
      fetchcountitems();
      fetchotadate();
      fetchikejadate();
      fetchtotalworkerril();
      fetchpresentworkerril();
      fetchabsentworkerril();
      fetchtotalworkerlorna();
      fetchpresentworkerlorna();
      fetchabsentworkerlorna();
      fetchtotalworkerikeja();
      fetchpresentworkerikeja();
      fetchabsentworkerikeja();
      fetchtotaloperatorril();
      fetchtotaloperatorlorna();
      fetchtotaloperatorikeja();
      //table data ota
      fetchotadirectexpectedday();
      fetchotadirectpresentday();
      fetchotadirectabsentday();
      fetchotaindirectexpectedday();
      fetchotaindirectpresentday();
      fetchotaindirectabsentday();
      fetchotadirectexpectednight();
      fetchotadirectpresentnight();
      fetchotadirectabsentnight();
      fetchotaindirectexpectednight();
      fetchotaindirectpresentnight();
      fetchotaindirectabsentnight();
      //table data ikeja
      fetchikejadirectexpectedday();
      fetchikejadirectpresentday();
      fetchikejadirectabsentday();
      fetchikejaindirectexpectedday();
      fetchikejaindirectpresentday();
      fetchikejaindirectabsentday();
      fetchikejadirectexpectednight();
      fetchikejadirectpresentnight();
      fetchikejadirectabsentnight();
      fetchikejaindirectexpectednight();
      fetchikejaindirectpresentnight();
      fetchikejaindirectabsentnight();

    
      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, []);



  

  const fetchcountitems = async () => {
    try {
        const response = await axios.get('http://192.168.29.243:4000/icf');
        const data = response.data;
        setCategories(data.categories);
        setItems(data.totalItems);
      } catch (error) {
        console.error('Error fetching category items:', error);
      }
    };

    const fetchotadate = async () => {
      try {
          const response = await axios.get('http://192.168.29.243:4000/otadate');
          const data = response.data[0];
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOtadate(data.date);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

      const fetchikejadate = async () => {
        try {
            const response = await axios.get('http://192.168.29.243:4000/ikejadate');
            const data = response.data[0];
            //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
            setIkejadate(data.date);
            //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
           
          } catch (error) {
            console.error('Error fetching dates:', error);
          }
        };

        const fetchtotalworkerril = async () => {
          try {
              const response = await axios.get('http://192.168.29.243:4000/totalworkerril');
              const data = response.data[0];
              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
              setRilTotalWorker(data.totalWorkerCount);
              //alert('IKEJA Date: ' + data.totalWorkerCount); // Display an alert with the fetched date
             
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

          const fetchpresentworkerril = async () => {
            try {
                const response = await axios.get('http://192.168.29.243:4000/presentworkerril');
                const data = response.data[0];
                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                setRilPresentWorker(data.totalPresentCount);
                //alert('IKEJA Date: ' + data.totalPresentCountate); // Display an alert with the fetched date
               
              } catch (error) {
                console.error('Error fetching category items:', error);
              }
            };

            const fetchabsentworkerril = async () => {
              try {
                  const response = await axios.get('http://192.168.29.243:4000/absentworkerril');
                  const data = response.data[0];
                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                  setRilAbsentWorker(data.totalAbsentCount);
                  //alert('IKEJA Date: ' + data.totalAbsentCountate); // Display an alert with the fetched date
                 
                } catch (error) {
                  console.error('Error fetching category items:', error);
                }
              };

              const fetchtotalworkerlorna = async () => {
                try {
                    const response = await axios.get('http://192.168.29.243:4000/totalworkerlorna');
                    const data = response.data[0];
                    //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                    setLornaTotalWorker(data.totalWorkerCount);
                    //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                   
                  } catch (error) {
                    console.error('Error fetching category items:', error);
                  }
                };
      
                const fetchpresentworkerlorna = async () => {
                  try {
                      const response = await axios.get('http://192.168.29.243:4000/presentworkerlorna');
                      const data = response.data[0];
                      //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                      setLornaPresentWorker(data.totalPresentCount);
                      //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                     
                    } catch (error) {
                      console.error('Error fetching category items:', error);
                    }
                  };
      
                  const fetchabsentworkerlorna = async () => {
                    try {
                        const response = await axios.get('http://192.168.29.243:4000/absentworkerlorna');
                        const data = response.data[0];
                        //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                        setLornaAbsentWorker(data.totalAbsentCount);
                        //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                       
                      } catch (error) {
                        console.error('Error fetching category items:', error);
                      }
                    };

                    const fetchtotalworkerikeja = async () => {
                      try {
                          const response = await axios.get('http://192.168.29.243:4000/totalworkerikeja');
                          const data = response.data[0];
                          //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                          setIkejaTotalWorker(data.totalWorkerCount);
                          //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                         
                        } catch (error) {
                          console.error('Error fetching category items:', error);
                        }
                      };
            
                      const fetchpresentworkerikeja = async () => {
                        try {
                            const response = await axios.get('http://192.168.29.243:4000/presentworkerikeja');
                            const data = response.data[0];
                            //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                            setIkejaPresentWorker(data.totalPresentCount);
                            //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                           
                          } catch (error) {
                            console.error('Error fetching category items:', error);
                          }
                        };
            
                        const fetchabsentworkerikeja = async () => {
                          try {
                              const response = await axios.get('http://192.168.29.243:4000/absentworkerikeja');
                              const data = response.data[0];
                              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                              setIkejaAbsentWorker(data.totalAbsentCount);
                              //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
                             
                            } catch (error) {
                              console.error('Error fetching category items:', error);
                            }
                          };

                          const fetchtotaloperatorril = async () => {
                            try {
                                const response = await axios.get('http://192.168.29.243:4000/totaloperatorril');
                                const data = response.data[0];
                                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                                setRilTotalOperator(data.rilOpCount);
                                //alert('IKEJA Date: ' + data.rilOpCount); // Display an alert with the fetched date
                               
                              } catch (error) {
                                console.error('Error fetching total operators:', error);
                              }
                            };
                  
                            const fetchtotaloperatorlorna = async () => {
                              try {
                                  const response = await axios.get('http://192.168.29.243:4000/totaloperatorlorna');
                                  const data = response.data[0];
                                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                                  setLornaTotalOperator(data.lornaOpCount);
                                  //alert('IKEJA Date: ' + data.lornaOpCount); // Display an alert with the fetched date
                                 
                                } catch (error) {
                                  console.error('Error fetching total operators:', error);
                                }
                              };
                  
                              const fetchtotaloperatorikeja = async () => {
                                try {
                                    const response = await axios.get('http://192.168.29.243:4000/totaloperatorikeja');
                                    const data = response.data[0];
                                    //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                                    setIkejaTotalOperator(data.ikejaOpCount);
                                    //alert('IKEJA Date: ' + data.ikejaOpCount); // Display an alert with the fetched date
                                   
                                  } catch (error) {
                                    console.error('Error fetching total operators:', error);
                                  }
                                };

                                //table ota data fetch

                                //fetch ota direct data day

                                const fetchotadirectexpectedday = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/otadirectexpectedday');
                                      const data = response.data[0];
                                     
                                      setOtaDirectExpectedDay(data.otaDEDCount);
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected day:', error);
                                    }
                                  };

                                  const fetchotadirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otadirectpresentday');
                                        const data = response.data[0];
                                       
                                        setOtaDirectPresentDay(data.otaDPDCount);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present day:', error);
                                      }
                                    };

                                    const fetchotadirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otadirectabsentday');
                                          const data = response.data[0];
                                          
                                          setOtaDirectAbsentDay(data.otaDADCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent day:', error);
                                        }
                                      };

                                  //fetch ota indirect data day

                                  const fetchotaindirectexpectedday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectexpectedday');
                                        const data = response.data[0];
                                        
                                        setOtaIndirectExpectedDay(data.otaIEDCount);
                                        
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected day:', error);
                                      }
                                    };

                                  const fetchotaindirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectpresentday');
                                        const data = response.data[0];
                                        
                                        setOtaIndirectPresentDay(data.otaIPDCount);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present day:', error);
                                      }
                                    };

                                    const fetchotaindirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otaindirectabsentday');
                                          const data = response.data[0];
                                          
                                          setOtaIndirectAbsentDay(data.otaIADCount);
                                          
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent day:', error);
                                        }
                                      };

                                      //fetch ota direct data night

                                const fetchotadirectexpectednight = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/otadirectexpectednight');
                                      const data = response.data[0];
                                      
                                      setOtaDirectExpectedNight(data.otaDENCount);
                                      
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected night:', error);
                                    }
                                  };

                                  const fetchotadirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otadirectpresentnight');
                                        const data = response.data[0];
                                        
                                        setOtaDirectPresentNight(data.otaDPNCount);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present night:', error);
                                      }
                                    };

                                    const fetchotadirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otadirectabsentnight');
                                          const data = response.data[0];
                                          
                                          setOtaDirectAbsentNight(data.otaDANCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent night:', error);
                                        }
                                      };

                                  //fetch ota indirect data night

                                  const fetchotaindirectexpectednight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectexpectednight');
                                        const data = response.data[0];
                                       
                                        setOtaIndirectExpectedNight(data.otaIENCount);
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected night:', error);
                                      }
                                    };

                                  const fetchotaindirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectpresentnight');
                                        const data = response.data[0];
                                       
                                        setOtaIndirectPresentNight(data.otaIPNCount);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present night:', error);
                                      }
                                    };

                                    const fetchotaindirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otaindirectabsentnight');
                                          const data = response.data[0];
                                          
                                          setOtaIndirectAbsentNight(data.otaIANCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent night:', error);
                                        }
                                      };

                              //table ikeja data fetch

                                //fetch ikeja direct data day

                                const fetchikejadirectexpectedday = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/ikejadirectexpectedday');
                                      const data = response.data[0];
                                     
                                      setIkejaDirectExpectedDay(data.ikejaDEDCount);
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ikeja direct expected day:', error);
                                    }
                                  };

                                  const fetchikejadirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejadirectpresentday');
                                        const data = response.data[0];
                                       
                                        setIkejaDirectPresentDay(data.ikejaDPDCount);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present day:', error);
                                      }
                                    };

                                    const fetchikejadirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejadirectabsentday');
                                          const data = response.data[0];
                                         
                                          setIkejaDirectAbsentDay(data.ikejaDADCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent day:', error);
                                        }
                                      };

                                  //fetch ikeja indirect data day

                                  const fetchikejaindirectexpectedday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectexpectedday');
                                        const data = response.data[0];
                                       
                                        setIkejaIndirectExpectedDay(data.ikejaIEDCount);
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected day:', error);
                                      }
                                    };

                                  const fetchikejaindirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectpresentday');
                                        const data = response.data[0];
                                       
                                        setIkejaIndirectPresentDay(data.ikejaIPDCount);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present day:', error);
                                      }
                                    };

                                    const fetchikejaindirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejaindirectabsentday');
                                          const data = response.data[0];
                                         
                                          setIkejaIndirectAbsentDay(data.ikejaIADCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent day:', error);
                                        }
                                      };

                                      //fetch ikeja direct data night

                                const fetchikejadirectexpectednight = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/ikejadirectexpectednight');
                                      const data = response.data[0];
                                     
                                      setIkejaDirectExpectedNight(data.ikejaDENCount);
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ikeja direct expected night:', error);
                                    }
                                  };

                                  const fetchikejadirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejadirectpresentnight');
                                        const data = response.data[0];
                                       
                                        setIkejaDirectPresentNight(data.ikejaDPNCount);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present night:', error);
                                      }
                                    };

                                    const fetchikejadirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejadirectabsentnight');
                                          const data = response.data[0];
                                         
                                          setIkejaDirectAbsentNight(data.ikejaDANCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent night:', error);
                                        }
                                      };

                                  //fetch ikeja indirect data night

                                  const fetchikejaindirectexpectednight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectexpectednight');
                                        const data = response.data[0];
                                       
                                        setIkejaIndirectExpectedNight(data.ikejaIENCount);
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected night:', error);
                                      }
                                    };

                                  const fetchikejaindirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectpresentnight');
                                        const data = response.data[0];
                                       
                                        setIkejaIndirectPresentNight(data.ikejaIPNCount);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present night:', error);
                                      }
                                    };

                                    const fetchikejaindirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejaindirectabsentnight');
                                          const data = response.data[0];
                                         
                                          setIkejaIndirectAbsentNight(data.ikejaIANCount);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent night:', error);
                                        }
                                      };

  

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
       
         <Header />

        <main>
          <center>
        <div className='row  mt-3'>
          <div className='col'>
            <span className='textred'>Attendance Showing: </span>
            <span class="textgreen">Date: {otadate}</span> for <span class="textblue">OTA</span> 
            <span> and </span>
            <span class="textgreen">Date: {ikejadate}</span> for <span class="textblue">IKEJA</span>
          </div>
        </div>
        </center>
      
    
        <div className="box-info">
            <div className="row" style={{ paddingLeft: '3rem' }}>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                  <div className="text-center"> 
                  <i className="bx bxs-user-detail design"></i>
                   </div>
                  
                    <h5 className="card-title">RIL STAFF<sup>(Workers)</sup></h5>
                     <hr></hr>
                    <p className="card-text">
                      
                      <div className="row">
                        <div className="col">
                          <h5>{rilTotalWorker}</h5>
                          <span>TOTAL </span>
                        </div>
                        <div className="col">
                        <h5>{rilPresentWorker}</h5>
                          <span>PRESENT </span>
                        </div>
                        <div className="col">
                        <h5>{rilAbsentWorker}</h5>
                          <span>ABSENT </span>
                        </div>
                      </div>
                    </p>
                    
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card1">
                  <div className="card-body">
                  <div className="text-center"> 
                  <i className="bx bxs-user-detail design"></i>
                   </div>
                  
                    <h5 className="card-title">LORNA STAFF<sup>(Workers)</sup></h5>
                     <hr></hr>
                    <p className="card-text">
                      
                      <div className="row">
                        <div className="col">
                        <h5>{lornaTotalWorker}</h5>
                          <span>TOTAL </span>
                        </div>
                        <div className="col">
                        <h5>{lornaPresentWorker}</h5>
                          <span>PRESENT </span>
                        </div>
                        <div className="col">
                        <h5>{lornaAbsentWorker}</h5>
                          <span>ABSENT </span>
                        </div>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card2">
                  <div className="card-body">
                  <div className="text-center"> 
                  <i className="bx bxs-user-detail design"></i>
                   </div>
                  
                    <h5 className="card-title">IKEJA STAFF<sup>(Workers)</sup></h5>
                     <hr></hr>
                    <p className="card-text">
                      
                      <div className="row">
                        <div className="col">
                        <h5>{ikejaTotalWorker}</h5>
                          <span>TOTAL </span>
                        </div>
                        <div className="col">
                        <h5>{ikejaPresentWorker}</h5>
                          <span>PRESENT </span>
                        </div>
                        <div className="col">
                        <h5>{ikejaAbsentWorker}</h5>
                          <span>ABSENT </span>
                        </div>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          

          <ul className="box-info ">
          
            <li className='single-expense bg-light-info mb-2'>
              <i className="bx bxs-user"></i>

             
              <span className="text">
              <h3>RIL</h3>
              <h6>Operator: {rilTotalOperator}</h6>
                
              </span>
            </li>
            <li className='single-expense bg-light-warning mb-2'>
            <i className="bx bxs-user"></i>
              <span className="text">
              <h3>Lorna</h3>
              <h6>Operator: {lornaTotalOperator}</h6>
              </span>
            </li>
            <li className='single-expense bg-light-primary mb-2'>
            <i className="bx bxs-user" ></i>
              <span className="text">
              <h3>Ikeja</h3>
              <h6>Operator: {ikejaTotalOperator}</h6>
              </span>
            </li>
          </ul>

          <div className='row '>
          <div className="col">
          <table width="100%" border="1" cellspacing="0" className="border-class">
  <tr style={{ backgroundColor: '#fbc02d' }}>
    <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>OTA</strong></td>
  </tr>
  <tr>
    <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT</td>
    <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT</td>
  </tr>
  <tr style={{ backgroundColor: '#b0bec5' }}>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
    <td width="2%">&nbsp;</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
    <td width="2%">&nbsp;</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
  </tr>
  <tr>
    <td align="left">Expected: {otaDirectExpectedDay}</td>
    <td>&nbsp;</td>
    <td align="left">Expected: {otaIndirectExpectedDay}</td>
    <td align="left">Expected: {otaDirectExpectedNight}</td>
    <td>&nbsp;</td>
  <td align="left">Expected: {otaIndirectExpectedNight}</td>
  </tr>
 <tr>
    <td align="left">Present: {otaDirectPresentDay}</td>
    <td>&nbsp;</td>
  <td align="left">Present: {otaIndirectPresentDay}</td>
    <td align="left">Present: {otaDirectPresentNight}</td>
    <td>&nbsp;</td>
   <td align="left">Present: {otaIndirectPresentNight}</td>
  </tr>
  <tr>
    <td align="left">Absent: {otaDirectAbsentDay}</td>
    <td>&nbsp;</td>
     <td align="left">Absent: {otaIndirectAbsentDay}</td>
    <td align="left">Absent: {otaDirectAbsentNight}</td>
    <td>&nbsp;</td>
    <td align="left">Absent: {otaIndirectAbsentNight}</td>
  </tr>
</table>
          
          </div>
          <div className="col">
          <table width="100%" border="1" cellspacing="0" className="border-class">
  <tr style={{ backgroundColor: '#fbc02d' }}>
    <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>IKEJA</strong></td>
  </tr>
  <tr >
    <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT </td>
    <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT </td>
  </tr>
  <tr style={{ backgroundColor: '#b0bec5' }}>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
    <td width="2%">&nbsp;</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
    <td width="2%">&nbsp;</td>
    <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
  </tr>
  <tr>
    <td align="left">Expected: {ikejaDirectExpectedDay}</td>
    <td>&nbsp;</td>
    <td align="left">Expected: {ikejaIndirectExpectedDay}</td>
    <td align="left">Expected: {ikejaDirectExpectedNight}</td>
    <td>&nbsp;</td>
    <td align="left">Expected: {ikejaIndirectExpectedNight}</td>
  </tr>
  <tr>
    <td align="left">Present: {ikejaDirectPresentDay}</td>
    <td>&nbsp;</td>
  <td align="left">Present: {ikejaIndirectPresentDay}</td>
    <td align="left">Present: {ikejaDirectPresentNight}</td>
    <td>&nbsp;</td>
   <td align="left">Present: {ikejaIndirectPresentNight}</td>
  </tr>
  <tr>
    <td align="left">Absent: {ikejaDirectAbsentDay}</td>
    <td>&nbsp;</td>
     <td align="left">Absent: {ikejaIndirectAbsentDay}</td>
    <td align="left">Absent: {ikejaDirectAbsentNight}</td>
    <td>&nbsp;</td>
    <td align="left">Absent: {ikejaIndirectAbsentNight}</td>
  </tr>
</table>
          
                  
          </div>
          </div>

          
         
          
        </main>
      </section>
      
    </div>
  );
}

export default DashboardComponent;
