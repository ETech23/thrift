const socket = io("https://afrimart-zbj3.onrender.com");

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

// ✅ Ensure user is logged in
if (!token) {
  alert("Unauthorized! Please log in.");
  window.location.href = "login.html";
}

// ✅ Format Timestamp for Readable Display
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Example: "21:54"
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Fallback for debugging
  }
  return date.toLocaleString("en-US", { 
    hour: "2-digit", minute: "2-digit", second: "2-digit", 
    year: "numeric", month: "short", day: "numeric" 
  });
}

// ✅ Fetch and Display Orders as Notifications
function loadOrders() {
  axios.get(`https://afrimart-zbj3.onrender.com/api/orders/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      const orders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const notificationsContainer = document.getElementById("notifications");
      notificationsContainer.innerHTML = "";

      if (orders.length === 0) {
        notificationsContainer.innerHTML = `<p class="text-gray-500 text-center">No new orders</p>`;
        return;
      }

      // ✅ Show each order as a notification
      orders.forEach((order) => {
        const orderElement = document.createElement("div");
        orderElement.className = "notification bg-white shadow-md rounded-lg p-3 mb-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition";
        orderElement.innerHTML = `
          <div>
            <p class="font-bold">${order.item.name}</p>
            <p class="text-gray-600">Original Price: <del>${order.item.currency || "$"}${order.item.price}</del></p>
<p class="text-green-500">Bidding Price: ${order.item.currency || "$"}${order.price}</p>
            <p class="text-sm text-gray-500">Seller: ${order.seller.name} | Buyer: ${order.buyer.name}</p>
            <p class="text-xs text-gray-400">
  Created: ${order.createdAt ? formatTime(order.createdAt) : "N/A"}
</p>
          </div>
          <button class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-500" onclick="openChat('${order._id}', '${order.seller._id}', '${order.buyer._id}', '${order.seller.name}', '${order.buyer.name}')">
            Chat
          </button>
        `;
        notificationsContainer.appendChild(orderElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders.");
    });
}

// ✅ Open Full-Screen Chat Window
function openChat(orderId, sellerId, buyerId, sellerName, buyerName) {
  document.getElementById("chat-container").style.display = "flex";

  // ✅ Set correct chat partner
  const chatPartner = userId === sellerId ? buyerName : sellerName;
  document.getElementById("chat-title").textContent = chatPartner;

  document.getElementById("send-message").setAttribute("data-order-id", orderId);
  loadChatMessages(orderId);
}

// ✅ Close Chat Window
function closeChat() {
  document.getElementById("chat-container").style.display = "none";
}

// ✅ Load Chat Messages
function loadChatMessages(orderId) {
  axios.get(`https://afrimart-zbj3.onrender.com/api/orders/${orderId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      const chatBox = document.getElementById("chat-box");
      chatBox.innerHTML = "";

      response.data.forEach((msg) => {
        const isBuyer = msg.sender._id === userId;
        const messageElement = document.createElement("div");

        messageElement.className = `message p-2 my-1 rounded-xl text-sm w-fit max-w-xs break-words ${
          isBuyer ? "bg-blue-200 text-black ml-auto text-right" : "bg-blue-100 text-black mr-auto text-left"
        }`;

        messageElement.innerHTML = `
          <p>${msg.message}</p>
          <p class="text-xs text-gray-500 text-right">${formatTime(msg.timestamp)}</p>
        `;
        chatBox.appendChild(messageElement);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      alert("Failed to load messages.");
    });
}

// ✅ Send Chat Message
document.getElementById("send-message").addEventListener("click", () => {
  const orderId = document.getElementById("send-message").getAttribute("data-order-id");
  const message = document.getElementById("message").value;

  if (message) {
    axios.post(`https://afrimart-zbj3.onrender.com/api/orders/${orderId}/message`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      socket.emit("sendMessage", { orderId, senderId: userId, message });
      document.getElementById("message").value = "";
      loadChatMessages(orderId);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    });
  }
});

// ✅ Listen for Incoming Messages
socket.on("newMessage", (data) => {
  const chatBox = document.getElementById("chat-box");

  const isBuyer = data.senderId === userId;
  const messageElement = document.createElement("div");

  messageElement.className = `message p-2 my-1 rounded-xl text-sm w-fit max-w-xs break-words ${
    isBuyer ? "bg-blue-200 text-black ml-auto text-right" : "bg-blue-100 text-black mr-auto text-left"
  }`;

  messageElement.innerHTML = `
    <p>${data.message}</p>
    <p class="text-xs text-gray-500 text-right">${formatTime(new Date())}</p>
  `;

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ✅ Load Orders on Page Load
loadOrders();