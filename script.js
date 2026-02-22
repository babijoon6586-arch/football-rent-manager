let players = JSON.parse(localStorage.getItem("players")||"[]");
let sessions = JSON.parse(localStorage.getItem("sessions")||"[]");
let payments = JSON.parse(localStorage.getItem("payments")||"[]");
let price = parseInt(localStorage.getItem("price")||0);
let selectedPayDate="";

function save(){
localStorage.setItem("players",JSON.stringify(players));
localStorage.setItem("sessions",JSON.stringify(sessions));
localStorage.setItem("payments",JSON.stringify(payments));
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

document.getElementById("todayTop").innerText=
new persianDate().format("dddd YYYY/MM/DD");

// ---------- بازیکنان ----------
function addPlayer(){
let n=document.getElementById("name").value.trim();
let f=document.getElementById("family").value.trim();
if(n&&f){
players.push({n,f});
save();
renderPlayers();
document.getElementById("name").value="";
document.getElementById("family").value="";
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

// ---------- مودال تقویم ----------
function buildModal(multi,callback){

let now=new persianDate();
let month=now.month();
let year=now.year();
let tempSelected=[...sessions];

let modal=document.createElement("div");
modal.className="modal";

function render(){
modal.innerHTML="";
let box=document.createElement("div");
box.className="modalBox";

let header=document.createElement("div");
header.className="modalHeader";
header.innerHTML=`<span onclick="year--">${year}</span> ${now.format("MMMM")} ${year}`;
box.appendChild(header);

let days= new persianDate([year,month,1]).daysInMonth();
for(let i=1;i<=days;i++){
let d=new persianDate([year,month,i]).format("YYYY/MM/DD");
let btn=document.createElement("div");
btn.className="day";
btn.textContent=i;
if(tempSelected.includes(d)) btn.classList.add("selected");
btn.onclick=()=>{
if(multi){
if(tempSelected.includes(d))
tempSelected=tempSelected.filter(x=>x!==d);
else tempSelected.push(d);
render();
}else{
tempSelected=[d];
}
};
box.appendChild(btn);
}

let ok=document.createElement("button");
ok.textContent="✔ تایید";
ok.onclick=()=>{
callback(tempSelected);
document.body.removeChild(modal);
};
box.appendChild(ok);

modal.appendChild(box);
}

render();
document.body.appendChild(modal);
}

function openSessionModal(){
buildModal(true,(dates)=>{
sessions=dates;
save();
document.getElementById("selectedSessions").innerText=sessions.join(" , ");
renderCalendar();
renderDebts();
});
}

function openPayModal(){
buildModal(false,(dates)=>{
selectedPayDate=dates[0];
document.getElementById("payDateView").innerText=selectedPayDate;
});
}

// ---------- پرداخت ----------
function registerPayment(){
let i=parseInt(document.getElementById("playerSelect").value);
let a=parseInt(document.getElementById("payAmount").value.replace(/,/g,""));
if(!selectedPayDate||!a)return;
payments.push({i,a});
save();
renderDebts();
}

// ---------- بدهی ----------
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
let txt= diff<0?"بدهکار: "+format(-diff):
diff>0?"طلبکار: "+format(diff):"صفر";
let li=document.createElement("li");
li.textContent=p.n+" "+p.f+" - "+txt;
ul.appendChild(li);
});
}

// ---------- تقویم ثابت ----------
function renderCalendar(){
let cal=document.getElementById("calendar");
cal.innerHTML="";
let names=["ش","ی","د","س","چ","پ","ج"];
names.forEach(n=>{
let div=document.createElement("div");
div.className="dayName";
div.textContent=n;
cal.appendChild(div);
});
let now=new persianDate();
let days=now.daysInMonth();
for(let i=1;i<=days;i++){
let d=new persianDate([now.year(),now.month(),i]).format("YYYY/MM/DD");
let div=document.createElement("div");
div.className="day";
div.textContent=i;
if(sessions.includes(d)) div.classList.add("booked");
cal.appendChild(div);
}
}

renderPlayers();
renderDebts();
renderCalendar();
document.getElementById("selectedSessions").innerText=sessions.join(" , ");
