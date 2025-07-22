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
import Sidebar from '../../../Sidebar';
import Header from '../../../Header';
import { Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';


export function EmployeeList() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const toggleClass = () => {
    setActive(!isActive);
  };
  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };
 
  const history = useHistory();
  useEffect(() => {
  document.title = 'Zone Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    history.push('/login');
  } else {
 
  }
}, [history]); 

  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  return (
    <div className="container">
      <Sidebar />

      <section id="content">
        <Header />

        <main>
          <div className="container dt">
            <h5 className="title">Show List of worker working on different category</h5>
            <hr/>
             <div className='row' style={{padding:'50px'}}>
                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="#" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Braid 
                   </Link>
                   <p>
                    <Link to="/hrm/ikeja/changezone" className="btn btn-primary btn-sm">
                      Without <i class="bx bx-checkbox-checked"></i> 
                   </Link>
                    &nbsp;
                    <Link to="/hrm/ikeja/changezoneCheckbox" className="btn btn-primary btn-sm">
                      With <i class="bx bx-checkbox-checked"></i> 
                   </Link>
                   </p>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="/hrm/ikeja/changezonetonbraid" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Convert Braid To NBraid
                    </Link>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="#" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      NBraid
                    </Link>
                    <p>
                    <Link to="/hrm/ikeja/changezonenbraid" className="btn btn-primary btn-sm">
                      Without <i class="bx bx-checkbox-checked"></i> 
                   </Link>
                    &nbsp;
                    <Link to="/hrm/ikeja/changezonenbraidCheckbox" className="btn btn-primary btn-sm">
                      With <i class="bx bx-checkbox-checked"></i> 
                   </Link>
                   </p>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="/hrm/ikeja/changezonetobraid" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Convert NBraid To Braid
                    </Link>
                </div>
             </div>
        
          </div>
        </main>
      </section>
    </div>
  );
}

export default EmployeeList;
