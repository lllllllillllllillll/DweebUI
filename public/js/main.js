socket.on('connect', () => { console.log('connected'); });

// Server metrics
const cpuText = document.getElementById('cpu-text');
const cpuBar = document.getElementById('cpu-bar');
const ramText = document.getElementById('ram-text');
const ramBar = document.getElementById('ram-bar');
const netText = document.getElementById('net-text');
const netBar = document.getElementById('net-bar');
const diskText = document.getElementById('disk-text');
const diskBar = document.getElementById('disk-bar');

// Container cards
const dockerCards = document.getElementById('cards');

// Container logs
const logViewer = document.getElementById('logView');

// Server metrics
socket.on('metrics', (data) => {
    let [cpu, ram, tx, rx, disk] = data;

    cpuText.innerHTML = `<span>CPU ${cpu} %</span>`;
    if (cpu < 7 ) { cpu = 7; }
    cpuBar.innerHTML = `<span style="width: ${cpu}%"><span></span></span>`;
    
    ramText.innerHTML = `<span>RAM ${ram} %</span>`;
    if (ram < 7 ) { ram = 7; }
    ramBar.innerHTML = `<span style="width: ${ram}%"><span></span></span>`;

    tx = Math.round(tx / 1024 / 1024);
    rx = Math.round(rx / 1024 / 1024);

    netText.innerHTML = `<span>Down: ${rx}MB</span><span>  Up: ${tx}MB</span>`;
    netBar.innerHTML = `<span style="width: 50%"><span></span></span>`;

    diskText.innerHTML = `<span>DISK ${disk} %</span>`;
    if (disk < 7 ) { disk = 7; }
    diskBar.innerHTML = `<span style="width: ${disk}%"><span></span></span>`;
});

// Container cards
socket.on('containers', (data) => {
    let deleteMeElements = document.querySelectorAll('.deleteme');
    deleteMeElements.forEach((element) => {
      element.parentNode.removeChild(element);
    });
    dockerCards.insertAdjacentHTML("afterend", data);
});


function drawCharts(name, cpuArray, ramArray) {
  let element = document.querySelector(`${name}`);

  let chart = new ApexCharts(element, {
    chart: {
      type: "line",
      height: 40.0,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: false
      }
    },
    fill: {
      opacity: 1
    },
    stroke: {
      width: [2, 1],
      dashArray: [0, 3],
      lineCap: "round",
      curve: "smooth"
    },
    series: [{
      name: "CPU",
      data: cpuArray
    }, {
      name: "RAM",
      data: ramArray
    }],
    tooltip: {
      enabled: false
    },
    grid: {
      strokeDashArray: 4
    },
    xaxis: {
      labels: {
        padding: 0
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      labels: {
        padding: 4
      }
    },
    colors: [tabler.getColor("primary"), tabler.getColor("gray-600")],
    legend: {
      show: false
    }
  })
  chart.render();
}

// Buttons functions
function clicked(button) {
  socket.emit('clicked', {name: button.name, id: button.id, value: button.value});
}


socket.on('containerStats', (data) => {
  let containerStats = data;
  
  for (const [name, statsArray] of Object.entries(containerStats)) {

    let cpuArray = statsArray.cpuArray;
    let ramArray = statsArray.ramArray;

    let chart = document.getElementById(`${name}_chart`);
    if (chart) {
      chart.innerHTML = '';
      drawCharts(`#${name}_chart`, cpuArray, ramArray);
    } else {
      console.log(`Chart element with id ${name}_chart not found in the DOM`);
    }
  }

});


socket.on('logs', (data) => {
  logViewer.innerHTML = `<pre>${data}</pre>`;
});
