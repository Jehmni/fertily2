(function() {
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
    }

    .fertility-chat-header {
      padding: 16px;
      background: #7c3aed;
      color: white;
      font-weight: 600;
    }

    .fertility-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .fertility-message {
      margin-bottom: 12px;
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      line-height: 1.4;
    }

    .fertility-message.bot {
      background: #f3f4f6;
      margin-right: auto;
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
    }

    .fertility-chat-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      outline: none;
    }

    .fertility-chat-input button {
      padding: 8px 16px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
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
      <button class="fertility-widget-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div class="fertility-chat-window">
        <div class="fertility-chat-header">
          Fertility Assistant
        </div>
        <div class="fertility-chat-messages">
        </div>
        <div class="fertility-chat-input">
          <input type="text" placeholder="Type your message...">
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

  // Generate a unique session ID
  const sessionId = crypto.randomUUID();
  console.log('Generated session ID:', sessionId);

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
  });

  // Add message to chat
  function addMessage(text, isBot) {
    const message = document.createElement('div');
    message.className = `fertility-message ${isBot ? 'bot' : 'user'}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Handle sending messages
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    sendButton.disabled = true;
    addMessage(message, false);

    try {
      console.log('Sending message:', message);
      const response = await fetch('https://fgbhxuvdobmkqojfmboa.functions.supabase.co/widget-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ 
          message,
          sessionId 
        }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error);
      }

      addMessage(data.response, true);
    } catch (error) {
      console.error('Full error:', error);
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
