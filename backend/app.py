from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import send_from_directory
from werkzeug.utils import secure_filename
from db_config import get_connection
import os
import datetime
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","http://127.0.0.1"]}}, supports_credentials=True)

ALL_SLOTS = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
]
# ✅ Test Connection
@app.route('/test', methods=['GET'])
def test_connection():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        return jsonify({"message": f"Connected to DB ✅ | Total Users: {count}"})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        conn.close()


# 🧍‍♀️ Register Owner
@app.route('/register', methods=['POST'])
def register_owner():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    address = data.get('address')
    pet = data.get('pet')
    password = data.get('password')

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users (name, email, address, pet, password, role) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, email, address, pet, password, "owner")
        )
        conn.commit()
        return jsonify({"message": "Registration successful ✅"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# 🔑 Owner Login
@app.route('/login', methods=['POST'])
def owner_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s AND role = 'owner'", (email, password))
        user = cursor.fetchone()
        if user:
            return jsonify({"message": "Login successful ✅", "user": user})
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    finally:
        cursor.close()
        conn.close()

# 🔑 Doctor Login
@app.route('/doctor-login', methods=['POST'])
def doctor_login():
    """
    Authenticates a doctor user and returns their core user details.
    This endpoint enforces role = 'doctor'.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Step 1: Authenticate against email, password, AND role='doctor'
        cursor.execute("""
            SELECT id, name, email, role 
            FROM users 
            WHERE email = %s AND password = %s AND role = 'doctor'
        """, (email, password))
        
        user = cursor.fetchone()
        
        if user:
            # Step 2: Login successful, return core details from the users table
            return jsonify({
                "message": "Doctor login successful ✅", 
                # This 'user' object contains id, name, email, and role
                "user": user
            })
        else:
            return jsonify({"error": "Invalid credentials or user is not registered as a doctor"}), 401
    except Exception as e:
        print(f"Doctor login error: {e}")
        return jsonify({"error": "An error occurred during login"}), 500
    finally:
        cursor.close()
        conn.close()

# Add this temporary function in your app.py
@app.route('/test-format', methods=['GET'])
def test_format():
    """Tests if MySQL DATE_FORMAT works with Python's escaping (%%)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # We use NOW() to get the current server date/time for a reliable test
    query = """
    SELECT 
        DATE_FORMAT(NOW(), '%%Y-%%m-%%d') AS test_date,
        TIME_FORMAT(NOW(), '%%h:%%i %%p') AS test_time;
    """
    
    try:
        cursor.execute(query)
        result = cursor.fetchone()
        
        # Check if the result is correct before closing
        return jsonify({
            "message": "Format test successful",
            "date": result[0], # Should be 'YYYY-MM-DD'
            "time": result[1]  # Should be 'HH:MM AM/PM'
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/doctor/<int:id>/appointments', methods=['GET'])
def get_doctor_appointments(id):
    conn = get_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT 
        a.id AS appointment_id,
        a.pet_name_booked,
        a.pet_type,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
        TIME_FORMAT(a.appointment_time, '%h:%i %p') AS appointment_time,
        a.reason,
        a.status,
        u.name AS owner_name,
        u.email AS owner_email
    FROM appointments a
    JOIN users u ON a.owner_id = u.id
    WHERE a.vet_id = %s
    ORDER BY a.appointment_date ASC, a.appointment_time ASC;
    """
    
    try:
        cursor.execute(query, (id,))
        appointments = cursor.fetchall()
        return jsonify(appointments)
    except Exception as e:
        print(f"Error fetching doctor appointments: {e}")
        return jsonify({"message": "Error fetching appointments"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/appointments/<int:appointment_id>/complete', methods=['PUT'])
def complete_appointment(appointment_id):
    """
    NEW: Marks an appointment as 'completed'.
    Used by: DoctorDashboard.js markCompleted()
    """
    conn = get_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor()
    
    # Update the status to 'completed'
    query = "UPDATE appointments SET status = 'completed' WHERE id = %s"
    
    try:
        cursor.execute(query, (appointment_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"message": "Appointment not found."}), 404
        return jsonify({"message": f"Appointment {appointment_id} marked as completed."}), 200
    except Exception as e:
        print(f"Error completing appointment: {e}")
        return jsonify({"message": "Error completing appointment"}), 500
    finally:
        cursor.close()
        conn.close()

UPLOAD_FOLDER = 'uploads'  # same folder where images are saved
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Serve uploaded images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# 🐶 Fetch Pets for Adoption
@app.route('/api/adopt', methods=['GET'])
def get_pets():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT a.id, a.pet_name, a.description, a.contact_number, a.location,
                   a.image_path, u.name AS owner_name, u.email
            FROM adopt_pets a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        """)
        pets = cursor.fetchall()
        return jsonify(pets)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# 🐾 Add Pet for Adoption (with location)
@app.route('/api/adopt', methods=['POST'])
def post_pet():
    data = request.form
    pet_name = data.get('pet_name')
    description = data.get('description')
    contact_number = data.get('contact_number')
    location = data.get('location')
    email = data.get('email')  # identify user using email instead of id
    image = request.files.get('image')

    if not all([pet_name, description, contact_number, location, email]):
        return jsonify({'error': 'Missing fields'}), 400

    # Save uploaded image
    image_path = ""
    if image:
        image_path = f"uploads/{image.filename}"
        image.save(image_path)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Get user_id from email
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user[0]

        # Insert pet
        cursor.execute("""
            INSERT INTO adopt_pets (user_id, pet_name, description, contact_number, location, image_path)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, pet_name, description, contact_number, location, image_path))
        conn.commit()
        return jsonify({'message': 'Pet added successfully! 🐕'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 🗑️ Delete Pet (Only by Owner)
@app.route('/api/adopt/<int:pet_id>', methods=['DELETE'])
def delete_pet(pet_id):
    email = request.args.get('email')  # Get email from frontend (logged-in user)
    if not email:
        return jsonify({"error": "Missing user email"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if this pet belongs to this user
        cursor.execute("""
            SELECT a.id FROM adopt_pets a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = %s AND u.email = %s
        """, (pet_id, email))
        pet = cursor.fetchone()

        if not pet:
            return jsonify({"error": "Unauthorized: You can only delete your own pets"}), 403

        # Delete the pet
        cursor.execute("DELETE FROM adopt_pets WHERE id = %s", (pet_id,))
        conn.commit()
        return jsonify({"message": "Pet marked as sold and removed ✅"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 📤 POST a lost pet
@app.route("/api/lost", methods=["POST"])
def post_lost_pet():
    user_id = request.form.get("user_id")
    pet_name = request.form.get("pet_name")
    description = request.form.get("description")
    contact_number = request.form.get("contact_number")
    last_seen_location = request.form.get("last_seen_location")
    image = request.files.get("image")

    if not all([user_id, pet_name, description, contact_number, last_seen_location]):
        return jsonify({"error": "Missing required fields"}), 400

    image_path = None
    if image:
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        image.save(image_path)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO lost_pets (user_id, pet_name, description, contact_number, last_seen_location, image_path)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (user_id, pet_name, description, contact_number, last_seen_location, image_path))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Lost pet reported successfully!"}), 201


# 📋 GET all lost pets
@app.route("/api/lost", methods=["GET"])
def get_lost_pets():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM lost_pets ORDER BY created_at DESC")
    pets = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pets)


# ✅ Mark as Found
@app.route("/api/lost/<int:pet_id>/found", methods=["PUT"])
def mark_pet_found(pet_id):
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Verify ownership
    cursor.execute("SELECT * FROM lost_pets WHERE id = %s AND user_id = %s", (pet_id, user_id))
    pet = cursor.fetchone()
    if not pet:
        return jsonify({"error": "Unauthorized"}), 403

    cursor.execute("UPDATE lost_pets SET status='found' WHERE id=%s", (pet_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Pet marked as found!"})


@app.route("/api/lost/<int:pet_id>", methods=["DELETE"])
def delete_lost_pet(pet_id):
    user_id = request.args.get("user_id")  # or use email if preferred

    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Verify ownership
    cursor.execute("SELECT * FROM lost_pets WHERE id = %s AND user_id = %s", (pet_id, user_id))
    pet = cursor.fetchone()
    if not pet:
        return jsonify({"error": "Unauthorized"}), 403

    cursor.execute("DELETE FROM lost_pets WHERE id = %s", (pet_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Lost pet entry deleted ✅"})

@app.get("/products")
def get_products():
    category = request.args.get("category")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    if category:
        cursor.execute("SELECT * FROM products WHERE category = %s", (category,))
    else:
        cursor.execute("SELECT * FROM products")

    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(products)

# -------------------------
#   ADD TO CART
# -------------------------
@app.post("/cart/add")
def add_to_cart():
    data = request.json
    user_id = data["user_id"]
    product_id = data["product_id"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, quantity FROM cart 
        WHERE user_id = %s AND product_id = %s
    """, (user_id, product_id))

    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE cart SET quantity = quantity + 1 WHERE id = %s
        """, (existing[0],))
    else:
        cursor.execute("""
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (%s, %s, 1)
        """, (user_id, product_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "added"})

# -------------------------
#   VIEW CART
# -------------------------
@app.get("/cart/<int:user_id>")
def view_cart(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT c.id AS cart_id, c.quantity, 
               p.name, p.price, p.image_path,
               (c.quantity * p.price) AS total
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
    """, (user_id,))

    items = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(items)

# -------------------------
#   UPDATE QUANTITY
# -------------------------
@app.put("/cart/update")
def update_cart():
    data = request.json
    cart_id = data["cart_id"]
    quantity = data["quantity"]

    conn = get_connection()
    cursor = conn.cursor()

    if quantity <= 0:
        cursor.execute("DELETE FROM cart WHERE id = %s", (cart_id,))
    else:
        cursor.execute("UPDATE cart SET quantity = %s WHERE id = %s",
                       (quantity, cart_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "updated"})

# -------------------------
#   DELETE ITEM
# -------------------------
@app.delete("/cart/delete/<int:cart_id>")
def delete_cart_item(cart_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM cart WHERE id = %s", (cart_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "deleted"})

# -------------------------
#   IMAGE FILE ACCESS
# -------------------------
@app.route('/uploads/<path:filename>')
def uploaded_files(filename):
    from flask import send_from_directory
    return send_from_directory("/uploads", filename)

@app.route('/cart/clear/<int:user_id>', methods=['DELETE'])
def clear_cart(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE user_id=%s", (user_id,))
    conn.commit()
    return jsonify({"msg": "Cart Cleared"})

@app.route('/api/vets', methods=['GET'])
def get_vets():
    """
    Endpoint 1: Fetches the list of all veterinarians.
    Used by: VetsPage.js useEffect -> fetchVets()
    """
    conn = get_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    # SQL to join users (for name/email) and veterinarians (for specialty/clinic/bio)
    query = """
    SELECT 
        v.id, u.name, v.specialty, v.clinic_name, v.phone, v.bio 
    FROM veterinarians v
    JOIN users u ON v.user_id = u.id;
    """
    
    try:
        cursor.execute(query)
        vets = cursor.fetchall()
        return jsonify(vets)
    except Exception as e:
        print(f"Error fetching vets: {e}")
        return jsonify({"message": "Error fetching vets"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/vets/<int:vet_id>/availability', methods=['GET'])
def check_availability(vet_id):
    """
    Endpoint 2: Checks booked time slots for a specific vet on a given date.
    Used by: VetsPage.js checkAvailability(vetId, date)
    """
    selected_date = request.args.get('date')
    if not selected_date:
        return jsonify({"message": "Date parameter is missing"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor() 
    
    # The critical SQL query to find *booked* times
    query = """
    SELECT 
        TIME_FORMAT(a.appointment_time, '%%H:%%i') AS booked_time
    FROM appointments a 
    WHERE a.vet_id = %s 
    AND a.appointment_date = %s
    AND a.status IN ('pending', 'confirmed');
    """
    
    try:
        cursor.execute(query, (vet_id, selected_date))
        booked_slots = [row[0] for row in cursor.fetchall()]
        
        # Return only the booked slots, let the frontend calculate availability
        return jsonify(booked_slots)
    except Exception as e:
        print(f"Error checking availability: {e}")
        return jsonify({"message": "Error checking availability"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/appointments/book', methods=['POST'])
def book_appointment():
    """
    Endpoint 3: Books a new appointment.
    Used by: VetsPage.js handleBookAppointment()
    """
    data = request.json
    owner_id = data.get('owner_id')
    vet_id = data.get('vet_id')
    pet_name = data.get('pet_name_booked')
    pet_type = data.get('pet_type')
    date_str = data.get('appointment_date')
    time_str = data.get('appointment_time')
    reason = data.get('reason')

    if not all([owner_id, vet_id, pet_name,pet_type, date_str, time_str, reason]):
        return jsonify({"message": "Missing required fields"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor()
    
    # SQL to insert the new appointment
    query = """
    INSERT INTO appointments 
    (owner_id, vet_id, pet_name_booked, pet_type,appointment_date, appointment_time, reason, status)
    VALUES (%s, %s, %s,%s,%s, %s, %s, 'pending')
    """
    
    try:
        cursor.execute(query, (owner_id, vet_id, pet_name,pet_type, date_str, time_str, reason))
        conn.commit()
        return jsonify({"message": "Appointment booked successfully"}), 201
    except Exception as err:
        if err.errno == 1062: # MySQL error code for Duplicate entry (unique key violation)
            return jsonify({"message": "This slot is already booked. Please try another time."}), 409
        print(f"Database error during booking: {err}")
        return jsonify({"message": "Database error during booking"}), 500
    except Exception as e:
        print(f"General error during booking: {e}")
        return jsonify({"message": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
