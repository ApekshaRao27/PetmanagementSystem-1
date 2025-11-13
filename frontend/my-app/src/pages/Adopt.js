import React, { useEffect, useState } from "react";
import "../Adopt.css";

const Adopt = () => {
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [petName, setPetName] = useState("");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      setEmail(user.email);
    }
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/adopt");
      const data = await res.json();
      setPets(data);
    } catch (err) {
      console.error("Error fetching pets:", err);
    }
  };

  const handlePostPet = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please log in first!");
      return;
    }

    const formData = new FormData();
    formData.append("pet_name", petName);
    formData.append("description", description);
    formData.append("contact_number", contactNumber);
    formData.append("location", location);
    formData.append("email", email);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/adopt", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert("Pet posted successfully 🐾");
        setShowForm(false);
        setPetName("");
        setDescription("");
        setContactNumber("");
        setLocation("");
        setImage(null);
        fetchPets();
      } else {
        alert(data.error || "Error posting pet");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }
  };

  // 🗑️ Handle Delete (Mark as Sold)
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure this pet is sold?")) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/adopt/${petId}?email=${email}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPets();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error deleting pet:", err);
      alert("Error deleting pet");
    }
  };

  return (
    <div className="adopt-container">
      <h2>🐶 Pets Available for Adoption</h2>

      <button className="post-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Post a Pet for Adoption"}
      </button>

      {showForm && (
        <form className="adopt-form" onSubmit={handlePostPet}>
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
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
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
          <button type="submit" className="submit-btn">Post Pet</button>
        </form>
      )}

      <div className="pet-grid">
        {pets.length > 0 ? (
          pets.map((pet) => (
            <div key={pet.id} className="pet-card">
              <img
                src={`http://127.0.0.1:5000/${pet.image_path}`}
                alt={pet.pet_name}
                onError={(e) => (e.target.src = "/default-pet.png")}
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
              />
              <div className="pet-info">
                <h3>{pet.pet_name}</h3>
                <p><strong>Owner:</strong> {pet.owner_name}</p>
                <p><strong>Contact:</strong> {pet.contact_number}</p>
                <p><strong>Location:</strong> {pet.location}</p>

                <p>{pet.description}</p>
                 <button
  className="btn btn-outline-success mt-2"
  onClick={() => window.open(`tel:${pet.contact_number}`)}
>
  📞 Call Owner
</button>


                {/* Show delete button only for owner */}
                {pet.email === email && (
                  <button
                    onClick={() => handleDeletePet(pet.id)}
                    className="delete-btn"
                  >
                    Mark as Sold 🏷️
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No pets available right now 😺</p>
        )}
      </div>
    </div>
  );
};

export default Adopt;
