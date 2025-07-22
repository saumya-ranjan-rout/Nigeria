import React from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import maintenanceImage from './maintenance.svg';
const SorryComponent = () => {
    const history = useHistory();
    return (
        <div className="authentication-bg mt-5 mb-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="text-center">
                            <img alt="error-image" width="200" src={maintenanceImage} />
                            <h3 className="mt-4">There is a problem connecting with the attendance database. Please ensure the attendance server is up and running.</h3>
                            <p className="text-muted">
                                <Link to="/dashboard" className="link-button link-back-button">Go to Home Page</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SorryComponent;
