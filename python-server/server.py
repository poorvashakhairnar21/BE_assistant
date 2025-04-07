import socket
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests (from React)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    print(data)
    user_message = data.get("message", "")
    user_previousChat = data.get("previousChat", "")
    # Simulate an AI-generated response
    return jsonify({"reply": user_message})

def find_available_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))  # Bind to an available port
        return s.getsockname()[1]

if __name__ == "__main__":
    port = find_available_port()
    port=3002
    print(f"Server starting on port {port}")
    app.run(debug=True, host="127.0.0.1", port=port)
