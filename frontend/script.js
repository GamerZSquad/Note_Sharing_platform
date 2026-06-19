const API_URL = "http://localhost:5000/api/auth";

function goToLogin() {
    window.location.href = "login.html";
}

async function registerUser() {

    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        alert(data.message);

    } catch (error) {

        alert("Registration failed");
        console.error(error);

    }
}

// Login User
async function loginUser() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {

            alert("Login Successful!");

            localStorage.setItem("token", data.token);

            window.location.href = "dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        alert("Login failed");
        console.error(error);

    }
}