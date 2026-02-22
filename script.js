// داده‌ها را از LocalStorage بخوان
let players = JSON.parse(localStorage.getItem("players") || "[]");
let sessions = parseInt(localStorage.getItem("sessions") || "0");
let pricePerSession = parseInt(localStorage.getItem("pricePerSession") || "0");
let bookedDays = JSON.parse(localStorage.getItem("bookedDays") || "[]");

const playersList = document.getElementById("players-list");
const debtsList = document.getElementById("debts-list");

// افزودن بازیکن
document.getElementById("add-player").addEventListener("click", () => {
    const name = document.getElementById("player-name").value.trim();
    const family = document.getElementById("player-family").value.trim();
    if(name && family){
        players.push({name, family, paid: 0});
        saveData();
        updatePlayersList();
        document.getElementById("player-name").value = '';
        document.getElementById("player-family").value = '';
    }
});

function updatePlayersList(){
    playersList.innerHTML = '';
    players.forEach((p,i)=>{
        const li = document.createElement("li");
        li.innerHTML = `${p.name} ${p.family} - پرداخت شده: <input type="text" data-index="${i}" class="pay-input" value="${formatNumber(p.paid)}">`;
        playersList.appendChild(li);
    });
    attachPayListeners();
}

// فرمت کردن مبلغ سه‌رقم‌سه‌رقم
function formatNumber(num){
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// بروزرسانی پرداخت هر بازیکن
function attachPayListeners(){
    document.querySelectorAll(".pay-input").forEach(input=>{
        input.addEventListener("input", e=>{
            let i = e.target.dataset.index;
            let value = parseInt(e.target.value.replace(/,/g,'') || 0);
            players[i].paid = value;
            saveData();
            updateDebts();
        });
    });
}

// محاسبه بدهی‌ها
function updateDebts(){
    debtsList.innerHTML = '';
    let total = sessions * pricePerSession;
    let perPlayer = total / players.length;
    players.forEach(p=>{
        let status = 0;
        status = p.paid - perPlayer;
        let textStatus = "";
        if(status < 0) textStatus = `بدهکار: ${formatNumber(-status)}`;
        else if(status > 0) textStatus = `طلبکار: ${formatNumber(status)}`;
        else textStatus = `صفر`;
        const li = document.createElement("li");
        li.textContent = `${p.name} ${p.family} - ${textStatus}`;
        debtsList.appendChild(li);
    });
}

// محاسبه و ذخیره
document.getElementById("calculate").addEventListener("click",()=>{
    sessions = parseInt(document.getElementById("sessions").value) || 0;
    pricePerSession = parseInt(document.getElementById("price").value) || 0;
    let selected = Array.from(document.getElementById("days").selectedOptions).map(o=>parseInt(o.value));
    bookedDays = selected;
    saveData();
    updateDebts();
    renderCalendar();
});

// ذخیره در LocalStorage
function saveData(){
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("sessions", sessions);
    localStorage.setItem("pricePerSession", pricePerSession);
    localStorage.setItem("bookedDays", JSON.stringify(bookedDays));
}

// رندر تقویم شمسی
function renderCalendar(){
    const calendarDiv = document.getElementById("calendar");
    calendarDiv.innerHTML = '';
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    for(let d=1; d<=daysInMonth; d++){
        let dayDiv = document.createElement("div");
        dayDiv.classList.add("calendar-day");
        dayDiv.textContent = d;
        let date = new Date(today.getFullYear(), today.getMonth(), d);
        if(bookedDays.includes(date.getDay())){
            dayDiv.classList.add("booked");
        }
        calendarDiv.appendChild(dayDiv);
    }
}

// بارگزاری اولیه
updatePlayersList();
updateDebts();
renderCalendar();
