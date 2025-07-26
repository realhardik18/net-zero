from flask import Flask,jsonify
from flask_cors import CORS

app=Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify('hello')

@app.route('/maps')
def maps():
    return jsonify({
        "lat":12.9699,
        "long":77.700771,
        "event_info":{
            "id":1123,
            "name": "ctrl+vibe3.0",
            "guests":[
                "hardik",
                "arshan",
                "tanisq"
            ]
        }
    })

app.run(debug=True, host='0.0.0.0', port=5000)