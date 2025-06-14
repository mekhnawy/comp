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
        term = request.args.get('term', '').strip()
        category = request.args.get('category', '')
        sort_by = request.args.get('sort', '')
        min_price = request.args.get('min_price', '')
        max_price = request.args.get('max_price', '')
        min_rating = request.args.get('min_rating', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        cursor = db.cursor(dictionary=True)
        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if term:
            query += " AND (name LIKE %s OR description LIKE %s)"
            params.extend([f"%{term}%", f"%{term}%"])
        
        if category:
            query += " AND category = %s"
            params.append(category)
            
        if min_price:
            try:
                query += " AND price >= %s"
                params.append(float(min_price))
            except ValueError:
                pass
                
        if max_price:
            try:
                query += " AND price <= %s"
                params.append(float(max_price))
            except ValueError:
                pass
                
        if min_rating:
            try:
                query += " AND rating >= %s"
                params.append(float(min_rating))
            except ValueError:
                pass

        # Sorting options
        if sort_by == 'price_low':
            query += " ORDER BY price ASC"
        elif sort_by == 'price_high':
            query += " ORDER BY price DESC"
        elif sort_by == 'rating':
            query += " ORDER BY rating DESC"
        elif sort_by == 'delivery_fastest':
            query += " ORDER BY DeliveryTime ASC"

        # Add pagination
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, (page - 1) * per_page])
            
        cursor.execute(query, params)
        results = cursor.fetchall()
        return jsonify(results)

    except Exception as e:
        print("Error in /search:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/test')
def test():
    return jsonify({"status": "OK"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
