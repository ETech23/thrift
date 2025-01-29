// item-details.js
const BASE_URL = "https://thrift2.vercel.app/api";

// Get item ID from URL parameters
function getItemId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Setup Item Details Page
function setupItemDetails() {
    const itemId = getItemId();
    const itemDetailsContainer = document.getElementById('itemDetails');
    
    if (!itemId) {
        itemDetailsContainer.innerHTML = '<div class="alert alert-danger">Item not found</div>';
        return;
    }

    // Fetch item details from backend
    fetch(`${BASE_URL}/items/${itemId}`)
        .then(response => response.json())
        .then(item => {
            itemDetailsContainer.innerHTML = `
                <div class="container mt-4">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${item.imageUrl}" class="img-fluid rounded" alt="${item.name}">
                        </div>
                        <div class="col-md-6">
                            <h2>${item.name}</h2>
                            <p class="h4 text-primary">${item.price} ${item.currency || ''}</p>
                            <p class="text-muted">${item.description}</p>
                            
                            <div class="seller-info mt-4 ${item.anonymous ? 'd-none' : ''}">
                                <h4>Seller Information</h4>
                                <p>
                                    <strong>Seller:</strong> ${item.seller.name}
                                    <span class="badge bg-success">Verified Seller</span>
                                </p>
                                <p><strong>Location:</strong> ${item.seller.location}</p>
                            </div>

                            <div class="anonymous-seller ${!item.anonymous ? 'd-none' : ''}">
                                <p class="text-danger">
                                    <i class="fas fa-user-secret"></i> Anonymous Seller
                                </p>
                            </div>

                            <div class="mt-4">
                                <button onclick="initiateChat('${item._id}', '${item.seller._id}')" 
                                        class="btn btn-primary btn-lg">
                                    <i class="fas fa-comments"></i> Contact Seller
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error("Error fetching item details:", error);
            itemDetailsContainer.innerHTML = `
                <div class="alert alert-danger">Error loading item details. Please try again later.</div>
            `;
        });
}

// Initialize chat with seller
function initiateChat(itemId, sellerId) {
    // Check if user is logged in
    const currentUser = getCurrentUser(); // Implement this based on your auth system
    
    if (!currentUser) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    // Create or get existing chat session
    fetch(`${BASE_URL}/chats/initiate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
            itemId: itemId,
            sellerId: sellerId
        })
    })
    .then(response => response.json())
    .then(chat => {
        // Redirect to messages page with chat ID
        window.location.href = `/message.html?chatId=${chat._id}`;
    })
    .catch(error => {
        console.error("Error initiating chat:", error);
        alert("Unable to start chat. Please try again later.");
    });
}

// Helper function to get current user (implement based on your auth system)
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Call setup function when page loads
document.addEventListener('DOMContentLoaded', setupItemDetails);