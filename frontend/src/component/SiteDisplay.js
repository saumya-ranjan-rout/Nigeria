import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import logoImage from '../component/eta.png';
import 'bootstrap/dist/css/bootstrap.css';

export function SiteDisplay() {
  const [formData, setFormData] = useState({
    name: '',
    view: '',
  });

  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    width: '60%',
    height: '40px',
    margin: '10px auto',
    justifyContent: 'center',
    display: 'block',
    color: '#fff',
    background: isHovered
      ? 'linear-gradient(to right, #AB1E5D 0%, #3A9FD4 51%, #71B53C 100%)'
      : 'linear-gradient(to right, #71B53C 0%, #3A9FD4 51%, #AB1E5D 100%)',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '20px',
    outline: 'none',
    border: 'none',
    borderRadius: '5px',
    transition: '0.2s ease-in',
    cursor: 'pointer',
  };

  const history = useHistory(); // Access the history object from React Router

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Redirect based on selected values
    if (formData.name === 'ota' && formData.view === 'tv') {
      history.push('/tv-display-nbraid');
    } else if (formData.name === 'ota' && formData.view === 'analytics') {
      history.push('https://ng.godrejeta.com/analytics/ota-analytics.php');
    } else if (formData.name === 'ikeja' && formData.view === 'tv') {
      history.push('/tv-display-braid');
    } else if (formData.name === 'ikeja' && formData.view === 'analytics') {
      history.push('https://ng.godrejeta.com/analytics/braid-analytics.php');
    }
  };

  return (
    <div className="site-page">
      <div className="main" style={{ backgroundColor: '#f5f3f2' }}>
        <div className="signup">
          <form method="post" onSubmit={handleSubmit}>
            <label htmlFor="chk" aria-hidden="true">
              <img
                width="110px"
                height="50px"
                src="https://www.godrej.com/img/svg/godrej-logo.svg"
                alt="Godrej-Logo"
              />
            </label>
            <select
              name="name"
              required
              className="form-control select"
              value={formData.name}
              onChange={handleSelectChange}
            >
              <option value="">Select Site</option>
              <option value="ota">OTA</option>
              <option value="ikeja">IKEJA</option>
            </select>
            <select
              name="view"
              required
              className="form-control select"
              value={formData.view}
              onChange={handleSelectChange}
            >
              <option value="">Select View</option>
              <option value="tv">TV Display</option>
              <option value="analytics">Analytics</option>
            </select>
            <button
              type="submit"
              name="save"
              style={buttonStyle}
              className="buttonst"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SiteDisplay;
