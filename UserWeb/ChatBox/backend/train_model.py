from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np
import json
import pandas as pd

# === Load dữ liệu từ intent_data.json ===
with open("intent_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts, labels = [], []
label2id, id2label = {}, {}
label_idx = 0

for item in data["intents"]:
    tag = item["tag"]
    if tag not in label2id:
        label2id[tag] = label_idx
        id2label[label_idx] = tag
        label_idx += 1
    for pattern in item["patterns"]:
        texts.append(pattern)
        labels.append(label2id[tag])

# === Chuẩn bị hàm tính metrics ===
def compute_metrics(p):
    preds = np.argmax(p.predictions, axis=1)
    labels = p.label_ids
    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='weighted')
    return {
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }

# === Danh sách cấu hình huấn luyện để thử nghiệm ===
configs = [
    {"model": "distilbert-base-uncased", "batch_size": 4, "epochs": 5, "train_size": 0.8},
    {"model": "bert-base-uncased", "batch_size": 8, "epochs": 5, "train_size": 0.7},
    {"model": "distilbert-base-uncased", "batch_size": 16, "epochs": 3, "train_size": 0.6}
]

results = []

# === Chạy huấn luyện với từng cấu hình ===
for idx, config in enumerate(configs):
    print(f"\n=== Chạy thử cấu hình {idx+1}: {config} ===")

    # Tách tập huấn luyện và kiểm tra
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, train_size=config["train_size"], shuffle=True, random_state=42
    )

    tokenizer = AutoTokenizer.from_pretrained(config["model"])
    train_enc = tokenizer(train_texts, truncation=True, padding=True)
    test_enc = tokenizer(test_texts, truncation=True, padding=True)

    train_dataset = Dataset.from_dict({
        "input_ids": train_enc["input_ids"],
        "attention_mask": train_enc["attention_mask"],
        "labels": train_labels
    })
    test_dataset = Dataset.from_dict({
        "input_ids": test_enc["input_ids"],
        "attention_mask": test_enc["attention_mask"],
        "labels": test_labels
    })

    # Tạo mô hình
    model = AutoModelForSequenceClassification.from_pretrained(
        config["model"],
        num_labels=len(label2id),
        id2label=id2label,
        label2id=label2id
    )

    training_args = TrainingArguments(
        output_dir=f"./model_{idx+1}",
        num_train_epochs=config["epochs"],
        per_device_train_batch_size=config["batch_size"],
        learning_rate=5e-5,
        logging_dir=f"./logs_{idx+1}",
        save_strategy="no",  # Không auto save giữa chừng
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics
    )

    # === Huấn luyện và đánh giá
    trainer.train()
    eval_result = trainer.evaluate()

    # === Lưu mô hình đầy đủ
    trainer.save_model(f"./model_{idx+1}")
    tokenizer.save_pretrained(f"./model_{idx+1}")

    # === Lưu kết quả
    results.append({
        "Model": config["model"],
        "Batch size": config["batch_size"],
        "Epochs": config["epochs"],
        "Train size": config["train_size"],
        "Accuracy": round(eval_result["eval_accuracy"], 4),
        "Precision": round(eval_result["eval_precision"], 4),
        "Recall": round(eval_result["eval_recall"], 4),
        "F1-score": round(eval_result["eval_f1"], 4)
    })

# === In bảng so sánh kết quả ===
df = pd.DataFrame(results)
print("\n== BẢNG SO SÁNH KẾT QUẢ ==")
print(df.to_string(index=False))
df.to_csv("compare_results.csv", index=False)

# === Lưu thư mục model tốt nhất (theo accuracy cao nhất) để chatbot sử dụng ===
best_model_idx = df['Accuracy'].idxmax()
best_model_dir = f"model_{best_model_idx + 1}"

with open("best_model.txt", "w") as f:
    f.write(best_model_dir)

print(f"\n Mô hình tốt nhất đã được lưu vào: {best_model_dir} (theo accuracy)")