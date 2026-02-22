let players = [];
let sessions = 0;
let pricePerSession = 0;

document.getElementById("add-player").addEventListener("click", () => {
    const name = document.getElementById("player-name").value;
    const family = document.getElementById("player-family").value;
    if(name && family) {
        players.push({name, family, paid: 0});
        updatePlayersList();
        document.getElementById("player-name").value = '';
        document.getElementById("player-family").value = '';
    }
});

function updatePlayersList() {
    const list = document.getElementById("players-list");
    list.innerHTML = '';
    players.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = `${p.name} ${p.family} - پرداخت شده: ${p.paid}`;
        list.appendChild(li);
    });
}

document.getElementById("calculate").addEventListener("click", () => {
    sessions = parseInt(document.getElementById("sessions").value);
    pricePerSession = parseInt(document.getElementById("price").value);
    const total = sessions * pricePerSession;
    const perPlayer = total / players.length;
    
    alert(`مبلغ کل: ${total}\nهر بازیکن: ${perPlayer}`);
});
