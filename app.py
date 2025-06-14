from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database with error handling
try:
    db = mysql.connector.connect(
        host="sql8.freesqldatabase.com",
        user="sql8784723",
        password="Gk7sbSGDs3",
        database="sql8784723"
    )
    print("✅ Database connected!")
except Exception as e:
    print("❌ Database connection failed:", e)
    raise

@app.route('/search', methods=['GET'])
def search():
    try:
        term = request.args.get('term')
        category = request.args.get('category')
        sort_by = request.args.get('sort', '')
        
        cursor = db.cursor(dictionary=True)
        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if term:
            query += " AND name LIKE %s"
            params.append(f"%{term}%")
        if category:
            query += " AND category = %s"
            params.append(category)

        if sort_by == 'price_low':
            query += " ORDER BY price ASC"
        elif sort_by == 'price_high':
            query += " ORDER BY price DESC"
        elif sort_by == 'rating':
            query += " ORDER BY rating DESC"

        cursor.execute(query, params)
        results = cursor.fetchall()
        return jsonify(results)

    except Exception as e:
        print("🔥 Error in /search:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/test')
def test():
    return jsonify({"status": "OK"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
