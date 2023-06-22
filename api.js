const TOKEN_DURATION = 1800;
const API_ENDPOINT = "https://enagramm.com/API/";
const ENDPOINTS = {
    LOGIN: API_ENDPOINT + "Account/Login",
    REFRESH_TOKEN: API_ENDPOINT + "Account/RefreshToken",
    TTS: API_ENDPOINT + "TTS/SynthesizeTextAudioPath",
}

export async function login(Email, Password) {
    let res = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "Accept": "application/json",
        },
        body: JSON.stringify({Email, Password}) 
    });

    let data = await processResponse(res);
    if(!data) return;

    storeTokens(data.AccessToken, data.RefreshToken);
    return true;
}

export async function loginWithRefreshToken(AccessToken, RefreshToken) {
    let res = await fetch(ENDPOINTS.REFRESH_TOKEN, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "Accept": "application/json",
        },
        body: JSON.stringify({AccessToken, RefreshToken}) 
    });

    let data = await processResponse(res);
    if(!data) {
        localStorage.clear();
        return false;
    }

    storeTokens(data.AccessToken, data.RefreshToken);
    return true;
}

export async function sendData(model) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    let res = await fetch(ENDPOINTS.TTS, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(model)
    });

    if(res.status === 401) {
        let loggedIn = await loginWithRefreshToken(accessToken, refreshToken);
        if(!loggedIn) {
            location.assign("./login.html");
        } else {
            sendData(model);
        }
    }

    return await processResponse(res);
}

export function storeTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("expirationDate", Date.now() + TOKEN_DURATION * 1000);
}

async function processResponse(res) {
    if(!res.ok) {
        alert("Something went wrong");
        return false;
    }

    let data = await res.json();

    if(!data.Success) {
        alert(data.Error);
        return false;
    }

    return data;
} 

