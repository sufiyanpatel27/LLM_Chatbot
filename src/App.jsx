import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';


import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // or any theme you like
import 'prismjs/components/prism-javascript'; // or python, etc.

const renderFormattedMessage = (text) => {
  const lines = text.split('\n');
  const formatted = [];

  let insideCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('File:') || line.trim().startsWith('```')) {
      if (insideCodeBlock) {
        const code = codeBuffer.join('\n');
        formatted.push(
          <div className="code-wrapper" key={`block-${idx}`}>
            <button
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(code)}
            >
              📋 Copy
            </button>
            <pre className="fancy-code">
              <code className="language-javascript">{code}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        insideCodeBlock = false;
      } else {
        insideCodeBlock = true;
      }
    } else if (insideCodeBlock) {
      codeBuffer.push(line);
    } else if (line.trim().startsWith('* ')) {
      formatted.push(<li key={`li-${idx}`}>{line.replace(/^\* /, '')}</li>);
    } else {
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, (_, bold) => `<strong>${bold}</strong>`);
      const emojiFormatted = boldFormatted
        .replace(/:\)/g, '😊')
        .replace(/:-\)/g, '😊')
        .replace(/:\(/g, '☹️')
        .replace(/:-\(/g, '☹️')
        .replace(/;-\)/g, '😉');

      formatted.push(
        <p
          key={`p-${idx}`}
          dangerouslySetInnerHTML={{ __html: emojiFormatted }}
        />
      );
    }
  });

  return formatted;
};




function App() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    Prism.highlightAll();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const res = await axios.post(`https://llm-chatbot-backend.onrender.com/api/chat`, { message: input });
      const botReply = res.data.reply;
      setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Oops, something went wrong!' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">LLM Chatbot 🤖</div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            {renderFormattedMessage(msg.text)}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
