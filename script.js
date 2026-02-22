// ------------------ ذخیره سازی ------------------

let players = JSON.parse(localStorage.getItem("players") || "[]");
let payments = JSON.parse(localStorage.getItem("payments") || "[]");
let sessionDates = JSON.parse(localStorage.getItem("sessionDates") || "[]");
let pricePerSession = parseInt(localStorage.getItem("pricePerSession") || "0");
let selectedPayDate = localStorage.getItem("selectedPayDate") || "";

function saveAll(){
localStorage.setItem("players", JSON.stringify(players));
localStorage.setItem("payments", JSON.stringify(payments));
localStorage.setItem("sessionDates", JSON.stringify(sessionDates));
localStorage.setItem("pricePerSession", pricePerSession);
localStorage.setItem("selectedPayDate", selectedPayDate);
}

// ------------------ فرمت سه رقمی ------------------

function formatNumber(num){
return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberInputFormatter(input){
input.addEventListener("input", e=>{
let value = e.target.value.replace(/,/g,"");
if(!isNaN(value)){
e.target.value = formatNumber(value);
}
});
}

numberInputFormatter(document.getElementById("price"));
numberInputFormatter(document.getElementById("pay-amount"));

// ------------------ بازیکنان ------------------

function renderPlayers(){
let list = document.getElementById("players-list");
let select = document.getElementById("pay-player");

list.innerHTML="";
select.innerHTML="";

players.forEach((p,i)=>{
let li = document.createElement("li");
li.innerHTML = p.name+" "+p.family+" ";
let del = document.createElement("button");
del.textContent="حذف";
del.onclick=()=>{
players.splice(i,1);
saveAll();
renderPlayers();
renderDebts();
};
li.appendChild(del);
list.appendChild(li);

let option=document.createElement("option");
option.value=i;
option.textContent=p.name+" "+p.family;
select.appendChild(option);
});
}

document.getElementById("add-player").onclick=()=>{
let name=document.getElementById("player-name").value.trim();
let family=document.getElementById("player-family").value.trim();
if(name && family){
players.push({name,family});
saveAll();
renderPlayers();
}
};

// ------------------ تقویم رزرو ------------------

$("#select-sessions").persianDatepicker({
format:'YYYY/MM/DD',
multiple:true,
onSelect:function(){
let dates = $(this).persianDatepicker("getState").selectedDates;
sessionDates = dates.map(d=> new persianDate(d).format("YYYY/MM/DD"));
document.getElementById("selected-dates").innerText=sessionDates.join(" , ");
saveAll();
renderCalendar();
renderDebts();
}
});

// ------------------ تقویم پرداخت ------------------

$("#select-pay-date").persianDatepicker({
format:'YYYY/MM/DD',
onSelect:function(unix){
selectedPayDate = new persianDate(unix).format("YYYY/MM/DD");
document.getElementById("pay-date-view").innerText=selectedPayDate;
saveAll();
}
});

// ------------------ ثبت پرداخت ------------------

document.getElementById("register-pay").onclick=()=>{
let playerIndex=parseInt(document.getElementById("pay-player").value);
let amount=parseInt(document.getElementById("pay-amount").value.replace(/,/g,""));
if(!selectedPayDate || !amount) return;

payments.push({playerIndex,amount,date:selectedPayDate});
document.getElementById("pay-amount").value="";
saveAll();
renderDebts();
};

// ------------------ محاسبه بدهی ------------------

document.getElementById("calculate").onclick=()=>{
pricePerSession=parseInt(document.getElementById("price").value.replace(/,/g,"")||0);
saveAll();
renderDebts();
};

function renderDebts(){
let list=document.getElementById("debts-list");
list.innerHTML="";

if(players.length===0) return;

let total=sessionDates.length*pricePerSession;
let perPlayer= total/players.length;

players.forEach((p,i)=>{
let paid=payments
.filter(pay=>pay.playerIndex===i)
.reduce((a,b)=>a+b.amount,0);

let diff=paid-perPlayer;
let status="";
if(diff<0) status="بدهکار: "+formatNumber(-diff);
else if(diff>0) status="طلبکار: "+formatNumber(diff);
else status="صفر";

let li=document.createElement("li");
li.textContent=p.name+" "+p.family+" - "+status;
list.appendChild(li);
});
}

// ------------------ تقویم نمایشی ------------------

function renderCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";

if(sessionDates.length===0) return;

let today=new persianDate();
let days=today.daysInMonth();

for(let i=1;i<=days;i++){
let dayDiv=document.createElement("div");
dayDiv.classList.add("day");
dayDiv.textContent=i;

let fullDate=new persianDate([today.year(),today.month(),i]).format("YYYY/MM/DD");

if(sessionDates.includes(fullDate)){
dayDiv.classList.add("booked");
}

cal.appendChild(dayDiv);
}
}

// ------------------ شروع اولیه ------------------

document.getElementById("price").value = formatNumber(pricePerSession);
document.getElementById("selected-dates").innerText=sessionDates.join(" , ");
document.getElementById("pay-date-view").innerText=selectedPayDate;

renderPlayers();
renderDebts();
renderCalendar();
