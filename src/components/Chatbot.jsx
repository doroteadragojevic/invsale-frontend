import React, { useState } from "react";
import "../styles/Chatbot.css";

const MAX_QUESTION_LENGTH = 200;
const CHATBOT_URL = process.env.REACT_APP_CHATBOT_URL;

const Chatbot = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleQuestionChange = (e) => {
    const value = e.target.value;

    if (value.length > MAX_QUESTION_LENGTH) {
      setError(`Question is too long.`);
    } else {
      setError("");
    }

    setQuestion(value);
  };

  const handleSubmit = async () => {
    if (question.trim() === "") {
      setError("Please enter your question.");
      return;
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      setError(`Question is too long.`);
      return;
    }

    try {
      const response = await fetch(`${CHATBOT_URL}/ask?question=${question}`);
      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("Error fetching answers.");
      console.error(err);
    }
  };

  return (
    <div className="chatbot-container">
  <input
    type="text"
    value={question}
    onChange={handleQuestionChange}
    placeholder="Ask a question"
    className={`chatbot-input ${error ? "error" : ""}`}
  />
  <button onClick={handleSubmit} disabled={!!error} className="chatbot-button">
    SUBMIT
  </button>

  {error && <p className="chatbot-error">{error}</p>}
  {answer && <p className="chatbot-answer">Answer: {answer}</p>}
</div>

  );
};

export default Chatbot;
