const BASE_URL = "https://thrift2.vercel.app/api";

// message.js

function setupMessaging() {
    const chatId = new URLSearchParams(window.location.search).get('chatId');
    const messageContainer = document.getElementById('messageContainer');
    const messageForm = document.getElementById('messageForm');
    
    if (!chatId) {
        messageContainer.innerHTML = '<div class="alert alert-danger">Chat session not found</div>';
        return;
    }

    // Load existing messages
    loadMessages(chatId);

    // Setup message form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(chatId);
    });

    // Setup real-time updates (if using WebSocket)
    setupRealtimeUpdates(chatId);
}

function loadMessages(chatId) {
    const currentUser = getCurrentUser();
    const messageContainer = document.getElementById('messageContainer');

    fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        headers: {
            'Authorization': `Bearer ${currentUser.token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        messageContainer.innerHTML = data.messages.map(message => `
            <div class="message ${message.senderId === currentUser.id ? 'sent' : 'received'} mb-3">
                <div class="message-content p-3 rounded">
                    <p class="mb-1">${message.content}</p>
                    <small class="text-muted">
                        ${new Date(message.timestamp).toLocaleString()}
                    </small>
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom of message container
        messageContainer.scrollTop = messageContainer.scrollHeight;
    })
    .catch(error => {
        console.error("Error loading messages:", error);
        messageContainer.innerHTML = `
            <div class="alert alert-danger">Error loading messages. Please try again later.</div>
        `;
    });
}

function sendMessage(chatId) {
    const currentUser = getCurrentUser();
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(message => {
        messageInput.value = '';
        // Optionally update UI immediately or wait for WebSocket update
        loadMessages(chatId);
    })
    .catch(error => {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    });
}

function setupRealtimeUpdates(chatId) {
    // Implement WebSocket connection for real-time updates
    const ws = new WebSocket(`${WS_BASE_URL}/chat/${chatId}`);
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        // Update UI with new message
        loadMessages(chatId);
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

// Call setup function when page loads
document.addEventListener('DOMContentLoaded', setupMessaging);

// Add some basic styles
const styles = `
    .message {
        max-width: 70%;
        margin: 8px 0;
    }

    .sent {
        margin-left: auto;
    }

    .received {
        margin-right: auto;
    }

    .sent .message-content {
        background-color: #007bff;
        color: white;
    }

    .received .message-content {
        background-color: #f8f9fa;
    }

    #messageContainer {
        height: 60vh;
        overflow-y: auto;
        padding: 20px;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);