const BASE_URL = "https://thrift2.vercel.app/api";

document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;

    const response = await fetch(`${BASE_URL}/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const result = await response.json();
    alert(result.message);
});

