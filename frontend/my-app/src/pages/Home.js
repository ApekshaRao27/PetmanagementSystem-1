import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
function Home() {
  const [reminders, setReminders] = useState([]);
  const [type, setType] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      setReminders((prevReminders) =>
        prevReminders.map((reminder) => {
          if (reminder.time === currentTime && !reminder.triggered) {
            playSound();
            alert(`🐾 Reminder: Time for your pet's ${reminder.type}!`);
            return { ...reminder, triggered: true };
          }
          return reminder;
        })
      );
    }, 1000); // check every second for accuracy

    return () => clearInterval(interval);
  }, []);

  const addReminder = () => {
    if (!type || !time) return alert("Please select both fields!");
    const newReminder = { type, time, triggered: false };
    setReminders([...reminders, newReminder]);
    setType("");
    setTime("");
  };

  const playSound = () => {
    const audio = new Audio(process.env.PUBLIC_URL + "/reminder.mp3"); // ✅ use your existing sound file
    audio.play();
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Welcome Section */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Welcome to Pet Management 🐾</h2>
        <p>Manage your pets easily care, adoption, and reminders in one place!</p>
      </div>

      {/* Reminder Section */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          backgroundColor: "#e3d1d5ff",
          padding: "20px",
          borderRadius: "10px",
          width: "80%",
          margin: "40px auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3>🐕 Set Pet Care Reminders</h3>
        <div
          style={{
            margin: "20px auto",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ padding: "6px" }}
          >
            <option value="">Select Reminder Type</option>
            <option value="Walk">Walk</option>
            <option value="Food">Food</option>
            <option value="Vaccine">Vaccine</option>
            <option value="Bath">Bath</option>
          </select>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: "6px" }}
          />

          <button
            onClick={addReminder}
            style={{
              padding: "6px 12px",
              background: "#ff9800",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
            }}
          >
            Add
          </button>
        </div>

        {/* Reminder List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reminders.map((r, i) => (
            <li
              key={i}
              style={{
                margin: "8px 0",
                fontSize: "18px",
                backgroundColor: r.triggered ? "#c8e6c9" : "#ffffffff",
                padding: "8px",
                borderRadius: "6px",
                textDecoration: r.triggered ? "line-through" : "none",
              }}
            >
              ⏰ {r.type} at {r.time}{" "}
              {r.triggered ? "✅ Done" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
