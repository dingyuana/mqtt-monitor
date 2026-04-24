# QST 系统监控中心 - 安装配置指南

## 环境要求

- Python 3.8+
- Node.js 14+ (可选，用于本地测试)
- 现代浏览器 (Chrome/Edge/Firefox)

## 项目结构

```
mqtt-monitor/
├── src/
│   └── collector.py          # Python数据采集端
├── web/
│   ├── index.html             # 前端页面
│   ├── css/style.css          # 样式文件
│   └── js/
│       ├── config.js          # 前端配置文件
│       ├── mqtt-client.js     # MQTT客户端
│       └── chart-handler.js   # 图表处理
├── .env                       # 环境变量配置 (敏感信息)
├── .env.example               # 配置模板
├── requirements.txt           # Python依赖
├── package.json              # Node依赖
├── README.md                 # 项目说明
└── INSTALL.md               # 安装指南
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/dingyuana/mqtt-monitor.git
cd mqtt-monitor
```

### 2. 安装Python依赖

```bash
pip install -r requirements.txt
```

依赖包括：
- paho-mqtt: MQTT客户端库
- psutil: 系统信息采集
- python-dotenv: 环境变量加载

### 3. 配置MQTT连接

#### 后端配置 (.env)

编辑 `.env` 文件：

```bash
MQTT_BROKER=i10a1ac9.ala.cn-hangzhou.emqxsl.cn
MQTT_PORT=8883
MQTT_USERNAME=dy
MQTT_PASSWORD=9055
COLLECTION_INTERVAL=3
```

#### 前端配置 (web/js/config.js)

编辑 `web/js/config.js` 文件：

```javascript
const MQTT_CONFIG = {
    hostname: 'i10a1ac9.ala.cn-hangzhou.emqxsl.cn',
    port: 8084,
    path: '/mqtt',
    username: 'dy',
    password: '9055'
};
```

**注意**: 
- `.env` 文件包含敏感信息，已加入 `.gitignore`，不会提交到GitHub
- 请复制 `.env.example` 为 `.env` 并修改配置
- 前端 `config.js` 也需要同步修改

### 4. 启动服务

#### 启动Web服务器 (终端1)

```bash
cd web
python3 -m http.server 8888
```

#### 启动数据采集 (终端2)

```bash
python3 src/collector.py
```

### 5. 访问监控界面

打开浏览器访问: http://localhost:8888

## MQTT主题说明

| 主题 | 说明 | 数据格式 |
|------|------|----------|
| sys/cpu | CPU使用率 | `{"usage": 25.5}` |
| sys/memory | 内存使用率 | `{"used": 8.2, "total": 16.0, "percent": 51.2}` |
| sys/disk | 磁盘使用率 | `{"used": 256.0, "total": 512.0, "percent": 50.0}` |
| sensor/temperature | 温度(模拟) | `{"value": 25.3, "unit": "℃"}` |
| sensor/humidity | 湿度(模拟) | `{"value": 65.0, "unit": "%"}` |

## 配置项说明

### .env 配置项

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MQTT_BROKER | MQTT服务器地址 | i10a1ac9.ala.cn-hangzhou.emqxsl.cn |
| MQTT_PORT | MQTT端口 | 8883 |
| MQTT_USERNAME | 用户名 | dy |
| MQTT_PASSWORD | 密码 | 9055 |
| COLLECTION_INTERVAL | 采集间隔(秒) | 3 |

### config.js 配置项

| 属性 | 说明 | 默认值 |
|------|------|--------|
| hostname | WebSocket服务器地址 | i10a1ac9.ala.cn-hangzhou.emqxsl.cn |
| port | WebSocket端口 | 8084 |
| path | 路径 | /mqtt |
| username | 用户名 | dy |
| password | 密码 | 9055 |

## 常见问题

### Q: MQTT连接失败
A: 检查网络是否可访问MQTT服务器，验证用户名密码是否正确

### Q: 页面显示未连接
A: 刷新页面，确认Python采集端正在运行

### Q: 图表不更新
A: 打开浏览器控制台(F12)查看是否有错误信息

### Q: 如何修改数据采集间隔
A: 编辑 `.env` 文件，修改 `COLLECTION_INTERVAL` 值

## 安全建议

1. **修改默认密码**: 修改 `.env` 和 `web/js/config.js` 中的默认密码
2. **使用私有MQTT Broker**: 生产环境建议部署私有Broker
3. **启用HTTPS**: 使用SSL证书启用HTTPS访问
4. **限制访问**: 通过防火墙限制MQTT和Web端口
5. **保护.env文件**: 敏感信息不要提交到版本控制

## 技术栈

- 后端: Python 3 + paho-mqtt + psutil + python-dotenv
- 前端: HTML5 + CSS3 + JavaScript (ES6+)
- 通信: MQTT over WebSocket (WSS)
- 可视化: Chart.js
- 服务器: EMQ X Cloud (TLS/SSL)
