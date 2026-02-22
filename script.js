let players = JSON.parse(localStorage.getItem("players")||"[]");
let payments = JSON.parse(localStorage.getItem("payments")||"[]");
let sessions = JSON.parse(localStorage.getItem("sessions")||"[]");
let doneSessions = JSON.parse(localStorage.getItem("doneSessions")||"[]");
let price = parseInt(localStorage.getItem("price")||0);
let selectedPayDate="";

function save(){
localStorage.setItem("players",JSON.stringify(players));
localStorage.setItem("payments",JSON.stringify(payments));
localStorage.setItem("sessions",JSON.stringify(sessions));
localStorage.setItem("doneSessions",JSON.stringify(doneSessions));
localStorage.setItem("price",price);
}

function format(n){
return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}

document.getElementById("price").addEventListener("input",e=>{
let v=e.target.value.replace(/,/g,"");
if(!isNaN(v)) e.target.value=format(v);
});

document.getElementById("payAmount").addEventListener("input",e=>{
let v=e.target.value.replace(/,/g,"");
if(!isNaN(v)) e.target.value=format(v);
});

function updateClock(){
let now=new persianDate();
document.getElementById("today-date").innerText=now.format("dddd YYYY/MM/DD");
document.getElementById("clock").innerText=new Date().toLocaleTimeString("fa-IR");
}
setInterval(updateClock,1000);
updateClock();

function addPlayer(){
let n=document.getElementById("name").value;
let f=document.getElementById("family").value;
if(n&&f){
players.push({n,f});
save();
renderPlayers();
}
}

function renderPlayers(){
let ul=document.getElementById("players");
let sel=document.getElementById("playerSelect");
ul.innerHTML="";
sel.innerHTML="";
players.forEach((p,i)=>{
let li=document.createElement("li");
li.innerHTML=p.n+" "+p.f+" <button onclick='removePlayer("+i+")'>حذف</button>";
ul.appendChild(li);
let op=document.createElement("option");
op.value=i;
op.textContent=p.n+" "+p.f;
sel.appendChild(op);
});
}

function removePlayer(i){
players.splice(i,1);
save();
renderPlayers();
renderDebts();
}

function calculateDebts(){
price=parseInt(document.getElementById("price").value.replace(/,/g,"")||0);
save();
renderDebts();
}

function renderDebts(){
let ul=document.getElementById("debts");
ul.innerHTML="";
if(players.length==0)return;
let total=sessions.length*price;
let per=total/players.length;
players.forEach((p,i)=>{
let paid=payments.filter(x=>x.i==i).reduce((a,b)=>a+b.a,0);
let diff=paid-per;
let txt="";
if(diff<0)txt="بدهکار: "+format(-diff);
else if(diff>0)txt="طلبکار: "+format(diff);
else txt="صفر";
let li=document.createElement("li");
li.textContent=p.n+" "+p.f+" - "+txt;
ul.appendChild(li);
});
}

function registerPayment(){
let i=parseInt(document.getElementById("playerSelect").value);
let a=parseInt(document.getElementById("payAmount").value.replace(/,/g,""));
if(!selectedPayDate||!a)return;
payments.push({i,a,d:selectedPayDate});
save();
renderDebts();
}

function buildCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";
let names=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
names.forEach(n=>{
let div=document.createElement("div");
div.textContent=n;
div.className="day-name";
cal.appendChild(div);
});

let now=new persianDate();
let days=now.daysInMonth();
for(let i=1;i<=days;i++){
let d=new persianDate([now.year(),now.month(),i]).format("YYYY/MM/DD");
let div=document.createElement("div");
div.textContent=i;
div.className="day";
if(d==now.format("YYYY/MM/DD"))div.classList.add("today");
if(sessions.includes(d))div.classList.add("booked");
if(doneSessions.includes(d))div.classList.add("done");
div.onclick=()=>{
if(sessions.includes(d)){
if(confirm("علامت به عنوان برگزار شده؟")){
doneSessions.push(d);
save();
buildCalendar();
}
}
};
cal.appendChild(div);
}
}

function openSessionPicker(){
openDateModal(date=>{
if(!sessions.includes(date)){
sessions.push(date);
save();
document.getElementById("selectedSessions").innerText=sessions.join(" , ");
buildCalendar();
renderDebts();
}
});
}

function openPayPicker(){
openDateModal(date=>{
selectedPayDate=date;
document.getElementById("payDateView").innerText=date;
});
}

function openDateModal(callback){
let modal=document.createElement("div");
modal.className="modal";
let content=document.createElement("div");
content.className="modal-content";
let now=new persianDate();
let days=now.daysInMonth();
for(let i=1;i<=days;i++){
let d=new persianDate([now.year(),now.month(),i]).format("YYYY/MM/DD");
let btn=document.createElement("button");
btn.textContent=d;
btn.onclick=()=>{
callback(d);
document.body.removeChild(modal);
};
content.appendChild(btn);
}
modal.appendChild(content);
document.body.appendChild(modal);
}

renderPlayers();
renderDebts();
buildCalendar();
document.getElementById("selectedSessions").innerText=sessions.join(" , ");
