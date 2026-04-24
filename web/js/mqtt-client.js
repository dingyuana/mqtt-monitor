const MQTT_CONFIG = {
    hostname: 'i10a1ac9.ala.cn-hangzhou.emqxsl.cn',
    port: 8084,
    path: '/mqtt',
    username: 'dy',
    password: '9055',
    clientId: 'mqtt_nexus_' + Math.random().toString(16).substr(2, 8)
};

const MQTT_TOPICS = [
    { topic: 'sys/cpu', qos: 1 },
    { topic: 'sys/memory', qos: 1 },
    { topic: 'sys/disk', qos: 1 },
    { topic: 'sensor/temperature', qos: 1 },
    { topic: 'sensor/humidity', qos: 1 }
];

const STREAM_DOTS = {
    'sys/cpu': 'cpuStream',
    'sys/memory': 'memStream',
    'sys/disk': 'diskStream',
    'sensor/temperature': 'tempStream',
    'sensor/humidity': 'humStream'
};

class MqttClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.lastActivity = Date.now();
    }

    connect() {
        const options = {
            clientId: MQTT_CONFIG.clientId,
            username: MQTT_CONFIG.username,
            password: MQTT_CONFIG.password,
            keepalive: 60,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30 * 1000
        };

        this.client = mqtt.connect(`wss://${MQTT_CONFIG.hostname}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`, options);

        this.client.on('connect', () => {
            console.log('[QST] MQTT连接成功');
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.subscribeTopics();
            this.startActivityMonitor();
        });

        this.client.on('error', (error) => {
            console.error('[QST] MQTT连接错误:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        this.client.on('close', () => {
            console.log('[QST] MQTT连接关闭');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message);
        });
    }

    subscribeTopics() {
        MQTT_TOPICS.forEach(item => {
            this.client.subscribe(item.topic, { qos: item.qos }, (err) => {
                if (!err) {
                    console.log(`[QST] 已订阅主题: ${item.topic}`);
                } else {
                    console.error(`[QST] 订阅失败 ${item.topic}:`, err);
                }
            });
        });
    }

    handleMessage(topic, message) {
        this.lastActivity = Date.now();

        const streamId = STREAM_DOTS[topic];
        if (streamId) {
            this.flashStreamDot(streamId);
        }

        try {
            const payload = JSON.parse(message.toString());
            console.log(`[QST] 收到消息 [${topic}]:`, payload);

            const handler = this.messageHandlers.get(topic);
            if (handler) {
                handler(payload);
            }
        } catch (e) {
            console.error(`[QST] 消息解析失败 [${topic}]:`, e);
        }
    }

    flashStreamDot(streamId) {
        const dot = document.getElementById(streamId);
        if (dot) {
            dot.classList.add('active');
            setTimeout(() => {
                dot.classList.remove('active');
            }, 300);
        }
    }

    onMessage(topic, handler) {
        this.messageHandlers.set(topic, handler);
    }

    updateConnectionStatus(connected) {
        const indicator = document.getElementById('connectionIndicator');
        const text = document.getElementById('connectionText');
        const statusValue = document.getElementById('systemStatus');

        if (connected) {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            text.textContent = '已连接';
            if (statusValue) {
                statusValue.textContent = '在线';
                statusValue.classList.add('online');
            }
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            text.textContent = '未连接';
            if (statusValue) {
                statusValue.textContent = '离线';
                statusValue.classList.remove('online');
            }
        }
    }

    startActivityMonitor() {
        setInterval(() => {
            const timeSinceActivity = Date.now() - this.lastActivity;
            const lastUpdateEl = document.getElementById('lastUpdate');

            if (this.isConnected && lastUpdateEl) {
                if (timeSinceActivity < 10000) {
                    lastUpdateEl.textContent = `最后更新: ${new Date().toLocaleTimeString()}`;
                } else {
                    lastUpdateEl.textContent = '数据流中断...';
                }
            }
        }, 1000);
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
        }
    }
}

const mqttClient = new MqttClient();