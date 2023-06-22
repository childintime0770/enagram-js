import { loginWithRefreshToken, sendData, storeTokens } from "./api.js";

// შევამოწმოთ მომხმარებელი თუ არის დალოგინებული
checkLogin();

const textarea = document.querySelector("textarea");
const button = document.querySelector("button");
const audioContainer = document.querySelector(".audio-elements");

button.addEventListener("click", clickHandler);

function clickHandler() {
    audioContainer.innerHTML = '';
    let myClass = new MyClass();
    myClass.text = textarea.value;
    myClass.start();
    myClass.onResult = function (res) {
        let audio = document.createElement("audio");
        audio.setAttribute("controls", true);
        audio.src = res.AudioFilePath;
        audioContainer.appendChild(audio);
    };
}

class MyClass {
    text = "";
    onResult = null;
    #chunks = [];
    priorities = {
        " ": 1,
        ",": 2,
        ";": 3,
        "?": 4,
        "!": 5,
        ".": 6
    }

    start() {
        this.#chunks = [];
        let lastStop = -1;
        let start = 151;
        let end = 230;
        
        // დავჭრათ ტექსტი პატარა წინადადებებად
        while(lastStop <= this.text.length) {
            if(this.text.length - 1 < start) {
                this.#chunks.push(this.text.slice(lastStop + 1));
                break;
            }
            let currentPriority = 0;
            let max = Math.min(end, this.text.length - 1);
            let currentStop = max;
            
            for(let i = start; i <= max; i++) {
                let char = this.text[i];
                let charPriority = this.priorities[char] ?? -1; 
                if(charPriority > currentPriority) {
                    currentPriority = charPriority;
                    currentStop = i;
                }
            }
            this.#chunks.push(this.text.slice(lastStop + 1, currentStop + 1));

            lastStop = currentStop;
            start = currentStop + 151;
            end = currentStop + 230;
        }

        this.send();
    }

    async send(iteration = 0) {
        if(iteration >= this.#chunks.length) return;
        
        const model = { 
            Language: "ka",
            Text: this.#chunks[iteration],
            Voice: 0,
            IterationCount: iteration
        }

        let res = await sendData(model);

        if(typeof this.onResult !== 'function') throw("please provide onResult function");
        
        this.onResult(res);
        this.send(iteration + 1);
    }
}

async function checkLogin() {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expirationDate = +localStorage.getItem("expirationDate");
    if(!accessToken || !refreshToken || !expirationDate) {
        localStorage.clear();
        location.assign("./login.html");
    }

    if(expirationDate < Date.now()) {
        let data = await loginWithRefreshToken(accessToken, refreshToken);
        if(!data) {
            location.assign("./login.html");
        }
    }
}