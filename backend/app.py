
from flask import Flask, request, jsonify
from flask_cors import CORS
from db_config import get_connection

app = Flask(__name__)
CORS(app)

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

# 🐾 Pet Owner Registration
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

# 🔑 Pet Owner Login
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

# 👨‍⚕️ Doctor/Admin Login
@app.route('/doctor-login', methods=['POST'])
def doctor_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s AND role = 'doctor'", (email, password))
        doctor = cursor.fetchone()
        if doctor:
            return jsonify({"message": "Doctor login successful ✅", "doctor": doctor})
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
