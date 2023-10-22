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
socket.on('metrics', ({ cpu, ram, tx, rx, disk}) => {
    cpuText.innerHTML = `<span>CPU ${cpu} %</span>`;
    cpuBar.innerHTML = `<span style="width: ${cpu}%"><span></span></span>`;
    ramText.innerHTML = `<span>RAM ${ram} %</span>`;
    ramBar.innerHTML = `<span style="width: ${ram}%"><span></span></span>`;
    diskText.innerHTML = `<span>DISK ${disk} %</span>`;
    diskBar.innerHTML = `<span style="width: ${disk}%"><span></span></span>`;
});

function drawCharts(name, cpu_array, ram_array) {
  var elements = document.querySelectorAll(`${name}`);

  if (cpu_array == undefined) {
    cpu_array = [37, 35, 44, 28, 36, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 4, 46, 39, 62, 51, 35, 41, 67];
  }

  if (ram_array == undefined) {
    ram_array = [93, 54, 51, 24, 35, 35, 31, 67, 19, 43, 28, 36, 62, 61, 27, 39, 35, 41, 27, 35, 51, 46, 62, 37, 44, 53, 41, 65, 39, 37];
  }


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

socket.on('cards', (data) => {

  console.log('cards deleted');
  let deleteMeElements = document.querySelectorAll('.deleteme');
  deleteMeElements.forEach((element) => {
    element.parentNode.removeChild(element);
  });
 
  dockerCards.insertAdjacentHTML("afterend", data);
  // drawCharts('#cardChart');
});


socket.on('container_stats', (data) => {

  let {name, cpu, ram} = data;

  // get cpu and ram array of the container from local storage
  var cpu_array = JSON.parse(localStorage.getItem(`${name}_cpu`));
  var ram_array = JSON.parse(localStorage.getItem(`${name}_ram`));
  
  // if the cpu and ram arrays are null, create both arrays with 30 values of 0
  if (cpu_array == null) { cpu_array = Array(30).fill(0); }
  if (ram_array == null) { ram_array = Array(30).fill(0); }

  // add the new cpu and ram values to the arrays, but limit the array to 30 values
  cpu_array.push(cpu);
  ram_array.push(ram);
  cpu_array = cpu_array.slice(-30);
  ram_array = ram_array.slice(-30);

  // save the arrays to local storage
  localStorage.setItem(`${name}_cpu`, JSON.stringify(cpu_array));
  localStorage.setItem(`${name}_ram`, JSON.stringify(ram_array));

  // replace the old chart with the new one without breaking the surrounding elements
  let chart = document.getElementById(`${name}_chart`);
  let newChart = document.createElement('div');
  newChart.id = `${name}_chart`;
  chart.parentNode.replaceChild(newChart, chart);
  drawCharts(`#${name}_chart`, cpu_array, ram_array);  
});

socket.on('install', (data) => {
  
  console.log('added install card');
  dockerCards.insertAdjacentHTML("afterend", data);
});
