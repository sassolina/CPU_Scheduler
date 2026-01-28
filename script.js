console.log('Happy developing ✨')

// DICHIARAZIONE VARIABILI GLOBALI
let p = []; //ARRAY PROCESSI
let at = []; //ARRAY TEMPO DI ARRIVO
let bt = []; //ARRAY TEMPO DI BURST
let rbt = []; //ARRAY TEMPO DI BURST RIMANENTE
let ts = 0; //TIME SLICE 


function conferma() {
    let numProcessi = document.getElementById("numProcessi").value;
    
    if (numProcessi < 1 || numProcessi === "") {
        alert("Inserisci un numero valido di processi (minimo 1)");
        return;
    }
    
    let container = document.getElementById("campiProcessi");
    container.innerHTML = "";
    
    for (let i = 1; i <= numProcessi; i++) {
        let div = document.createElement("div");
        div.style.border = "1px solid #ddd";
        div.style.padding = "10px";
        div.style.marginBottom = "10px";
        div.style.borderRadius = "5px";
        
        div.innerHTML = `
            <h5>Processo P${i}</h5>
            <label>Arrival Time: </label>
            <input type="number" id="arrival${i}" min="0" placeholder="Es: 0" style="margin-right: 20px;">
            <label>Burst Time: </label>
            <input type="number" id="burst${i}" min="1" placeholder="Es: 5">
        `;
        
        container.appendChild(div);
    }
    
    document.querySelector(".inserDatiProcessi").style.display = "block";
}


function reset(){
    let tableEl = document.getElementById("idTable");
    let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0];
    let newTBodyEl = document.createElement('tbody');

    tableEl.replaceChild(newTBodyEl, oldTBodyEl);
    document.getElementById("output").style.display = "none";
    
    // Reset degli input
    document.getElementById("numProcessi").value = "";
    document.getElementById("campiProcessi").innerHTML = "";
    document.getElementById("timeSlice").value = "";
    document.querySelector(".inserDatiProcessi").style.display = "none";
    
    p = [];
    at = [];
    bt = [];
    rbt = [];
    ts = 0;
}

function start(){
    let numProcessi = document.getElementById("numProcessi").value;
    let timeSlice = document.getElementById("timeSlice").value;
    
    if (!numProcessi || !timeSlice) {
        alert("Compila prima il numero di processi e il time slice!");
        return;
    }
    
    p = [];
    at = [];
    bt = [];
    rbt = [];
    ts = parseInt(timeSlice);
  
    for (let i = 1; i <= numProcessi; i++) {
        let arrival = document.getElementById("arrival" + i).value;
        let burst = document.getElementById("burst" + i).value;
        
        if (!arrival || !burst) {
            alert("Compila tutti i campi dei processi!");
            return;
        }
        
        p.push("P" + i);
        at.push(parseInt(arrival));
        bt.push(parseInt(burst));
        rbt.push(parseInt(burst));
    }
    
    let tableEl = document.getElementById("idTable");
    let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0];
    let newTBodyEl = document.createElement("tbody");
    
    for(let i = 0; i < p.length; i++) {
        const trEl = newTBodyEl.insertRow();
        let tdEl = trEl.insertCell();
        tdEl.appendChild(document.createTextNode(p[i]));
        tdEl = trEl.insertCell();
        tdEl.appendChild(document.createTextNode(at[i]));
        tdEl = trEl.insertCell();
        tdEl.appendChild(document.createTextNode(bt[i]));
        tdEl = trEl.insertCell();
        tdEl.id = "idP" + i;
        tdEl.appendChild(document.createTextNode(rbt[i]));
        tdEl = trEl.insertCell();
        tdEl.appendChild(document.createTextNode(ts));
    }
    
    tableEl.replaceChild(newTBodyEl, oldTBodyEl);
    document.getElementById("output").style.display = "block";

    let process = document.getElementById("process");
    process.innerHTML = "";

    for (let i = 0; i < p.length; i++){
        let div = document.createElement("div");
        div.className = "progress-bar";
        
        if (i % 3 === 0) div.className += " progress-bar-success";
        else if (i % 3 === 1) div.className += " progress-bar-warning";
        else div.className += " progress-bar-danger";
        
        div.style.width = (bt[i] * 10) + "%";
        div.innerHTML = p[i];
        process.appendChild(div);
    }
}