# MQTT 系统监控项目

基于MQTT协议的实时系统监控解决方案，采集服务器CPU、内存、硬盘等硬件数据，并模拟温度湿度传感器数据，通过EMQ X云服务进行数据传输，前端实时展示。

## 项目架构

```
┌─────────────────┐      MQTT      ┌─────────────────┐
│   Python采集端   │ ────────────► │   EMQ X Broker  │
│  (psutil采集)    │   mqtt://     │   broker.emqx.io│
│                 │   1883        │                 │
└─────────────────┘               └────────┬────────┘
                                           │ MQTT over WS
                                           ▼
                                   ┌────────┴────────┐
                                   │   前端展示页面   │
                                   │   (订阅+图表)   │
                                   └─────────────────┘
```

## 技术栈

- **数据采集**: Python 3.x + psutil
- **消息传输**: MQTT (paho-mqtt)
- **前端展示**: HTML5 + JavaScript + MQTT.js
- **数据可视化**: Chart.js
- **MQTT服务**: EMQ X Cloud (broker.emqx.io:1883)

## 目录结构

```
mqtt/
├── README.md
├── package.json          # 前端依赖
├── src/
│   ├── collector.py      # Python数据采集客户端
│   └── subscriber.py    # 前端订阅示例
├── web/
│   ├── index.html        # 主页面
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       ├── mqtt-client.js    # MQTT客户端封装
│       └── chart-handler.js  # 图表处理
└── requirements.txt      # Python依赖
```

## 快速开始

### 1. Python数据采集端

```bash
# 安装依赖
pip install -r requirements.txt

# 启动采集程序
python src/collector.py
```

### 2. 前端展示

```bash
# 安装前端依赖
npm install

# 启动Web服务器
npx http-server web -p 8080
```

浏览器访问: http://localhost:8080

## 数据主题

| 主题 | 描述 | 数据格式 |
|------|------|---------|
| `sys/cpu` | CPU使用率 | `{"usage": 25.5}` |
| `sys/memory` | 内存使用率 | `{"used": 8.2, "total": 16.0, "percent": 51.2}` |
| `sys/disk` | 磁盘使用率 | `{"used": 256.0, "total": 512.0, "percent": 50.0}` |
| `sensor/temperature` | 温度(模拟) | `{"value": 25.3, "unit": "℃"}` |
| `sensor/humidity` | 湿度(模拟) | `{"value": 65.0, "unit": "%"}` |

## 配置说明

MQTT连接配置（使用EMQ X Cloud TLS/SSL）:

```javascript
{
  hostname: 'your-broker.emqxsl.cn',
  port: 8084,
  path: '/mqtt',
  username: 'your-username',
  password: 'your-password'
}
```

**注意**: 公共Broker仅用于测试，生产环境建议部署私有Broker。

## 功能特性

- 实时CPU使用率监控
- 内存使用情况追踪
- 磁盘空间监控
- 温湿度模拟数据生成
- WebSocket实时数据传输
- 响应式前端界面
- 历史数据图表展示