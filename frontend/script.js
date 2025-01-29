document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://thrift2.vercel.app/api";
    const socket = io(BASE_URL);

    // Dark Mode Management
    function setupDarkMode() {
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener("click", () => {
                document.body.classList.toggle("dark-mode");
                localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
            });
        }
    }

    // Mobile Menu Toggle
    function setupMobileMenu() {
        const menuToggle = document.getElementById("menuToggle");
        const mobileMenu = document.getElementById("mobileMenu");
        const overlay = document.getElementById("overlay");

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", () => {
                mobileMenu.classList.toggle("active");
                if (overlay) overlay.classList.toggle("active");
            });

            if (overlay) {
                overlay.addEventListener("click", () => {
                    mobileMenu.classList.remove("active");
                    overlay.classList.remove("active");
                });
            }
        }
    }

    function setupFeaturedListings() {
    const featuredListings = document.getElementById("featuredListings");

    fetch(`${BASE_URL}/items?limit=4`)
        .then(response => response.json())
        .then(data => {
            console.log("🔍 Full API Response:", JSON.stringify(data, null, 2));  // ✅ Debug full response

            if (!data || typeof data !== "object") {
                console.error("❌ Invalid API response format:", data);
                featuredListings.innerHTML = "<p class='text-danger'>Invalid API response.</p>";
                return;
            }

            if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
                console.warn("⚠ No valid items returned from API");
                featuredListings.innerHTML = "<p class='text-danger'>No featured listings available.</p>";
                return;
            }

            featuredListings.innerHTML = "";
data.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
        <div class="card shadow-sm">
            <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
            <div class="card-body">
                <h5 class="card-title text-primary">${item.name}</h5>
                <p class="text-muted">
                    <strong>${item.price}</strong> ${item.currency || ''}
                </p>
                <p class="text-muted">
                    <strong>${""}</strong> ${item.location || ''}
                </p>
                <p class="text-sm ${item.anonymous ? 'text-danger' : 'text-muted'}">
                    ${item.anonymous ? 'Anonymous' : 'Verified Seller'}
                </p>
                <a href="item-details.html?id=${item._id}" class="btn btn-primary w-100">View Item</a>
            </div>
        </div>
    `;

                featuredListings.appendChild(card);
            });
        })
        .catch(error => {
            console.error("❌ Error fetching items:", error);
            featuredListings.innerHTML = "<p class='text-danger'>Failed to load featured listings.</p>";
        });
}

    // Item Posting Form
    function setupItemPostForm() {
        const postItemForm = document.getElementById("postItemForm");

        if (postItemForm) {
            postItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const formData = new FormData();
                formData.append("name", document.getElementById("itemName").value);
                formData.append("price", document.getElementById("itemPrice").value);
                formData.append("category", document.getElementById("itemCategory").value);
                formData.append("location", document.getElementById("itemLocation").value);
                formData.append("currency", document.getElementById("itemCurrency").value);
                formData.append("anonymous", document.getElementById("anonymousToggle").checked);
                formData.append("image", document.getElementById("itemImage").files[0]);

                try {
                    const response = await fetch(`${BASE_URL}/items/create`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },
                        body: formData
                    });

                    const result = await response.json();
                    if (result.success) {
                        showNotification("Item posted successfully!", "success");
                        postItemForm.reset();
                    } else {
                        showNotification(result.message || "Failed to post item", "error");
                    }
                } catch (error) {
                    console.error("Error:", error);
                    showNotification("An error occurred", "error");
                }
            });
        }
    }

    function setupChatPage() {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get("chatId");

    if (!chatId) {
        alert("Invalid chat.");
        window.location.href = "index.html";
        return;
    }

    fetch(`${BASE_URL}/chat/${chatId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(response => response.json())
    .then(chat => {
        document.getElementById("chatTitle").textContent = chat.anonymous ? "Anonymous Chat" : `Chat with ${chat.seller.username}`;

        const chatBox = document.getElementById("chatMessages");
        chat.messages.forEach(message => {
            const msgDiv = document.createElement("div");
            msgDiv.className = `message ${message.sender === localStorage.getItem("userId") ? "sent" : "received"}`;
            msgDiv.textContent = message.text;
            chatBox.appendChild(msgDiv);
        });

        document.getElementById("sendMessage").addEventListener("click", sendMessage);
    })
    .catch(error => console.error("Error loading chat:", error));
}

function sendMessage() {
    const chatId = new URLSearchParams(window.location.search).get("chatId");
    const messageInput = document.getElementById("messageInput");

    fetch(`${BASE_URL}/chat/${chatId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ text: messageInput.value })
    })
    .then(response => response.json())
    .then(() => {
        messageInput.value = "";
        setupChatPage();  // Reload messages
    })
    .catch(error => console.error("Error sending message:", error));
}

document.addEventListener("DOMContentLoaded", setupChatPage);
    
    // Real-time Chat Setup
    function setupChatMessaging() {
        const chatMessages = document.getElementById("chatMessages");
        const messageInput = document.getElementById("messageInput");
        const sendMessageButton = document.getElementById("sendMessage");

        const senderId = localStorage.getItem("userId");
        const receiverId = localStorage.getItem("chatReceiver");

        socket.emit("joinRoom", { senderId, receiverId });

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            socket.emit("sendMessage", { senderId, receiverId, text });
            messageInput.value = "";
        }

        socket.on("receiveMessage", (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${message.sender === senderId ? "sent" : "received"}`;
    messageDiv.innerHTML = `${message.text} <span class="status">${message.read ? "Seen" : "Delivered"}</span>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Mark message as read
    if (message.sender !== senderId) {
        socket.emit("markAsRead", { messageId: message._id });
    }
});
        
        socket.on("receiveMessage", (message) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${message.sender === senderId ? "sent" : "received"}`;
            messageDiv.textContent = message.text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        if (sendMessageButton) {
            sendMessageButton.addEventListener("click", sendMessage);
            messageInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        }
    }

    function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("show");
            setTimeout(() => {
                notification.classList.remove("show");
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 10);
    }

    function setupCurrencyUpdate() {
        document.getElementById("itemCurrency").addEventListener("change", function() {
            const currencySymbol = {
                'NGN': '₦',
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'KES': 'KSh',
                'ZAR': 'R',
                'AED': 'د.إ',
                'GHS': '₵',
                'XAF': 'CFA',
                'XOF': 'CFA'
            };
            
            const symbol = currencySymbol[this.value] || '₦';
            document.getElementById("currencySymbol").textContent = symbol;
        });
    }

    // Initialize all features
    setupDarkMode();
    setupMobileMenu();
    setupFeaturedListings();
    setupItemPostForm();
    setupChatMessaging();
    setupCurrencyUpdate();

    window.addEventListener("error", (event) => {
        showNotification(`An error occurred: ${event.message}`, "error");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://thrift2.vercel.app/api";
    const socket = io(BASE_URL);

   /** function setupDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    console.log("Dark Mode status:", localStorage.getItem("darkMode"));

    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            console.log("Button clicked!");
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
    }
}
**/


    

document.addEventListener("DOMContentLoaded", () => {
    setupAuthForms();
});

function setupAuthForms() {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const formObject = Object.fromEntries(formData.entries());

        console.log("🔍 Form Data as Object:", JSON.stringify(formObject, null, 2)); // ✅ Now prints readable JSON

        if (!formObject.username || !formObject.email || !formObject.password) {  
            alert("All fields are required!");  
            return;
        }

        if (formObject.password !== formObject.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formObject),
            });

            const text = await response.text();
            console.log("Raw API Response:", text);

            const data = JSON.parse(text);
            console.log("Parsed JSON Response:", data);

            if (data.success) {
                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            alert("Error connecting to the server.");
            console.error("Registration Error:", error);
        }
    });
}

    if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formObject),
            });

            const data = await response.json();
            console.log("Login API Response:", JSON.stringify(data, null, 2));  // ✅ Fix: Display JSON properly

            if (!data.success) {
                console.error("Login Failed - API Response:", data);
                alert(data.message || "Login failed.");
                return;
            }

            if (!data.token) {
                console.error("Login Failed - Token Missing:", data);
                alert("Token missing. Login failed.");
                return;
            }

            if (!data.user || !data.user._id) {
                console.error("Login Failed - User ID Missing:", data);
                alert("User ID missing. Login failed.");
                return;
            }

            console.log("✅ Storing Token in LocalStorage...");
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user._id);

            console.log("✅ Login Successful! Redirecting...");
            window.location.href = "dashboard.html";  // ✅ Redirect after successful login
        } catch (error) {
            console.error("Login Error:", error);
            alert("Error connecting to the server.");
        }
    });
}
}

    /**function setupUserDashboard() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to access your dashboard.");
            window.location.href = "login.html";
        }
        fetch(`${BASE_URL}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("username").textContent = data.username;
            document.getElementById("userEmail").textContent = data.email;
        })
        .catch(() => {
            alert("Failed to fetch profile.");
        });
    }**/
    

            

    function setupItemPosting() {
        const postItemForm = document.getElementById("postItemForm");
        if (postItemForm) {
            postItemForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formData = new FormData(postItemForm);
                formData.append("image", document.getElementById("itemImage").files[0]);

                const response = await fetch(`${BASE_URL}/items/create`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    alert("Item posted successfully!");
                    postItemForm.reset();
                } else {
                    alert("Failed to post item.");
                }
            });
        }
    }

    function setupViewItemDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get("id");

        if (itemId) {
            fetch(`${BASE_URL}/items/${itemId}`)
                .then(response => response.json())
                .then(item => {
                    document.getElementById("itemTitle").textContent = item.name;
                    document.getElementById("itemImage").src = item.imageUrl;
                    document.getElementById("itemPrice").textContent = item.price;
                    document.getElementById("itemLocation").textContent = item.location;
                    document.getElementById("itemCategory").textContent = item.category;
                })
                .catch(() => console.log("Failed to load item details."));
        }
    }

    function setupRealTimeChat() {
        const chatMessages = document.getElementById("chatMessages");
        const messageInput = document.getElementById("messageInput");
        const sendMessageButton = document.getElementById("sendMessage");

        const senderId = localStorage.getItem("userId");
        const receiverId = localStorage.getItem("chatReceiver");

        // Emit typing event when user types
    messageInput.addEventListener("input", () => {
        socket.emit("typing", { senderId, receiverId });
    });

    // Listen for typing events
    socket.on("showTyping", (data) => {
        if (data.senderId !== senderId) {
            typingIndicator.textContent = "User is typing...";
            setTimeout(() => {
                typingIndicator.textContent = "";
            }, 3000);
        }
  });
        socket.emit("joinRoom", { senderId, receiverId });
        
        const recordButton = document.getElementById("recordButton");
let mediaRecorder;
let audioChunks = [];

recordButton.addEventListener("mousedown", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };
});

recordButton.addEventListener("mouseup", () => {
    mediaRecorder.stop();
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        await fetch(`${BASE_URL}/messages/audio`, {
            method: "POST",
            body: formData,
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        audioChunks = [];
    };
});

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            socket.emit("sendMessage", { senderId, receiverId, text });
            messageInput.value = "";
        }

        socket.on("receiveMessage", (message) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${message.sender === senderId ? "sent" : "received"}`;
            messageDiv.textContent = message.text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        if (sendMessageButton) {
            sendMessageButton.addEventListener("click", sendMessage);
            messageInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        }
    }
    
    setupAuthForms();
    //setupUserDashboard();
    setupItemPosting();
    setupViewItemDetails();
    setupRealTimeChat();
});

const BASE_URL = "https://thrift2.vercel.app/api";
    const socket = io(BASE_URL);

function updateUnreadCount() {
    const userId = localStorage.getItem("userId");

    fetch(`${BASE_URL}/chat/unread/${userId}`)
        .then(response => response.json())
        .then(data => {
            const unreadCount = data.unread;
            const messagesMenu = document.getElementById("messagesMenu");
            if (unreadCount > 0) {
                messagesMenu.textContent = `Messages (${unreadCount})`;
            } else {
                messagesMenu.textContent = "Messages";
            }
        })
        .catch(error => console.error("Error fetching unread messages:", error));
}

// Call this function every 10 seconds
setInterval(updateUnreadCount, 10000);

document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://your-marketplace-api.com/api";
    const socket = io(BASE_URL);
    const messageSound = new Audio("message.mp3"); // Add a message sound file

    function setupRealTimeChat() {
        const chatMessages = document.getElementById("chatMessages");
        const messageInput = document.getElementById("messageInput");
        const sendMessageButton = document.getElementById("sendMessage");

        const senderId = localStorage.getItem("userId");
        const receiverId = localStorage.getItem("chatReceiver");

        socket.emit("joinRoom", { senderId, receiverId });

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            socket.emit("sendMessage", { senderId, receiverId, text });
            messageInput.value = "";
        }

        socket.on("receiveMessage", (message) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${message.sender === senderId ? "sent" : "received"}`;
            messageDiv.textContent = message.text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Play sound alert
            messageSound.play();

            // Push Notification - Check Permission
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    new Notification("New Message", { body: message.text });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("New Message", { body: message.text });
                        }
                    });
                }
            }
        });

        if (sendMessageButton) {
            sendMessageButton.addEventListener("click", sendMessage);
            messageInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        }
    }

    setupRealTimeChat();
});