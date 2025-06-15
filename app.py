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
    sort_By = request.args.get('sort', '')
    cursor = db.cursor(dictionary=True)

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if term:
        # Split search term into words and require ALL words to match
        words = term.split()
        if words:
            like_conditions = []
            for word in words:
                like_conditions.append("name LIKE %s")
                params.append(f"%{word}%")
            query += " AND " + " AND ".join(like_conditions)

    if category:
        query += " AND category = %s"
        params.append(category)

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
    app.run(port=3000)