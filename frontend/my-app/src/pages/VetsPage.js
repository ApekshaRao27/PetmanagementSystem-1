import React, { useState, useEffect } from "react";
import { FaUserMd, FaCalendarPlus, FaStethoscope, FaClock, FaCalendarDay, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "./Navbar";
function VetsPage() {
  const [vets, setVets] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    petName: '',
    animal: '',
    reason: '',
  });
  const [message, setMessage] = useState('');
  
  // NOTE: In a real app, this should come from authentication context
  const OWNER_ID = 2; // Assuming a user (owner) with ID 2 exists for booking

  // Define standard available slots for demonstration (e.g., 9:00 AM to 5:00 PM)
  const ALL_SLOTS = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    fetchVets();
  }, []);

  // --- API Handlers ---

  const fetchVets = async () => {
    try {
      // Endpoint to fetch all vets and their details
      const res = await fetch("http://127.0.0.1:5000/api/vets"); 
      const data = await res.json();
      setVets(data);
    } catch (error) {
      console.error("Error fetching vets:", error);
    }
  };

  const checkAvailability = async (vetId, date) => {
    if (!vetId || !date) return;
    
    try {
      // Endpoint to check booked slots for the selected vet and date
      const res = await fetch(`http://127.0.0.1:5000/api/vets/${vetId}/availability?date=${date}`);
      const bookedSlots = await res.json(); // e.g., ['09:00', '14:00']

      // Calculate available slots
      const available = ALL_SLOTS.filter(slot => !bookedSlots.includes(slot));
      setAvailableTimes(available);
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailableTimes(ALL_SLOTS); // Fallback to all slots if API fails
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedVet || !bookingForm.date || !bookingForm.time) {
      setMessage('Please select a date, time, and pet.');
      return;
    }

    const payload = {
      owner_id: OWNER_ID,
      vet_id: selectedVet.id,
      pet_name_booked: bookingForm.petName,
      pet_type: bookingForm.animal,
      appointment_date: bookingForm.date,
      appointment_time: bookingForm.time,
      reason: bookingForm.reason,
      
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/appointments/book", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(`🎉 Appointment booked with Dr. ${selectedVet.name} on ${bookingForm.date} at ${bookingForm.time}!`);
        // Reset state after successful booking
        setSelectedVet(null);
        setBookingForm({ date: '', time: '', petName: '', reason: '' });
        setAvailableTimes([]);
      } else {
        const errorData = await res.json();
        setMessage(`❌ Booking failed: ${errorData.message || 'Slot may be taken.'}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setMessage('❌ An unexpected error occurred during booking.');
    }
  };
  
  // --- UI Handlers ---

  const handleVetSelect = (vet) => {
    setSelectedVet(vet);
    setBookingForm(prev => ({ ...prev, date: '', time: '' })); // Clear date/time on vet change
    setAvailableTimes([]);
    setMessage('');
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBookingForm(prev => ({ ...prev, date: newDate, time: '' }));
    if (selectedVet) {
      checkAvailability(selectedVet.id, newDate);
    }
  };

  const handleFormChange = (e) => {
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Utility to format time from 'HH:MM' to 'h:mm AM/PM'
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };


  return (
    <div className="vets-container">
      <Navbar />
      <h2 className="vets-header">
        <FaUserMd size={28} /> Book a Veterinary Appointment
      </h2>

      {message && (
        <div className={`app-message ${message.startsWith('🎉') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="vets-layout">
        
        {/* Vets List Panel */}
        <div className="vet-list-panel">
          <h3 className="panel-title">Available Veterinarians</h3>
          {vets.length > 0 ? (
            vets.map((vet) => (
              <div
                key={vet.id}
                className={`vet-card ${selectedVet?.id === vet.id ? 'selected' : ''}`}
                onClick={() => handleVetSelect(vet)}
              >
                <div className="vet-details">
                  <h4 className="vet-name"> {vet.name}</h4>
                  <p className="vet-specialty"><FaStethoscope /> {vet.specialty}</p>
                  <p className="vet-clinic"><FaMapMarkerAlt /> {vet.clinic_name}</p>
                  <p className="vet-bio">{vet.bio}</p>
                </div>
                {selectedVet?.id === vet.id && <span className="selection-indicator">Selected</span>}
              </div>
            ))
          ) : (
            <p>No veterinarians available at the moment.</p>
          )}
        </div>

        {/* Booking Panel */}
        {selectedVet && (
          <div className="booking-panel">
            <h3 className="panel-title">
              <FaCalendarPlus /> Book Slot with {selectedVet.name}
            </h3>

            <form className="booking-form" onSubmit={handleBookAppointment}>
              
              {/* Pet Details */}
              <label htmlFor="petName">Pet's Name:</label>
              <input
                type="text"
                id="petName"
                name="petName"
                placeholder="Name of pet needing the appointment"
                value={bookingForm.petName}
                onChange={handleFormChange}
                required
              />
              <label htmlFor="animal">Pet Type </label>
               <input 
                type="text"
                id="animal"
                name="animal"
                placeholder="eg: cat"
                value={bookingForm.animal}
                onChange={handleFormChange}
                required
               />
            

              <label htmlFor="reason">Reason for Visit:</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Routine checkup, vaccination, illness..."
                value={bookingForm.reason}
                onChange={handleFormChange}
                required
              ></textarea>
              
              {/* Date Selection */}
              <label htmlFor="date">Appointment Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={bookingForm.date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]} // Min date is today
                required
              />

              {/* Time Selection */}
              {bookingForm.date && (
                <>
                  <label>Available Times:</label>
                  <div className="time-slots-grid">
                    {availableTimes.length > 0 ? (
                      availableTimes.map(time => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot-btn ${bookingForm.time === time ? 'selected-slot' : ''}`}
                          onClick={() => setBookingForm(prev => ({ ...prev, time: time }))}
                        >
                          <FaClock /> {formatTime(time)}
                        </button>
                      ))
                    ) : (
                      <p className="no-slots">No slots available on this date. Try another day.</p>
                    )}
                  </div>
                </>
              )}

              <button type="submit" className="submit-booking-btn" disabled={!bookingForm.time}>
                Confirm Appointment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default VetsPage;