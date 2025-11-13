from flask import Flask, request, jsonify
from flask_cors import CORS
from db_config import get_connection
from flask import send_from_directory
app = Flask(__name__)


CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)


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


if __name__ == '__main__':
    app.run(debug=True)
