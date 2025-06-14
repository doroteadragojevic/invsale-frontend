from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

FAQ_FILE = 'faq.txt'
UNANSWERED_FILE = 'unanswered_questions.txt'
SEPARATOR = '-'

def load_faq(file_path=FAQ_FILE):
    faq = []
    if not os.path.exists(file_path):
        return faq
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if SEPARATOR in line:
                question, answer = line.split(SEPARATOR, 1)
                faq.append({'question': question.strip(), 'answer': answer.strip()})
    return faq

def save_faq_entry(question, answer, file_path=FAQ_FILE):
    with open(file_path, 'a', encoding='utf-8') as file:
        file.write(f"{question} {SEPARATOR} {answer}\n")

def load_unanswered(file_path=UNANSWERED_FILE):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as file:
        questions = [line.strip() for line in file if line.strip()]
    return questions

def save_unanswered_question(question, file_path=UNANSWERED_FILE):
    # Dodaj pitanje ako već ne postoji
    questions = load_unanswered(file_path)
    if question not in questions:
        with open(file_path, 'a', encoding='utf-8') as file:
            file.write(question + '\n')

def remove_unanswered_question(question, file_path=UNANSWERED_FILE):
    questions = load_unanswered(file_path)
    questions = [q for q in questions if q != question]
    with open(file_path, 'w', encoding='utf-8') as file:
        for q in questions:
            file.write(q + '\n')

# Endpoint za dohvat svih FAQ pitanja i odgovora
@app.route('/faq', methods=['GET'])
def get_faq():
    faq = load_faq()
    return jsonify(faq)

# Endpoint za dohvat neodgovorenih pitanja
@app.route('/unanswered', methods=['GET'])
def get_unanswered():
    questions = load_unanswered()
    return jsonify(questions)

# Endpoint za postavljanje pitanja (postoji već, ali neka ostane)
@app.route('/ask', methods=['GET'])
def ask_question():
    user_question = request.args.get('question')
    faq = load_faq()
    for entry in faq:
        if user_question.lower() in entry['question'].lower():
            return jsonify({'answer': entry['answer']})
    # Ako nema odgovora, spremi pitanje u neodgovorena
    save_unanswered_question(user_question)
    return jsonify({'answer': "Unfortunately, we don't have an answer for this question."})

# Novi endpoint za spremanje odgovora na neodgovorena pitanja
@app.route('/answer', methods=['POST'])
def post_answer():
    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')

    if not question or not answer:
        return jsonify({'error': 'Nedostaje pitanje ili odgovor.'}), 400

    # Spremi u faq.txt
    save_faq_entry(question, answer)

    # Ukloni iz neodgovorenih pitanja
    remove_unanswered_question(question)

    return jsonify({'message': 'Odgovor spremljen uspješno.'}), 200

if __name__ == '__main__':
    app.run(debug=True)
