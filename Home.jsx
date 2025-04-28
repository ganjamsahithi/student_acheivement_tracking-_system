import React from 'react';
import { Link } from 'react-router-dom';
import videoFile from '../assets/video/video.mp4'; // Import the video file
import '../assets/css/Home.css'; // Import external CSS for styling

const Home = () => {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="background-video">
        <source src={videoFile} type="video/mp4" />
      </video>
      <div className="content">
        <h1>Student Achievement Portal</h1>
        <div className="button-container">
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>
          <Link to="/register">
            <button className="btn">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
