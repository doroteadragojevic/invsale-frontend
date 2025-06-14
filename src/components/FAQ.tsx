import React, { useEffect, useState } from 'react';
import AdminHeader from './AdminMenu';
import '../styles/FAQ.css'; // 👉 uvoz CSS-a

export default function FAQ() {
  const [faq, setFaq] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch('http://127.0.0.1:5000/faq')
      .then(res => res.json())
      .then(data => setFaq(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/unanswered')
      .then(res => res.json())
      .then(data => setUnanswered(data))
      .catch(console.error);
  }, []);

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const submitAnswer = async (question) => {
    const answer = answers[question];
    if (!answer) {
      alert('ŠInsert answer.');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (res.ok) {
        alert('Answer is saved.');
        setUnanswered(prev => prev.filter(q => q !== question));
        setFaq(prev => [...prev, { question, answer }]);
        setAnswers(prev => {
          const copy = { ...prev };
          delete copy[question];
          return copy;
        });
      } else {
        alert('Error saving answer.');
      }
    } catch (err) {
      alert('Error connecting with chatbot service.');
    }
  };

  return (
    <div>
      <AdminHeader />
      <div className="faq-container">
        <h2>FAQ</h2>
        <ul className="faq-list">
          {faq.map(({ question, answer }, i) => (
            <li key={i} className="faq-item">
              <p><strong>Question:</strong> {question}</p>
              <p><strong>Answer:</strong> {answer}</p>
            </li>
          ))}
        </ul>

        <h2>Unanswered questions</h2>
        {unanswered.length === 0 && <p>No questions.</p>}
        {unanswered.map((question, i) => (
          <div key={i} className="unanswered-card">
            <p><strong>Question:</strong> {question}</p>
            <textarea
              rows={3}
              className="answer-textarea"
              placeholder="Write answer here..."
              value={answers[question] || ''}
              onChange={e => handleAnswerChange(question, e.target.value)}
            />
            <button className="save-button" onClick={() => submitAnswer(question)}>
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
