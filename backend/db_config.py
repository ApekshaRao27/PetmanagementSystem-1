import mysql.connector
\
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",          # change if needed
        password="ap20ek05",          # your MySQL password
        database="PET_MANAGEMENT"
    )
