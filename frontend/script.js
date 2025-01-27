

document.addEventListener("DOMContentLoaded", () => {
    // Global Configuration
    const BASE_URL = "https://your-marketplace-api.com/api";
    
    // Dark Mode Management
    function setupDarkMode() {
        const darkModeToggle = document.getElementById("darkModeToggle");
        
        // Initial dark mode check
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener("click", () => {
                document.body.classList.toggle("dark-mode");

                if (document.body.classList.contains("dark-mode")) {
                    localStorage.setItem("darkMode", "enabled");
                } else {
                    localStorage.removeItem("darkMode");
                }
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

            // Close menu when clicking outside
            if (overlay) {
                overlay.addEventListener("click", () => {
                    mobileMenu.classList.remove("active");
                    overlay.classList.remove("active");
                });
            }
        }
    }

    // Featured Listings Management
    function setupFeaturedListings() {
        const featuredListings = document.getElementById("featuredListings");

        if (featuredListings) {
            const sampleItems = [
                { 
                    name: "iPhone 12", 
                    price: "$500", 
                    image: "img/i.jpeg", 
                    anonymous: false 
                },
                { 
                    name: "Gaming Laptop", 
                    price: "$900", 
                    image: "img/laptop.jpeg", 
                    anonymous: true 
                },
            { 
                    name: "iPhone 12", 
                    price: "$500", 
                    image: "img/i.jpeg", 
                    anonymous: false 
                },
                { 
                    name: "Gaming Laptop", 
                    price: "$900", 
                    image: "img/laptop.jpeg", 
                    anonymous: true 
                },
            ];

            sampleItems.forEach(item => {
                const card = document.createElement("div");
                card.className = "col-md-4 mb-4";
                card.innerHTML = `
                    <div class="card">
                        <img src="${item.image}" class="card-img-top" alt="${item.name}">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="text-muted">${item.price}</p>
                            <p class="text-sm ${item.anonymous ? 'text-danger' : 'text-muted'}">
                                ${item.anonymous ? 'Anonymous' : 'Verified Seller'}
                            </p>
                            <a href="item-details.html" class="btn btn-primary w-100">View Item</a>
                        </div>
                    </div>
                `;
                featuredListings.appendChild(card);
            });
        }
    }

    // Item Posting Form Management
    function setupItemPostForm() {
        const postItemForm = document.getElementById("postItemForm");

        if (postItemForm) {
            const itemImage = document.getElementById("itemImage");
            const previewImage = document.getElementById("previewImage");
            const anonymousToggle = document.getElementById("anonymousToggle");

            // Image Upload Preview
            itemImage.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImage.src = e.target.result;
                        previewImage.classList.remove("d-none");
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Form Submission
            postItemForm.addEventListener("submit", (event) => {
                event.preventDefault();

                const itemData = {
                    name: document.getElementById("itemName").value,
                    price: document.getElementById("itemPrice").value,
                    category: document.getElementById("itemCategory").value,
                    anonymous: anonymousToggle.checked,
                    image: previewImage.src
                };

                // Sending data to backend
                fetch(`${BASE_URL}/items/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showNotification("Item posted successfully!", "success");
                        postItemForm.reset();
                        previewImage.classList.add("d-none");
                    } else {
                        showNotification(result.message || "Failed to post item", "error");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification("An error occurred", "error");
                });
            });
        }
    }

    // Chat Messaging System
    function setupChatMessaging() {
        const chatMessages = document.getElementById("chatMessages");
        const messageInput = document.getElementById("messageInput");
        const sendMessageButton = document.getElementById("sendMessage");

        function loadMessages() {
            const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
            chatMessages.innerHTML = "";
            messages.forEach(msg => {
                const messageDiv = document.createElement("div");
                messageDiv.className = `message ${msg.type}`;
                messageDiv.textContent = msg.text;
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        if (sendMessageButton && messageInput) {
            sendMessageButton.addEventListener("click", sendMessage);
            messageInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        }

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
            messages.push({ text, type: "sent", timestamp: Date.now() });
            localStorage.setItem("chatMessages", JSON.stringify(messages));

            // Simulated auto-reply
            setTimeout(() => {
                const replyMessages = [
                    "Thanks for your message!",
                    "I'll get back to you soon.",
                    "How can I help you today?"
                ];
                const randomReply = replyMessages[Math.floor(Math.random() * replyMessages.length)];
                
                messages.push({ 
                    text: randomReply, 
                    type: "received", 
                    timestamp: Date.now() 
                });
                localStorage.setItem("chatMessages", JSON.stringify(messages));
                loadMessages();
            }, 1000);

            messageInput.value = "";
            loadMessages();
        }

        // Initial message load
        loadMessages();
    }

    // Notification System
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

    // Initialize all features
    setupDarkMode();
    setupMobileMenu();
    setupFeaturedListings();
    setupItemPostForm();
    setupChatMessaging();

    // Global error handling
    window.addEventListener('error', (event) => {
        showNotification(`An error occurred: ${event.message}`, "error");
    });
});

// Function to validate form inputs
function validateFormInputs() {
    const itemName = document.getElementById('itemName').value.trim();
    const itemPrice = document.getElementById('itemPrice').value.trim();
    const itemLocation = document.getElementById('itemLocation').value.trim();
    const itemCurrency = document.getElementById('itemCurrency').value;

    // Basic validation
    if (!itemName) {
        alert('Please enter item name');
        return false;
    }

    if (!itemPrice || parseFloat(itemPrice) <= 0) {
        alert('Please enter a valid price');
        return false;
    }

    if (!itemLocation) {
        alert('Please enter item location');
        return false;
    }

    return true;
}

// Function to submit form data
async function submitItemForm(event) {
    event.preventDefault(); // Prevent default form submission

    // Validate inputs first
    if (!validateFormInputs()) {
        return;
    }

    // Prepare form data
    const formData = {
        itemName: document.getElementById('itemName').value.trim(),
        itemCurrency: document.getElementById('itemCurrency').value,
        itemPrice: parseFloat(document.getElementById('itemPrice').value),
        itemLocation: document.getElementById('itemLocation').value.trim()
    };

    try {
        // Replace with your actual backend endpoint
        const response = await fetch('/api/submit-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // Success handling
        alert('Item submitted successfully!');
        
        // Optional: Reset form or redirect
        document.getElementById('postItemForm').reset();
    } catch (error) {
        console.error('Error submitting item:', error);
        alert('Failed to submit item. Please try again.');
    }
}

// Add event listener to form submission
document.getElementById('postItemForm').addEventListener('submit', submitItemForm);

// Currency symbol update
document.getElementById('itemCurrency').addEventListener('change', function() {
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
    document.getElementById('currencySymbol').textContent = symbol;
});