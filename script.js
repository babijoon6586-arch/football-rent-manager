// ---------- داده‌ها ----------
let players = JSON.parse(localStorage.getItem("players") || "[]");
let pricePerSession = parseInt(localStorage.getItem("pricePerSession") || "0");
let sessionDates = JSON.parse(localStorage.getItem("sessionDates") || "[]");
let payments = JSON.parse(localStorage.getItem("payments") || "[]");

// ---------- ابزار کمکی ----------
function formatNumber(num){
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function saveData(){
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("pricePerSession", pricePerSession);
    localStorage.setItem("sessionDates", JSON.stringify(sessionDates));
    localStorage.setItem("payments", JSON.stringify(payments));
}

// ---------- افزودن بازیکن ----------
const playersList = document.getElementById("players-list");
const payPlayerSelect = document.getElementById("pay-player");

document.getElementById("add-player").addEventListener("click",()=>{
    const name = document.getElementById("player-name").value.trim();
    const family = document.getElementById("player-family").value.trim();
    if(name && family){
        players.push({name,family});
        saveData();
        updatePlayersUI();
        document.getElementById("player-name").value = '';
        document.getElementById("player-family").value = '';
    }
});

function updatePlayersUI(){
    // لیست بازیکنان
    playersList.innerHTML = '';
    players.forEach((p,i)=>{
        const li = document.createElement("li");
        li.textContent = `${p.name} ${p.family} `;
        const btn = document.createElement("button");
        btn.textContent = "حذف";
        btn.addEventListener("click",()=>{
            players.splice(i,1);
            saveData();
            updatePlayersUI();
            updatePayPlayerSelect();
            updateDebts();
        });
        li.appendChild(btn);
        playersList.appendChild(li);
    });
    updatePayPlayerSelect();
}

// ---------- انتخاب بازیکن برای پرداخت ----------
function updatePayPlayerSelect(){
    payPlayerSelect.innerHTML = '';
    players.forEach((p,i)=>{
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${p.name} ${p.family}`;
        payPlayerSelect.appendChild(option);
    });
}

// ---------- ثبت پرداخت ----------
document.getElementById("register-pay").addEventListener("click",()=>{
    const playerIndex = parseInt(payPlayerSelect.value);
    const amount = parseInt(document.getElementById("pay-amount").value.replace(/,/g,'') || 0);
    const date = $('#pay-date').val();
    if(!isNaN(playerIndex) && amount>0 && date){
        payments.push({playerIndex,amount,date});
        saveData();
        document.getElementById("pay-amount").value='';
        updateDebts();
    }
});

// ---------- محاسبه بدهی ----------
function updateDebts(){
    const debtsList = document.getElementById("debts-list");
    debtsList.innerHTML = '';
    const totalPrice = pricePerSession * sessionDates.length;
    const perPlayer = totalPrice / players.length;
    players.forEach((p,i)=>{
        const paid = payments.filter(pay=>pay.playerIndex===i).reduce((a,b)=>a+b.amount,0);
        let diff = paid - perPlayer;
        let textStatus = '';
        if(diff<0) textStatus = `بدهکار: ${formatNumber(-diff)}`;
        else if(diff>0) textStatus = `طلبکار: ${formatNumber(diff)}`;
        else textStatus = 'صفر';
        const li = document.createElement("li");
        li.textContent = `${p.name} ${p.family} - ${textStatus}`;
        debtsList.appendChild(li);
    });
}

// ---------- انتخاب تاریخ‌های سانس ----------
$(function(){
    $("#session-dates").persianDatepicker({
        format: 'YYYY/MM/DD',
        observer: true,
        multiple: true,
        onSelect: function(unix){
            const dates = $(this).persianDatepicker("getState").selectedDates;
            sessionDates = dates.map(d=>d.toISOString());
            saveData();
            updateDebts();
            renderCalendar();
        }
    });
});

// ---------- تقویم پرداخت ----------
$(function(){
    $("#pay-date").persianDatepicker({
        format: 'YYYY/MM/DD',
        observer: true,
    });
});

// ---------- رندر تقویم سانس ----------
const calendarDiv = document.getElementById("calendar");
function renderCalendar(){
    calendarDiv.innerHTML = '';
    if(sessionDates.length===0) return;
    const today = new persianDate();
    const firstDay = new persianDate([today.year(),today.month(),1]);
    const daysInMonth = firstDay.daysInMonth();
    for(let d=1; d<=daysInMonth; d++){
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("calendar-day");
        dayDiv.textContent = d;
        const thisDate = new persianDate([today.year(),today.month(),d]).toString('YYYY/MM/DD');
        if(sessionDates.map(d=>new Date(d).toISOString().split('T')[0]).includes(new Date(thisDate).toISOString().split('T')[0])){
            dayDiv.classList.add("booked");
        }
        calendarDiv.appendChild(dayDiv);
    }
}

// ---------- محاسبه و ذخیره ----------
document.getElementById("calculate").addEventListener("click",()=>{
    pricePerSession = parseInt(document.getElementById("price").value.replace(/,/g,'')||0);
    saveData();
    updateDebts();
    renderCalendar();
});

// ---------- بارگزاری اولیه ----------
updatePlayersUI();
updateDebts();
renderCalendar();
