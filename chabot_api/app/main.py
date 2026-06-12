import os
from flask import Flask, jsonify
from app.api.routes.chat import chat_router

app = Flask(__name__)
app.register_blueprint(chat_router, url_prefix="/api")


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Chatbot API is running!"})


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="127.0.0.1", debug=debug, port=8080)
