from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import requests
import re
import json
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Load intent_data
with open("intent_data.json", "r", encoding="utf-8") as f:
    intents = json.load(f)

# Load mô hình
with open("best_model.txt", "r") as f:
    best_model_path = f.read().strip()
    print(f" Đang load mô hình từ: {best_model_path}")

model = AutoModelForSequenceClassification.from_pretrained(best_model_path)
tokenizer = AutoTokenizer.from_pretrained(best_model_path)
id2label = model.config.id2label

API_BASE_URL = "http://localhost:3001/api"
BOT_TOKEN = None
chat_memory = {}

# Trạng thái hội thoại tính phí
shipping_steps = {
    "fromAddress": "Vui lòng cho tôi biết địa chỉ gửi hàng?",
    "toAddress": "Tiếp theo, bạn vui lòng cho biết địa chỉ nhận hàng?",
    "weight": "Khối lượng gói hàng là bao nhiêu kg?",
    "dimension": "Kích thước gói hàng (Dài x Rộng x Cao)?",
}
user_shipping_state = {}

def get_bot_token():
    global BOT_TOKEN
    try:
        res = requests.post(f"{API_BASE_URL}/auth/login", json={
            "email": "vbot@chatbox.com",
            "password": "123456"
        })
        res.raise_for_status()
        BOT_TOKEN = res.json().get("accessToken")
        print(" Bot login thành công.")
    except Exception as e:
        print(f" Không thể lấy token: {e}")
        BOT_TOKEN = None

get_bot_token()

def predict_intent(text):
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    pred = torch.argmax(outputs.logits, dim=1).item()
    intent = id2label[pred]

    text_lower = text.lower()
    if re.search(r"(hủy|huỷ|xóa|xoá)", text_lower):
        intent = "huy_don"
    elif re.search(r"(phí|tiền|cước).*(giao hàng|ship)", text_lower):
        intent = "tinh_phi_giao_hang"
    elif re.search(r"(ship|giao hàng|vận chuyển).*(bao nhiêu|giá|phí|tiền)", text_lower):
        intent = "tinh_phi_giao_hang"
    elif re.search(r"(tính phí|tính tiền|bao nhiêu tiền|ship bao nhiêu)", text_lower):
        intent = "tinh_phi_giao_hang"

    print(f" Intent: {intent} | Message: {text}")
    return intent

def query_order_status(code):
    if not BOT_TOKEN:
        get_bot_token()
    try:
        res = requests.get(f"{API_BASE_URL}/orders/detail/{code}", headers={
            "Authorization": f"Bearer {BOT_TOKEN}"
        })
        res.raise_for_status()
        order = res.json()
        return f"Đơn hàng #{code} hiện đang: {order.get('Order_status', 'không rõ trạng thái')}."
    except Exception as e:
        return f"Không thể tìm thấy đơn hàng: {str(e)}"

def cancel_order(code):
    if not BOT_TOKEN:
        get_bot_token()
    try:
        res = requests.delete(f"{API_BASE_URL}/orders/cancel/{code}", headers={
            "Authorization": f"Bearer {BOT_TOKEN}"
        })
        res.raise_for_status()
        return f"Đơn hàng #{code} đã được huỷ thành công."
    except Exception as e:
        return f"Không thể huỷ đơn hàng: {str(e)}"
    
def calculate_shipping_cost(form):
    if not BOT_TOKEN:
        get_bot_token()
    try:
        # Parse weight
        weight_raw = str(form.get("weight", "")).lower()
        match_weight = re.findall(r"[\d.]+", weight_raw)
        if not match_weight:
            return " Khối lượng không hợp lệ. Vui lòng nhập số kg, ví dụ: 10"
        weight = float(match_weight[0])

        # Parse dimension
        dimension_raw = form.get("dimension", "")
        match = re.findall(r"\d+", dimension_raw)
        if len(match) == 3:
            length, width, height = map(int, match)
        else:
            return " Kích thước không hợp lệ. Vui lòng nhập theo định dạng: Dài x Rộng x Cao"

        payload = {
            "fromAddress": form.get("fromAddress"),
            "toAddress": form.get("toAddress"),
            "weight": weight,
            "length": length,
            "width": width,
            "height": height,
            "freightType": "Tiêu chuẩn",
            "extraServices": [],
            "declaredValue": 0
        }

        res = requests.post(f"{API_BASE_URL}/shipping/calculate", headers={
            "Authorization": f"Bearer {BOT_TOKEN}"
        }, json=payload)
        res.raise_for_status()
        data = res.json()
        reply = (
            f"Khoảng cách: {data.get('distanceKm', '?')} km\n"
            f"Khối lượng tính cước: {data.get('chargeableWeight', '?')} kg\n"
            f"Phí cơ bản: {data.get('basePrice', 0)} đ\n"
            f"Phụ phí: " + ', '.join([f"{k}: {v} đ" for k, v in data.get('extraServices', {}).items()]) + "\n"
            f"Tổng cước phí: {data.get('total', 0)} đ"
        )
        return reply
    except Exception as e:
        return f"Không thể tính phí: {str(e)}"


@app.route("/chat", methods=["POST"])
def chat():
    text = request.json.get("message", "")
    user_id = request.json.get("userId", "default")
    match = re.search(r"(ORD-\d+|\d{6,})", text)
    prev_intent = chat_memory.get(user_id)

    # Nếu đang trong luồng tính phí thì bỏ qua đoán intent
    if user_id in user_shipping_state:
        intent = "tinh_phi_giao_hang"
    elif match and prev_intent in ["kiem_tra_don", "huy_don"]:
        intent = prev_intent
    else:
        intent = predict_intent(text)
        chat_memory[user_id] = intent

    # Tra cứu đơn hàng
    if intent == "kiem_tra_don":
        if match:
            chat_memory[user_id] = None
            return jsonify({"reply": query_order_status(match.group(1)), "intent": intent})
        return jsonify({"reply": "Bạn vui lòng cung cấp mã đơn hàng để tôi kiểm tra.", "intent": intent})

    # Huỷ đơn hàng
    if intent == "huy_don":
        if match:
            chat_memory[user_id] = None
            return jsonify({"reply": cancel_order(match.group(1)), "intent": intent})
        return jsonify({"reply": "Bạn muốn huỷ đơn nào? Gửi mã đơn giúp tôi.", "intent": intent})

    # Tính phí đa bước
    if intent == "tinh_phi_giao_hang":
        state = user_shipping_state.get(user_id, {
            "step": 0,
            "data": {
                "fromAddress": None,
                "toAddress": None,
                "weight": None,
                "dimension": None,
            }
        })

        keys = list(shipping_steps.keys())
        step = state["step"]

        if step > 0:
            prev_key = keys[step - 1]
            state["data"][prev_key] = text

        if step == len(keys):
            reply = calculate_shipping_cost(state["data"])
            user_shipping_state.pop(user_id, None)
            return jsonify({"reply": reply, "intent": intent})

        current_key = keys[step]
        question = shipping_steps[current_key]
        state["step"] += 1
        user_shipping_state[user_id] = state
        return jsonify({"reply": question, "intent": intent})

    # Intent thường (chào hỏi...)
    for item in intents["intents"]:
        if item["tag"] == intent:
            return jsonify({
                "reply": random.choice(item["responses"]),
                "intent": intent
            })

    return jsonify({
        "reply": "Tôi chỉ hỗ trợ kiểm tra, huỷ đơn và tính phí. Vui lòng nhập yêu cầu phù hợp.",
        "intent": "unknown"
    })

if __name__ == "__main__":
    app.run(port=5005) 
    