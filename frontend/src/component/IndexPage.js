import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // If you're using React Router for navigation
import logoImage from '../component/eta.png'; // Import your logo image
import 'bootstrap/dist/css/bootstrap.css';

export function IndexPage() {


  useEffect(() => {
    document.title = 'GODREJETA'; // Set your desired page title here
  }, []);


  return (
     <div className="index-page">
    <div className="centered-container">

    {/* Logo */}
      <img src={logoImage} alt="Logo" className="logo" />
      
      <div className="button-container">
        <a href="/second" target="_blank" rel="noopener noreferrer">
        <button className="button-nigeria">Login with Nigeria</button>
         </a>
        
        <a href="http://192.168.29.242:3001/" target="_blank" rel="noopener noreferrer">
        <button className="button-mozambique">Login with Mozambique</button>
         </a>
        
        <a href="http://192.168.29.191:3001/GODREJETA-KENYA-REACT" target="_blank" rel="noopener noreferrer">
        <button className="button-kenya">Login with Kenya</button>
         </a>
        <a href="http://192.168.29.191:3002" target="_blank" rel="noopener noreferrer">
        <button className="button-tanzania">Login with Tanzania</button>
         </a>
         <a href="#" target="_blank" rel="noopener noreferrer">
        <button className="button-ghana">Login with Ghana</button>
         </a>
        
        
      </div>
    </div>
     </div>
  );
}

export default IndexPage;
