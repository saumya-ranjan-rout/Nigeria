import React from 'react';
import { useHistory } from 'react-router-dom';

const DataComponent = () => {
  const history = useHistory();
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>ETA | Godrej</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta content="Productivity Tool" name="description" />
        <meta content="Coderthemes" name="author" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* App favicon */}
        <link rel="shortcut icon" type="image/x-icon" href="app-assets/images/ico/favicon.ico" />
        {/* App css */}
        <link href="assets/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/icons.min.css" rel="stylesheet" type="text/css" />
        <link href="assets/app.min.css" rel="stylesheet" type="text/css" />
        <style>
          {`
            body {
              background-color: #2F3242;
            }
            svg {
              position: absolute;
              top: 50%;
              left: 50%;
              margin-top: -250px;
              margin-left: -400px;
            }
            .message-box {
              height: 200px;
              width: 380px;
              position: absolute;
              top: 50%;
              left: 50%;
              margin-top: -100px;
              margin-left: 50px;
              color: #FFF;
              font-family: Roboto;
              font-weight: 300;
            }
            .message-box h1 {
              font-size: 60px;
              line-height: 46px;
              margin-bottom: 40px;
            }
            .buttons-con .action-link-wrap {
              margin-top: 40px;
            }
            .buttons-con .action-link-wrap a {
              background: #68c950;
              padding: 8px 25px;
              border-radius: 4px;
              color: #FFF;
              font-weight: bold;
              font-size: 14px;
              transition: all 0.3s linear;
              cursor: pointer;
              text-decoration: none;
              margin-right: 10px
            }
            .buttons-con .action-link-wrap a:hover {
              background: #5A5C6C;
              color: #fff;
            }
            #Polygon-1 , #Polygon-2 , #Polygon-3 , #Polygon-4 , #Polygon-4, #Polygon-5 {
              animation: float 1s infinite ease-in-out alternate;
            }
            #Polygon-2 {
              animation-delay: .2s; 
            }
            #Polygon-3 {
              animation-delay: .4s; 
            }
            #Polygon-4 {
              animation-delay: .6s; 
            }
            #Polygon-5 {
              animation-delay: .8s; 
            }
            @keyframes float {
              100% {
                transform: translateY(20px);
              }
            }
            @media (max-width: 450px) {
              svg {
                position: absolute;
                top: 50%;
                left: 50%;
                margin-top: -250px;
                margin-left: -190px;
              }
              .message-box {
                top: 50%;
                left: 50%;
                margin-top: -100px;
                margin-left: -190px;
                text-align: center;
              }
            }
          `}
        </style>
      </head>

      <svg width="380px" height="500px" viewBox="0 0 837 1045" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnsSketch="http://www.bohemiancoding.com/sketch/ns">
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketchType="MSPage">
          <path d="M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z" id="Polygon-1" stroke="#007FB2" strokeWidth="6" sketchType="MSShapeGroup"></path>
          <path d="M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z" id="Polygon-2" stroke="#EF4A5B" strokeWidth="6" sketchType="MSShapeGroup"></path>
          <path d="M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z" id="Polygon-3" stroke="#795D9C" strokeWidth="6" sketchType="MSShapeGroup"></path>
          <path d="M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z" id="Polygon-4" stroke="#F2773F" strokeWidth="6" sketchType="MSShapeGroup"></path>
          <path d="M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z" id="Polygon-5" stroke="#36B455" strokeWidth="6" sketchType="MSShapeGroup"></path>
        </g>
      </svg>

      <div className="message-box">
        {/* Use React state/props to conditionally render content */}
        <h1 className="display-3">Thank You!</h1>
        <p className="lead"><strong>Data is updated successfully.</strong> for further instructions check worker details.</p>
        <hr />
        <div className="buttons-con">
          <div className="action-link-wrap">
            {/* <a onClick={() => { window.history.back(); }} className="link-button link-back-button">Go to Home Page</a> */}
            <a onClick={() => { history.push('/dashboard'); }} className="link-button link-back-button">Go to Home Page</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataComponent;
