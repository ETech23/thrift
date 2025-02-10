document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://afrimart-zbj3.onrender.com/api";
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
    const itemsPerPage = 20; // Number of items to load at a time
    let allItems = [];
    let filteredItems = [];
    let currentIndex = 0;

    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container mb-4';
    searchContainer.innerHTML = `
        <div class="d-flex flex-wrap gap-2 mb-3">
            <input 
                type="text" 
                id="titleSearch" 
                class="px-4 py-2 rounded shadow-lg flex-grow-1" 
                placeholder="Search by title, location, or category..."
            >
            <select 
                id="categoryFilter" 
                class="px-4 py-2 rounded shadow-lg"
            >
                <option value="" >All Categories</option>
            </select>
            <select 
                id="locationFilter" 
                class="px-4 py-2 rounded shadow-lg"
            >
                <option value="">All Locations</option>
            </select>
            <button 
                id="searchButton"
                class="bg-secondary text-white px-6 py-2 rounded shadow-lg"
            >
                Search
            </button>
        </div>
    `;
    
    // Insert search container before the featuredListings
    featuredListings.parentNode.insertBefore(searchContainer, featuredListings);

    // Add the existing styles (unchanged)
    const style = document.createElement('style');
    style.textContent = `
        .nav-arrow {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            z-index: 10;
        }
        
    
        .nav-arrow:hover {
            background-color: rgba(255, 255, 255, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: scale(1.05);
        }
        
        .nav-arrow svg {
            width: 24px;
            height: 24px;
        }

        .card {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .listing-content {
            display: flex;
            flex-direction: column;
            padding: 8px;
            flex-grow: 1;
        }

        .listing-title {
            margin-bottom: 4px !important;
        }

        .listing-price {
            margin-bottom: 2px !important;
        }

        .listing-location {
            margin-bottom: 2px !important;
            font-size: 12px;
            color: #666;
        }

        .listing-seller-status {
            margin-bottom: 8px !important;
            font-size: 12px;
        }
        
        .search-container input,
        .search-container select {
            border: 1px solid #ddd;
            min-width: 150px;
        }
        
        .search-container button:hover {
            opacity: 0.9;
        }
        
        @media (max-width: 480px) {
            .nav-arrow {
                width: 30px;
                height: 30px;
            }
            
            .nav-arrow svg {
                width: 18px;
                height: 18px;
            }
            
    #titleSearch {
            max-width: 50px;
    }
            #featuredListings {
                grid-template-columns: repeat(2, 1fr);
                display: grid;
                gap: 8px;
                padding: 4px;
                justify-content: center;
                align-items: start;
                justify-items: center;
                margin-left: 2px;
            }

            #featuredListings img {
                height: 150px;
                width: 100%;
                object-fit: cover;
            }

            #featuredListings .listing-content {
                text-align: left;
                padding: 8px 4px;
            }

            #featuredListings .listing-title {
                font-size: 12px;
                margin-bottom: -20px !important;
                line-height: 1.2;
                height: 32px;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            #featuredListings .listing-price {
                font-size: 12px;
                margin-top: -22px !important;
            }

            #featuredListings .listing-location {
                margin-bottom: 45px !important;
            font-size: 14px !important;
            }

            #featuredListings .listing-seller-status {
                margin-top: 60px !important;
            font-size: 12px;
        text-align: left !important;
        
            }

            #featuredListings .btn-sm {
                font-size: 10px;
                padding: 4px 8px;
            }
            
            .search-container {
                padding: 0 8px;
            }
            
            .search-container input,
            .search-container select,
            .search-container button {
                font-size: 14px;
                padding: 6px 12px;
            }
        }
            /* Desktop and Tablet Styles */
        @media (min-width: 481px) {
            #featuredListings {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                padding: 8px;
                justify-content: center;
                align-items: start;
            }

            /* Larger screens */
            @media (min-width: 1200px) {
                #featuredListings {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            /* Even larger screens */
            @media (min-width: 1600px) {
                #featuredListings {
                    grid-template-columns: repeat(6, 1fr);
                }
            }
        }

        .listing-content {
            display: flex;
            flex-direction: column;
            padding: 8px;
            flex-grow: 1;
        }

        .listing-title {
            font-size: 14px !important;
            margin-bottom: -15px !important;
        }

        .listing-price {
            margin-top: -25px !important;
            text-align: center !important;
        }

        .listing-location {
            margin-bottom: 40px !important;
            font-size: 14px !important;
            color: #666;
            text-align: center !important;
        }

        .status {
            margin-top: 50px !important;
            font-size: 12px;
            text-align: left !important;
        }

    `;
    document.head.appendChild(style);

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

    function filterItems() {
        const searchQuery = document.getElementById('titleSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const locationFilter = document.getElementById('locationFilter').value;

        filteredItems = allItems.filter(item => {
            const matchesSearch = 
                item.name.toLowerCase().includes(searchQuery) ||
                item.category.toLowerCase().includes(searchQuery) ||
                item.location.toLowerCase().includes(searchQuery);

            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesLocation = !locationFilter || item.location === locationFilter;

            return matchesSearch && matchesCategory && matchesLocation;
        });

        currentIndex = 0;
        featuredListings.innerHTML = ""; // Clear existing items
        loadMoreItems();
    }

    function loadMoreItems() {
        const itemsToLoad = filteredItems.slice(currentIndex, currentIndex + itemsPerPage);
        currentIndex += itemsPerPage;

        if (itemsToLoad.length === 0) {
            if (currentIndex === itemsPerPage) {
                featuredListings.innerHTML = "<p class='text-center text-danger'>No items found matching your search criteria.</p>";
            }
            return;
        }

        itemsToLoad.forEach(item => {
            const symbol = currencySymbol[item.currency] || '₦';
            const formattedPrice = new Intl.NumberFormat('en-US').format(item.price);
            
            const card = document.createElement("div");
            card.className = "listing-item";
            card.innerHTML = `
                <div class="card shadow-sm">
                    <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}">
                    <div class="listing-content">
                        <h5 class="listing-title text-primary">${item.name}</h5>
                        <p class="listing-price text-muted">
                            <strong>${symbol}${formattedPrice}</strong>
                        </p>
                        <p class="listing-location">
                            ${item.location || ''}
                        </p>
                        <p class="listing-seller-status ${item.anonymous ? 'text-danger' : 'text-muted'}">
                            ${item.anonymous ? 'Anonymous' : 'Verified Seller'}
                        </p>
                        <a href="item-details.html?id=${item._id}" class="btn btn-primary btn-sm mt-auto">View</a>
                    </div>
                </div>
            `;
            featuredListings.appendChild(card);
        });
    }

    // Add event listeners for search
    document.getElementById('searchButton').addEventListener('click', filterItems);
    document.getElementById('titleSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterItems();
    });
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    document.getElementById('locationFilter').addEventListener('change', filterItems);

    // Infinite scroll
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadMoreItems();
        }
    });

    // Initial fetch
    fetch(`${BASE_URL}/items`)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.items || !Array.isArray(data.items)) {
                console.error("❌ Invalid API response format:", data);
                featuredListings.innerHTML = "<p class='text-danger'>Invalid API response.</p>";
                return;
            }

            allItems = data.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by most recent
            filteredItems = allItems;

            // Populate category and location filters
            const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];
            const locations = [...new Set(allItems.map(item => item.location).filter(Boolean))];

            const categorySelect = document.getElementById('categoryFilter');
            const locationSelect = document.getElementById('locationFilter');

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationSelect.appendChild(option);
            });

            loadMoreItems(); // Initial load
        })
        .catch(error => {
            console.error("❌ Error fetching items:", error);
            featuredListings.innerHTML = "<p class='text-danger'>Failed to load featured listings.</p>";
        });
}
// Call this function after your existing setupFeaturedListings()

    
      /**  .catch(error => {
            console.error("❌ Error fetching items:", error);
            featuredListings.innerHTML = "<p class='text-danger'>Failed to load featured listings.</p>";
        });**/

        
                     

 /**   // Keep your existing currencySymbol object
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
};**/

// Define currency symbols
const currencySymbol = {
    'NGN': '₦',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

function setupPriceInput() {
    const currencySelect = document.getElementById('itemCurrency');
    const currencySymbolSpan = document.getElementById('currencySymbol');
    const priceInput = document.getElementById('itemPrice');

    // Set default currency symbol
    currencySymbolSpan.textContent = currencySymbol[currencySelect.value] || '₦';

    // Update currency symbol when currency changes
    currencySelect.addEventListener('change', (e) => {
        const selectedCurrency = e.target.value;
        currencySymbolSpan.textContent = currencySymbol[selectedCurrency] || '₦';
    });

    // Format price as user types
    priceInput.addEventListener('input', (e) => {
        let value = e.target.value;
        // Remove non-numeric characters except decimal point
        value = value.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        // Limit to two decimal places
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        e.target.value = value;
    });
}

function validateForm() {
    const requiredFields = {
        'itemName': 'Item name',
        'itemPrice': 'Price',
        'itemCategory': 'Category',
        'itemLocation': 'Location',
        'itemCurrency': 'Currency',
        'itemImage': 'Image'
    };

    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            showNotification(`Please provide the ${fieldName}`, "error");
            field.focus();
            return false;
        }
    }

    // Validate price
    const price = parseFloat(document.getElementById("itemPrice").value);
    if (isNaN(price) || price <= 0) {
        showNotification("Please enter a valid price greater than 0", "error");
        return false;
    }

    // Validate image
    const imageFile = document.getElementById("itemImage").files[0];
    if (!imageFile) {
        showNotification("Please select an image", "error");
        return false;
    }

    // Validate image type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(imageFile.type)) {
        showNotification("Please select a valid image file (JPEG, PNG, or GIF)", "error");
        return false;
    }

    return true;
}

async function setupItemPostForm() {
    const postItemForm = document.getElementById("postItemForm");
    
    // Setup price input handling
    setupPriceInput();

    if (postItemForm) {
        postItemForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!validateForm()) {
                return;
            }

            const formData = new FormData();
            formData.append("name", document.getElementById("itemName").value.trim());
            formData.append("price", parseFloat(document.getElementById("itemPrice").value));
            formData.append("category", document.getElementById("itemCategory").value);
            formData.append("location", document.getElementById("itemLocation").value);
            formData.append("currency", document.getElementById("itemCurrency").value);
            formData.append("anonymous", document.getElementById("anonymousToggle").checked);
            formData.append("image", document.getElementById("itemImage").files[0]);

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    showNotification("You must be logged in to post an item", "error");
                    window.location.href = "login.html";
                    return;
                }

                console.log("🔍 Sending form data to API...");

                const response = await fetch(`${BASE_URL}/items/create`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("✅ API Response:", JSON.stringify(result, null, 2));

                if (result.success) {
                    showNotification("Item posted successfully!", "success");
                    postItemForm.reset();
                    document.getElementById('currencySymbol').textContent = '₦';
                } else {
                    throw new Error(result.message || "Failed to post item");
                }
            } catch (error) {
                console.error("❌ Error:", error);
                showNotification(error.message || "An error occurred while posting the item", "error");
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
    //setupSearch();
    setupItemPostForm();
    
    setupCurrencyUpdate();
    

    window.addEventListener("error", (event) => {
        showNotification(`An error occurred: ${event.message}`, "error");
    });
});

const authLinks = document.querySelector('[data-auth-links]');

function updateAuthLinks() {
    const token = localStorage.getItem('token');
    
    if (token) {
        authLinks.innerHTML = `
            <li class="my-2">
                <a href="#" onclick="handleLogout(event)" class="w-100">Logout</a>
            </li>
        `;
    } else {
        authLinks.innerHTML = `
            <li class="my-2">
                <a href="login.html" class="w-100">Sign In</a>
            </li>
        `;
    }
}

function handleLogout(event) {
    event.preventDefault();
    
    // Create a confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal fade';
    confirmDialog.setAttribute('id', 'logoutConfirmModal');
    confirmDialog.setAttribute('tabindex', '-1');
    confirmDialog.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Logout</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to logout?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="confirmLogout()">Yes, Logout</button>
                </div>
            </div>
        </div>
    `;

    // Add the dialog to the document if it doesn't exist
    if (!document.getElementById('logoutConfirmModal')) {
        document.body.appendChild(confirmDialog);
    }

    // Show the modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('logoutConfirmModal'));
    modal.show();
}

function confirmLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthLinks();
    
    // Hide the modal before redirecting
    const modal = bootstrap.Modal.getInstance(document.getElementById('logoutConfirmModal'));
    modal.hide();
    
    // Add a slight delay to allow the modal to hide smoothly
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', updateAuthLinks);

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


    




function setupAuthForms() {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    // Handle Registration Form Submission
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(registerForm);
            const formObject = Object.fromEntries(formData.entries());

            // Logging form data for debugging
            console.log("Form Data:", JSON.stringify(formObject, null, 2));

            // Validation
            if (!formObject.username || !formObject.email || !formObject.password || !formObject.confirmPassword) {
                alert("All fields are required!");
                return;
            }

            if (formObject.password !== formObject.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formObject),
                });

                const data = await response.json();
                console.log("Registration Response:", JSON.stringify(data, null, 2));

                if (data.success) {
                    alert("Registration successful! Please login.");
                    window.location.href = "login.html"; // Redirect to login page
                } else {
                    alert(data.message || "Registration failed.");
                }
            } catch (error) {
                console.error("Registration Error:", error);
                alert("Error connecting to the server.");
            }
        });
    }

    // Handle Login Form Submission
    if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`https://afrimart-zbj3.onrender.com/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formObject),
            });

            console.log("🟢 Full Response:", response);

            const data = await response.json();
            console.log("🟢 Parsed JSON Response:", data);

            if (!response.ok) {
                console.error("❌ Login Failed:", data.message);
                alert("Login failed: " + (data.message || "Unknown error."));
                return;
            }

            if (data.token && data.user) {
                console.log("🟢 Token:", data.token);
                console.log("🟢 User ID:", data.user._id);

                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user._id);
                
                console.log("✅ Login Successful! Redirecting...");
                window.location.href = "index.html";
            } else {
                console.error("❌ Login Failed - Invalid Response Structure:", data);
                alert("Login failed: Invalid server response.");
            }
        } catch (error) {
            console.error("🔥 Fetch Error:", error);
            alert("Network error or CORS issue. Check browser console.");
        }
    });
}
   /** if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`https://afrimart-zbj3.onrender.com/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formObject),
            });

            console.log("🟢 Full Response:", response);

            if (!response.ok) {
                console.error("❌ Server Response Error:", response.status, response.statusText);
                alert("Failed to log in. Please try again.");
                return;
            }

            const data = await response.json();
            console.log("🟢 Parsed JSON Response:", data);

            if (data.token && data.user) {
                console.log("🟢 Token:", data.token);
                console.log("🟢 User ID:", data.user._id);

                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user._id);
                
                console.log("✅ Login Successful! Redirecting...");
                window.location.href = "index.html";
            } else {
                console.error("❌ Login Failed - Invalid Response Structure:", data);
                alert("Login failed: " + (data.message || "Unknown error."));
            }
        } catch (error) {
            console.error("🔥 Fetch Error:", error);
            alert("Network error or CORS issue. Check browser console.");
        }
    });
}**/
/**if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`https://afrimart-zbj3.onrender.com/api/users/login`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"  // 🚀 Prevent caching
    },
    body: JSON.stringify(formObject),
});

            console.log("Full Response:", response);

            if (!response.ok) {
                console.error("Server Response Error:", response.status, response.statusText);
                alert("Failed to log in. Please try again.");
                return;
            }

            const data = await response.json();
            console.log("Parsed JSON Response:", data);

            if (data.token && data.user) {
                localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    console.log("Login Successful! Redirecting...");
    window.location.href = "index.html";
} else {
    console.error("Login Failed - Invalid Response Structure:", data);
    alert("Login failed: " + (data.message || "Unknown error."));
}
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Network error or CORS issue. Check browser console.");
        }
    });
}**/
}

// Initialize the forms on page load
document.addEventListener("DOMContentLoaded", setupAuthForms);

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
    

            

   /**  function setupItemPosting() {
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
    }**/

   /** function setupRealTimeChat() {
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
    }**/
    
    setupAuthForms();
    //setupUserDashboard();
    //setupItemPosting();
    //setupViewItemDetails();
    //setupRealTimeChat();
});


