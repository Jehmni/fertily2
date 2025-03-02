(function() {
  // Configuration object that can be overridden
  window.FERTILITY_WIDGET_CONFIG = window.FERTILITY_WIDGET_CONFIG || {
    apiUrl: 'https://fgbhxuvdobmkqojfmboa.functions.supabase.co/widget-chat',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnYmh4dXZkb2Jta3FvamZtYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzE4NzIsImV4cCI6MjA1Mzg0Nzg3Mn0.1oCLHiM1UcC0qn2eif1tv54r_TBGyoqbC6y2pqC_dkk'
  };

  // Create widget styles
  const styles = `
    .fertility-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .fertility-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #7c3aed;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .fertility-widget-button:hover {
      transform: scale(1.05);
    }

    .fertility-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .fertility-chat-header {
      padding: 16px;
      background: #7c3aed;
      color: white;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fertility-chat-header img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .fertility-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
    }

    .fertility-message {
      margin-bottom: 12px;
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      line-height: 1.4;
      font-size: 14px;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fertility-message.bot {
      background: white;
      margin-right: auto;
      border: 1px solid #e5e7eb;
    }

    .fertility-message.user {
      background: #7c3aed;
      color: white;
      margin-left: auto;
    }

    .fertility-chat-input {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      background: white;
    }

    .fertility-chat-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      outline: none;
      font-size: 14px;
    }

    .fertility-chat-input input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
    }

    .fertility-chat-input button {
      padding: 8px 16px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .fertility-chat-input button:hover {
      background: #6d28d9;
    }

    .fertility-chat-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  // Create and inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget HTML
  const widgetHTML = `
    <div class="fertility-widget">
      <button class="fertility-widget-button" aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div class="fertility-chat-window">
        <div class="fertility-chat-header">
          <img src="https://fertily.lovable.ai/logo.png" alt="Fertily Chat" />
          Fertility Assistant
        </div>
        <div class="fertility-chat-messages">
        </div>
        <div class="fertility-chat-input">
          <input type="text" placeholder="Type your message..." aria-label="Chat message">
          <button>Send</button>
        </div>
      </div>
    </div>
  `;

  // Insert widget into page
  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // Get widget elements
  const widget = container.querySelector('.fertility-widget');
  const chatButton = widget.querySelector('.fertility-widget-button');
  const chatWindow = widget.querySelector('.fertility-chat-window');
  const messagesContainer = widget.querySelector('.fertility-chat-messages');
  const input = widget.querySelector('input');
  const sendButton = widget.querySelector('button:not(.fertility-widget-button)');

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    const isVisible = chatWindow.style.display === 'flex';
    chatWindow.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible && messagesContainer.children.length === 0) {
      // Add welcome message when opening for the first time
      addMessage("Hello! I'm your fertility assistant. How can I help you today?", true);
    }
  });

  // Add message to chat
  function addMessage(text, isBot) {
    const message = document.createElement('div');
    message.className = `fertility-message ${isBot ? 'bot' : 'user'}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Modified sendMessage function to use configured API URL
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    sendButton.disabled = true;
    addMessage(message, false);

    try {
      const sessionId = localStorage.getItem('fertility_chat_session') || 
                       Math.random().toString(36).substring(7);
      localStorage.setItem('fertility_chat_session', sessionId);

      const response = await fetch(window.FERTILITY_WIDGET_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': window.FERTILITY_WIDGET_CONFIG.apiKey
        },
        mode: 'cors',
        cache: 'no-cache',
        body: JSON.stringify({ 
          message,
          sessionId 
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      addMessage(data.response, true);
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('Sorry, I encountered an error. Please try again.', true);
    } finally {
      sendButton.disabled = false;
    }
  }

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
