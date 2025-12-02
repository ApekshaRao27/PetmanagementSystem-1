import React, { useState, useEffect } from "react";
import { FaCalendarCheck, FaClock, FaCalendarDay, FaPaw, FaUser, FaCheckCircle, FaSpinner } from "react-icons/fa";
import '../DoctorDashboard.css';
function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  
  const DOCTOR_ID = 1; 

  useEffect(() => {
    fetchAppointments(DOCTOR_ID);
  }, [DOCTOR_ID]);

  
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  // --- API Handlers ---

  const fetchAppointments = async (vetId) => {
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/doctor/${vetId}/appointments`);
      const data = await res.json();
      
      if (res.ok) {
        setAppointments(data);
      } else {
        setMessage(`❌ Failed to load appointments: ${data.message}`);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setMessage('❌ Network error: Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const markCompleted = async (appointmentId) => {
    setMessage('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/appointments/${appointmentId}/complete`, {
        method: 'PUT',
      });

      if (res.ok) {
        setMessage(`✅ Appointment ${appointmentId} marked as completed!`);
        // Update state locally without full reload for instant feedback
        setAppointments(prev => prev.map(app => 
          app.appointment_id === appointmentId ? { ...app, status: 'completed' } : app
        ));
      } else {
        const errorData = await res.json();
        setMessage(`❌ Failed to complete: ${errorData.message || 'Appointment not found.'}`);
      }
    } catch (error) {
      console.error("Completion error:", error);
      setMessage('❌ Network error while marking complete.');
    }
  };

  // --- UI Filter & Renderer ---

  const pendingAppointments = appointments.filter(app => app.status !== 'completed');
  const completedAppointments = appointments.filter(app => app.status === 'completed');

  const renderAppointmentCard = (app) => {
    const isPending = app.status !== 'completed';
    const cardClass = isPending ? (isToday(app.appointment_date) ? 'app-card pending today' : 'app-card pending') : 'app-card completed';

    return (
      <div className={cardClass} key={app.appointment_id}>
        <div className="card-header-status">
          <FaPaw size={24} />
          <h4 className="pet-name">{app.pet_name_booked} ({app.pet_type})</h4>
          <span className={`status-badge ${app.status}`}>
            {app.status.toUpperCase()}
          </span>
        </div>

        <div className="card-body-details">
            <div className="detail-row">
                <FaCalendarDay /> <strong>Date:</strong> {app.appointment_date}
                {isToday(app.appointment_date) && <span className="today-indicator">TODAY!</span>}
            </div>
            <div className="detail-row"><FaClock /> <strong>Time:</strong> {app.appointment_time}</div>
            <div className="detail-row"><FaUser /> <strong>Owner:</strong> {app.owner_name}</div>
            <div className="detail-row detail-reason">
                <strong>Reason:</strong> {app.reason}
            </div>
        </div>

        <div className="card-actions">
          {isPending ? (
            <button 
              className="action-btn complete-btn"
              onClick={() => markCompleted(app.appointment_id)}
            >
              <FaCheckCircle /> Mark Completed
            </button>
          ) : (
            <button className="action-btn completed-indicator" disabled>
              <FaCheckCircle /> Visit Concluded
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">
        <FaCalendarCheck size={30} /> Doctor Appointment Dashboard
      </h2>

      {message && (
        <div className={`dashboard-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <FaSpinner className="spinner" /> Loading appointments...
        </div>
      )}
      
      {!isLoading && (
          <div className="dashboard-layout">
          
          {/* Pending Appointments Column */}
          <div className="appointments-column">
            <h3 className="column-title pending-title">
                Pending Visits ({pendingAppointments.length})
            </h3>
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map(renderAppointmentCard)
            ) : (
              <p className="no-appointments">🎉 No pending appointments! Time for a break.</p>
            )}
          </div>

          {/* Completed Appointments Column */}
          <div className="appointments-column">
            <h3 className="column-title completed-title">
                Completed Visits ({completedAppointments.length})
            </h3>
            {completedAppointments.length > 0 ? (
              completedAppointments.map(renderAppointmentCard)
            ) : (
              <p className="no-appointments">No visits have been completed yet.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;