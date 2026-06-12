import os
from functools import wraps
from flask import request, jsonify


def require_internal_api_key(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        expected = os.getenv("CHATBOT_INTERNAL_API_KEY", "").strip()
        if not expected:
            return jsonify({"error": "Chatbot API is not configured"}), 503

        provided = request.headers.get("X-Internal-Api-Key", "").strip()
        if not provided or provided != expected:
            return jsonify({"error": "Unauthorized"}), 401

        return view(*args, **kwargs)

    return wrapped
