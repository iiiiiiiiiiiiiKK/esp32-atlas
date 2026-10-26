import type { Difficulty, I18nText } from "@/lib/types";

export interface PathStepSeed {
  no: number;
  title: I18nText;
  goal: I18nText;
  prereq?: I18nText;
  resources: Array<{ label: I18nText; url: string; kind: "doc" | "tutorial" | "video" | "project" | "tool" }>;
  projects: string[];
  estimate: string;
  doneWhen: I18nText;
}

export interface PathSeed {
  slug: string;
  title: I18nText;
  summary: I18nText;
  level: Difficulty;
  hours: string;
  chips: string[];
  frameworks: string[];
  icon: string;
  steps: PathStepSeed[];
}

const s = (zh: string, en: string): I18nText => ({ zh, en });

/**
 * Estimates are explicit rough ranges (see copy in the UI) and assume a few
 * hours per week. Completion criteria are observable, not "you understand it".
 */
export const PATHS: PathSeed[] = [
  {
    slug: "zero-to-esp32",
    title: s("零基础 ESP32", "ESP32 from zero"),
    summary: s(
      "从没碰过单片机开始：认识开发板、装好工具链、点亮第一个 LED，再到能联网上报数据。",
      "Never touched a microcontroller: meet the board, install the toolchain, blink an LED, then report data over the network.",
    ),
    level: "beginner",
    hours: "10–16 h",
    chips: ["esp32", "esp32-c3"],
    frameworks: ["arduino"],
    icon: "cpu",
    steps: [
      {
        no: 1,
        title: s("认识硬件与安全", "Meet the hardware"),
        goal: s("分清芯片型号、开发板与模块，知道 USB 供电与 3.3V 逻辑的基本约束。", "Tell chips, boards and modules apart and know the 3.3V / USB power constraints."),
        resources: [
          { label: s("ESP32 芯片选型指南", "ESP32 chip guide"), url: "https://randomnerdtutorials.com/esp32-chip-guide/", kind: "tutorial" },
          { label: s("引脚参考（启动引脚）", "Pinout reference"), url: "https://randomnerdtutorials.com/esp32-pinout-reference-gpios/", kind: "tutorial" },
        ],
        projects: [],
        estimate: "1–2 h",
        doneWhen: s("能在自己的板子上指出 BOOT、EN、3V3、GND 与至少两个可用 GPIO。", "You can point at BOOT, EN, 3V3, GND and two usable GPIOs on your own board."),
      },
      {
        no: 2,
        title: s("装好开发环境", "Install the toolchain"),
        goal: s("在 Arduino IDE 中安装 ESP32 核心，并能成功编译上传一个空白程序。", "Install the ESP32 core in Arduino IDE and upload an empty sketch successfully."),
        resources: [
          { label: s("Arduino-ESP32 安装指南", "Arduino-ESP32 install"), url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html", kind: "doc" },
          { label: s("Arduino IDE 文档", "Arduino IDE docs"), url: "https://docs.arduino.cc/software/ide/", kind: "doc" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "1–3 h",
        doneWhen: s("串口监视器能打印出你写的文字，且没有上传报错。", "The serial monitor prints your text and the upload completes without errors."),
      },
      {
        no: 3,
        title: s("GPIO 与 PWM 输出", "GPIO and PWM output"),
        goal: s("用数字输出点灯、用 LEDC 做呼吸灯，理解占空比。", "Blink with digital output, then build a breathing LED with LEDC and understand duty cycle."),
        resources: [
          { label: s("ESP32 PWM 教程", "ESP32 PWM tutorial"), url: "https://randomnerdtutorials.com/esp32-pwm-arduino-ide/", kind: "tutorial" },
          { label: s("ESP-IDF GPIO 文档", "ESP-IDF GPIO docs"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html", kind: "doc" },
        ],
        projects: ["FastLED/FastLED"],
        estimate: "2–3 h",
        doneWhen: s("你能不看教程写出一个渐变呼吸灯，并解释为什么亮度不是线性的。", "You can write a fading LED without the tutorial and explain why brightness is not linear."),
      },
      {
        no: 4,
        title: s("模拟输入与传感器", "Analog input and sensors"),
        goal: s("读 ADC 与 I2C 传感器数据，并在串口里观察噪声与漂移。", "Read ADC and an I2C sensor, watching noise and drift on the serial monitor."),
        resources: [
          { label: s("ADC 读取教程", "ADC reading tutorial"), url: "https://randomnerdtutorials.com/esp32-adc-analog-read-arduino-ide/", kind: "tutorial" },
          { label: s("I2C 通信与地址扫描", "I2C and address scanning"), url: "https://randomnerdtutorials.com/esp32-i2c-communication-arduino-ide/", kind: "tutorial" },
          { label: s("DHT11/DHT22 温湿度", "DHT11/DHT22 sensor"), url: "https://randomnerdtutorials.com/esp32-dht11-dht22-temperature-humidity-sensor-arduino-ide/", kind: "tutorial" },
        ],
        projects: ["bruhautomation/ESP-MQTT-JSON-Multisensor"],
        estimate: "2–4 h",
        doneWhen: s("你能自己排查「读不到设备」：先扫 I2C 地址，再查供电与上拉。", "You can debug \u201Cno device found\u201D yourself: scan I2C addresses first, then check power and pull-ups."),
      },
      {
        no: 5,
        title: s("联网与第一个 Web 界面", "Networking and a first web UI"),
        goal: s("连上 Wi-Fi，起一个 HTTP 服务，把传感器数据显示在网页上。", "Join Wi-Fi, serve HTTP, and show sensor readings in a web page."),
        resources: [
          { label: s("ESP32 Web Server 教程", "ESP32 web server"), url: "https://randomnerdtutorials.com/esp32-web-server-arduino-ide/", kind: "tutorial" },
          { label: s("Arduino Wi-Fi API", "Arduino Wi-Fi API"), url: "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html", kind: "doc" },
          { label: s("WiFiManager 配网库", "WiFiManager"), url: "https://github.com/tzapu/WiFiManager", kind: "project" },
        ],
        projects: ["tzapu/WiFiManager"],
        estimate: "3–5 h",
        doneWhen: s("手机在同一 Wi-Fi 下能打开板子的网页，并看到实时数值。", "A phone on the same network opens the board's page and sees live values."),
      },
    ],
  },
  {
    slug: "arduino-esp32",
    title: s("Arduino-ESP32 进阶", "Arduino-ESP32 in depth"),
    summary: s(
      "已经把灯点亮了？这一条路线把 Arduino 核心的能力用满：任务调度、中断、文件系统、WebSocket 与 OTA。",
      "Already blinking? This path uses the Arduino core properly: task scheduling, interrupts, filesystem, WebSockets and OTA.",
    ),
    level: "intermediate",
    hours: "20–30 h",
    chips: ["esp32", "esp32-s3", "esp32-c3"],
    frameworks: ["arduino"],
    icon: "code",
    steps: [
      {
        no: 1,
        title: s("读懂核心库", "Read the bundled libraries"),
        goal: s("知道 WiFi / HTTPClient / WebServer / ESP-NOW 都在哪里，避免重复造轮子。", "Know where WiFi, HTTPClient, WebServer and ESP-NOW live so you stop reinventing them."),
        resources: [
          { label: s("Arduino-ESP32 库目录", "Bundled libraries"), url: "https://github.com/espressif/arduino-esp32/tree/master/libraries", kind: "project" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "2 h",
        doneWhen: s("能说出三个场景各该用哪个官方库，并找到对应示例。", "For three scenarios you can name the right official library and its example."),
      },
      {
        no: 2,
        title: s("并发与中断", "Concurrency and interrupts"),
        goal: s("区分 loop 阻塞、FreeRTOS 任务与 ISR，写出不卡住 Wi-Fi 的代码。", "Separate blocking loop code, FreeRTOS tasks and ISRs so Wi-Fi never stalls."),
        resources: [
          { label: s("Arduino-ESP32 中的 FreeRTOS（示例）", "FreeRTOS in Arduino-ESP32"), url: "https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples", kind: "project" },
          { label: s("GPIO 中断文档", "GPIO interrupt docs"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html", kind: "doc" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "4–6 h",
        doneWhen: s("你能写一个按钮中断 + 后台定时上报的组合，且不会丢事件。", "You can combine a button ISR with periodic reporting without dropping events."),
      },
      {
        no: 3,
        title: s("实时双向通信", "Real-time bidirectional link"),
        goal: s("用 WebSocket 做实时控制面板，理解心跳与重连。", "Build a real-time control panel over WebSocket with heartbeat and reconnect."),
        resources: [
          { label: s("ESP32 WebSocket 教程", "ESP32 WebSocket"), url: "https://randomnerdtutorials.com/esp32-web-server-websocket/", kind: "tutorial" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "4–6 h",
        doneWhen: s("断开 Wi-Fi 后客户端能自动恢复，且板子不重启。", "Clients recover automatically after Wi-Fi drops, and the board does not reboot."),
      },
      {
        no: 4,
        title: s("MQTT 与设备上云", "MQTT and device telemetry"),
        goal: s("用 MQTT 上报结构化 JSON，并订阅下行指令。", "Publish structured JSON over MQTT and subscribe to downstream commands."),
        resources: [
          { label: s("ESP32 MQTT 教程", "ESP32 MQTT"), url: "https://randomnerdtutorials.com/esp32-mqtt-publish-subscribe-arduino-ide/", kind: "tutorial" },
          { label: s("ArduinoJson", "ArduinoJson"), url: "https://github.com/bblanchon/ArduinoJson", kind: "project" },
        ],
        projects: ["bblanchon/ArduinoJson", "arendst/Tasmota"],
        estimate: "4–6 h",
        doneWhen: s("MQTTX 或 HA 上能看到你的数据，并且能下发指令改变设备状态。", "MQTTX or HA shows your telemetry and a downlink command changes device state."),
      },
      {
        no: 5,
        title: s("OTA 与固件发布", "OTA and firmware rollout"),
        goal: s("实现空中升级，并保留回滚手段。", "Ship over-the-air updates with a rollback path."),
        resources: [
          { label: s("ESPHome OTA（参考实现思路）", "ESPHome OTA concepts"), url: "https://esphome.io/components/ota.html", kind: "doc" },
          { label: s("PlatformIO 构建与依赖", "PlatformIO espressif32"), url: "https://docs.platformio.org/en/latest/platforms/espressif32.html", kind: "doc" },
        ],
        projects: ["esphome/esphome"],
        estimate: "5–8 h",
        doneWhen: s("设备能从一个 URL 自我升级；升级失败时仍能回到可用分区。", "A device upgrades itself from a URL and still boots a working image when the update fails."),
      },
    ],
  },
  {
    slug: "esp-idf",
    title: s("ESP-IDF 生产级开发", "ESP-IDF for production"),
    summary: s(
      "从 Arduino 过渡到 IDF：组件化工程、事件循环、日志、NVS、单元测试与安全配置。",
      "Move from Arduino to IDF: componentised projects, event loops, logging, NVS, unit tests and security config.",
    ),
    level: "advanced",
    hours: "30–45 h",
    chips: ["esp32", "esp32-s3", "esp32-c3", "esp32-c6"],
    frameworks: ["esp-idf"],
    icon: "layers",
    steps: [
      {
        no: 1,
        title: s("工程结构与构建系统", "Project layout and build system"),
        goal: s("理解 CMake 组件模型、sdkconfig 与多目标芯片切换。", "Understand the CMake component model, sdkconfig and switching target chips."),
        resources: [
          { label: s("ESP-IDF Get Started", "ESP-IDF Get Started"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html", kind: "doc" },
          { label: s("中文入门", "Chinese Get Started"), url: "https://docs.espressif.com/projects/esp-idf/zh_CN/stable/esp32/get-started/index.html", kind: "doc" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "3–5 h",
        doneWhen: s("你能为同一份代码切换 esp32s3 / esp32c3 目标并各自编译通过。", "One codebase builds for both esp32s3 and esp32c3 targets."),
      },
      {
        no: 2,
        title: s("驱动与事件循环", "Drivers and the event loop"),
        goal: s("用 esp_event 组织 Wi-Fi、传感器与服务间通信。", "Wire Wi-Fi, sensors and services together with esp_event."),
        resources: [
          { label: s("Wi-Fi 驱动指南", "Wi-Fi driver guide"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi.html", kind: "doc" },
          { label: s("官方示例库", "Official examples"), url: "https://github.com/espressif/esp-idf/tree/master/examples", kind: "project" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "6–10 h",
        doneWhen: s("断网重连、传感器异常都不会让主循环卡死。", "Reconnects and sensor faults never block the main loop."),
      },
      {
        no: 3,
        title: s("存储、日志与诊断", "Storage, logging and diagnostics"),
        goal: s("用 NVS 存配置、分级日志与 core dump 定位现场问题。", "Store config in NVS and use levelled logging plus core dumps to debug the field."),
        resources: [
          { label: s("ESP-IDF 组件管理器", "Component registry"), url: "https://components.espressif.com/", kind: "tool" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "5–8 h",
        doneWhen: s("设备重启后配置仍然存在，且能从日志定位一次人为注入的崩溃。", "Config survives a reboot and you can localise a deliberately injected crash from logs."),
      },
      {
        no: 4,
        title: s("性能与内存", "Performance and memory"),
        goal: s("读懂 heap 报告，区分内部 SRAM 与 PSRAM 的取舍。", "Read heap reports and reason about internal SRAM versus PSRAM trade-offs."),
        resources: [
          { label: s("内存类型说明", "Memory types"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/memory-types.html", kind: "doc" },
          { label: s("外部 RAM（S3）", "External RAM (S3)"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-guides/external-ram.html", kind: "doc" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "6–8 h",
        doneWhen: s("你能解释为什么某个缓冲放在 PSRAM 会更慢，并用数据证明。", "You can explain — with measurements — why a buffer in PSRAM is slower."),
      },
      {
        no: 5,
        title: s("安全与量产准备", "Security and manufacturing"),
        goal: s("了解 flash 加密、安全启动、NVS 加密与产线烧录流程。", "Understand flash encryption, secure boot, NVS encryption and factory flashing."),
        resources: [
          { label: s("ESP-IDF 安全指南", "ESP-IDF security guides"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/security/index.html", kind: "doc" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "8–12 h",
        doneWhen: s("你能写出一份包含密钥管理、烧录与回滚的量产检查清单。", "You can write a manufacturing checklist covering keys, flashing and rollback."),
      },
    ],
  },
  {
    slug: "ai-voice-assistant",
    title: s("ESP32 AI 语音助手", "ESP32 AI voice assistant"),
    summary: s(
      "把一块 S3 开发板做成桌面语音助手：音频链路、唤醒词、大模型对话与设备控制。",
      "Turn an S3 board into a desktop voice assistant: audio path, wake word, LLM dialogue and device control.",
    ),
    level: "advanced",
    hours: "25–40 h",
    chips: ["esp32-s3", "esp32-c3"],
    frameworks: ["esp-idf"],
    icon: "mic",
    steps: [
      {
        no: 1,
        title: s("音频输入输出链路", "Audio input and output"),
        goal: s("用 I2S 接麦克风与功放，先做到录音回放。", "Wire mic and amp over I2S and get record-and-playback working first."),
        resources: [
          { label: s("I2S 外设文档", "I2S peripheral docs"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/i2s.html", kind: "doc" },
          { label: s("ESP32-audioI2S 库", "ESP32-audioI2S"), url: "https://github.com/schreibfaul1/ESP32-audioI2S", kind: "project" },
        ],
        projects: ["schreibfaul1/ESP32-audioI2S"],
        estimate: "6–10 h",
        doneWhen: s("录 3 秒人声并原样播放，没有明显爆音与断续。", "Record three seconds of speech and play it back cleanly, without clipping or dropouts."),
      },
      {
        no: 2,
        title: s("跑通官方固件", "Run the upstream firmware"),
        goal: s("先按小智官方说明把固件跑起来，确认硬件与网络没问题。", "Flash the upstream XiaoZhi firmware first to prove hardware and network are fine."),
        resources: [
          { label: s("小智 README", "XiaoZhi README"), url: "https://github.com/78/xiaozhi-esp32/blob/main/README.md", kind: "project" },
          { label: s("小智官网/控制台", "XiaoZhi console"), url: "https://xiaozhi.me/", kind: "tool" },
        ],
        projects: ["78/xiaozhi-esp32"],
        estimate: "4–6 h",
        doneWhen: s("设备能联网、被唤醒并完成一轮问答。", "The device joins the network, wakes on the wake word and completes one Q&A round."),
      },
      {
        no: 3,
        title: s("理解协议与后端", "Understand the protocol and backend"),
        goal: s("搞清音频流如何上传、MCP 指令如何下发、服务端做了什么。", "Understand how audio streams up, how MCP commands come down and what the server does."),
        resources: [
          { label: s("小智服务端", "XiaoZhi server"), url: "https://github.com/xinnan-tech/xiaozhi-esp32-server", kind: "project" },
        ],
        projects: ["xinnan-tech/xiaozhi-esp32-server"],
        estimate: "6–10 h",
        doneWhen: s("你能画出「唤醒 → 上传 → 识别 → 回复 → 播放」的完整时序。", "You can draw the full wake → upload → ASR → reply → playback sequence."),
      },
      {
        no: 4,
        title: s("移植到自己的板子", "Port to your own board"),
        goal: s("把自定义板（屏幕、麦克风、功放型号）接入固件并调通。", "Port your custom board (display, mic, amp) into the firmware and make it work."),
        resources: [
          { label: s("自定义开发板指南", "Custom board guide"), url: "https://github.com/78/xiaozhi-esp32/blob/main/docs/custom-board.md", kind: "doc" },
        ],
        projects: ["78/xiaozhi-esp32"],
        estimate: "8–14 h",
        doneWhen: s("换成自己的板子后，语音链路与屏幕显示都正常，且写下了引脚配置表。", "On your own board both the voice path and display work, and you have written down the pin map."),
      },
    ],
  },
  {
    slug: "esphome-smart-home",
    title: s("ESPHome 智能家居", "ESPHome smart home"),
    summary: s(
      "不写 C++，只用 YAML 把传感器、灯、继电器接入 Home Assistant，并做到可维护、可回滚。",
      "No C++: bring sensors, lights and relays into Home Assistant with YAML alone — maintainable and reversible.",
    ),
    level: "beginner",
    hours: "12–20 h",
    chips: ["esp32", "esp32-c3", "esp32-s3", "esp32-c6"],
    frameworks: ["esphome", "yaml"],
    icon: "home",
    steps: [
      {
        no: 1,
        title: s("装 ESPHome 并刷第一台设备", "Install ESPHome and flash a device"),
        goal: s("用 HA 加载项或 CLI 编译并 OTA 刷入第一份配置。", "Build and OTA-flash a first config via the HA add-on or CLI."),
        resources: [
          { label: s("ESPHome 入门", "ESPHome getting started"), url: "https://esphome.io/guides/getting_started_hassio.html", kind: "doc" },
        ],
        projects: ["esphome/esphome"],
        estimate: "2–4 h",
        doneWhen: s("设备出现在 HA 中，能读出至少一个实体。", "The device shows up in HA with at least one working entity."),
      },
      {
        no: 2,
        title: s("传感器与滤波", "Sensors and filtering"),
        goal: s("配置传感器、采样与滤波，避免数值抖动污染自动化。", "Configure sensors, sampling and filters so jitter does not poison automations."),
        resources: [
          { label: s("ESPHome 传感器组件", "ESPHome sensors"), url: "https://esphome.io/components/sensor/index.html", kind: "doc" },
        ],
        projects: ["esphome/esphome"],
        estimate: "3–5 h",
        doneWhen: s("你的温湿度曲线平稳可读，并且你知道每个 filter 的作用。", "Your temperature curve is smooth and you can explain each filter."),
      },
      {
        no: 3,
        title: s("灯带与显示", "LED strips and displays"),
        goal: s("用 YAML 定义灯带效果与本地显示。", "Define strip effects and a local display in YAML."),
        resources: [
          { label: s("ESPHome 灯光组件", "ESPHome light"), url: "https://esphome.io/components/light/index.html", kind: "doc" },
          { label: s("ESPHome 显示组件", "ESPHome display"), url: "https://esphome.io/components/display/index.html", kind: "doc" },
        ],
        projects: ["esphome/esphome", "wled/WLED"],
        estimate: "3–5 h",
        doneWhen: s("HA 里能切换灯效，屏幕上能看到同一份数据。", "HA can switch effects and the display shows the same data."),
      },
      {
        no: 4,
        title: s("安全、备份与版本管理", "Secrets, backup and versioning"),
        goal: s("用 secrets.yaml 管理凭据，把配置放进 Git，能回滚一次坏改动。", "Keep credentials in secrets.yaml, put config in Git and roll back one bad change."),
        resources: [
          { label: s("HA ESPHome 集成", "HA ESPHome integration"), url: "https://www.home-assistant.io/integrations/esphome/", kind: "doc" },
        ],
        projects: ["esphome/esphome"],
        estimate: "2–4 h",
        doneWhen: s("仓库里没有明文密码，且你成功回滚过一次配置。", "No plaintext passwords in the repo and you have rolled back a config once."),
      },
    ],
  },
  {
    slug: "lvgl-ui",
    title: s("LVGL 小屏 UI", "LVGL small-screen UI"),
    summary: s(
      "在 ESP32 上做出流畅的本地界面：显示缓冲、字体、控件与触摸输入，避免卡顿与闪烁。",
      "Build a smooth on-device UI: draw buffers, fonts, widgets and touch input without tearing or stutter.",
    ),
    level: "intermediate",
    hours: "18–28 h",
    chips: ["esp32", "esp32-s3", "esp32-p4"],
    frameworks: ["c-plus-plus", "esp-idf", "arduino"],
    icon: "monitor",
    steps: [
      {
        no: 1,
        title: s("点亮屏幕", "Light up the panel"),
        goal: s("确认驱动 IC、SPI 频率与偏移参数，先显示纯色块。", "Confirm driver IC, SPI clock and offsets, then draw solid colour blocks."),
        resources: [
          { label: s("LCD 驱动文档", "LCD driver docs"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/lcd/index.html", kind: "doc" },
          { label: s("LovyanGFX", "LovyanGFX"), url: "https://github.com/lovyan03/LovyanGFX", kind: "project" },
        ],
        projects: ["lovyan03/LovyanGFX", "witnessmenow/ESP32-Cheap-Yellow-Display"],
        estimate: "4–8 h",
        doneWhen: s("整屏颜色均匀，无花屏、无偏移。", "The whole panel is uniform — no glitches, no offsets."),
      },
      {
        no: 2,
        title: s("LVGL 集成", "Integrate LVGL"),
        goal: s("把 LVGL 接到你的显示驱动与 tick 上，显示第一个 label。", "Hook LVGL to your display driver and tick, then show a first label."),
        resources: [
          { label: s("LVGL 介绍", "LVGL intro"), url: "https://docs.lvgl.io/master/intro/index.html", kind: "doc" },
          { label: s("LVGL 示例", "LVGL examples"), url: "https://docs.lvgl.io/master/examples.html", kind: "doc" },
        ],
        projects: ["lvgl/lvgl"],
        estimate: "5–8 h",
        doneWhen: s("屏幕上出现可刷新的文本，且 CPU 占用可接受。", "Refreshing text appears on screen with acceptable CPU load."),
      },
      {
        no: 3,
        title: s("控件与交互", "Widgets and input"),
        goal: s("做出按钮、列表、图表，并接上触摸或编码器。", "Build buttons, lists and charts, wired to touch or an encoder."),
        resources: [
          { label: s("CYD 示例索引", "CYD index"), url: "https://github.com/witnessmenow/ESP32-Cheap-Yellow-Display/blob/main/README.md", kind: "project" },
        ],
        projects: ["witnessmenow/ESP32-Cheap-Yellow-Display"],
        estimate: "5–8 h",
        doneWhen: s("按下按钮能触发真实动作（例如切换灯或翻页），没有漏触。", "Tapping a button triggers a real action (turning a light on, changing pages) with no missed touches."),
      },
      {
        no: 4,
        title: s("性能与内存优化", "Performance and memory"),
        goal: s("用局部刷新、双缓冲与字体子集把帧率提上去。", "Use partial refresh, double buffering and font subsets to raise the frame rate."),
        resources: [
          { label: s("内存类型说明", "Memory types"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/memory-types.html", kind: "doc" },
        ],
        projects: ["lvgl/lvgl"],
        estimate: "4–6 h",
        doneWhen: s("动画肉眼流畅，且你能量化改动前后的帧率或刷新耗时。", "Animation looks smooth and you can quantify the before/after frame time."),
      },
    ],
  },
  {
    slug: "camera-vision",
    title: s("摄像头与视觉", "Camera and vision"),
    summary: s(
      "用 ESP32-CAM 或 S3 + 摄像头做图像采集、流媒体与轻量识别，理解带宽与算力的边界。",
      "Capture, stream and lightly classify images with ESP32-CAM or S3 + camera — and learn where bandwidth and compute run out.",
    ),
    level: "intermediate",
    hours: "15–25 h",
    chips: ["esp32", "esp32-s3", "esp32-p4"],
    frameworks: ["arduino", "esp-idf"],
    icon: "camera",
    steps: [
      {
        no: 1,
        title: s("摄像头接线与取帧", "Wire the camera and grab frames"),
        goal: s("配好引脚与时钟，先抓一帧 JPEG 存到 SD 卡。", "Set pins and clock, then save a single JPEG frame to SD."),
        resources: [
          { label: s("ESP32-CAM 视频流教程", "ESP32-CAM streaming"), url: "https://randomnerdtutorials.com/esp32-cam-video-streaming-web-server-camera-home-assistant/", kind: "tutorial" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "4–8 h",
        doneWhen: s("SD 卡里出现能正常打开的 JPEG。", "A valid JPEG appears on the SD card."),
      },
      {
        no: 2,
        title: s("MJPEG 流与远程查看", "MJPEG streaming"),
        goal: s("把画面以 MJPEG over HTTP 推出去，在浏览器或 HA 中查看。", "Serve MJPEG over HTTP and view it in a browser or HA."),
        resources: [
          { label: s("Home Assistant 摄像头接入", "HA camera integration"), url: "https://www.home-assistant.io/integrations/generic/", kind: "doc" },
        ],
        projects: ["espressif/arduino-esp32"],
        estimate: "4–6 h",
        doneWhen: s("局域网内流畅看到画面，并知道分辨率/帧率如何影响带宽。", "The stream is smooth on your LAN and you know how resolution/FPS drive bandwidth."),
      },
      {
        no: 3,
        title: s("轻量识别", "Lightweight inference"),
        goal: s("分清「端侧推理」与「上传到服务端推理」的成本，选一条落地。", "Weigh on-device versus server-side inference and ship one of them."),
        resources: [
          { label: s("ESP-WHO（官方视觉方案）", "ESP-WHO"), url: "https://github.com/espressif/esp-who", kind: "project" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "6–10 h",
        doneWhen: s("你的设备能对特定目标给出稳定判断，并记录误判率。", "Your device reliably classifies a target and you have recorded the error rate."),
      },
    ],
  },
  {
    slug: "lora-meshtastic",
    title: s("LoRa 与 Meshtastic", "LoRa and Meshtastic"),
    summary: s(
      "不依赖基站与手机信号组网：LoRa 频段、天线、Mesh 拓扑与合法发射功率。",
      "Network without towers or cell coverage: LoRa bands, antennas, mesh topology and legal transmit power.",
    ),
    level: "beginner",
    hours: "10–18 h",
    chips: ["esp32", "esp32-s3", "esp32-c3"],
    frameworks: ["arduino", "platformio"],
    icon: "radio",
    steps: [
      {
        no: 1,
        title: s("认识硬件与法规", "Hardware and regulations"),
        goal: s("确认 LoRa 模块频段符合当地法规，理解天线与发射功率的关系。", "Confirm the module's band is legal where you are and understand antenna versus power."),
        resources: [
          { label: s("Meshtastic 硬件清单", "Meshtastic hardware"), url: "https://meshtastic.org/docs/hardware/devices/", kind: "doc" },
        ],
        projects: ["meshtastic/firmware"],
        estimate: "2–3 h",
        doneWhen: s("你能说出所在地区允许的频段与最大发射功率。", "You can state the allowed band and maximum transmit power for your region."),
      },
      {
        no: 2,
        title: s("刷机与两台设备通信", "Flash two nodes"),
        goal: s("用网页刷机工具烧好固件，让两台设备互通。", "Flash via the web installer and exchange messages between two nodes."),
        resources: [
          { label: s("Meshtastic 入门", "Meshtastic getting started"), url: "https://meshtastic.org/docs/getting-started/", kind: "doc" },
          { label: s("网页刷机工具", "Web flasher"), url: "https://flasher.meshtastic.org/", kind: "tool" },
        ],
        projects: ["meshtastic/firmware"],
        estimate: "3–5 h",
        doneWhen: s("两台设备在无网络环境下能互发文本。", "Two nodes exchange text with no network at all."),
      },
      {
        no: 3,
        title: s("组网与覆盖测试", "Mesh and range testing"),
        goal: s("测量不同环境下的实际距离，理解为什么「标称 10km」不可信。", "Measure real range in different environments and why “10 km” claims are marketing."),
        resources: [
          { label: s("Meshtastic 概念文档", "Meshtastic concepts"), url: "https://meshtastic.org/docs/overview/", kind: "doc" },
        ],
        projects: ["meshtastic/firmware"],
        estimate: "4–8 h",
        doneWhen: s("你有一份自己的覆盖测距记录（环境、距离、丢包）。", "You have your own coverage log: environment, distance, packet loss."),
      },
    ],
  },
  {
    slug: "robotics-motion",
    title: s("机器人与电机控制", "Robotics and motion control"),
    summary: s(
      "从舵机与直流电机起步，到逆运动学与步态：把 ESP32 变成能动的机器。",
      "From servos and DC motors to inverse kinematics and gait: make an ESP32 move.",
    ),
    level: "advanced",
    hours: "25–40 h",
    chips: ["esp32", "esp32-s3"],
    frameworks: ["arduino", "esp-idf"],
    icon: "bot",
    steps: [
      {
        no: 1,
        title: s("电机与电源基础", "Motors and power"),
        goal: s("分清舵机、步进与直流电机，理解为什么电机要独立供电。", "Tell servos, steppers and DC motors apart, and why motors need their own supply."),
        resources: [
          { label: s("ESP32 PWM 教程", "ESP32 PWM"), url: "https://randomnerdtutorials.com/esp32-pwm-arduino-ide/", kind: "tutorial" },
        ],
        projects: ["dorianborian/sesame-robot"],
        estimate: "4–8 h",
        doneWhen: s("电机噪音不再导致开发板复位，且你能解释原因。", "Motor noise no longer resets the board and you can explain why."),
      },
      {
        no: 2,
        title: s("多舵机协调", "Coordinating many servos"),
        goal: s("用 PCA9685 或 LEDC 多通道同时驱动 8 个以上舵机。", "Drive 8+ servos at once with a PCA9685 or multi-channel LEDC."),
        resources: [
          { label: s("OpenCat 四足框架", "OpenCat quadruped"), url: "https://github.com/PetoiCamp/OpenCat-Quadruped-Robot", kind: "project" },
          { label: s("Sesame 迷你四足", "Sesame robot"), url: "https://github.com/dorianborian/sesame-robot", kind: "project" },
        ],
        projects: ["PetoiCamp/OpenCat-Quadruped-Robot", "dorianborian/sesame-robot"],
        estimate: "6–10 h",
        doneWhen: s("八个舵机能平滑走完一段预设轨迹，不抖动。", "Eight servos sweep a preset trajectory smoothly, without jitter."),
      },
      {
        no: 3,
        title: s("步态或运动学", "Gait or kinematics"),
        goal: s("实现一个最小可行步态，或用逆运动学算关节角。", "Implement a minimal gait, or solve joint angles with inverse kinematics."),
        resources: [
          { label: s("Stack-chan 项目", "Stack-chan"), url: "https://github.com/stack-chan/stack-chan", kind: "project" },
        ],
        projects: ["stack-chan/stack-chan", "PetoiCamp/OpenCat-Quadruped-Robot"],
        estimate: "8–14 h",
        doneWhen: s("机器人能稳定前进 30 秒不摔；你能说出姿态反馈从哪来。", "It walks for 30 seconds without falling and you know where the attitude feedback comes from."),
      },
      {
        no: 4,
        title: s("传感与闭环", "Sensors and closed loop"),
        goal: s("加 IMU 做姿态闭环，处理延迟与丢步。", "Add an IMU for attitude control and deal with latency and missed steps."),
        resources: [
          { label: s("I2C 通信教程", "I2C tutorial"), url: "https://randomnerdtutorials.com/esp32-i2c-communication-arduino-ide/", kind: "tutorial" },
        ],
        projects: ["PetoiCamp/OpenCat-Quadruped-Robot"],
        estimate: "8–12 h",
        doneWhen: s("推它一下它能自己恢复平衡，且你记录了控制周期。", "A push no longer knocks it over, and you have logged the control loop period."),
      },
    ],
  },
  {
    slug: "open-source-contribution",
    title: s("为开源项目做贡献", "Contributing to open source"),
    summary: s(
      "从读代码、复现 Issue 到提交被合并的 PR：把用过的固件变成你参与维护的项目。",
      "From reading code and reproducing issues to a merged PR: turn firmware you use into a project you help maintain.",
    ),
    level: "intermediate",
    hours: "15–25 h",
    chips: ["esp32", "esp32-s3", "esp32-c3"],
    frameworks: ["arduino", "esp-idf", "esphome"],
    icon: "git-branch",
    steps: [
      {
        no: 1,
        title: s("读懂一个真实仓库", "Read a real repository"),
        goal: s("从 issue 模板、CI 配置和目录结构判断项目接受什么样的贡献。", "Judge what a project accepts from its issue templates, CI config and directory layout."),
        resources: [
          { label: s("ESP-IDF 贡献指南", "ESP-IDF contributions"), url: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/contribute/index.html", kind: "doc" },
        ],
        projects: ["espressif/esp-idf"],
        estimate: "3–5 h",
        doneWhen: s("你能说出该项目 PR 的门槛（测试、格式、review 流程）。", "You can state the project's PR bar: tests, formatting, review flow."),
      },
      {
        no: 2,
        title: s("复现一个 Issue", "Reproduce an issue"),
        goal: s("在本地复现别人报告的问题，写出可重复的最小步骤。", "Reproduce a reported bug locally and write minimal, repeatable steps."),
        resources: [
          { label: s("PlatformIO 构建", "PlatformIO"), url: "https://docs.platformio.org/en/latest/platforms/espressif32.html", kind: "doc" },
        ],
        projects: ["wled/WLED", "esphome/esphome"],
        estimate: "4–8 h",
        doneWhen: s("你发布了一条带版本号、板型和日志的复现评论。", "You posted a reproduction comment with version, board and logs."),
      },
      {
        no: 3,
        title: s("提交第一个 PR", "Land your first PR"),
        goal: s("修一个小 bug 或改一处文档，走完 review。", "Fix a small bug or a doc slip and go through review."),
        resources: [
          { label: s("HomeSpan 仓库（示例小项目）", "HomeSpan repo"), url: "https://github.com/HomeSpan/HomeSpan", kind: "project" },
        ],
        projects: ["HomeSpan/HomeSpan", "bblanchon/ArduinoJson"],
        estimate: "5–10 h",
        doneWhen: s("你的 PR 被合并，或收到了明确的修改意见并已更新。", "Your PR is merged, or you received concrete review feedback and revised it."),
      },
      {
        no: 4,
        title: s("长期参与", "Sustained participation"),
        goal: s("成为某个项目可信任的贡献者：跟 Issue、写文档、做 triage。", "Become a trusted contributor: follow issues, write docs, help triage."),
        resources: [
          { label: s("Arduino-ESP32 仓库", "Arduino-ESP32 repo"), url: "https://github.com/espressif/arduino-esp32", kind: "project" },
        ],
        projects: ["espressif/arduino-esp32", "arendst/Tasmota"],
        estimate: "持续进行",
        doneWhen: s("连续三个月保持贡献，且维护者在 Issue 里 @ 过你。", "Three consecutive months of contributions and a maintainer has pinged you in an issue."),
      },
    ],
  },
];
