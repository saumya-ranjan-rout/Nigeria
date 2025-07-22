import React, { useEffect, useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import logoImage from '../component/eta.png';




export function TvDisplayMoz() {
  const history = useHistory();
  const tableRef = useRef(null);
  
  const [fgslide, setFGSlide] = useState([]);
  const [pvtslide, setPVTSlide] = useState([]);
  const [iwpppslide, setIWPPPSlide] = useState([]);
  const [mtdpppslide, setMTDPPPSlide] = useState([]);
  const [twslide, setTWSlide] = useState([]);
  const [twmtdslide, setTWMTDSlide] = useState([]);
 

const divRef = useRef(null);
  let direction = 1; // 1 for scrolling down, -1 for scrolling up
  let scrollInterval;

  const scrollDiv = () => {
    scrollInterval = setInterval(() => {
      if (direction === 1) {
        // Scroll down
        divRef.current.scrollTop += 1;
        if (
          divRef.current.scrollTop + divRef.current.clientHeight >=
          divRef.current.scrollHeight
        ) {
          // If reached the bottom, change direction to scroll up
          direction = -1;
        }
      } else {
        // Scroll up
        divRef.current.scrollTop -= 1;
        if (divRef.current.scrollTop <= 0) {
          // If reached the top, change direction to scroll down
          direction = 1;
        }
      }
    }, 70);
  };

  useEffect(() => {
    // Start scrolling
    scrollDiv();

    // Clean up interval on component unmount
    return () => clearInterval(scrollInterval);
  }, []); // Empty dependency array to run the effect only once on mount

  const handleMouseEnter = () => {
    // Stop scrolling when mouse is over the div
    clearInterval(scrollInterval);
  };

  const handleMouseLeave = () => {
    // Resume scrolling when mouse leaves the div
    scrollDiv();
  };

useEffect(() => {
    document.title = 'TV DISPLAY';
   
  }, []);



 
  const [carouselData, setCarouselData] = useState([
    // Add your content for each carousel here
    [
      {
        
        content: (
          <div className="container-fluid">
            <div className="row">
              {/* Sidebar */}
              <div className="col-md-3">
                <div className="sidebar">
                   <div className="row">
		              	<h5 align="center" className="hh5">MELHORES REALIZADORES</h5>
		                <hr/>
		                </div>
		                <div className="row">
		              	<h5 align="center" className="hh5">FINALIZADORES</h5>
		                <hr/>
	                </div>
                </div>
              </div>
              {/* Main Content */}
              <div className="col-md-9">
                <div className="cardslides">
                <div className="container">
                  <div className="row">
	              	<h5 align="center" className="hh6">5 MELHORES REALIZADORES POR SECÇÃO</h5>
	                <hr/>
	                </div>
	                <div className="row">
	              	<h5 align="center" className="hh6">5 FINALIZADORES POR SECÇÃO</h5>
	                <hr/>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
       
        content: (
          <div className="container-fluid">
            <div className="row">
              
              <div className="col-md-12">
                <div className="cardslides">
                <div className="container">
                  <div className="row">
	              	<h5 align="center" className="hh5">TODOS OS TRABALHADORES POR SECÇÃO</h5>
	                <hr/>
	              </div>
	              <div className="row">
	              	<div className="col-md-6"><input type="text" id="myInput" className="search"  placeholder="Search For Names.." title="Type in a name"/>
	              	</div>
	              	<div className="col-md-6"><input type="text" id="myInput" className="search"  placeholder="Search For Sections.." title="Type in a section"/>
	              	</div>
	                
                  </div>
                  <div className="row">
                  <div
      id="box" // Replace 'box' with the appropriate id for your div
      ref={divRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '800px', // Set your desired height
        overflowY: 'auto', // Allow scrolling within the div
        border: '1px solid #ddd', // Optional: Add a border for visibility
        // Hide scrollbar for all browsers
        scrollbarWidth: 'none', // For Firefox
        WebkitOverflowScrolling: 'touch', // For WebKit browsers (Chrome, Safari)
        msOverflowStyle: 'none', // For IE
      }}
    >
	              	<table className="tables" id="myTable" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dddddd' }}>
				      <thead
          style={{
            backgroundColor: 'gray',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
				        <tr style={{ backgroundColor: 'gray', color: 'white' }}>
				          <th style={{ borderRight: '1px solid #2e6398' }}>Id</th>
				          <th style={{ borderRight: '1px solid #2e6398' }}>Name</th>
				          <th style={{ borderRight: '1px solid #2e6398' }} hidden>Section</th>
				          <th style={{ borderRight: '1px solid #2e6398' }}>Efficiency</th>
				        </tr>
				      </thead>
				      {/* Add your table body here */}
				      <tbody>
				        <tr>
				          <td>1</td>
				          <td>John Doe</td>
				          <td hidden>Section A</td>
				          <td>90%</td>
				        </tr>
				        <tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr><tr>
                  <td>1</td>
                  <td>John Doe</td>
                  <td hidden>Section A</td>
                  <td>90%</td>
                </tr>
				      </tbody>
				    </table>
	            </div>    
                  </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        
        content: (
          <div className="container-fluid">
            <div className="cardslides">
              <video
      height="100%"
      muted
      autoPlay
      loop
      playsInline
      style={{
        width: '100%',
       
        
        right: 0,
        top: 0,
        minWidth: '100%',
        zIndex: -100,
      }}
      // Additional attributes for better compatibility
      preload="metadata"
      controlsList="nodownload"
    >
      <source src="https://mz.3sd.website/video/274429Untitledvideo-MadewithClipchamp4.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
              </div>
          </div>
        ),
      },
      {
       
        content: (
          <div className="container">
            <div className="cardslides">
              <div className="row">
                     <div className="col-md-3">
		              	<h5 align="center" className="hh5">Funcionários atuais:</h5>
		                
		             </div>
		             <div className="col-md-6">
		              	<h5 align="center" className="hh5">Lista de produtos produzidos & PPP</h5>
		                
		             </div>
		             <div className="col-md-3">
		              	<h5 align="center" className="hh5">Funcionários ausentes :</h5>
		                
		             </div>
		       </div>
		       <div className="row">
                     <div className="col-md-4">
		              	<table className="table table-striped dt-responsive nowrap" style={{ borderCollapse: 'collapse' }}>
					      <thead>
					        <tr style={{ border: '1px solid gray', borderTop: '1px solid gray' }}>
					          <th colSpan="3" align="center">Lista de produtos produzidos</th>
					        </tr>
					        <tr style={{ backgroundColor: 'gray', color: 'white' }}>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Nome do Produto</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Meta</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Conquista</th>
					        </tr>
					      </thead>
					      <tbody>
					        <tr style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
					          <td style={{ borderRight: '1px solid #2e6398' }}>YAKI BRAID</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>170668.70</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>38651.20</td>
					        </tr>
					      </tbody>
					    </table>
		                
		             </div>
		             <div className="col-md-6">
		              	<table className="table table-striped dt-responsive nowrap" style={{ borderCollapse: 'collapse' }}>
					      <thead>
					        <tr style={{ border: '1px solid gray', borderTop: '1px solid gray' }}>
					          <th colSpan="6" align="center">PPP</th>
					        </tr>
					        <tr style={{ backgroundColor: 'gray', color: 'white' }}>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Nome do Produto</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Turno</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Saída FG</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Nº de horas trabalhadas</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>Dias de homem</th>
					          <th style={{ borderRight: '1px solid #2e6398' }}>PPP</th>
					        </tr>
					      </thead>
					      <tbody>
					        <tr style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
					          <td style={{ borderRight: '1px solid #2e6398' }}>YAKI BRAID</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>8</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>
					            <span style={{ color: 'green' }}><b>0</b></span>
					          </td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>148</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>18.5</td>
					          <td style={{ borderRight: '1px solid #2e6398' }}>0.00</td>
					        </tr>
					      </tbody>
					    </table>
		                
		             </div>
		             
		       </div>
		                
              </div>
          </div>
        ),
      },
      
      
    ],
    
  ]);

 // Use this useEffect to see the updated state
useEffect(() => {
  //alert('fgslide:' + JSON.stringify(fgslide));
}, [fgslide]);

  return (
    <div>
    <header className="fixed-top">
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src="https://mz.3sd.website/video/smart-tv.png" alt="Logo" className="logotv1" />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="collapsibleNavbar">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a className="nav-link" href="https://mz.3sd.website/dashboard/" style={{ color: 'white' }}>
                <i className="bx bx-home-circle" style={{ color: 'white' }}></i> Painel
              </a>
            </li>
            </ul>
            <ul className="navbar-nav ms-auto">

            <li className="nav-item dropdown">
              <a
				  className="nav-link dropdown-toggle"
				  href="#"
				  role="button"
				  data-bs-toggle="dropdown"
				  style={{ color: 'yellow' }}
				>
				  <i className="bx bxs-user" style={{ color: 'yellow' }}></i> Aniceto Carlos Dairamo		
				</a>

              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    Logout
                  </a>
                </li>
                
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </header>

      <div className="container-fluid">
        {carouselData.map((carouselContent, index) => (
  <div key={index} id={`myCarousel${index}`} className="carousel slide" data-bs-ride="carousel" data-interval="30000">
    <ol className="carousel-indicators">
      {carouselContent.map((_, imageIndex) => (
        <li
          key={imageIndex}
          data-bs-target={`#myCarousel${index}`}
          data-bs-slide-to={imageIndex}
          className={imageIndex === 0 ? 'active' : ''}
        />
      ))}
    </ol>
    <div className="carousel-inner">
      {carouselContent.map((content, contentIndex) => (
        <div key={contentIndex} className={`carousel-item ${contentIndex === 0 ? 'active' : ''}`}>
          {content.content}
          <div className="carousel-caption">
            {/* Add any additional caption content here */}
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
