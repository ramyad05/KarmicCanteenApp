from flask import Flask, request, jsonify
from flask_cors import CORS
from config import supabase, FLASK_SECRET_KEY
from datetime import datetime, timedelta
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = FLASK_SECRET_KEY
CORS(app)

# Helper Functions
def get_menu_date():
    now = datetime.now()
    hour = now.hour
    
    if hour >= 21:
        menu_date = now + timedelta(days=2)
    else:
        menu_date = now + timedelta(days=1)
    
    return menu_date.strftime('%Y-%m-%d')

def get_day_name(date_string):
    date = datetime.strptime(date_string, '%Y-%m-%d')
    return date.strftime('%A')

# Admin Authentication Routes
@app.route('/api/admin/register', methods=['POST'])
def admin_register():
    data = request.json
    
    try:
        # Check if username exists
        existing = supabase.table('admins').select('*').eq('username', data['username']).execute()
        
        if existing.data:
            return jsonify({'error': 'Username already exists'}), 400
        
        # Insert new admin
        result = supabase.table('admins').insert({
            'name': data['name'],
            'username': data['username'],
            'email': data['email'],
            'password': data['password']  # In production, hash this!
        }).execute()
        
        return jsonify({'message': 'Registration successful', 'data': result.data}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    
    try:
        result = supabase.table('admins').select('*').eq('username', data['username']).eq('password', data['password']).execute()
        
        if result.data:
            admin = result.data[0]
            return jsonify({
                'message': 'Login successful',
                'admin': {
                    'id': admin['id'],
                    'username': admin['username'],
                    'name': admin['name']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Employee Authentication Routes
@app.route('/api/employee/register', methods=['POST'])
def employee_register():
    data = request.json
    
    try:
        # Check if email exists
        existing = supabase.table('employees').select('*').eq('email', data['email']).execute()
        
        if existing.data:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Insert new employee
        result = supabase.table('employees').insert({
            'name': data['name'],
            'email': data['email'],
            'employee_id': data['employeeId'],
            'password': data['password']  # In production, hash this!
        }).execute()
        
        return jsonify({'message': 'Registration successful', 'data': result.data}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/login', methods=['POST'])
def employee_login():
    data = request.json
    
    try:
        result = supabase.table('employees').select('*').eq('email', data['email']).eq('password', data['password']).execute()
        
        if result.data:
            employee = result.data[0]
            return jsonify({
                'message': 'Login successful',
                'employee': {
                    'id': employee['id'],
                    'email': employee['email'],
                    'name': employee['name'],
                    'employee_id': employee['employee_id']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Menu Management Routes
@app.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        result = supabase.table('weekly_menu').select('*').execute()
        
        if result.data:
            # Convert to weekly menu format
            menu = {}
            for item in result.data:
                menu[item['day']] = json.loads(item['meals'])
            return jsonify(menu), 200
        else:
            # Return default menu if none exists
            return jsonify(get_default_menu()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/menu', methods=['POST'])
def update_menu():
    data = request.json
    
    try:
        # Update or insert menu for each day
        for day, meals in data.items():
            existing = supabase.table('weekly_menu').select('*').eq('day', day).execute()
            
            if existing.data:
                # Update existing
                supabase.table('weekly_menu').update({
                    'meals': json.dumps(meals)
                }).eq('day', day).execute()
            else:
                # Insert new
                supabase.table('weekly_menu').insert({
                    'day': day,
                    'meals': json.dumps(meals)
                }).execute()
        
        return jsonify({'message': 'Menu updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/menu/day/<day>', methods=['PUT'])
def update_day_menu(day):
    data = request.json
    
    try:
        existing = supabase.table('weekly_menu').select('*').eq('day', day).execute()
        
        if existing.data:
            result = supabase.table('weekly_menu').update({
                'meals': json.dumps(data['meals'])
            }).eq('day', day).execute()
        else:
            result = supabase.table('weekly_menu').insert({
                'day': day,
                'meals': json.dumps(data['meals'])
            }).execute()
        
        return jsonify({'message': 'Day menu updated', 'data': result.data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Meal Submission Routes
@app.route('/api/submissions', methods=['POST'])
def submit_meals():
    data = request.json
    
    try:
        menu_date = get_menu_date()
        employee_email = data['employee_email']
        
        # Check if already submitted
        existing = supabase.table('meal_submissions').select('*').eq('employee_email', employee_email).eq('menu_date', menu_date).execute()
        
        if existing.data:
            return jsonify({'error': 'Already submitted for this date'}), 400
        
        # Insert submission
        result = supabase.table('meal_submissions').insert({
            'employee_email': employee_email,
            'menu_date': menu_date,
            'selected_meals': json.dumps(data['selected_meals']),
            'submission_time': datetime.now().isoformat()
        }).execute()
        
        return jsonify({'message': 'Submission successful', 'data': result.data}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submissions/<employee_email>', methods=['GET'])
def get_employee_submissions(employee_email):
    menu_date = request.args.get('date', get_menu_date())
    
    try:
        result = supabase.table('meal_submissions').select('*').eq('employee_email', employee_email).eq('menu_date', menu_date).execute()
        
        return jsonify(result.data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submissions/stats', methods=['GET'])
def get_submission_stats():
    menu_date = request.args.get('date', get_menu_date())
    
    try:
        result = supabase.table('meal_submissions').select('*').eq('menu_date', menu_date).execute()
        
        stats = {
            'total': len(result.data),
            'meal_counts': {}
        }
        
        for submission in result.data:
            meals = json.loads(submission['selected_meals'])
            for meal_type, items in meals.items():
                if meal_type not in stats['meal_counts']:
                    stats['meal_counts'][meal_type] = 0
                stats['meal_counts'][meal_type] += len(items)
        
        return jsonify(stats), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Utility Routes
@app.route('/api/menu-date', methods=['GET'])
def get_menu_date_info():
    menu_date = get_menu_date()
    day_name = get_day_name(menu_date)
    
    return jsonify({
        'date': menu_date,
        'day': day_name,
        'can_select': datetime.now().hour < 21
    }), 200

def get_default_menu():
    return {
        "Monday": {
            "Breakfast": ["Oatmeal", "Toast", "Juice"],
            "Lunch": ["Chicken Rice", "Salad", "Water"],
            "Snacks": ["Cookies", "Fruit", "Tea"]
        },
        "Tuesday": {
            "Breakfast": ["Eggs", "Bread", "Milk"],
            "Lunch": ["Fish Curry", "Rice", "Water"],
            "Snacks": ["Biscuits", "Apple", "Coffee"]
        },
        "Wednesday": {
            "Breakfast": ["Pancakes", "Syrup", "OJ"],
            "Lunch": ["Veggie Stir Fry", "Rice", "Water"],
            "Snacks": ["Cake", "Banana", "Tea"]
        },
        "Thursday": {
            "Breakfast": ["Cereal", "Milk", "Toast"],
            "Lunch": ["Mutton Biryani", "Raita", "Water"],
            "Snacks": ["Donut", "Orange", "Coffee"]
        },
        "Friday": {
            "Breakfast": ["Yogurt", "Granola", "Juice"],
            "Lunch": ["Paneer Butter", "Naan", "Water"],
            "Snacks": ["Muffin", "Grapes", "Tea"]
        },
        "Saturday": {
            "Breakfast": ["French Toast", "Berries", "Milk"],
            "Lunch": ["Tandoori Chicken", "Roti", "Water"],
            "Snacks": ["Brownie", "Mango", "Coffee"]
        },
        "Sunday": {
            "Breakfast": ["Waffle", "Honey", "Juice"],
            "Lunch": ["Butter Chicken", "Paratha", "Water"],
            "Snacks": ["Pie", "Watermelon", "Tea"]
        }
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)