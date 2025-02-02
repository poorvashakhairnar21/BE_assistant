from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests (from React)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    # Simulate an AI-generated response
    ai_response = f"AI: {user_message[::-1]}"  # Example: Reverse the message

    return jsonify({"reply": ai_response})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3002)
