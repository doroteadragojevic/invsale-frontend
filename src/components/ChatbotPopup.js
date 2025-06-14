import React, { useState } from "react";
import Chatbot from "./Chatbot"; // Chatbot komponenta koju smo ranije kreirali

const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{
    fontFamily: "Montserrat, sans-serif",       // Font za cijeli div
    height: isOpen ? "100px" : "auto",      // Visina samo kad je otvoren
    position: "relative"
  }}>
      {/* Bot trigger button */}
      <button 
        onClick={toggleChatbot}
        style={styles.button}
      >
        FAQ
      </button>

      {/* Chatbot popup */}
      {isOpen && (
        <div style={{
      ...styles.popup,
      marginTop: "16px",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      height: "300px",
      overflowY: "auto"
    }}>
        
          <Chatbot />
        </div>
      )}
    </div>
  );
};

// Stiliziranje komponenta pomoću inline stilova
const styles = {
  button: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    zIndex: 1000,
  },
  popup: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "300px",
    height: "400px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "10px",
    zIndex: 999,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  title: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
};

export default ChatbotPopup;
