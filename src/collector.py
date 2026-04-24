import paho.mqtt.client as mqtt
import psutil
import json
import time
import random
import ssl

MQTT_BROKER = "i10a1ac9.ala.cn-hangzhou.emqxsl.cn"
MQTT_PORT = 8883
MQTT_USERNAME = "dy"
MQTT_PASSWORD = "9055"
PUBLISH_INTERVAL = 3

class SystemCollector:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.tls_set(tls_version=ssl.PROTOCOL_TLS, cert_reqs=ssl.CERT_NONE)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("MQTT连接成功")
        else:
            print(f"MQTT连接失败: {rc}")

    def _on_disconnect(self, client, userdata, rc):
        print("MQTT连接断开，正在重连...")
        time.sleep(5)
        self.client.reconnect()

    def connect(self):
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
            time.sleep(1)
        except Exception as e:
            print(f"连接MQTT服务器失败: {e}")
            raise

    def get_cpu_usage(self):
        return psutil.cpu_percent(interval=1)

    def get_memory_info(self):
        mem = psutil.virtual_memory()
        return {
            "used": round(mem.used / (1024**3), 2),
            "total": round(mem.total / (1024**3), 2),
            "percent": mem.percent
        }

    def get_disk_info(self):
        disk = psutil.disk_usage('/')
        return {
            "used": round(disk.used / (1024**3), 2),
            "total": round(disk.total / (1024**3), 2),
            "percent": disk.percent
        }

    def get_mock_temperature(self):
        return round(random.uniform(20.0, 35.0), 1)

    def get_mock_humidity(self):
        return round(random.uniform(40.0, 80.0), 1)

    def publish_data(self):
        cpu_data = {"usage": self.get_cpu_usage()}
        self.client.publish("sys/cpu", json.dumps(cpu_data))
        print(f"发布CPU数据: {cpu_data}")

        mem_data = self.get_memory_info()
        self.client.publish("sys/memory", json.dumps(mem_data))
        print(f"发布内存数据: {mem_data}")

        disk_data = self.get_disk_info()
        self.client.publish("sys/disk", json.dumps(disk_data))
        print(f"发布磁盘数据: {disk_data}")

        temp_data = {"value": self.get_mock_temperature(), "unit": "℃"}
        self.client.publish("sensor/temperature", json.dumps(temp_data))
        print(f"发布温度数据: {temp_data}")

        hum_data = {"value": self.get_mock_humidity(), "unit": "%"}
        self.client.publish("sensor/humidity", json.dumps(hum_data))
        print(f"发布湿度数据: {hum_data}")

    def run(self):
        self.connect()
        print("开始数据采集和发布...")
        try:
            while True:
                self.publish_data()
                time.sleep(PUBLISH_INTERVAL)
        except KeyboardInterrupt:
            print("\n停止采集")
            self.client.loop_stop()
            self.client.disconnect()

if __name__ == "__main__":
    collector = SystemCollector()
    collector.run()