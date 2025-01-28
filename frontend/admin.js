

document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://your-marketplace-api.com/api";
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Access Denied. Admin login required.");
        window.location.href = "login.html";
    }

    function fetchUsers() {
        fetch(`${BASE_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById("users");
            userList.innerHTML = users.map(user => `
                <li>${user.username} - ${user.email}
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                </li>
            `).join("");
        });
    }

    function fetchItems() {
        fetch(`${BASE_URL}/admin/items`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(items => {
            const itemList = document.getElementById("items");
            itemList.innerHTML = items.map(item => `
                <li>${item.name} - ${item.price}
                    <button onclick="deleteItem('${item._id}')">Delete</button>
                </li>
            `).join("");
        });
    }

    window.deleteUser = function(userId) {
        fetch(`${BASE_URL}/admin/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(() => fetchUsers());
    };

    window.deleteItem = function(itemId) {
        fetch(`${BASE_URL}/admin/items/${itemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(() => fetchItems());
    };

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    fetchUsers();
    fetchItems();
});