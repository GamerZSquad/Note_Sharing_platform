const url = "http://localhost:5000/api/auth";

function scrollToAuth() {
    document.getElementById("auth").scrollIntoView();
}

async function registerUser() {

    let username = document.getElementById("regUsername").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    let res = await fetch(url + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    });

    let data = await res.json();

    document.getElementById("output").innerText =
        JSON.stringify(data, null, 2);
}

async function loginUser() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let res = await fetch(url + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    let data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    document.getElementById("output").innerText =
        JSON.stringify(data, null, 2);
}