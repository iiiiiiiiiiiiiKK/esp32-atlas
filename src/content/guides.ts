import type { GuideContent, I18nText } from "@/lib/types";

const s = (zh: string, en: string): I18nText => ({ zh, en });

/**
 * Hand-written project guides. Everything here is editorial and stored apart
 * from GitHub metadata, so syncs never overwrite it. Hardware lists reflect
 * what each upstream project documents; we never invent parts.
 */
export interface GuideSeed {
  fullName: string;
  confidence: "verified" | "unverified";
  content: GuideContent;
}

export const GUIDES: GuideSeed[] = [
  {
    fullName: "78/xiaozhi-esp32",
    confidence: "verified",
    content: {
      intro: s(
        "基于 MCP 协议的 ESP32 语音聊天机器人固件：设备端负责唤醒词、录音与播放，服务端处理语音识别与大模型对话。",
        "An MCP-based ESP32 voice chatbot firmware: the device handles wake word, capture and playback while the server does speech recognition and LLM dialogue.",
      ),
      prerequisites: [
        s("会使用 ESP-IDF 编译并烧录工程", "Comfortable building and flashing projects with ESP-IDF"),
        s("了解 I2S 音频与基础网络请求", "Basic knowledge of I2S audio and HTTP/WebSocket networking"),
      ],
      hardware: [
        { item: s("ESP32-S3 开发板（建议 8MB Flash + PSRAM）", "ESP32-S3 board (8 MB flash + PSRAM recommended)"), note: s("官方支持多块现成板卡，也可自行移植", "Several off-the-shelf boards are supported upstream") },
        { item: s("I2S 数字麦克风", "I2S digital microphone") },
        { item: s("I2S 功放 + 扬声器", "I2S amplifier + speaker") },
        { item: s("可选：SPI 显示屏用于表情/状态", "Optional: SPI display for expressions and status") },
      ],
      quickStart: [
        { step: s("准备 ESP-IDF 环境", "Set up ESP-IDF"), detail: s("按官方文档安装 IDF 并确认 idf.py 可用。", "Install IDF per the official docs and confirm idf.py works.") },
        { step: s("选择板型并编译", "Pick a board and build"), detail: s("用仓库提供的板型配置生成工程，执行 idf.py build。", "Generate the project from a supported board profile, then idf.py build.") },
        { step: s("烧录并配网", "Flash and provision"), detail: s("烧录后设备会开启热点，用手机完成 Wi-Fi 与设备绑定。", "After flashing, the device opens a hotspot so you can set Wi-Fi and bind it from a phone.") },
        { step: s("验证一轮对话", "Verify one dialogue round"), detail: s("唤醒后说一句话，确认设备有回复音频。", "Wake it, speak once and confirm audio comes back.") },
      ],
      docs: [
        { label: s("官方 README（刷机/配网）", "Upstream README (flash/provision)"), url: "https://github.com/78/xiaozhi-esp32/blob/main/README.md", kind: "doc" },
        { label: s("自定义开发板移植", "Custom board porting"), url: "https://github.com/78/xiaozhi-esp32/blob/main/docs/custom-board.md", kind: "doc" },
        { label: s("配套服务端", "Companion server"), url: "https://github.com/xinnan-tech/xiaozhi-esp32-server", kind: "tutorial" },
        { label: s("官方控制台", "Official console"), url: "https://xiaozhi.me/", kind: "demo" },
      ],
      faq: [
        { q: s("没有官方开发板能用吗？", "Can I use a non-official board?"), a: s("可以，但需要按 custom-board 文档写板型配置（引脚、屏幕、音频），难度明显上升。", "Yes, but you must write a board profile (pins, display, audio) following the custom-board docs — a clear step up in difficulty.") },
        { q: s("必须自己部署服务端吗？", "Do I have to self-host the server?"), a: s("不一定：官方提供了在线服务；自建服务端适合需要私有化或定制模型的场景。", "No — an official online service exists. Self-hosting makes sense for privacy or custom models.") },
      ],
      limitations: [
        s("语音链路依赖网络，离线不可用。", "The voice pipeline depends on a network connection; it does not work offline."),
        s("不同板卡的音频参数差异大，移植时经常需要反复调 I2S 配置。", "Audio parameters differ a lot between boards; porting usually needs repeated I2S tuning."),
      ],
      maintenance: s("仓库近期持续提交并有版本发布，Issue 数量较多说明社区活跃但同时需要先搜历史 Issue。", "Actively committed with recent releases. The high issue count means a lively community — search existing issues first."),
      nextSteps: [
        s("把固件移植到自己的 PCB 并整理引脚表。", "Port the firmware to your own PCB and document the pin map."),
        s("接入自建服务端，替换成自己的模型与音色。", "Point it at a self-hosted server with your own model and voice."),
      ],
    },
  },
  {
    fullName: "xinnan-tech/xiaozhi-esp32-server",
    confidence: "verified",
    content: {
      intro: s(
        "小智硬件的后端：接收设备音频、调用语音识别与大模型、合成语音回传，并提供设备与配置管理。",
        "The backend for XiaoZhi hardware: receives device audio, calls ASR and LLMs, synthesises speech, and manages devices and configuration.",
      ),
      prerequisites: [
        s("熟悉 Docker 与容器编排", "Comfortable with Docker"),
        s("了解 WebSocket 与流式音频", "Understanding of WebSocket and streaming audio"),
      ],
      hardware: [{ item: s("一台可运行容器的主机（本地或云服务器）", "A host able to run containers (local or cloud)") }],
      quickStart: [
        { step: s("准备环境", "Prepare the host"), detail: s("安装 Docker，预留可用端口与存储。", "Install Docker and free up ports and disk.") },
        { step: s("启动服务", "Start the service"), detail: s("按 README 的 compose 配置启动，检查日志无报错。", "Start it with the compose config from the README and check the logs.") },
        { step: s("配置模型与音色", "Configure models and voices"), detail: s("在管理界面填入 ASR/LLM/TTS 的凭据。", "Enter ASR/LLM/TTS credentials in the admin UI.") },
        { step: s("设备联调", "Connect a device"), detail: s("把设备指向你的服务端地址并完成一轮对话。", "Point a device at your server and complete one dialogue round.") },
      ],
      docs: [
        { label: s("仓库 README", "Repo README"), url: "https://github.com/xinnan-tech/xiaozhi-esp32-server", kind: "doc" },
        { label: s("设备端固件", "Device firmware"), url: "https://github.com/78/xiaozhi-esp32", kind: "tutorial" },
      ],
      faq: [
        { q: s("必须用付费模型吗？", "Do I need paid models?"), a: s("取决于你选的 provider；仓库支持多种可替换的语音与大模型服务，成本由你自己控制。", "That depends on the provider you choose; multiple swappable speech and LLM services are supported, so you control cost.") },
      ],
      limitations: [s("自建服务端需要自己承担可用性、密钥管理与费用。", "Self-hosting means you own availability, key management and cost.")],
      maintenance: s("活跃开发中，版本迭代较快，部署前请锁定 tag。", "Actively developed with fast iteration — pin a tag before deploying."),
      nextSteps: [s("接入自有知识库或私有模型。", "Wire in your own knowledge base or private model.")],
    },
  },
  {
    fullName: "arendst/Tasmota",
    confidence: "verified",
    content: {
      intro: s(
        "把 ESP8266/ESP32 智能设备变成可本地控制的节点：Web 界面配置、MQTT、Home Assistant 自动发现与 Matter 桥接。",
        "Turns ESP8266/ESP32 smart devices into locally controlled nodes: web configuration, MQTT, Home Assistant discovery and Matter bridging.",
      ),
      prerequisites: [s("无需编程基础即可上手", "No programming needed to get started"), s("了解 MQTT 主题与 broker 概念更佳", "MQTT topics and brokers help")],
      hardware: [
        { item: s("ESP32 或 ESP8266 设备（插座、继电器、灯具等）", "An ESP32/ESP8266 device (plug, relay, light)") },
        { item: s("USB 转 TTL 烧录器（首次刷机通常需要）", "USB-TTL adapter (usually required for the first flash)") },
      ],
      quickStart: [
        { step: s("备份原厂固件", "Back up the stock firmware"), detail: s("先导出原固件以便回退，再动手刷机。", "Dump the original firmware first so you can roll back.") },
        { step: s("网页刷机", "Flash from the browser"), detail: s("用官方 installer 选择对应模板烧录。", "Use the official installer with the matching template.") },
        { step: s("配置 Wi-Fi 与 MQTT", "Configure Wi-Fi and MQTT"), detail: s("设备起热点，填 Wi-Fi 与 broker 信息。", "The device opens a hotspot; enter Wi-Fi and broker details.") },
        { step: s("接入 Home Assistant", "Add to Home Assistant"), detail: s("开启自动发现，确认实体出现。", "Enable discovery and confirm entities appear.") },
      ],
      docs: [
        { label: s("官方入门文档", "Getting started"), url: "https://tasmota.github.io/docs/Getting-Started/", kind: "doc" },
        { label: s("网页刷机工具", "Web installer"), url: "https://tasmota.github.io/install/", kind: "demo" },
      ],
      faq: [
        { q: s("刷坏了怎么办？", "What if I brick it?"), a: s("多数设备可通过 TTL 串口重新刷入；务必先备份原固件。", "Most devices can be re-flashed over TTL serial — hence the backup step.") },
      ],
      limitations: [s("不同硬件的 GPIO 模板差异大，选错模板可能控制到错误的引脚。", "GPIO templates differ per device; picking the wrong one can drive the wrong pin.")],
      maintenance: s("长期稳定维护，版本节奏规律。", "Long-term stable maintenance with a regular release cadence."),
      nextSteps: [s("用 Berry 脚本做本地自动化。", "Add local automation with Berry scripts.")],
    },
  },
  {
    fullName: "esphome/esphome",
    confidence: "verified",
    content: {
      intro: s(
        "用 YAML 描述设备：传感器、灯光、屏幕与自动化全部声明式配置，编译后 OTA 刷入，与 Home Assistant 原生集成。",
        "Describe a device in YAML: sensors, lights, displays and automations are declarative, compiled and flashed OTA, natively integrated with Home Assistant.",
      ),
      prerequisites: [s("会编辑文本文件即可", "Editing text files is enough"), s("建议先有 Home Assistant 环境", "A Home Assistant instance helps")],
      hardware: [
        { item: s("任意受支持的 ESP32 开发板", "Any supported ESP32 board") },
        { item: s("对应传感器/执行器", "The sensor or actuator you want to control") },
      ],
      quickStart: [
        { step: s("安装 ESPHome", "Install ESPHome"), detail: s("用 HA 加载项或 pip 安装 CLI。", "Use the HA add-on or install the CLI with pip.") },
        { step: s("写第一份 YAML", "Write your first YAML"), detail: s("定义 esphome/esp32/wifi/api/logger 与一个传感器。", "Declare esphome, esp32, wifi, api, logger and one sensor.") },
        { step: s("编译烧录", "Compile and flash"), detail: s("首次用 USB，之后走 OTA。", "USB for the first flash, OTA afterwards.") },
        { step: s("在 HA 中确认实体", "Confirm entities in HA"), detail: s("检查设备与实体是否按预期出现。", "Check the device and entities appear as expected.") },
      ],
      docs: [
        { label: s("快速开始", "Getting started"), url: "https://esphome.io/guides/getting_started_hassio.html", kind: "doc" },
        { label: s("ESP32 平台配置", "ESP32 platform"), url: "https://esphome.io/components/esp32.html", kind: "doc" },
        { label: s("HA 集成说明", "HA integration"), url: "https://www.home-assistant.io/integrations/esphome/", kind: "doc" },
      ],
      faq: [
        { q: s("ESPHome 和 Tasmota 怎么选？", "ESPHome or Tasmota?"), a: s("想完全自定义引脚与逻辑、并接受重新编译，选 ESPHome；想刷完即用现成设备，选 Tasmota。", "Choose ESPHome for full pin/logic control and recompiles; Tasmota for flash-and-go on existing devices.") },
      ],
      limitations: [s("改配置需要重新编译并 OTA，不适合高频调参的探索性开发。", "Config changes require a recompile and OTA, which is slow for exploratory tuning.")],
      maintenance: s("活跃维护，按月发布，文档质量高。", "Actively maintained with monthly releases and excellent docs."),
      nextSteps: [s("把设备配置放进 Git 并用 secrets.yaml 管理凭据。", "Keep configs in Git and credentials in secrets.yaml.")],
    },
  },
  {
    fullName: "wled/WLED",
    confidence: "verified",
    content: {
      intro: s(
        "地址 LED 控制固件：Web 界面里选效果、调色、配矩阵，支持 E1.31/DDP、Hyperion 与语音助手。",
        "Addressable-LED firmware: pick effects, colours and matrix layouts in a web UI, with E1.31/DDP, Hyperion and voice-assistant support.",
      ),
      prerequisites: [s("会接线（数据线、电源、共地）", "Basic wiring: data, power, common ground")],
      hardware: [
        { item: s("ESP32 开发板", "ESP32 board") },
        { item: s("WS2812B / SK6812 等地址灯带", "An addressable strip such as WS2812B or SK6812") },
        { item: s("足够功率的 5V 电源 + 电平转换（长灯带建议）", "Adequate 5V supply and a level shifter for long strips") },
        { item: s("470Ω 串联电阻与大电容（推荐）", "470Ω series resistor and a bulk capacitor (recommended)") },
      ],
      quickStart: [
        { step: s("网页刷机", "Flash from the browser"), detail: s("用 install.wled.me 选择固件并烧录。", "Flash from install.wled.me.") },
        { step: s("连 Wi-Fi", "Join Wi-Fi"), detail: s("连接 WLED-AP 热点并填写家庭 Wi-Fi。", "Join the WLED-AP hotspot and enter your Wi-Fi.") },
        { step: s("配置灯带", "Configure the strip"), detail: s("设置 GPIO、LED 数量与颜色顺序。", "Set GPIO, LED count and colour order.") },
        { step: s("试效果与预设", "Try effects and presets"), detail: s("保存常用效果为预设，方便一键切换。", "Save favourite effects as presets for one-click recall.") },
      ],
      docs: [
        { label: s("官方入门", "Getting started"), url: "https://kno.wled.ge/basics/getting-started/", kind: "doc" },
        { label: s("网页刷机", "Web installer"), url: "https://install.wled.me/", kind: "demo" },
      ],
      faq: [
        { q: s("灯带尾部颜色发黄/闪烁？", "Colours drift or flicker at the end of the strip?"), a: s("通常是压降与电平问题：加粗电源线、注入电源、加电平转换器。", "Usually voltage drop or logic level: use thicker power wires, power injection and a level shifter.") },
      ],
      limitations: [s("灯带越长对电源与布线要求越高，不能只靠开发板 USB 供电。", "Longer strips demand better power and wiring — USB power is not enough.")],
      maintenance: s("非常活跃，版本更新频繁。", "Very active with frequent releases."),
      nextSteps: [s("接入 Hyperion 做屏幕同步氛围灯。", "Hook into Hyperion for screen-synced ambient light.")],
    },
  },
  {
    fullName: "meshtastic/firmware",
    confidence: "verified",
    content: {
      intro: s(
        "离网 LoRa 网格通信固件：无需基站与手机信号，多台设备自动组网互发消息，配合手机 App 使用。",
        "Off-grid LoRa mesh firmware: nodes form a network and exchange messages without towers or cell coverage, driven from a phone app.",
      ),
      prerequisites: [s("了解当地无线电法规", "Know your local radio regulations")],
      hardware: [
        { item: s("受支持的 ESP32 + LoRa 板卡（如 Heltec、T-Beam 类）", "A supported ESP32 + LoRa board") },
        { item: s("匹配频段的天线（务必接好再上电）", "A band-matched antenna (always attach before powering on)") },
        { item: s("手机（蓝牙配置）", "A phone for Bluetooth configuration") },
      ],
      quickStart: [
        { step: s("刷固件", "Flash firmware"), detail: s("用 flasher.meshtastic.org 选择你的板型。", "Pick your board at flasher.meshtastic.org.") },
        { step: s("手机配对", "Pair from the phone"), detail: s("安装 App 并通过蓝牙连接设备。", "Install the app and connect over Bluetooth.") },
        { step: s("设置频道与区域", "Set channel and region"), detail: s("区域必须与法规一致，否则发射功率与频段非法。", "The region must match local law or the band and power are illegal.") },
        { step: s("两台设备互发消息", "Message between two nodes"), detail: s("确认收件箱收到对方文本。", "Confirm the other node's text arrives.") },
      ],
      docs: [
        { label: s("官方入门", "Getting started"), url: "https://meshtastic.org/docs/getting-started/", kind: "doc" },
        { label: s("支持硬件清单", "Supported hardware"), url: "https://meshtastic.org/docs/hardware/devices/", kind: "doc" },
        { label: s("网页刷机", "Web flasher"), url: "https://flasher.meshtastic.org/", kind: "demo" },
      ],
      faq: [
        { q: s("为什么实际距离远小于宣传？", "Why is real range far below the marketing?"), a: s("视距、天线质量、遮挡与发射功率限制共同决定；城市环境通常只有几百米到几公里。", "Line of sight, antenna quality, obstruction and legal power limits all matter — urban links are typically hundreds of metres to a few km.") },
      ],
      limitations: [s("ESP32 版本功耗高于 nRF52 版本，长期电池供电不占优势。", "ESP32 builds draw more power than nRF52 builds, so they are weaker for long battery life.")],
      maintenance: s("活跃维护，固件与 App 同步演进。", "Actively maintained with firmware and app evolving together."),
      nextSteps: [s("做一次覆盖测距并记录丢包率。", "Run a coverage test and record packet loss.")],
    },
  },
  {
    fullName: "justcallmekoko/ESP32Marauder",
    confidence: "verified",
    content: {
      intro: s(
        "Wi-Fi/蓝牙扫描与测试工具套件，用于评估自有网络与设备的安全状况。请只在获得授权的环境中使用。",
        "A Wi-Fi/Bluetooth scanning and testing suite for auditing networks and devices you own. Use it only where you are authorised.",
      ),
      prerequisites: [s("了解 Wi-Fi/BLE 基础概念", "Basic Wi-Fi and BLE concepts"), s("明确的法律与授权边界", "A clear legal and authorisation boundary")],
      hardware: [
        { item: s("ESP32 或 ESP32-S3 开发板", "An ESP32 or ESP32-S3 board") },
        { item: s("可选：触摸屏与 GPS 模块", "Optional: touchscreen and GPS module") },
      ],
      quickStart: [
        { step: s("编译并烧录", "Build and flash"), detail: s("按 README 用 PlatformIO/Arduino 构建。", "Build with PlatformIO/Arduino per the README.") },
        { step: s("从串口菜单操作", "Use the serial menu"), detail: s("通过串口或屏幕菜单选择扫描与测试功能。", "Pick scanning and test features from the serial or on-screen menu.") },
        { step: s("只在自有网络测试", "Test only on your own networks"), detail: s("先确认授权范围，再执行任何主动测试。", "Confirm your authorisation before any active test.") },
      ],
      docs: [{ label: s("仓库 Wiki", "Repo wiki"), url: "https://github.com/justcallmekoko/ESP32Marauder/wiki", kind: "doc" }],
      faq: [
        { q: s("可以用来测试公共 Wi-Fi 吗？", "Can I test public Wi-Fi?"), a: s("不建议也不合法。未经授权对他人网络做主动测试在多数司法辖区违法。", "No. Active testing of networks you do not own is illegal in most jurisdictions.") },
      ],
      limitations: [s("部分功能依赖特定硬件（屏幕、GPS、SD 卡）。", "Some features depend on extra hardware such as a display, GPS or SD card.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("用扫描结果加固自己的 AP 配置。", "Use scan results to harden your own access points.")],
    },
  },
  {
    fullName: "lvgl/lvgl",
    confidence: "verified",
    content: {
      intro: s(
        "嵌入式图形界面库：控件、布局、动画与多语言字体，几乎所有的 ESP32 带屏项目最终都会用到它。",
        "The embedded GUI library: widgets, layouts, animations and multilingual fonts. Nearly every ESP32 project with a screen ends up using it.",
      ),
      prerequisites: [s("C 语言基础", "Working C knowledge"), s("能点亮并驱动一块 LCD", "You can already drive an LCD")],
      hardware: [
        { item: s("带屏开发板（SPI 或 RGB 接口）", "A board with an SPI or RGB panel") },
        { item: s("可选：触摸控制器或编码器", "Optional: touch controller or encoder") },
      ],
      quickStart: [
        { step: s("接好显示驱动", "Wire the display driver"), detail: s("先确保能画纯色与矩形。", "First make sure you can fill the screen with colour.") },
        { step: s("接入 LVGL", "Hook up LVGL"), detail: s("实现 flush_cb 与 tick，注册显示与输入设备。", "Implement flush_cb and tick, then register display and input.") },
        { step: s("跑官方示例", "Run an official example"), detail: s("先跑 demos/widgets，再替换成自己的界面。", "Run demos/widgets first, then swap in your own UI.") },
      ],
      docs: [
        { label: s("LVGL 介绍与移植", "Intro and porting"), url: "https://docs.lvgl.io/master/intro/index.html", kind: "doc" },
        { label: s("官方示例", "Official examples"), url: "https://docs.lvgl.io/master/examples.html", kind: "doc" },
      ],
      faq: [
        { q: s("内存不够怎么办？", "What if I run out of RAM?"), a: s("减小绘制缓冲、使用字体子集、把大图片放到 flash 或 PSRAM，并开启局部刷新。", "Shrink draw buffers, subset fonts, move images to flash or PSRAM and enable partial refresh.") },
      ],
      limitations: [s("不是通用 GUI 框架：需要自己写移植层与输入驱动。", "Not a drop-in GUI framework — you write the port and input drivers.")],
      maintenance: s("企业级维护，发布节奏稳定。", "Enterprise-backed maintenance with a steady release cadence."),
      nextSteps: [s("用 SquareLine 或 EEZ Studio 做可视化原型。", "Prototype visually with SquareLine or EEZ Studio.")],
    },
  },
  {
    fullName: "espressif/esp-idf",
    confidence: "verified",
    content: {
      intro: s(
        "乐鑫官方开发框架（C/C++ + FreeRTOS），提供完整驱动、组件管理、构建系统与安全能力，是量产项目的基准。",
        "Espressif's official framework (C/C++ + FreeRTOS) with complete drivers, component management, build system and security features — the baseline for production.",
      ),
      prerequisites: [s("C 语言与命令行基础", "C and command-line basics"), s("理解任务/队列等多任务概念更佳", "Task/queue concepts help")],
      hardware: [{ item: s("任意受支持的 ESP32 系列开发板", "Any supported ESP32-series board") }],
      quickStart: [
        { step: s("安装工具链", "Install the toolchain"), detail: s("按官方 get-started 安装，或使用 VS Code 扩展。", "Follow the official get-started guide or use the VS Code extension.") },
        { step: s("编译 hello_world", "Build hello_world"), detail: s("idf.py set-target / build / flash / monitor。", "idf.py set-target / build / flash / monitor.") },
        { step: s("切换到自己的工程", "Move to your project"), detail: s("用 idf.py create-project 建立组件化工程。", "Create a componentised project with idf.py create-project.") },
      ],
      docs: [
        { label: s("Get Started", "Get Started"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html", kind: "doc" },
        { label: s("官方示例", "Official examples"), url: "https://github.com/espressif/esp-idf/tree/master/examples", kind: "tutorial" },
        { label: s("组件管理器", "Component registry"), url: "https://components.espressif.com/", kind: "tool" },
      ],
      faq: [
        { q: s("和 Arduino 怎么选？", "IDF or Arduino?"), a: s("原型与教学用 Arduino 更快；需要精细控制、低功耗与安全特性时选 IDF。", "Arduino is faster for prototypes and teaching; choose IDF when you need fine control, low power and security features.") },
      ],
      limitations: [s("学习曲线陡峭，构建与配置概念较多。", "Steep learning curve with many build and configuration concepts.")],
      maintenance: s("官方长期维护，多分支发布。", "Officially maintained with multiple release branches."),
      nextSteps: [s("阅读官方 security 指南，规划量产烧录。", "Read the security guides and plan manufacturing flashing.")],
    },
  },
  {
    fullName: "espressif/arduino-esp32",
    confidence: "verified",
    content: {
      intro: s(
        "乐鑫官方 Arduino 核心：让 ESP32 全系列能在 Arduino IDE / PlatformIO 中开发，是新手最快的上手路径。",
        "Espressif's official Arduino core, letting the whole ESP32 family build in Arduino IDE or PlatformIO — the fastest on-ramp for beginners.",
      ),
      prerequisites: [s("无（懂一点 C 更顺）", "None (a little C helps)")],
      hardware: [{ item: s("ESP32 开发板 + USB 线", "An ESP32 board and a USB cable") }],
      quickStart: [
        { step: s("添加板管理器地址", "Add the boards URL"), detail: s("在首选项里填入官方 JSON 地址。", "Paste the official JSON URL in preferences.") },
        { step: s("安装 esp32 核心", "Install the esp32 core"), detail: s("在板管理器里安装最新稳定版。", "Install the latest stable core.") },
        { step: s("上传 Blink", "Upload Blink"), detail: s("选对板型与串口，编译上传。", "Select the right board and port, then upload.") },
      ],
      docs: [
        { label: s("安装指南", "Install guide"), url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html", kind: "doc" },
        { label: s("Wi-Fi API", "Wi-Fi API"), url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html", kind: "doc" },
        { label: s("内置库目录", "Bundled libraries"), url: "https://github.com/espressif/arduino-esp32/tree/master/libraries", kind: "tutorial" },
      ],
      faq: [
        { q: s("上传一直失败？", "Uploads keep failing?"), a: s("检查板型、串口驱动与 BOOT 按键；部分板子需要手动进入下载模式。", "Check board selection, the USB driver and the BOOT button — some boards need manual download mode.") },
      ],
      limitations: [s("抽象较高，做低功耗与实时性调优会比 IDF 麻烦。", "Higher abstraction makes low-power and real-time tuning harder than IDF.")],
      maintenance: s("官方维护，版本随 IDF 更新。", "Officially maintained, tracking IDF releases."),
      nextSteps: [s("熟悉后迁移到 PlatformIO 或 IDF。", "Move to PlatformIO or IDF once comfortable.")],
    },
  },
  {
    fullName: "DuRuofu/ESP32-Guide",
    confidence: "verified",
    content: {
      intro: s(
        "中文 ESP-IDF 系统教程：从环境搭建到外设、网络与 LVGL，按阶段推进，适合中文读者系统入门。",
        "A structured Chinese ESP-IDF course: toolchain through peripherals, networking and LVGL, staged for steady progress.",
      ),
      prerequisites: [s("C 语言基础", "Basic C")],
      hardware: [{ item: s("一块 ESP32 或 ESP32-S3 开发板", "An ESP32 or ESP32-S3 board") }],
      quickStart: [
        { step: s("通读目录结构", "Skim the outline"), detail: s("先了解基础/实践/进阶三个阶段的分工。", "Understand the basic/practical/advanced split first.") },
        { step: s("跟着做基础阶段", "Follow the basic stage"), detail: s("每节都实际编译烧录一次，不要只读。", "Build and flash every section — do not just read.") },
        { step: s("做一个小项目收尾", "Finish with a small project"), detail: s("用所学外设做一个可演示的小作品。", "Build a demo-able project from the peripherals you learned.") },
      ],
      docs: [
        { label: s("在线教程", "Online course"), url: "https://duruofu.github.io/ESP32-Guide/", kind: "doc" },
        { label: s("GitHub 仓库", "GitHub repo"), url: "https://github.com/DuRuofu/ESP32-Guide", kind: "project" },
      ],
      faq: [{ q: s("需要先学 Arduino 吗？", "Should I learn Arduino first?"), a: s("不需要，但完全没接触过单片机时，先点个灯建立信心会更容易坚持。", "Not required, though blinking an LED first builds momentum.") }],
      limitations: [s("个人维护的教程，章节深度不完全均匀；以官方文档交叉验证关键结论。", "Individually maintained, so depth varies — cross-check key claims against official docs.")],
      maintenance: s("仓库更新不频繁，但内容以文档为主，失效风险较低。", "Infrequent updates, but it is mostly prose so content ages slowly."),
      nextSteps: [s("读完进阶篇后直接读官方 IDF 文档。", "After the advanced chapters, move to the official IDF docs.")],
    },
  },
  {
    fullName: "HomeSpan/HomeSpan",
    confidence: "verified",
    content: {
      intro: s(
        "Arduino 生态里的原生 HomeKit 库：几行代码即可让 ESP32 变成 Apple 家庭 App 中可直接添加的配件。",
        "Native HomeKit for Arduino: a few lines turn an ESP32 into an accessory addable from Apple's Home app.",
      ),
      prerequisites: [s("Arduino 基础", "Arduino basics"), s("一台 Apple 设备用于配对", "An Apple device for pairing")],
      hardware: [{ item: s("ESP32 或 C3/S3 开发板", "An ESP32, C3 or S3 board") }, { item: s("你要控制的外设（继电器、传感器等）", "The device you want to control") }],
      quickStart: [
        { step: s("安装库", "Install the library"), detail: s("在 Arduino 库管理器里搜索 HomeSpan。", "Search HomeSpan in the Arduino library manager.") },
        { step: s("跑示例", "Run an example"), detail: s("先用 Example 1 熟悉配对码与串口日志。", "Start with Example 1 to learn the pairing code and serial log.") },
        { step: s("定义自己的配件", "Define your accessory"), detail: s("按 HomeKit 服务模型组合 Service/Characteristic。", "Compose Service/Characteristic per the HomeKit model.") },
        { step: s("配对与控制", "Pair and control"), detail: s("用家庭 App 扫码添加并测试开关。", "Add it via the Home app QR and test toggling.") },
      ],
      docs: [{ label: s("官方 README", "Official README"), url: "https://github.com/HomeSpan/HomeSpan/blob/master/README.md", kind: "doc" }],
      faq: [{ q: s("需要 MFi 认证吗？", "Do I need MFi certification?"), a: s("HomeSpan 是非商业/DIY 方案；商业量产 HomeKit 配件需要 Apple 的认证流程。", "HomeSpan targets non-commercial/DIY use; commercial HomeKit products need Apple's certification programme.") }],
      limitations: [s("HomeKit 认证、固件更新与多设备同步仍需自己处理。", "Certification, firmware updates and multi-device sync are still your problem.")],
      maintenance: s("作者长期维护，更新稳定。", "Maintained steadily by the author."),
      nextSteps: [s("把多个配件合并到一个桥接设备。", "Bundle several accessories behind one bridge.")],
    },
  },
  {
    fullName: "witnessmenow/ESP32-Cheap-Yellow-Display",
    confidence: "verified",
    content: {
      intro: s(
        "围绕廉价黄色触摸屏开发板（CYD）的社区项目合集：屏幕驱动、LVGL 示例与多个可直接刷入的项目。",
        "A community hub for the cheap yellow display (CYD): display drivers, LVGL samples and several ready-to-flash projects.",
      ),
      prerequisites: [s("Arduino 基础", "Arduino basics")],
      hardware: [{ item: s("CYD 开发板（ESP32 + 2.8\" 触摸屏）", "A CYD board (ESP32 + 2.8\" touch panel)") }],
      quickStart: [
        { step: s("认准型号", "Identify your variant"), detail: s("CYD 有多个版本，屏幕驱动与触摸芯片不同。", "There are several variants with different display and touch chips.") },
        { step: s("安装对应库", "Install the matching libraries"), detail: s("按 README 说明安装 TFT_eSPI 配置或直接使用现成固件。", "Follow the README for TFT_eSPI configuration or use a prebuilt binary.") },
        { step: s("跑一个示例项目", "Run a sample project"), detail: s("先跑天气或时钟示例，确认屏幕与触摸都正常。", "Start with the weather or clock sample to validate display and touch.") },
      ],
      docs: [{ label: s("官方 README 索引", "README index"), url: "https://github.com/witnessmenow/ESP32-Cheap-Yellow-Display/blob/main/README.md", kind: "doc" }],
      faq: [{ q: s("屏幕颜色不对/倒置？", "Colours inverted or image mirrored?"), a: s("多为板型差异导致：调整 TFT_eSPI 的 User_Setup 中反转与镜像参数。", "Usually a board variant issue — adjust the invert and mirror flags in TFT_eSPI's User_Setup.") }],
      limitations: [s("CYD 内存与引脚受限，复杂 LVGL 界面需要仔细裁剪。", "CYD has limited RAM and pins; complex LVGL UIs need careful trimming.")],
      maintenance: s("社区持续更新示例与板型说明。", "Community keeps samples and board notes updated."),
      nextSteps: [s("把 CYD 做成 Home Assistant 控制面板。", "Turn the CYD into a Home Assistant panel.")],
    },
  },
  {
    fullName: "FastLED/FastLED",
    confidence: "verified",
    content: {
      intro: s("Arduino 生态最成熟的 LED 动画库，适合写自定义灯效与矩阵动画，示例覆盖从呼吸灯到音频响应。", "The most mature LED animation library for Arduino — custom effects and matrix animations, from fades to audio reactivity."),
      prerequisites: [s("Arduino 基础与 C++ 语法", "Arduino basics and C++ syntax")],
      hardware: [{ item: s("ESP32 开发板", "ESP32 board") }, { item: s("WS2812B 等灯带", "A WS2812B-class strip") }, { item: s("独立 5V 电源", "A separate 5V supply") }],
      quickStart: [
        { step: s("安装库", "Install the library"), detail: s("库管理器安装 FastLED，跑 Blink 示例。", "Install FastLED and run the Blink example.") },
        { step: s("确认颜色顺序", "Confirm colour order"), detail: s("RGB/GRB 弄错会得到错误颜色。", "Wrong RGB/GRB order gives wrong colours.") },
        { step: s("做动画", "Build an animation"), detail: s("用 CRGB 数组 + 时间函数实现渐变与追光。", "Use a CRGB array plus time functions for fades and chases.") },
      ],
      docs: [{ label: s("仓库文档与示例", "Repo docs and examples"), url: "https://github.com/FastLED/FastLED", kind: "doc" }],
      faq: [{ q: s("灯带只亮第一颗？", "Only the first LED lights up?"), a: s("检查数据方向、电平与 LED 数量配置；长灯带需要电平转换。", "Check data direction, logic level and the LED count; long strips need a level shifter.") }],
      limitations: [s("只负责驱动与动画，不含网络与界面。", "Drivers and animation only — no networking or UI.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("把效果暴露成 HTTP 接口，用手机切换。", "Expose effects over HTTP for phone control.")],
    },
  },
  {
    fullName: "bdring/FluidNC",
    confidence: "verified",
    content: {
      intro: s("运行在 ESP32 上的 CNC 运动控制固件，用浏览器完成配置与调试，适合自制雕刻机与激光机。", "CNC motion-control firmware on ESP32 with browser-based configuration — for DIY routers and laser cutters."),
      prerequisites: [s("了解 G-code 与机床坐标", "G-code and machine coordinates"), s("机械装配与安全常识", "Mechanical assembly and safety sense")],
      hardware: [{ item: s("ESP32 控制板（或 6-pack 类专用板）", "An ESP32 controller board") }, { item: s("步进驱动与电机", "Stepper drivers and motors") }, { item: s("急停开关（强烈建议）", "An emergency stop (strongly recommended)") }],
      quickStart: [
        { step: s("刷固件", "Flash the firmware"), detail: s("按官方发布包烧录对应板型固件。", "Flash the matching board build from the official release.") },
        { step: s("连 WebUI 配置", "Configure in the WebUI"), detail: s("在浏览器里设置行程、限位与电机参数。", "Set travel, limits and motor parameters in the browser.") },
        { step: s("空跑验证", "Dry run"), detail: s("先不装刀具，验证运动方向与限位。", "Run without a tool to verify direction and limits.") },
      ],
      docs: [{ label: s("官方文档站", "Official docs"), url: "https://github.com/bdring/FluidNC/wiki", kind: "doc" }],
      faq: [{ q: s("电机方向反了？", "Motor spins the wrong way?"), a: s("修改对应轴的 direction 位掩码，不要改接线。", "Flip the axis direction bitmask rather than rewiring.") }],
      limitations: [s("机床安全完全由使用者负责，软件限位不能替代物理急停。", "Machine safety is your responsibility; software limits are no substitute for a physical E-stop.")],
      maintenance: s("发布节奏稳定。", "Steady release cadence."),
      nextSteps: [s("加装探针做自动对刀。", "Add a probe for auto tool setting.")],
    },
  },
  {
    fullName: "peng-zhihui/HoloCubic",
    confidence: "unverified",
    content: {
      intro: s("带网络功能的伪全息透明显示桌面站，经典的 ESP32 结构 + 固件全栈开源项目。", "A pseudo-holographic transparent desktop display with networking — a classic full-stack ESP32 hardware and firmware project."),
      prerequisites: [s("能焊接与做简单结构装配", "Soldering and light mechanical assembly"), s("Arduino/ESP32 基础", "Arduino/ESP32 basics")],
      hardware: [
        { item: s("ESP32 模块 + 分光棱镜", "ESP32 module plus a beam-splitting prism"), note: s("物料清单以仓库内文档为准，部分零件已难购买", "Check the in-repo BOM; some parts are hard to source now") },
        { item: s("0.96\" 或 1.3\" TFT 屏", "A 0.96\" or 1.3\" TFT panel") },
      ],
      quickStart: [
        { step: s("核对物料", "Verify the BOM"), detail: s("先确认关键件（棱镜、屏幕）还能买到。", "First confirm key parts (prism, panel) are still purchasable.") },
        { step: s("烧录固件", "Flash firmware"), detail: s("按仓库说明编译固件并验证显示。", "Build per the repo notes and verify the display.") },
        { step: s("组装结构", "Assemble"), detail: s("按结构文件装配，注意棱镜角度。", "Assemble from the structure files, minding prism angle.") },
      ],
      docs: [{ label: s("仓库 README 与结构文件", "Repo README and structure files"), url: "https://github.com/peng-zhihui/HoloCubic/blob/main/README.md", kind: "doc" }],
      faq: [{ q: s("还能复刻吗？", "Is it still reproducible?"), a: s("可行性取决于是非能找到当年的物料；仓库多年未更新，请把本项目当作学习参考而非即买即做。", "It depends on sourcing the original parts. The repo has been dormant for years — treat it as a learning reference, not a build-it-tonight kit.") }],
      limitations: [s("最近提交距今较久，依赖版本与物料可能已变化。", "No recent commits, so dependencies and parts may have moved on.")],
      maintenance: s("已长期无更新，视作归档级参考项目。", "Dormant for years — treat as archival reference."),
      nextSteps: [s("用 S3 + 现成 RGB 屏做更现代的替代方案。", "Modernise with an S3 board and an off-the-shelf RGB panel.")],
    },
  },
  {
    fullName: "lmarzen/esp32-weather-epd",
    confidence: "verified",
    content: {
      intro: s("低功耗电子墨水天气站：定时联网拉取天气与日历数据，深度睡眠唤醒刷新，附接线图与配置说明。", "A low-power e-paper weather station: periodically fetches weather and calendar data, refreshes from deep sleep, with wiring and config docs."),
      prerequisites: [
        s("PlatformIO 或 Arduino 基础", "PlatformIO or Arduino basics"),
        s("一个可用的天气数据 API 密钥", "A working weather data API key"),
      ],
      hardware: [
        { item: s("ESP32 开发板", "ESP32 board") },
        { item: s("7.5\" 电子墨水屏（项目默认型号）", "A 7.5\" e-paper panel (project default)") },
        { item: s("锂电池或 USB 供电", "Li-ion cell or USB power") },
      ],
      quickStart: [
        { step: s("准备配置", "Prepare config"), detail: s("复制示例配置文件，填入 Wi-Fi、API 密钥与位置。", "Copy the example config and fill in Wi-Fi, API key and location.") },
        { step: s("编译烧录", "Build and flash"), detail: s("PlatformIO 编译并烧录。", "Build and flash with PlatformIO.") },
        { step: s("验证刷新与睡眠", "Verify refresh and sleep"), detail: s("确认首屏刷新完整，且能按时唤醒。", "Confirm a full first refresh and correct wake-up.") },
      ],
      docs: [{ label: s("官方 README（含接线）", "README with wiring"), url: "https://github.com/lmarzen/esp32-weather-epd/blob/main/README.md", kind: "doc" }],
      faq: [{ q: s("墨水屏刷新很慢正常吗？", "Is slow refresh normal?"), a: s("正常，全刷常需数秒；局部刷新可提速但可能留下残影。", "Yes. A full refresh takes seconds; partial refresh is faster but can ghost.") }],
      limitations: [s("依赖第三方天气 API，接口变更会影响显示内容。", "Depends on third-party weather APIs, so schema changes can break the display.")],
      maintenance: s("维护中，更新不算频繁但问题响应及时。", "Maintained, with responsive fixes if not frequent releases."),
      nextSteps: [s("加电池管理把续航拉到数月。", "Add battery management to reach months of runtime.")],
    },
  },
  {
    fullName: "stack-chan/stack-chan",
    confidence: "verified",
    content: {
      intro: s("M5Stack 上的桌面小机器人：舵机驱动的表情动作 + JavaScript 固件，可接入对话模型做语音互动。", "A desktop robot on M5Stack: servo-driven expressions with a JavaScript firmware, pluggable into a dialogue model for voice interaction."),
      prerequisites: [s("能组装小型结构件", "Comfortable with small mechanical assembly"), s("了解 M5Stack 平台", "Familiarity with M5Stack")],
      hardware: [{ item: s("M5Stack Core2 / CoreS3", "M5Stack Core2 or CoreS3") }, { item: s("SG90 舵机（多枚）", "Several SG90 servos") }, { item: s("3D 打印外壳与伺服支架", "3D-printed shell and servo brackets") }],
      quickStart: [
        { step: s("打印与组装", "Print and assemble"), detail: s("按开源结构文件准备外壳，先装舵机再上主板。", "Prepare the shell from the open structure files, mounting servos before the mainboard.") },
        { step: s("刷入固件", "Flash firmware"), detail: s("按 README 用 Moddable/JavaScript 固件烧录。", "Flash the JavaScript firmware per the README.") },
        { step: s("调表情", "Tune expressions"), detail: s("调整舵机角度与其最小值/最大值。", "Adjust servo angles and their min/max limits.") },
      ],
      docs: [{ label: s("官方 README 与文档", "README and docs"), url: "https://github.com/stack-chan/stack-chan", kind: "doc" }],
      faq: [{ q: s("舵机抖动/发热？", "Servos jitter or overheat?"), a: s("通常是力矩不足或角度越界，减轻结构、设置合理行程与独立供电。", "Usually torque limits or out-of-range angles — lighten the structure, clamp travel and power servos separately.") }],
      limitations: [s("需要 3D 打印与机械装配能力。", "Requires 3D printing and mechanical assembly.")],
      maintenance: s("持续维护，社区有衍生方案。", "Maintained with community forks."),
      nextSteps: [s("接入语音对话做完整桌面助手。", "Add voice dialogue for a full desktop assistant.")],
    },
  },
  {
    fullName: "PetoiCamp/OpenCat-Quadruped-Robot",
    confidence: "verified",
    content: {
      intro: s("开源四足机器狗框架，包含步态算法、舵机控制与积木式编程接口，并有完整硬件结构与教程。", "Open-source quadruped framework with gait algorithms, servo control and block-based programming, shipped with hardware structure and tutorials."),
      prerequisites: [s("机械装配经验", "Mechanical assembly experience"), s("C++ 与 Arduino 基础", "C++ and Arduino basics")],
      hardware: [{ item: s("Petoi 机器狗套件或等价结构件", "A Petoi kit or equivalent structure") }, { item: s("舵机与驱动板", "Servos and driver board") }, { item: s("电池与充电器", "Battery and charger") }],
      quickStart: [
        { step: s("按官方教程组装", "Assemble per the official guide"), detail: s("先按校准姿态安装舵机，不要通电乱转。", "Mount servos at the calibration pose first; do not power them arbitrarily.") },
        { step: s("刷官方固件", "Flash official firmware"), detail: s("用官方工具烧录并做舵机校准。", "Flash with the official tool and calibrate servos.") },
        { step: s("跑基础步态", "Run basic gaits"), detail: s("先直线行走，再加转向与平衡。", "Walk straight first, then add turning and balance.") },
      ],
      docs: [{ label: s("官方文档", "Official docs"), url: "https://docs.petoi.com/", kind: "doc" }],
      faq: [{ q: s("能只买结构自己配电子件吗？", "Can I buy only the structure?"), a: s("可以，但需要自行匹配舵机型号与驱动，官方文档给了参数参考。", "Yes, but you must match servos and drivers yourself — the docs give reference parameters.") }],
      limitations: [s("商用套件为主，纯 DIY 复刻成本与时间更高。", "Primarily sold as a kit; pure DIY replication costs more time and money.")],
      maintenance: s("维护中，硬件迭代快于软件。", "Maintained, with hardware iterating faster than software."),
      nextSteps: [s("加 IMU 闭环与视觉跟随。", "Add IMU closed loop and visual tracking.")],
    },
  },
  {
    fullName: "dorianborian/sesame-robot",
    confidence: "verified",
    content: {
      intro: s("低成本 3D 打印迷你四足机器人，包含结构文件与 ESP32 控制固件，适合动手能力强的创客。", "An affordable 3D-printed mini quadruped with printable structure files and ESP32 control firmware — for hands-on makers."),
      prerequisites: [s("3D 打印与装配", "3D printing and assembly"), s("Arduino 基础", "Arduino basics")],
      hardware: [{ item: s("ESP32 开发板", "ESP32 board") }, { item: s("8 个微型舵机", "Eight micro servos") }, { item: s("3D 打印结构件与紧固件", "Printed parts and fasteners") }],
      quickStart: [
        { step: s("打印结构", "Print the structure"), detail: s("按仓库 STL 打印并试装。", "Print the STLs and dry-fit.") },
        { step: s("装配舵机", "Mount servos"), detail: s("按校准姿态安装，避免行程越界。", "Mount at the calibration pose to avoid over-travel.") },
        { step: s("烧录固件", "Flash firmware"), detail: s("Arduino 打开工程，配置引脚后上传。", "Open the Arduino project, set pins and upload.") },
      ],
      docs: [{ label: s("官方 README", "Official README"), url: "https://github.com/dorianborian/sesame-robot", kind: "doc" }],
      faq: [{ q: s("走路总是摔？", "It keeps falling over?"), a: s("先降低步频与抬腿高度，再检查重心与足端摩擦。", "Slow the gait and lower the step height first, then check centre of mass and foot grip.") }],
      limitations: [s("文档相对轻量，遇到问题需要读代码。", "Documentation is light, so expect to read the code.")],
      maintenance: s("维护中。", "Maintained."),
      nextSteps: [s("加遥控或手机端调参。", "Add a remote control or phone tuning.")],
    },
  },
  {
    fullName: "espressif/esp-drone",
    confidence: "verified",
    content: {
      intro: s("乐鑫官方迷你四轴无人机固件，包含姿态控制、遥控链路与配套硬件设计，属于进阶嵌入式项目。", "Espressif's official mini quadcopter firmware: attitude control, RC link and companion hardware design — an advanced embedded project."),
      prerequisites: [s("控制理论（PID）基础", "Basic control theory (PID)"), s("能安全测试飞行器", "A safe place to test a flying machine")],
      hardware: [{ item: s("官方无人机参考硬件（机架、电机、桨）", "Official reference hardware (frame, motors, props)") }, { item: s("遥控器或手机 App", "RC transmitter or phone app") }],
      quickStart: [
        { step: s("按官方文档装硬件", "Assemble per docs"), detail: s("严格按参考设计装配，桨叶方向必须正确。", "Follow the reference design; prop direction must be correct.") },
        { step: s("烧录固件并校准", "Flash and calibrate"), detail: s("完成陀螺与加速度计校准。", "Calibrate gyro and accelerometer.") },
        { step: s("系绳试飞", "Tethered test"), detail: s("先系绳验证姿态响应，再自由飞行。", "Verify attitude response on a tether before free flight.") },
      ],
      docs: [{ label: s("官方 README", "Official README"), url: "https://github.com/espressif/esp-drone", kind: "doc" }],
      faq: [{ q: s("适合新手吗？", "Is this beginner friendly?"), a: s("不适合。涉及气动、控制与飞行安全，建议先做地面机器人。", "No. It involves aerodynamics, control and flight safety — start with a ground robot.") }],
      limitations: [s("飞行安全风险高，务必在合规场地并有防护措施。", "High flight-safety risk; fly legally and with protection.")],
      maintenance: s("官方维护，更新节奏跟随 IDF。", "Officially maintained, tracking IDF."),
      nextSteps: [s("加光流或定高传感器提升稳定性。", "Add optical flow or altitude hold for stability.")],
    },
  },
  {
    fullName: "tbnobody/OpenDTU",
    confidence: "verified",
    content: {
      intro: s("读取光伏逆变器实时发电数据的开源固件，通过 Web 界面与 MQTT 接入家庭能源自动化。", "Open firmware that reads live solar-inverter data and exposes it via a web UI and MQTT for home energy automation."),
      prerequisites: [s("会刷 ESP32 固件", "Comfortable flashing ESP32 firmware")],
      hardware: [{ item: s("ESP32 开发板", "ESP32 board") }, { item: s("nRF24L01+ 无线模块（多数逆变器需要）", "An nRF24L01+ radio (needed for most inverters)") }, { item: s("受支持的逆变器型号", "A supported inverter model") }],
      quickStart: [
        { step: s("核对兼容性", "Check compatibility"), detail: s("先确认逆变器型号在支持列表内。", "Confirm your inverter is on the supported list.") },
        { step: s("刷固件", "Flash firmware"), detail: s("用官方 Web installer 烧录。", "Flash with the official web installer.") },
        { step: s("配置逆变器与 MQTT", "Configure inverter and MQTT"), detail: s("填逆变器序列号与 broker 信息。", "Enter the inverter serial and broker details.") },
      ],
      docs: [{ label: s("官方文档", "Official docs"), url: "https://www.opendtu.solar/", kind: "doc" }],
      faq: [{ q: s("读不到数据？", "No data?"), a: s("多为 nRF24 供电与天线问题：加电容、缩短排线、换优质模块。", "Usually nRF24 power or antenna issues — add a capacitor, shorten leads, use a better module.") }],
      limitations: [s("仅支持特定逆变器品牌与型号。", "Supports only specific inverter brands and models.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("接入 Home Assistant 做发电统计与自动策略。", "Feed Home Assistant for generation stats and automation.")],
    },
  },
  {
    fullName: "ESPresense/ESPresense",
    confidence: "verified",
    content: {
      intro: s("用 BLE 信号做室内定位与房间级在场检测，配合 Home Assistant 实现「人走灯灭」类自动化。", "Room-level presence detection from BLE signal strength, feeding Home Assistant automations such as lights that follow you."),
      prerequisites: [s("有 Home Assistant 环境", "A Home Assistant setup"), s("理解 BLE 与信号强度概念", "BLE and RSSI concepts")],
      hardware: [{ item: s("多个 ESP32 节点（每个房间一个）", "Several ESP32 nodes (one per room)") }, { item: s("被追踪的 BLE 设备（手机、手环、标签）", "BLE devices to track (phone, band, tag)") }],
      quickStart: [
        { step: s("布置节点", "Place the nodes"), detail: s("每房间一个，注意供电与位置。", "One per room, minding power and placement.") },
        { step: s("刷固件并配置", "Flash and configure"), detail: s("在 Web 界面填入 MQTT 与房间信息。", "Enter MQTT and room info in the web UI.") },
        { step: s("校准指纹", "Calibrate fingerprints"), detail: s("每个房间走一遍，让系统学习信号指纹。", "Walk each room so the system learns the fingerprint.") },
      ],
      docs: [{ label: s("官方文档", "Official docs"), url: "https://espresense.com/", kind: "doc" }],
      faq: [{ q: s("定位不准？", "Inaccurate location?"), a: s("增加节点密度、固定发射功率、关闭手机随机 MAC，并重新校准。", "Add nodes, fix transmit power, disable MAC randomisation and recalibrate.") }],
      limitations: [s("BLE 定位受墙体与人体遮挡影响，房间级可靠、米级不可靠。", "BLE is affected by walls and bodies: room-level works, metre-level does not.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("结合门磁与光照做更稳的自动化。", "Combine with door and lux sensors for robust automations.")],
    },
  },
  {
    fullName: "HASwitchPlate/openHASP",
    confidence: "verified",
    content: {
      intro: s("把廉价触摸屏变成 Home Assistant 控制面板的固件，界面用 JSON 描述，改界面不用重新编译。", "Firmware that turns cheap touchscreens into Home Assistant panels; the UI is JSON-described, so redesigns need no recompile."),
      prerequisites: [s("有 Home Assistant", "A Home Assistant instance"), s("会写 JSON 更佳", "JSON familiarity helps")],
      hardware: [{ item: s("受支持的 ESP32 + 触摸屏（如 Lanbon、Sunton 类面板）", "A supported ESP32 touch panel") }],
      quickStart: [
        { step: s("刷固件", "Flash firmware"), detail: s("用官方 Web installer 选择板型。", "Pick your board in the official web installer.") },
        { step: s("连 MQTT", "Connect MQTT"), detail: s("填 broker 与 Home Assistant 连接信息。", "Enter broker and Home Assistant details.") },
        { step: s("上传界面", "Upload a UI"), detail: s("用 JSON 或设计工具生成页面并上传。", "Generate pages as JSON or with the designer and upload.") },
      ],
      docs: [{ label: s("官方文档", "Official docs"), url: "https://www.openhasp.com/", kind: "doc" }],
      faq: [{ q: s("支持我的屏吗？", "Is my panel supported?"), a: s("先查官方硬件列表；不支持时需自行适配显示/触摸驱动。", "Check the official hardware list; unsupported panels need custom display/touch drivers.") }],
      limitations: [s("板型适配依赖社区，冷门屏需要自己写驱动。", "Board support is community-driven; obscure panels need custom drivers.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("做家庭总控面板与场景切换。", "Build a whole-home control panel with scenes.")],
    },
  },
  {
    fullName: "tzapu/WiFiManager",
    confidence: "verified",
    content: {
      intro: s("配网神器：设备起一个热点，手机连上填写 Wi-Fi 密码即可联网，避免把凭据硬编码进固件。", "The classic provisioning library: the board starts a hotspot, you enter credentials from a phone, and no Wi-Fi password is hardcoded."),
      prerequisites: [s("Arduino 基础", "Arduino basics")],
      hardware: [{ item: s("ESP32 开发板", "ESP32 board") }],
      quickStart: [
        { step: s("安装库", "Install the library"), detail: s("库管理器安装 WiFiManager。", "Install WiFiManager from the library manager.") },
        { step: s("加几行代码", "Add a few lines"), detail: s("autoConnect 即可在无配置时开启配网热点。", "autoConnect opens the portal when no credentials exist.") },
        { step: s("验证持久化", "Verify persistence"), detail: s("重启后应自动连上已保存的 Wi-Fi。", "It should reconnect automatically after reboot.") },
      ],
      docs: [{ label: s("仓库 README", "Repo README"), url: "https://github.com/tzapu/WiFiManager", kind: "doc" }],
      faq: [{ q: s("配网页面打不开？", "Portal will not open?"), a: s("检查是否已保存凭据与超时设置，并确认手机连的是设备热点。", "Check saved credentials and timeout settings, and make sure the phone joined the device hotspot.") }],
      limitations: [s("不处理凭据加密存储，敏感场景需自行加保护。", "Does not encrypt stored credentials — add protection for sensitive deployments.")],
      maintenance: s("维护中，更新节奏较慢但可用。", "Maintained, though releases are infrequent."),
      nextSteps: [s("结合 captive portal 做完整首次开机流程。", "Combine with a captive portal for a full first-boot flow.")],
    },
  },
  {
    fullName: "bblanchon/ArduinoJson",
    confidence: "verified",
    content: {
      intro: s("嵌入式 JSON 库的标配，用来解析 MQTT 消息、REST 响应与配置文件，文档与示例质量极高。", "The standard embedded JSON library for MQTT payloads, REST responses and config files — with unusually good docs and examples."),
      prerequisites: [s("C++ 基础", "C++ basics")],
      hardware: [{ item: s("任意 ESP32 开发板（纯软件库）", "Any ESP32 board (library only)") }],
      quickStart: [
        { step: s("安装库", "Install"), detail: s("库管理器安装 ArduinoJson 7.x。", "Install ArduinoJson 7.x from the library manager.") },
        { step: s("按容量规划", "Plan capacity"), detail: s("用 Assistant 估算 JSON 文档容量。", "Use the Assistant to size the JsonDocument.") },
        { step: s("解析与序列化", "Parse and serialise"), detail: s("先 deserialize 再取字段，注意类型转换。", "Deserialize then read fields, minding type conversions.") },
      ],
      docs: [{ label: s("官方文档", "Official docs"), url: "https://arduinojson.org/", kind: "doc" }],
      faq: [{ q: s("解析返回 NoMemory？", "Parse returns NoMemory?"), a: s("容量不足：加大 JsonDocument 或改用流式解析。", "Not enough capacity — grow the JsonDocument or parse as a stream.") }],
      limitations: [s("不是通用 JSON 库：为嵌入式内存约束做了设计取舍。", "Not a general-purpose JSON library — designed around embedded memory limits.")],
      maintenance: s("活跃维护，作者响应积极。", "Actively maintained with a responsive author."),
      nextSteps: [s("用 JsonDocument 做设备配置持久化 + 校验。", "Use JsonDocument for validated config persistence.")],
    },
  },
  {
    fullName: "lovyan03/LovyanGFX",
    confidence: "verified",
    content: {
      intro: s("高性能 SPI LCD/EPD 图形库，DMA 加速、板型配置丰富，是 TFT_eSPI 的常用替代方案。", "High-performance SPI LCD/EPD graphics library with DMA acceleration and many board profiles — a common alternative to TFT_eSPI."),
      prerequisites: [s("C++ 基础与显示驱动经验", "C++ and display driver experience")],
      hardware: [{ item: s("ESP32 + SPI 屏", "ESP32 plus an SPI panel") }],
      quickStart: [
        { step: s("选板型配置", "Pick a board profile"), detail: s("LGFX_Device 子类里选现成配置或自定义。", "Use a ready LGFX_Device subclass or roll your own.") },
        { step: s("初始化并画图", "Init and draw"), detail: s("确认分辨率、偏移与颜色顺序。", "Verify resolution, offsets and colour order.") },
        { step: s("开启 DMA", "Enable DMA"), detail: s("把大块刷新交给 DMA，CPU 去算下一帧。", "Move bulk transfers to DMA while the CPU computes the next frame.") },
      ],
      docs: [{ label: s("仓库示例", "Repo examples"), url: "https://github.com/lovyan03/LovyanGFX", kind: "doc" }],
      faq: [{ q: s("和 TFT_eSPI 怎么选？", "LovyanGFX or TFT_eSPI?"), a: s("需要更多板型与高级特性选 LovyanGFX；追求最少改动选 TFT_eSPI。", "LovyanGFX for more board profiles and features; TFT_eSPI for minimal changes.") }],
      limitations: [s("接口与配置较多，初次上手需要读示例。", "Many interfaces and options; expect to read examples first.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("把 LovyanGFX 作为 LVGL 的 flush 后端。", "Use LovyanGFX as the LVGL flush backend.")],
    },
  },
  {
    fullName: "schreibfaul1/ESP32-audioI2S",
    confidence: "verified",
    content: {
      intro: s("ESP32 音频播放库：从网络流或 SD 卡播放 MP3/AAC/FLAC 到 I2S 解码器，是自制音箱与语音设备的基础件。", "Audio playback for ESP32: stream MP3/AAC/FLAC from network or SD into an I2S DAC — a building block for DIY speakers and voice devices."),
      prerequisites: [s("Arduino 基础", "Arduino basics"), s("了解 I2S 接线", "I2S wiring knowledge")],
      hardware: [{ item: s("ESP32-S3 或 ESP32 开发板", "ESP32-S3 or ESP32 board") }, { item: s("I2S DAC（如 PCM5102）与功放", "An I2S DAC such as PCM5102 plus an amp") }, { item: s("扬声器", "Speaker") }],
      quickStart: [
        { step: s("接好 I2S", "Wire I2S"), detail: s("BCLK/LRC/DOUT 与 DAC 对应接好，共地。", "Connect BCLK/LRC/DOUT to the DAC with a common ground.") },
        { step: s("跑示例", "Run the example"), detail: s("先用 SD 卡播放一首固定格式的音频。", "Play a known-good file from SD first.") },
        { step: s("换网络流", "Switch to streaming"), detail: s("换成 HTTP 流地址，观察缓冲与卡顿。", "Switch to an HTTP stream and watch buffering.") },
      ],
      docs: [{ label: s("仓库 README", "Repo README"), url: "https://github.com/schreibfaul1/ESP32-audioI2S", kind: "doc" }],
      faq: [{ q: s("有杂音或断续？", "Crackling or dropouts?"), a: s("多为缓冲不足与 Wi-Fi 干扰：增大缓冲、提高供电质量、缩短接线。", "Usually buffering and Wi-Fi noise — increase buffer, improve power, shorten wires.") }],
      limitations: [s("只管播放，不含录音与语音识别。", "Playback only — no recording or speech recognition.")],
      maintenance: s("活跃维护。", "Actively maintained."),
      nextSteps: [s("与语音助手固件组合做完整语音终端。", "Combine with a voice-assistant firmware for a full voice terminal.")],
    },
  },
  {
    fullName: "smartHomeHub/SmartIR",
    confidence: "verified",
    content: {
      intro: s("Home Assistant 集成，用红外发射/接收控制空调、电视等家电，内置大量遥控码库。", "A Home Assistant integration that controls ACs, TVs and other IR appliances, with a large built-in code library."),
      prerequisites: [s("有 Home Assistant 与 ESPHome", "Home Assistant and ESPHome"), s("会接线红外发射管", "IR LED wiring")],
      hardware: [{ item: s("ESP32 开发板", "ESP32 board") }, { item: s("红外发射管与接收头", "IR emitter and receiver") }],
      quickStart: [
        { step: s("装集成", "Install the integration"), detail: s("通过 HACS 安装 SmartIR。", "Install SmartIR via HACS.") },
        { step: s("准备 ESPHome 红外设备", "Prepare an ESPHome IR device"), detail: s("用 remote_transmitter 组件输出红外码。", "Use the remote_transmitter component to emit codes.") },
        { step: s("导入码库", "Import a code set"), detail: s("选对应品牌型号的 JSON 码库并测试。", "Pick the matching brand/model JSON and test.") },
      ],
      docs: [{ label: s("官方仓库", "Official repo"), url: "https://github.com/smartHomeHub/SmartIR", kind: "doc" }],
      faq: [{ q: s("空调控制不生效？", "AC commands do nothing?"), a: s("先用接收头抓原遥控码，确认协议与码库一致。", "Capture the original remote with a receiver first and confirm the protocol matches.") }],
      limitations: [s("红外是单向通信，无法确认设备真实状态。", "IR is one-way — you cannot confirm actual device state.")],
      maintenance: s("仍在维护，但更新不算频繁。", "Still maintained, with infrequent updates."),
      nextSteps: [s("配合温湿度传感器做自动控温。", "Combine with a temp/humidity sensor for closed-loop control.")],
    },
  },
  {
    fullName: "bruhautomation/ESP-MQTT-JSON-Multisensor",
    confidence: "unverified",
    content: {
      intro: s("经典的多传感器 + MQTT 教学项目（温湿度/气压/光照），代码简洁易读，适合学习数据上报结构。", "A classic multi-sensor + MQTT teaching project (temp/humidity/pressure/light) with small, readable code for learning telemetry structure."),
      prerequisites: [s("Arduino 基础", "Arduino basics"), s("有 MQTT broker", "An MQTT broker")],
      hardware: [{ item: s("ESP8266 或 ESP32 开发板", "ESP8266 or ESP32 board"), note: s("原始项目面向 ESP8266", "The original targets ESP8266") }, { item: s("DHT22、BMP180、光敏电阻", "DHT22, BMP180 and a photoresistor") }],
      quickStart: [
        { step: s("读懂代码结构", "Read the code"), detail: s("先看 MQTT 主题与 JSON 组装方式。", "Start with the MQTT topics and JSON assembly.") },
        { step: s("按当前版本改依赖", "Update dependencies"), detail: s("老库版本可能已不兼容，需换成当前维护的库。", "Old library versions may not compile — swap in maintained ones.") },
        { step: s("验证上报", "Verify publishing"), detail: s("用 MQTT 客户端订阅并检查 JSON 字段。", "Subscribe with an MQTT client and inspect the JSON fields.") },
      ],
      docs: [{ label: s("仓库 README", "Repo README"), url: "https://github.com/bruhautomation/ESP-MQTT-JSON-Multisensor", kind: "doc" }],
      faq: [{ q: s("为什么编译不过？", "Why does it not compile?"), a: s("项目已多年未更新，依赖与 API 变化会导致编译失败，属正常现象。", "The repo has not been updated for years, so dependency and API drift will break the build — expected.") }],
      limitations: [s("已停止维护，硬件清单与库版本需要按现状调整。", "Unmaintained: adapt the parts list and library versions yourself.")],
      maintenance: s("已长期无更新，仅作学习参考。", "Dormant for years — reference only."),
      nextSteps: [s("用 ESPHome 重写同样功能，维护成本更低。", "Reimplement the same features in ESPHome for far lower maintenance cost.")],
    },
  },
];
