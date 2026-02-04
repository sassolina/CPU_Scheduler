console.log('Happy developing ✨')

// DICHIARAZIONE VARIABILI GLOBALI
let p = []; // ARRAY PROCESSI
let at = []; // ARRAY TEMPO DI ARRIVO
let bt = []; // ARRAY TEMPO DI BURST
let rbt = []; // ARRAY TEMPO DI BURST RIMANENTE
let ts = 0; // TIME SLICE
let priority = []; // ARRAY PRIORITÀ

let completionTime = [];
let turnaroundTime = [];
let waitingTime = [];
let responseTime = [];
let ganttChart = [];

function generaTabella() {
    let numProcessi = document.getElementById("numProcessi").value;
    let timeSlice = document.getElementById("timeSlice").value;
    
    if (!numProcessi || numProcessi < 1 || numProcessi > 10) {
        alert("Inserisci un numero valido di processi (da 1 a 10)");
        return;
    }
    
    if (!timeSlice || timeSlice < 1) {
        alert("Inserisci un time slice valido (minimo 1)");
        return;
    }

    document.getElementById("tabellaInput").style.display = "block";
    
    let tbody = document.getElementById("inputTableBody");
    tbody.innerHTML = "";
    
    for (let i = 1; i <= numProcessi; i++) {
        let row = tbody.insertRow();
 
        let cellProcess = row.insertCell();
        cellProcess.textContent = "P" + i;
        cellProcess.style.fontWeight = "bold";
        cellProcess.style.textAlign = "center";

        let cellArrival = row.insertCell();
        cellArrival.innerHTML = '<input type="number" class="form-control input-sm" id="arrival' + i + '" min="0" value="0" style="text-align: center;">';

        let cellBurst = row.insertCell();
        cellBurst.innerHTML = '<input type="number" class="form-control input-sm" id="burst' + i + '" min="1" placeholder="Es: 5" style="text-align: center;">';
        
        let cellPriority = row.insertCell();
        cellPriority.innerHTML = '<input type="number" class="form-control input-sm" id="priority' + i + '" min="1" value="1" style="text-align: center;">';
    }
}

function reset() {
    let tableEl = document.getElementById("idTable");
    let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0];
    let newTBodyEl = document.createElement('tbody');
    tableEl.replaceChild(newTBodyEl, oldTBodyEl);
    
    document.getElementById("output").style.display = "none";
    document.getElementById("tabellaInput").style.display = "none";
    document.getElementById("numProcessi").value = "";
    document.getElementById("timeSlice").value = "";
    document.getElementById("inputTableBody").innerHTML = "";

    p = [];
    at = [];
    bt = [];
    rbt = [];
    priority = [];
    ts = 0;
    completionTime = [];
    turnaroundTime = [];
    waitingTime = [];
    responseTime = [];
    ganttChart = [];
}

function start() {
    let numProcessi = document.getElementById("numProcessi").value;
    let timeSlice = document.getElementById("timeSlice").value;
    
    if (!numProcessi || !timeSlice) {
        alert("Genera prima la tabella con numero di processi e time slice!");
        return;
    }
   
    p = [];
    at = [];
    bt = [];
    rbt = [];
    priority = [];
    ts = parseInt(timeSlice);
    completionTime = [];
    turnaroundTime = [];
    waitingTime = [];
    responseTime = [];
    ganttChart = [];
    
    for (let i = 1; i <= numProcessi; i++) {
        let arrival = document.getElementById("arrival" + i).value;
        let burst = document.getElementById("burst" + i).value;
        let prior = document.getElementById("priority" + i).value;
        
        if (!burst || burst < 1) {
            alert("Inserisci un Burst Time valido per tutti i processi!");
            return;
        }
        
        p.push("P" + i);
        at.push(parseInt(arrival) || 0);
        bt.push(parseInt(burst));
        rbt.push(parseInt(burst));
        priority.push(parseInt(prior) || 1);
    }
 
    sortProcessesByArrival();
 
    displayProcessTable();
    
    displayInitialProgressBar();
    
    executeRoundRobin();

    displayGanttChart();
    displayMetrics();
    
    document.getElementById("output").style.display = "block";
}

function displayInitialProgressBar() {
    let process = document.getElementById("process");
    process.innerHTML = "";
    process.style.height = "50px";
    process.style.display = "flex";

    const colors = [
        '#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#9b59b6', 
        '#e67e22', '#1abc9c', '#34495e', '#e74c3c', '#3498db'
    ];

    for (let i = 0; i < p.length; i++){
        let div = document.createElement("div");
        div.className = "progress-bar";
        div.style.backgroundColor = colors[i % colors.length];
        
        let totalBurst = bt.reduce((sum, val) => sum + val, 0);
        let percentage = (bt[i] / totalBurst) * 100;
        
        div.style.width = percentage + "%";
        div.style.lineHeight = "50px";
        div.style.color = "white";
        div.style.fontWeight = "bold";
        div.style.textAlign = "center";
        div.innerHTML = p[i];
        
        process.appendChild(div);
    }
}

function sortProcessesByArrival() {
    let processes = [];
    for (let i = 0; i < p.length; i++) {
        processes.push({
            name: p[i],
            arrival: at[i],
            burst: bt[i],
            remaining: rbt[i],
            priority: priority[i]
        });
    }

    processes.sort((a, b) => a.arrival - b.arrival);

    for (let i = 0; i < processes.length; i++) {
        p[i] = processes[i].name;
        at[i] = processes[i].arrival;
        bt[i] = processes[i].burst;
        rbt[i] = processes[i].remaining;
        priority[i] = processes[i].priority;
    }
}

function displayProcessTable() {
    let tableEl = document.getElementById("idTable");
    let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0];
    let newTBodyEl = document.createElement("tbody");
    
    for (let i = 0; i < p.length; i++) {
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
}

function executeRoundRobin() {
    let n = p.length;
    let currentTime = 0;
    let completed = 0;
    let queue = [];
   
    completionTime = new Array(n).fill(0);
    responseTime = new Array(n).fill(-1);
    let processIndex = 0;
    let remainingBurst = [...bt];
 
    while (processIndex < n && at[processIndex] <= currentTime) {
        queue.push(processIndex);
        processIndex++;
    }
  
    if (queue.length === 0 && processIndex < n) {
        currentTime = at[processIndex];
        queue.push(processIndex);
        processIndex++;
    }
    
    while (completed < n) {
        if (queue.length === 0) {
            if (processIndex < n) {
                currentTime = at[processIndex];
                queue.push(processIndex);
                processIndex++;
            }
            continue;
        }
        
        let current = queue.shift();
        
        if (responseTime[current] === -1) {
            responseTime[current] = currentTime - at[current];
        }

        let executionTime = Math.min(ts, remainingBurst[current]);

        ganttChart.push({
            process: p[current],
            start: currentTime,
            end: currentTime + executionTime
        });
        
        currentTime += executionTime;
        remainingBurst[current] -= executionTime;
        
        while (processIndex < n && at[processIndex] <= currentTime) {
            queue.push(processIndex);
            processIndex++;
        }
        
        if (remainingBurst[current] === 0) {
            completed++;
            completionTime[current] = currentTime;
        } else {
            queue.push(current);
        }
    }
    
    for (let i = 0; i < n; i++) {
        turnaroundTime[i] = completionTime[i] - at[i];
        waitingTime[i] = turnaroundTime[i] - bt[i];
    }
}

function displayGanttChart() {
    let ganttDiv = document.getElementById("ganttChart");
    ganttDiv.innerHTML = "";
    ganttDiv.style.display = "flex";
    ganttDiv.style.marginBottom = "5px";
    
    const colors = [
        '#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#9b59b6', 
        '#e67e22', '#1abc9c', '#34495e', '#e74c3c', '#3498db'
    ];
    
    for (let i = 0; i < ganttChart.length; i++) {
        let block = document.createElement("div");
        let duration = ganttChart[i].end - ganttChart[i].start;
        let processNum = parseInt(ganttChart[i].process.substring(1)) - 1;
        
        block.style.backgroundColor = colors[processNum % colors.length];
        block.style.minWidth = (duration * 40) + "px";
        block.style.height = "50px";
        block.style.display = "flex";
        block.style.alignItems = "center";
        block.style.justifyContent = "center";
        block.style.color = "white";
        block.style.fontWeight = "bold";
        block.style.border = "1px solid #fff";
        block.style.fontSize = "14px";
        
        block.textContent = ganttChart[i].process;
        ganttDiv.appendChild(block);
    }
    
    let timelineDiv = document.getElementById("ganttTimeline");
    timelineDiv.innerHTML = "";
    timelineDiv.style.display = "flex";
    timelineDiv.style.position = "relative";
    
    for (let i = 0; i < ganttChart.length; i++) {
        let duration = ganttChart[i].end - ganttChart[i].start;
        let timeLabel = document.createElement("div");
        timeLabel.style.minWidth = (duration * 40) + "px";
        timeLabel.style.textAlign = "left";
        timeLabel.style.fontSize = "12px";
        timeLabel.style.fontWeight = "bold";
        timeLabel.style.borderLeft = "2px solid #333";
        timeLabel.style.paddingLeft = "2px";
        
        if (i === 0) {
            timeLabel.textContent = ganttChart[i].start;
        }   
        timelineDiv.appendChild(timeLabel);
    }
    
    let lastTime = document.createElement("div");
    lastTime.style.fontSize = "12px";
    lastTime.style.fontWeight = "bold";
    lastTime.style.borderLeft = "2px solid #333";
    lastTime.style.paddingLeft = "2px";
    lastTime.textContent = ganttChart[ganttChart.length - 1].end;
    timelineDiv.appendChild(lastTime);
}

function displayMetrics() {
    let metricsBody = document.getElementById("metricsBody");
    metricsBody.innerHTML = "";
    
    let totalTAT = 0, totalWT = 0, totalRT = 0;
    
    for (let i = 0; i < p.length; i++) {
        let row = metricsBody.insertRow();
        row.insertCell().textContent = p[i];
        row.insertCell().textContent = completionTime[i];
        row.insertCell().textContent = turnaroundTime[i];
        row.insertCell().textContent = waitingTime[i];
        row.insertCell().textContent = responseTime[i];
        
        totalTAT += turnaroundTime[i];
        totalWT += waitingTime[i];
        totalRT += responseTime[i];
    }

    let n = p.length;
    document.getElementById("avgTAT").textContent = (totalTAT / n).toFixed(2);
    document.getElementById("avgWT").textContent = (totalWT / n).toFixed(2);
    document.getElementById("avgRT").textContent = (totalRT / n).toFixed(2);
    
    let totalBurstTime = bt.reduce((sum, val) => sum + val, 0);
    let totalTime = ganttChart[ganttChart.length - 1].end;
    let cpuUtilization = ((totalBurstTime / totalTime) * 100).toFixed(2);
    document.getElementById("cpuUtil").textContent = cpuUtilization + "%";
}
