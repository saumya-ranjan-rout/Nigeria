import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // If you're using React Router for navigation
import logoImage from '../component/eta.png'; // Import your logo image
import 'bootstrap/dist/css/bootstrap.css';



const colStyle1 = {
  height: '250px', // Adjust the height to include padding
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(143deg, #981450 40%, #5568f3 100%)',
  padding: '60px',
};


const colStyle2 = {
  height: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
 background: 'linear-gradient(135deg, #1a07b9 0%, #55f368 100%)',

   padding: '60px',
};

const colStyle3 = {
  height: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
 background: 'linear-gradient(135deg, #ef904c 0%, #78cfbf 100%)',

   padding: '120px',
};

 

export function SecondPage() {


useEffect(() => {
    document.title = 'GODREJETA | Login'; // Set your desired page title here
  }, []);
  
  return (
    <>
     

      <div className="second-page" >
       <img
          src="https://ng.godrejeta.com/assets/images/prd3.jpg"
          alt=""
          style={{ width: '100%', height: '500px' }}
        />
      </div>
      <div className="box11 stack-top11" >

        <img src={logoImage} alt="Logo" className="logo1" />
        <div className="row">
          <div className="col-md-4" style={colStyle1}>
            <div>
              <h2 style={{ color: '#ffffff', marginTop: '40px', lineHeight: 1.5, fontWeight: 400, fontFamily: "Lato, Arial, sans-serif" }}>Welcome to<br /> Matori</h2>
              
              <a href="/second">
                <button className="button-matori">Sign In</button>
              </a>
            </div>
          </div>
          <div className="col-md-4" style={colStyle2}>
            <div>
              <h2 style={{ color: '#ffffff', marginTop: '40px', lineHeight: 1.5, fontWeight: 400, fontFamily: "Lato, Arial, sans-serif" }}>Welcome to<br /> Ota-Ikeja</h2>
              
               <a href="/login">
                <button className="button-ota">Sign In</button>
              </a>
            </div>
          </div>
          <div className="col-md-4" style={colStyle3}>
            <div>
              <h2 style={{ color: '#ffffff', marginTop: '40px', lineHeight: 1.5, fontWeight: 400, fontFamily: "Lato, Arial, sans-serif" }}>Site<br /> Display</h2>
              
              <a href="/site-display">
                <button className="button-ota">Go To</button>
              </a>
            </div>
          </div>
        </div></div>
     
      
    </>
  );
}

export default SecondPage;