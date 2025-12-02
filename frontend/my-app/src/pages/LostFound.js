import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
function LostFound() {
  const [lostPets, setLostPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const userId = 1; 

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/lost")
      .then((res) => res.json())
      .then((data) => setLostPets(data));
  }, []);

  const deletePet = async (id) => {
  await fetch(`http://127.0.0.1:5000/api/lost/${id}?user_id=${userId}`, {
    method: "DELETE",
  });
  alert("Entry deleted!");
  window.location.reload();
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("pet_name", petName);
    formData.append("description", description);
    formData.append("contact_number", contact);
    formData.append("last_seen_location", location);
    if (image) formData.append("image", image);

    const res = await fetch("http://127.0.0.1:5000/api/lost", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Lost pet posted successfully!");
      window.location.reload();
    }
  };

  const markAsFound = async (id) => {
  await fetch(`http://127.0.0.1:5000/api/lost/${id}/found?user_id=${userId}`, {
    method: "PUT",
  });
  alert("Pet marked as found!");
  window.location.reload();
};


  return (
    <div className="adopt-container">
      <Navbar />
      <h2>🐾 Lost & Found Pets</h2>

      <button className="post-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Report Lost Pet"}
      </button>

      {showForm && (
        <form className="adopt-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Pet Name"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <input
            type="text"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      )}

      <div className="pet-grid">
        {lostPets.length > 0 ? (
          lostPets.map((pet) => (
            <div key={pet.id} className="pet-card">
              <img
                src={`http://127.0.0.1:5000/${pet.image_path}`}
                alt={pet.pet_name}
                onError={(e) => (e.target.src = "/default-pet.png")}
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
              />
              <div className="pet-info">
                <h3>{pet.pet_name}</h3>
                <p>{pet.description}</p>
                <p><strong>📍 Location:</strong> {pet.last_seen_location}</p>
                <p><strong>📞 Contact:</strong> {pet.contact_number}</p>

                {pet.status === "lost" ? (
                  <button
                    className="btn btn-success mt-2"
                    onClick={() => markAsFound(pet.id)}
                  >
                  Mark as Found
                  </button>
                ) : (
                  <p style={{ color: "green", fontWeight: "bold" }}>Found</p>
                )}

                {pet.status === "found" && pet.user_id === userId && (
  <button
    className="btn btn-danger mt-2"
    onClick={() => deletePet(pet.id)}
  >
    🗑️ Delete Entry
  </button>
)}

              </div>
            </div>
          ))
        ) : (
          <p>No lost pets reported yet 🐕</p>
        )}
      </div>
    </div>
  );
}

export default LostFound;
