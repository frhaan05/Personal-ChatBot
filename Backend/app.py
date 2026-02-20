from flask import Flask, request, jsonify
from rules import get_rule_response

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    message = data.get("message", "")
    rule_reply = get_rule_response(message)
    if rule_reply is not None:
        return jsonify({"source": "rule", "response": rule_reply})
    # else: forward to AI (ai_engine) -- we'll implement this next
    return jsonify({"source": "ai", "response": "forward_to_ai"})
