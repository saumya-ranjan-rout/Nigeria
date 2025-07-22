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


    
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };
  // alert(token);
   //alert(roleId);
     //alert(ptype);
     // alert(ctype);

   const [slideIndex, setSlideIndex] = useState(1);
  const [assignedList, setAssignedList] = useState([]);

  function plusDivs(n) {
    const newIndex = slideIndex + n;
    setSlideIndex(newIndex > assignedList.length ? 1 : newIndex < 1 ? assignedList.length : newIndex);
  }


  useEffect(() => {
    document.title = 'Dashboard';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      history.push('/login');
    } else {

        // Fetch data from the server API
      fetchTotalItem();
      fetchTotalSection();
      fetchTotalWorkers();
      fetchTotalOperators();
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

      
      fetchAssignedZoneMachine();

    
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

  const fetchTotalItem = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/dashbord_total_item');
      const data = response.data;
      setTotalItem(data.totalItem);
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

  const fetchTotalSection = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/dashbord_total_section');
      const data = response.data;
      setTotalSection(data.totalSection);
    } catch (error) {
      console.error('Error fetching total section:', error);
    }
  };

  const fetchTotalWorkers = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/dashbord_total_workers');
      const data = response.data;
      setTotalWorkers(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalOperators = async () => {
    try {
      const response = await axios.get('http://192.168.29.243:4000/dashbord_total_operators');
      const data = response.data;
      setTotalOperators(data.totalOperators);
    } catch (error) {
      console.error('Error fetching total operators:', error);
    }
  };

  

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
                                     if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setOtaDirectExpectedDay(data.otaDEDCount);
                                        } else {
                                            setOtaDirectExpectedDay(0);
                                        }
                                     
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected day:', error);
                                      setOtaDirectExpectedDay(0);
                                    }
                                  };

                                  const fetchotadirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otadirectpresentday');
                                        const data = response.data[0];
                                       if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaDirectPresentDay(data.otaDPDCount);
                                        } else {
                                            setOtaDirectPresentDay(0);
                                        }
                                        
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present day:', error);
                                        setOtaDirectPresentDay(0);
                                      }
                                    };

                                    const fetchotadirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otadirectabsentday');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaDirectAbsentDay(data.otaDADCount);
                                        } else {
                                           setOtaDirectAbsentDay(0);
                                        }
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent day:', error);
                                          setOtaDirectAbsentDay(0);
                                        }
                                      };

                                  //fetch ota indirect data day

                                  const fetchotaindirectexpectedday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectexpectedday');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaIndirectExpectedDay(data.otaIEDCount);
                                        } else {
                                           setOtaIndirectExpectedDay(0);
                                        }
                                        
                                        
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected day:', error);
                                        setOtaIndirectExpectedDay(0);
                                      }
                                    };

                                  const fetchotaindirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectpresentday');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaIndirectPresentDay(data.otaIPDCount);
                                        } else {
                                           setOtaIndirectPresentDay(0);
                                        }
                                        
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present day:', error);
                                        setOtaIndirectPresentDay(0);
                                      }
                                    };

                                    const fetchotaindirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otaindirectabsentday');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaIndirectAbsentDay(data.otaIADCount);
                                        } else {
                                           setOtaIndirectAbsentDay(0);
                                        }
                                          
                                          
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent day:', error);
                                          setOtaIndirectAbsentDay(0);
                                        }
                                      };

                                      //fetch ota direct data night

                                const fetchotadirectexpectednight = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/otadirectexpectednight');
                                      const data = response.data[0];
                                      if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaDirectExpectedNight(data.otaDENCount);
                                        } else {
                                           setOtaDirectExpectedNight(0);
                                        }
                                      
                                      
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected night:', error);
                                      setOtaDirectExpectedNight(0);
                                    }
                                  };

                                  const fetchotadirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otadirectpresentnight');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaDirectPresentNight(data.otaDPNCount);
                                        } else {
                                            setOtaDirectPresentNight(0);
                                        }
                                        
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present night:', error);
                                        setOtaDirectPresentNight(0);
                                      }
                                    };

                                    const fetchotadirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otadirectabsentnight');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                           setOtaDirectAbsentNight(data.otaDANCount);
                                        } else {
                                            setOtaDirectAbsentNight(0);
                                        }
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent night:', error);
                                          setOtaDirectAbsentNight(0);
                                        }
                                      };

                                  //fetch ota indirect data night

                                  const fetchotaindirectexpectednight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectexpectednight');
                                        const data = response.data[0];
                                       if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setOtaIndirectExpectedNight(data.otaIENCount);
                                        } else {
                                            setOtaIndirectExpectedNight(0);
                                        }
                                        
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected night:', error);
                                        setOtaIndirectExpectedNight(0);
                                      }
                                    };

                                  const fetchotaindirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/otaindirectpresentnight');
                                        const data = response.data[0];
                                       if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setOtaIndirectPresentNight(data.otaIPNCount);
                                        } else {
                                            setOtaIndirectPresentNight(0);
                                        }
                                        
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present night:', error);
                                        setOtaIndirectPresentNight(0);
                                      }
                                    };

                                    const fetchotaindirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/otaindirectabsentnight');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setOtaIndirectAbsentNight(data.otaIANCount);
                                        } else {
                                            setOtaIndirectAbsentNight(0);
                                        }
                                          
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent night:', error);
                                          setOtaIndirectAbsentNight(0);
                                        }
                                      };

                              //table ikeja data fetch

                                //fetch ikeja direct data day

                                const fetchikejadirectexpectedday = async () => {
                                  try {
                                      const response = await axios.get('http://192.168.29.243:4000/ikejadirectexpectedday');
                                      const data = response.data[0];
                                      if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setIkejaDirectExpectedDay(data.ikejaDEDCount);
                                        } else {
                                            setIkejaDirectExpectedDay(0);
                                        }
                                     
                                      
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ikeja direct expected day:', error);
                                      setIkejaDirectExpectedDay(0);
                                    }
                                  };

                                  const fetchikejadirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejadirectpresentday');
                                        const data = response.data[0];
                                       if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setIkejaDirectPresentDay(data.ikejaDPDCount);
                                        } else {
                                            setIkejaDirectPresentDay(0);
                                        }
                                        
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present day:', error);
                                        setIkejaDirectPresentDay(0);
                                      }
                                    };

                                    const fetchikejadirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejadirectabsentday');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                             setIkejaDirectAbsentDay(data.ikejaDADCount);
                                        } else {
                                            setIkejaDirectAbsentDay(0);
                                        }
                                         
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent day:', error);
                                          setIkejaDirectAbsentDay(0);
                                        }
                                      };

                                  //fetch ikeja indirect data day

                                  const fetchikejaindirectexpectedday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectexpectedday');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                              setIkejaIndirectExpectedDay(data.ikejaIEDCount);
                                        } else {
                                            setIkejaIndirectExpectedDay(0);
                                        }
                                        
                                       
                                        
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected day:', error);
                                        setIkejaIndirectExpectedDay(0);
                                      }
                                    };

                                  const fetchikejaindirectpresentday = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectpresentday');
                                        const data = response.data[0];
                                       if (response.data.length > 0) {
                                            const data = response.data[0];
                                              setIkejaIndirectPresentDay(data.ikejaIPDCount);
                                        } else {
                                            setIkejaIndirectPresentDay(0);
                                        }
                                        
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present day:', error);
                                        setIkejaIndirectPresentDay(0);
                                      }
                                    };

                                    const fetchikejaindirectabsentday = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejaindirectabsentday');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                              setIkejaIndirectAbsentDay(data.ikejaIADCount);
                                        } else {
                                            setIkejaIndirectAbsentDay(0);
                                        }
                                         
                                        
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent day:', error);
                                          setIkejaIndirectAbsentDay(0);
                                        }
                                      };

                                      //fetch ikeja direct data night

                                const fetchikejadirectexpectednight = async () => {
                                  try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejadirectexpectednight');
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setIkejaDirectExpectedNight(data.ikejaDENCount);
                                        } else {
                                            setIkejaDirectExpectedNight(0);
                                        }
                                    } catch (error) {
                                        console.error('Error fetching ikeja direct expected night:', error);
                                        setIkejaDirectExpectedNight(0);
                                    }
                                  };

                                  const fetchikejadirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejadirectpresentnight');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setIkejaDirectPresentNight(data.ikejaDPNCount);
                                        } else {
                                            setIkejaDirectPresentNight(0);
                                        }
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present night:', error);
                                        setIkejaDirectPresentNight(0);
                                      }
                                    };

                                    const fetchikejadirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejadirectabsentnight');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                            setIkejaDirectAbsentNight(data.ikejaDANCount);
                                        } else {
                                            setIkejaDirectAbsentNight(0);
                                        }
                                         
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent night:', error);
                                          setIkejaDirectAbsentNight(0);
                                        }
                                      };

                                  //fetch ikeja indirect data night

                                  const fetchikejaindirectexpectednight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectexpectednight');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                             setIkejaIndirectExpectedNight(data.ikejaIENCount);
                                        } else {
                                            setIkejaIndirectExpectedNight(0);
                                        }
                                       
                                       
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected night:', error);
                                        setIkejaIndirectExpectedNight(0);
                                      }
                                    };

                                  const fetchikejaindirectpresentnight = async () => {
                                    try {
                                        const response = await axios.get('http://192.168.29.243:4000/ikejaindirectpresentnight');
                                        const data = response.data[0];
                                        if (response.data.length > 0) {
                                            const data = response.data[0];
                                             setIkejaIndirectPresentNight(data.ikejaIPNCount);
                                        } else {
                                            setIkejaIndirectPresentNight(0);
                                        }
                                       
                                        
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present night:', error);
                                        setIkejaIndirectPresentNight(0);
                                      }
                                    };

                                    const fetchikejaindirectabsentnight = async () => {
                                      try {
                                          const response = await axios.get('http://192.168.29.243:4000/ikejaindirectabsentnight');
                                          const data = response.data[0];
                                          if (response.data.length > 0) {
                                            const data = response.data[0];
                                             setIkejaIndirectAbsentNight(data.ikejaIANCount);
                                        } else {
                                            setIkejaIndirectAbsentNight(0);
                                        }
                                         
                                          
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent night:', error);
                                          setIkejaIndirectAbsentNight(0);
                                        }
                                      };



  const fetchAssignedZoneMachine = async () => {
  try {
    const ptype = sessionStorage.getItem('production_type');
    const ctype = sessionStorage.getItem('category_type');
    const userid = sessionStorage.getItem('id'); // Make sure to get the user ID from the appropriate source

    const response = await axios.get(`http://192.168.29.243:4000/get_assigned_zone_machine/${userid}`, {
      params: {
        ptype: ptype,
        ctype: ctype,
      },
    });

    const data = response.data;
     //alert(JSON.stringify(data));
    setAssignedList(data);
  } catch (error) {
    console.error('Error fetching assigned list:', error);
  }
};




  

  return (
    <div className="container">
      <Sidebar />

      <section id="content">
       
         <Header />

        <main>
          <center>
            
          {roleId == 5 && (
             <div className='row  mt-3'>
          <div className='col'>
            <span className='text-effect'>Attendance Showing: </span>
            <span class="textgreen">Date: {otadate}</span> for <span class="textblue">OTA</span> 
            <span> and </span>
            <span class="textgreen">Date: {ikejadate}</span> for <span class="textblue">IKEJA</span>
          </div>
        </div>)}
        </center>
      
        {roleId == 5 && (
       
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>RIL STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{rilTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{rilPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{rilAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card1">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>LORNA STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{lornaTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{lornaPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{lornaAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card2">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>IKEJA STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>   
        )}

        


{ (ptype === 'ikeja') && (
  <div className="box-info">
    <div className="row" >
      { (ptype == 'ikeja' && ctype == 'BRAID') &&  (
         <div className="col-md-8">
                <style>
                  {`.mySlides {
                    display: none ;
                  }
                  .active{
                    display: block ;
                  }
                  `}
                </style>
                 {assignedList.map((row1, index) => (
                  <div
                    key={index}
                    className={`mySlides ${index + 1 === slideIndex ? 'active' : ''}`}
                    style={{ width: '100%' }}
                  >
                    <div className="cardslider">
                      <div className="cardslider-header text-center text-white bg-danger">
                        <h5 className="cardslider-title">Assigned Zone & Machine</h5>
                      </div>
                      <div className="cardslider-body text-center">
                        <p>
                          <a href="#" className="text-pink">
                            {row1.zone}>>
                          </a><br/>
                         <span className="text-grey">{row1.machine}</span>
                        </p>
                       
                        <p className=" text-muted">
                          {row1.section_name}
                          <br />
                        </p>
                      </div>
                      <div className="cardslider-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() => plusDivs(-1)}
                        >
                          &#10094;
                        </button>&nbsp;
                        <button
                          className="btn btn-primary "
                          onClick={() => plusDivs(1)}
                        >
                          &#10095;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
      )}
      { (ptype == 'ikeja' && ctype == 'NBRAID') &&  (
         <div className="col-md-8">
                <style>
                  {`.mySlides {
                    display: none ;
                  }
                  .active{
                    display: block ;
                  }
                  `}
                </style>
                 {assignedList.map((row1, index) => (
                  <div
                    key={index}
                    className={`mySlides ${index + 1 === slideIndex ? 'active' : ''}`}
                    style={{ width: '100%' }}
                  >
                    <div className="cardslider">
                      <div className="cardslider-header text-center text-white bg-danger">
                        <h5 className="cardslider-title">Assigned Zone & Machine</h5>
                      </div>
                      <div className="cardslider-body text-center">
                        <p>
                          <a href="#" className="text-pink">
                            {row1.zone}>>
                          </a><br/>
                         <span className="text-grey">{row1.machine}</span>
                        </p>
                        
                        <p className=" text-muted">
                          {row1.section_name}
                          <br />
                        </p>
                      </div>
                      <div className="cardslider-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() => plusDivs(-1)}
                        >
                          &#10094;
                        </button>&nbsp;
                        <button
                          className="btn btn-primary "
                          onClick={() => plusDivs(1)}
                        >
                          &#10095;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
      )}

       <div className="col-md-4">
              <div className="card2">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>IKEJA STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{ikejaAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
  </div>
)}

{ (ptype === 'ota') && (
  <div className="box-info">
    <div className="row" >
      { (ptype == 'ota' && ctype == 'BRAID') &&  (
         <div className="col-md-4">
                <style>
                  {`.mySlides {
                    display: none ;
                  }
                  .active{
                    display: block ;
                  }
                  `}
                </style>
                 {assignedList.map((row1, index) => (
                  <div
                    key={index}
                    className={`mySlides ${index + 1 === slideIndex ? 'active' : ''}`}
                    style={{ width: '100%' }}
                  >
                    <div className="cardslider">
                      <div className="cardslider-header text-center text-white bg-danger">
                        <h5 className="cardslider-title">Assigned Shift,Line & Section</h5>
                      </div>
                      <div className="cardslider-body text-center">
                        <p>
                          <a href="#" className="text-pink">
                            {row1.shift}[{row1.line}]>>
                          </a><br/>
                         <span className="text-grey">{row1.machine}</span>
                        </p>
                        
                        <p className=" text-muted">
                          {row1.section_name}
                          <br />
                        </p>
                      </div>
                      <div className="cardslider-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() => plusDivs(-1)}
                        >
                          &#10094;
                        </button>&nbsp;
                        <button
                          className="btn btn-primary "
                          onClick={() => plusDivs(1)}
                        >
                          &#10095;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
      )}
      { (ptype == 'ota' && ctype == 'NBRAID') &&  (
         <div className="col-md-4">
                <style>
                  {`.mySlides {
                    display: none ;
                  }
                  .active{
                    display: block ;
                  }
                  `}
                </style>
                 {assignedList.map((row1, index) => (
                  <div
                    key={index}
                    className={`mySlides ${index + 1 === slideIndex ? 'active' : ''}`}
                    style={{ width: '100%' }}
                  >
                    <div className="cardslider">
                      <div className="cardslider-header text-center text-white bg-danger">
                        <h5 className="cardslider-title">Assigned Shift,Line & Section</h5>
                      </div>
                      <div className="cardslider-body text-center">
                        <p>
                          <a href="#" className="text-pink">
                            {row1.shift}[{row1.line}]>>
                          </a><br/>
                         <span className="text-grey">{row1.machine}</span>
                        </p>
                       
                        <p className=" text-muted">
                          {row1.section_name}
                          <br />
                        </p>
                      </div>
                      <div className="cardslider-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() => plusDivs(-1)}
                        >
                          &#10094;
                        </button>&nbsp;
                        <button
                          className="btn btn-primary "
                          onClick={() => plusDivs(1)}
                        >
                          &#10095;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
      )}

            <div className="col-md-4">
              <div className="card">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>RIL STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{rilTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{rilPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{rilAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card1">
                <div className="imgBx">
                  <img src="https://ng.godrejeta.com/nigeria/userfiles/company/teamwork.png" style={{ width: '30%' }} alt="Teamwork" />
                </div>
                <div className="contentBx">
                  <h2><b>LORNA STAFF<sup>(Workers)</sup></b></h2>
                  <div class="box-footer">
                    <div class="row">
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{lornaTotalWorker}</h5>
                          <span class="description-text">Total </span>
                        </div>
                      </div>
                      <div class="col-sm-4 border-rights">
                        <div class="description-block">
                          <h5 class="description-header">{lornaPresentWorker}</h5>
                          <span class="description-text">Present</span>
                        </div>
                      </div>
                      <div class="col-sm-4">
                        <div class="description-block">
                          <h5 class="description-header">{lornaAbsentWorker}</h5>
                          <span class="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
  </div>
)}



{roleId == 5 && (
          <div class="row">
            <div class="col-md-4">
              <div class="single-expense bg-light-info mb-2">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="warning circle"></div>
                    <div class="icon">
                      <i class="bx bxs-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">RIL</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{rilTotalOperator}</span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="single-expense bg-light-warning mb-2">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="error circle"></div>
                    <div class="icon">
                      <i class="bx bxs-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">LORNA</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{lornaTotalOperator}</span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="single-expense bg-light-primary">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="success circle"></div>
                    <div class="icon">
                      <i class="bx bxs-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">IKEJA</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{ikejaTotalOperator}</span>
              </div>
            </div>
          </div>
)}



          {roleId == 5 && (  <div className='row '>
          <div className="col">
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
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
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
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
          </div>)}

          {ctype == 'BRAID' && (

           <div className='row '>
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

            
          )}


{ ctype == 'NBRAID' && (

<div className='row '>
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

 
)}
         
   
        </main>
      </section>
      
    </div>
  );
}

export default DashboardComponent;
