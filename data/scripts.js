var chartT1, chartT2, chartT3;
var chartsCounter = 0;
var charts = [];

////

function setStatus(device, status) {
  var cardId = device + "_card";
  var badgeId = device + "_status";
  let badgeElement = document.getElementById(badgeId);
  let cardElement = document.getElementById(cardId);

  if (status == "ONLINE") {
    badgeElement.innerHTML = "ONLINE";
    badgeElement.className = "badge bg-success";
    cardElement.classList.remove("offline");
  } else {
    badgeElement.innerHTML = "OFFLINE";
    badgeElement.className = "badge bg-danger";
    cardElement.classList.add("offline");
  }
}

////
// Array of chart definitions
var chartDefinitions = [
  {
    chart: {
      renderTo: "chart-phase1",
    },
    title: {
      text: "L1",
    },

    // Add other chart options as needed
  },
  {
    chart: {
      renderTo: "chart-phase2",
    },
    title: {
      text: "L2",
    },
    // Add other chart options as needed
  },
  {
    chart: {
      renderTo: "chart-phase3",
    },
    title: {
      text: "L3",
    },
    // Add other chart options as needed
  },
  // Add more chart definitions as needed
];

// Function to initialize charts based on the array of chart definitions
function initializeCharts(chartDefinitions) {
  chartDefinitions.forEach(function (chartDefinition) {
    // Use Object.assign to merge the common options with chart-specific options
    var chartOptions = Object.assign({}, commonChartOptions, chartDefinition);

    // Initialize the chart
    var chartObj = new Highcharts.Chart(chartOptions);
    charts.push(chartObj);
  });
}

// Common chart options that are shared among all charts
var commonChartOptions = {
  series: [
    {
      name: "Napětí",
      showInLegend: false,
      data: [],
      color: "#059e8a",
    },
    {
      name: "Proud",
      showInLegend: false,
      data: [],
      yAxis: 1,
      color: "red",
    },
  ],
  plotOptions: {
    line: {
      animation: false,
      dataLabels: {
        enabled: false,
      },
    },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: {
      second: "%H:%M:%S",
    },
  },
  yAxis: [
    {
      title: {
        text: "Napětí L1 (V)",
      },
    },
    {
      title: {
        text: "Proud L1 (A)",
      },
      opposite: true,
    },
  ],
  credits: {
    enabled: false,
  },
  // Add exporting module with a button for changing timespan
};

// Call the initializeCharts function with the array of chart definitions
initializeCharts(chartDefinitions);

// Your existing code to add data to the chart at 1-second intervals
/* setInterval(function () {
  console.log(charts);
  var chartT1 = charts[1];
  var x = new Date().getTime(),
    y = Math.floor(Math.random() * 100);

  // Add point to series 1
  if (chartT1.series[0].data.length >= 10) {
    chartT1.series[0].addPoint([x, y], true, true);
  } else {
    chartT1.series[0].addPoint([x, y], true, false);
  }

  // Add point to series 2
  if (chartT1.series[1].data.length >= 10) {
    chartT1.series[1].addPoint([x, y + 20], true, true);
  } else {
    chartT1.series[1].addPoint([x, y + 20], true, false);
  }
}, 1000); */

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener("load", onLoad);

function initWebSocket() {
  console.log("Trying to open a WebSocket connection...");
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage; // <-- add this line
}

function onOpen(event) {
  console.log("Connection opened");
}

function onClose(event) {
  console.log("Connection closed");
  setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
  const data = JSON.parse(event.data);
  console.log(data);
  // Update measurement values on the dashboard
  if (data[0].voltage != null) {
    setStatus("device1", "ONLINE");
    document.getElementById("device1_voltage").innerHTML = parseInt(
      data[0].voltage
    );
    document.getElementById("device1_current").innerHTML =
      data[0].current.toFixed(1);
    document.getElementById("device1_power").innerHTML = parseInt(
      data[0].power
    );
    document.getElementById("device1_frequency").innerHTML = parseInt(
      data[0].frequency
    );
    document.getElementById("device1_power_factor").innerHTML =
      data[0].pf.toFixed(2);
  } else {
    setStatus("device1", "OFFLINE");
  }
  if (data[1].voltage != null) {
    setStatus("device2", "ONLINE");
    document.getElementById("device2_voltage").innerHTML = parseInt(
      data[1].voltage
    );
    document.getElementById("device2_current").innerHTML =
      data[1].current.toFixed(1);
    document.getElementById("device2_power").innerHTML = parseInt(
      data[1].power
    );
    document.getElementById("device2_frequency").innerHTML = parseInt(
      data[1].frequency
    );
    document.getElementById("device2_power_factor").innerHTML =
      data[1].pf.toFixed(2);
  } else {
    setStatus("device2", "OFFLINE");
  }
  if (data[2].voltage != null) {
    setStatus("device3", "ONLINE");
    document.getElementById("device3_voltage").innerHTML = parseInt(
      data[2].voltage
    );
    document.getElementById("device3_current").innerHTML =
      data[2].current.toFixed(1);
    document.getElementById("device3_power").innerHTML = parseInt(
      data[2].power
    );
    document.getElementById("device3_frequency").innerHTML = parseInt(
      data[2].frequency
    );
    document.getElementById("device3_power_factor").innerHTML =
      data[2].pf.toFixed(2);
  } else {
    setStatus("device3", "OFFLINE");
  }
  updateGraphs(data);
}

function onLoad(event) {
  initWebSocket();

  //initButton();
}

function initButton() {
  //document.getElementById("button").addEventListener("click", toggle);
}

function toggle() {
  //websocket.send("toggle");
}

function updateGraphs(data) {
  data.forEach((data, i) => {
    if (data.voltage != null) {
      var x = new Date().getTime();
      var y = data.voltage;
      if (charts[i].series[0].data.length > 40) {
        charts[i].series[0].addPoint([x, y], true, true, true);
      } else {
        charts[i].series[0].addPoint([x, y], true, false, true);
      }
    }
  });
}
