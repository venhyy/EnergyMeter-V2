
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
        document.getElementById("device1_voltage").innerHTML =
          data[0].voltage.toFixed(2);
        document.getElementById("device1_current").innerHTML =
          data[0].current.toFixed(2);
        document.getElementById("device1_power").innerHTML =
          data[0].power.toFixed(2);
        document.getElementById("device1_frequency").innerHTML =
          data[0].frequency.toFixed(2);
        document.getElementById("device1_power_factor").innerHTML =
          data[0].pf.toFixed(2);
        if (data[1].voltage != null) {
          document.getElementById("device2_voltage").innerHTML =
            data[1].voltage.toFixed(2);
          document.getElementById("device2_current").innerHTML =
            data[1].current.toFixed(2);
          document.getElementById("device2_power").innerHTML =
            data[1].power.toFixed(2);
          document.getElementById("device2_frequency").innerHTML =
            data[1].frequency.toFixed(2);
          document.getElementById("device2_power_factor").innerHTML =
            data[1].pf.toFixed(2);
        }
        if (data[2].voltage != null) {
          document.getElementById("device3_voltage").innerHTML =
            data[2].voltage.toFixed(2);
          document.getElementById("device3_current").innerHTML =
            data[2].current.toFixed(2);
          document.getElementById("device3_power").innerHTML =
            data[2].power.toFixed(2);
          document.getElementById("device3_frequency").innerHTML =
            data[2].frequency.toFixed(2);
          document.getElementById("device3_power_factor").innerHTML =
            data[2].pf.toFixed(2);
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
        const charts = [chartT1, chartT2, chartT3];

        data.forEach((data, i) => {
          var x = new Date().getTime();
          var y = data.voltage;
          if (charts[i].series[0].data.length > 40) {
            charts[i].series[0].addPoint([x, y], true, true, true);
          } else {
            charts[i].series[0].addPoint([x, y], true, false, true);
          }
        });
      }
    

      <script>
      var chartT1 = new Highcharts.Chart({
        chart: {
          renderTo: "chart-temperature1",
        },
        title: {
          text: "Napětí L1",
        },
        series: [
          {
            showInLegend: false,
            data: [],
          },
        ],
        plotOptions: {
          line: {
            animation: false,
            dataLabels: {
              enabled: true,
            },
          },
          series: {
            color: "#059e8a",
          },
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            second: "%H:%M:%S",
          },
        },
        yAxis: {
          title: {
            text: "Napětí L1 (V)",
          },
          //title: { text: 'Temperature (Fahrenheit)' }
        },
        credits: {
          enabled: false,
        },
      });
      /* setInterval(function () {
        var x = new Date().getTime(),
          y = Math.floor(Math.random() * 100);
        if (chartT1.series[0].data.length > 40) {
          chart1T.series[0].addPoint([x, y], true, true, true);
        } else {
          chartT1.series[0].addPoint([x, y], true, false, true);
        }
      }, 3000); */
    </script>

    <script>
      var chartT2 = new Highcharts.Chart({
        chart: {
          renderTo: "chart-temperature2",
        },
        title: {
          text: "Napětí L1",
        },
        series: [
          {
            showInLegend: false,
            data: [],
          },
        ],
        plotOptions: {
          line: {
            animation: false,
            dataLabels: {
              enabled: true,
            },
          },
          series: {
            color: "#059e8a",
          },
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            second: "%H:%M:%S",
          },
        },
        yAxis: {
          title: {
            text: "Napětí L1 (V)",
          },
          //title: { text: 'Temperature (Fahrenheit)' }
        },
        credits: {
          enabled: false,
        },
      });
      /*  setInterval(function () {
        var x = new Date().getTime(),
          y = Math.floor(Math.random() * 100);
        if (chartT2.series[0].data.length > 40) {
          chartT2.series[0].addPoint([x, y], true, true, true);
        } else {
          chartT2.series[0].addPoint([x, y], true, false, true);
        }
      }, 3000); */
    </script>

    <script>
      var chartT3 = new Highcharts.Chart({
        chart: {
          renderTo: "chart-temperature3",
        },
        title: {
          text: "Napětí L1",
        },
        series: [
          {
            showInLegend: false,
            data: [],
          },
        ],
        plotOptions: {
          line: {
            animation: false,
            dataLabels: {
              enabled: true,
            },
          },
          series: {
            color: "#059e8a",
          },
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            second: "%H:%M:%S",
          },
        },
        yAxis: {
          title: {
            text: "Napětí L1 (V)",
          },
          //title: { text: 'Temperature (Fahrenheit)' }
        },
        credits: {
          enabled: false,
        },
      });
      /*  setInterval(function () {
        var x = new Date().getTime(),
          y = Math.floor(Math.random() * 100);
        if (chartT3.series[0].data.length > 40) {
          chartT3.series[0].addPoint([x, y], true, true, true);
        } else {
          chartT3.series[0].addPoint([x, y], true, false, true);
        }
      }, 3000); */
    </script>