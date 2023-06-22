import { login } from "./api.js";

let accessToken = localStorage.getItem("accessToken");

if(accessToken) {
    location.assign("/");
}

const form = document.querySelector("form");

form.addEventListener("submit", submitHandler);

async function submitHandler(event) {
    event.preventDefault();
    let formData = new FormData(event.target);

    let loggedIn = await login(formData.get("email"), formData.get("password"));
    if(loggedIn) {
        location.assign("/");
    }
}

