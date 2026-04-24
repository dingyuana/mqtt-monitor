const MAX_DATA_POINTS = 20;
const GAUGE_CIRCUMFERENCE = 326.73;

class ChartHandler {
    constructor() {
        this.charts = {};
    }

    init() {
        this.initCharts();
        this.setupMqttHandlers();
    }

    initCharts() {
        const canvasIds = ['cpuChart', 'memoryChart', 'diskChart', 'tempChart', 'humidityChart'];
        const colors = ['#ef4444', '#00f5ff', '#3b82f6', '#f97316', '#a855f7'];

        canvasIds.forEach((id, index) => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.charts[id.replace('Chart', '')] = this.createLineChart(canvas, colors[index]);
            }
        });
    }

    createLineChart(canvas, color) {
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '15',
                    borderWidth: 1.5,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                scales: {
                    y: {
                        display: false,
                        min: 0,
                        max: 100
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                elements: {
                    line: {
                        borderCapStyle: 'round'
                    }
                }
            }
        });
    }

    updateGauge(gaugeId, value) {
        const gauge = document.getElementById(gaugeId);
        if (!gauge) return;

        const offset = GAUGE_CIRCUMFERENCE - (value / 100) * GAUGE_CIRCUMFERENCE;
        gauge.style.strokeDashoffset = offset;
    }

    updateChart(chartName, value) {
        const chart = this.charts[chartName];
        if (!chart) return;

        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });

        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(value);

        if (chart.data.labels.length > MAX_DATA_POINTS) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    setupMqttHandlers() {
        mqttClient.onMessage('sys/cpu', (data) => {
            this.updateGauge('cpuGauge', data.usage);
            const el = document.getElementById('cpuValue');
            if (el) el.textContent = data.usage.toFixed(1);
            this.updateChart('cpu', data.usage);
        });

        mqttClient.onMessage('sys/memory', (data) => {
            this.updateGauge('memoryGauge', data.percent);
            const el = document.getElementById('memoryValue');
            if (el) el.textContent = data.percent.toFixed(1);
            const usedEl = document.getElementById('memoryUsed');
            if (usedEl) usedEl.textContent = data.used.toFixed(1) + ' GB';
            const totalEl = document.getElementById('memoryTotal');
            if (totalEl) totalEl.textContent = data.total.toFixed(1) + ' GB';
            this.updateChart('memory', data.percent);
        });

        mqttClient.onMessage('sys/disk', (data) => {
            this.updateGauge('diskGauge', data.percent);
            const el = document.getElementById('diskValue');
            if (el) el.textContent = data.percent.toFixed(1);
            const usedEl = document.getElementById('diskUsed');
            if (usedEl) usedEl.textContent = data.used.toFixed(1) + ' GB';
            const totalEl = document.getElementById('diskTotal');
            if (totalEl) totalEl.textContent = data.total.toFixed(1) + ' GB';
            this.updateChart('disk', data.percent);
        });

        mqttClient.onMessage('sensor/temperature', (data) => {
            const el = document.getElementById('tempValue');
            if (el) el.textContent = data.value;
            this.updateChart('temperature', data.value);
        });

        mqttClient.onMessage('sensor/humidity', (data) => {
            const el = document.getElementById('humidityValue');
            if (el) el.textContent = data.value;
            this.updateChart('humidity', data.value);
        });
    }
}

const chartHandler = new ChartHandler();
mqttClient.connect();

document.addEventListener('DOMContentLoaded', () => {
    chartHandler.init();
});