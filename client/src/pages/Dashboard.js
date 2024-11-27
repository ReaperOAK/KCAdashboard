import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  
  useEffect(() => {
    // Fetch attendance data from backend
    axios.get("http://localhost:5000/api/attendance")
      .then(response => {
        setAttendance(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Header />
        <div className="p-6">
          <h2>Upcoming Classes</h2>
          <div>
            {/* Render attendance or other sections here */}
            {attendance && attendance.map(item => (
              <div key={item.id}>
                <h3>{item.className}</h3>
                <p>{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
