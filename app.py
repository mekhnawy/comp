from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Database config
db = mysql.connector.connect(
    host="sql8.freesqldatabase.com",
    user="sql8784723",
    password="Gk7sbSGDs3",
    database="sql8784723"
)


@app.route('/search', methods=['GET'])
def search():
    term = request.args.get('term')
    category = request.args.get('category')
    sort_By = request.args.get('sort', '')  # New sort parameter
    cursor = db.cursor(dictionary=True)

    query = "SELECT * FROM products WHERE 1=1"
    where_clauses = []
    params = []

    if term:
        query += " AND name LIKE %s"
        params.append(f"%{term}%")
    if category:
        query += " AND category = %s"
        params.append(category)

    # Construct full query
    query = query
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)
    # Add sorting logic
    if sort_By == 'price_low':
        query += " ORDER BY price ASC"
    elif sort_By == 'price_high':
        query += " ORDER BY price DESC"
    elif sort_By == 'rating':
        query += " ORDER BY rating DESC"

    cursor.execute(query, params)
    results = cursor.fetchall()
    return jsonify(results)


if __name__ == '__main__':
    app.run(port=10000)
