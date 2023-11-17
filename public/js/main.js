// SOCKET IO
const socket = io({
  auth: {
    token: "abc"
  }
});

// ON CONNECT EVENT
socket.on('connect', () => {
    console.log('Connected');
});

// SELECT METRICS ELEMENTS
const cpuText = document.getElementById('cpu-text');
const cpuBar = document.getElementById('cpu-bar');
const ramText = document.getElementById('ram-text');
const ramBar = document.getElementById('ram-bar');
const netText = document.getElementById('net-text');
const netBar = document.getElementById('net-bar');
const diskText = document.getElementById('disk-text');
const diskBar = document.getElementById('disk-bar');

const dockerCards = document.getElementById('cards');

// create

//Update usage bars
socket.on('metrics', (data) => {

    let {cpu, ram, tx, rx, disk} = data;

    cpuText.innerHTML = `<span>CPU ${cpu} %</span>`;
    cpuBar.innerHTML = `<span style="width: ${cpu}%"><span></span></span>`;
    
    ramText.innerHTML = `<span>RAM ${ram} %</span>`;
    ramBar.innerHTML = `<span style="width: ${ram}%"><span></span></span>`;

    tx = Math.round(tx / 1024 / 1024);
    rx = Math.round(rx / 1024 / 1024);

    netText.innerHTML = `<span>Down: ${rx}MB</span><span>  Up: ${tx}MB</span>`;
    netBar.innerHTML = `<span style="width: 50%"><span></span></span>`;

    diskText.innerHTML = `<span>DISK ${disk} %</span>`;
    diskBar.innerHTML = `<span style="width: ${disk}%"><span></span></span>`;
});

function drawCharts(name, cpu_array, ram_array) {
  var elements = document.querySelectorAll(`${name}`);

  Array.from(elements).forEach(function(element) {
    if (window.ApexCharts) {
      new ApexCharts(element, {
        chart: {
          type: "line",
          fontFamily: 'inherit',
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
          data: cpu_array
        }, {
          name: "RAM",
          data: ram_array
        }],
        tooltip: {
          theme: 'dark'
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
          },
          type: 'datetime'
        },
        yaxis: {
          labels: {
            padding: 4
          }
        },
        labels: [
          '2020-06-20', '2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24', '2020-06-25', '2020-06-26', '2020-06-27', '2020-06-28', '2020-06-29', '2020-06-30', '2020-07-01', '2020-07-02', '2020-07-03', '2020-07-04', '2020-07-05', '2020-07-06', '2020-07-07', '2020-07-08', '2020-07-09', '2020-07-10', '2020-07-11', '2020-07-12', '2020-07-13', '2020-07-14', '2020-07-15', '2020-07-16', '2020-07-17', '2020-07-18', '2020-07-19'
        ],
        colors: [tabler.getColor("primary"), tabler.getColor("gray-600")],
        legend: {
          show: false
        }
      }).render();
    }
  });
}

// container button actions
function buttonAction(button) {
  socket.emit('clicked', {container: button.name, state: button.id, action: button.value});
}

function viewLogs(button) {
  console.log(`trying to view logs for ${button.name}`);
}

socket.on('cards', (data) => {

  console.log('cards deleted');
  let deleteMeElements = document.querySelectorAll('.deleteme');
  deleteMeElements.forEach((element) => {
    element.parentNode.removeChild(element);
  });
 
  dockerCards.insertAdjacentHTML("afterend", data);

  // check localStorage for items ending with _cpu and redraw the charts
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).endsWith('_cpu')) {
      let name = localStorage.key(i).split('_')[0];
      let cpu_array = JSON.parse(localStorage.getItem(`${name}_cpu`));
      let ram_array = JSON.parse(localStorage.getItem(`${name}_ram`));
      drawCharts(`#${name}_chart`, cpu_array, ram_array);
    }
  }
  
  
});


socket.on('container_stats', (data) => {

  let {name, cpu, ram} = data;

  var cpu_array = JSON.parse(localStorage.getItem(`${name}_cpu`));
  var ram_array = JSON.parse(localStorage.getItem(`${name}_ram`));

  if (cpu_array == null) { cpu_array = Array(30).fill(0); }
  if (ram_array == null) { ram_array = Array(30).fill(0); }

  cpu_array.push(cpu);
  ram_array.push(ram);
  
  cpu_array = cpu_array.slice(-30);
  ram_array = ram_array.slice(-30);

  localStorage.setItem(`${name}_cpu`, JSON.stringify(cpu_array));
  localStorage.setItem(`${name}_ram`, JSON.stringify(ram_array));

  // replace the old chart with the new one
  let chart = document.getElementById(`${name}_chart`);
  if (chart) {
    let newChart = document.createElement('div');
    newChart.id = `${name}_chart`;
    chart.parentNode.replaceChild(newChart, chart);
    drawCharts(`#${name}_chart`, cpu_array, ram_array);
  } else {
    console.log(`Chart element with id ${name}_chart not found in the DOM`);
  }
});

socket.on('install', (data) => {
  
  console.log('added install card');
  dockerCards.insertAdjacentHTML("afterend", data);
});
