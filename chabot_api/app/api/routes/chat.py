from flask import Blueprint, request, jsonify
from app.core.model import Data
from app.services.model_services import ModelService
from app.core.config import Config
from app.core.auth import require_internal_api_key

chat_router = Blueprint("chat_router", __name__)

ConfigInstance = Config()
ModelServiceInstance = ModelService(config=ConfigInstance)

MAX_MESSAGE_LENGTH = 4000


@chat_router.route("/health", methods=["GET"])
def health():
    is_healthy = ModelServiceInstance.health_check()
    if is_healthy:
        return jsonify({"status": "ok"})
    else:
        return jsonify({"status": "unhealthy"}), 503


@chat_router.route("/chat", methods=["POST"])
@require_internal_api_key
def chat():
    try:
        data = request.get_json() or {}
        data_obj = Data(**data)
        user_msg = data_obj.message
    except Exception:
        return jsonify({"error": "Invalid input"}), 400

    if not user_msg:
        return jsonify({"error": "Message field is required."}), 400

    if len(user_msg) > MAX_MESSAGE_LENGTH:
        return jsonify({"error": f"Message must be {MAX_MESSAGE_LENGTH} characters or fewer."}), 400

    try:
        model_response = ModelServiceInstance.generate_response(prompt=user_msg)
        return jsonify({"response": model_response})
    except Exception:
        return jsonify({"error": "Failed to generate response"}), 500
