import type { I18nText, ChipSlug } from "@/lib/types";

export interface ChipSpec {
  slug: ChipSlug;
  name: string;
  family: string;
  cores: string;
  clock: string;
  sram: string;
  flash: string;
  wifi: string;
  ble: string;
  threadZigbee: string;
  usb: string;
  camera: string;
  display: string;
  useCases: I18nText;
  boards: string[];
  officialUrl: string;
  confidence: "verified" | "unverified";
  note?: I18nText;
}

const DS = "https://www.espressif.com/en/products/socs";

/**
 * Specs below are transcribed from Espressif SoC datasheets / product pages
 * (linked per row). Anything that varies by module or dev board is explicitly
 * separated: `flash` describes what ships in typical modules, not on the die.
 * Where a value could not be re-confirmed at build time we mark it 待核验.
 */
export const CHIPS: ChipSpec[] = [
  {
    slug: "esp32",
    name: "ESP32",
    family: "ESP32 (original)",
    cores: "2 × Xtensa LX6 (up to 240 MHz)",
    clock: "240 MHz",
    sram: "520 KB internal SRAM",
    flash: "No on-die flash — modules ship 4 MB SPI flash typically",
    wifi: "Wi-Fi 4 (802.11 b/g/n, 2.4 GHz)",
    ble: "Bluetooth 4.2 Classic + BLE",
    threadZigbee: "No",
    usb: "No native USB-OTG (dev boards use a USB-UART bridge)",
    camera: "Yes via I2S/LCD_CAM peripheral (ESP32-CAM boards)",
    display: "SPI / 8-bit parallel LCD through LCD_CAM",
    useCases: {
      zh: "最通用的入门与量产型号：Wi-Fi + 经典蓝牙、双核、外设齐全，生态与教程最多。适合智能家居、传感器网关、LED 控制器、摄像头入门项目。",
      en: "The most widely used entry and volume part: Wi-Fi + Bluetooth Classic, dual core and full peripherals with the largest ecosystem. Good for smart home, sensor gateways, LED controllers and first camera projects.",
    },
    boards: ["ESP32-DevKitC", "NodeMCU-32S", "ESP32-CAM", "ESP32-WROVER-KIT"],
    officialUrl: `${DS}/esp32`,
    confidence: "verified",
  },
  {
    slug: "esp32-s2",
    name: "ESP32-S2",
    family: "ESP32-S",
    cores: "1 × Xtensa LX7 (up to 240 MHz)",
    clock: "240 MHz",
    sram: "320 KB internal SRAM",
    flash: "No on-die flash — external SPI flash on module",
    wifi: "Wi-Fi 4 (802.11 b/g/n, 2.4 GHz)",
    ble: "No Bluetooth radio",
    threadZigbee: "No",
    usb: "Native USB-OTG (full speed)",
    camera: "Yes via LCD_CAM",
    display: "SPI / parallel LCD via LCD_CAM",
    useCases: {
      zh: "单核、带原生 USB 的 Wi-Fi 型号。适合 USB HID 设备、Keyboard/MIDI、成本敏感的联网终端；没有蓝牙是主要限制。",
      en: "Single-core Wi-Fi part with native USB. Suits USB HID devices, keyboards/MIDI and cost-sensitive networked terminals; the missing Bluetooth radio is the main limitation.",
    },
    boards: ["ESP32-S2-Saola-1", "LOLIN S2 Mini", "ESP32-S2-Kaluga-1"],
    officialUrl: `${DS}/esp32-s2`,
    confidence: "verified",
  },
  {
    slug: "esp32-s3",
    name: "ESP32-S3",
    family: "ESP32-S",
    cores: "2 × Xtensa LX7 (up to 240 MHz) + vector instructions",
    clock: "240 MHz",
    sram: "512 KB internal SRAM (+ optional external PSRAM on module)",
    flash: "No on-die flash — modules ship 8/16 MB flash",
    wifi: "Wi-Fi 4 (802.11 b/g/n, 2.4 GHz)",
    ble: "Bluetooth 5 LE",
    threadZigbee: "No",
    usb: "Native USB-OTG",
    camera: "Yes, LCD_CAM with 16-bit parallel input",
    display: "SPI / 16-bit parallel RGB LCD",
    useCases: {
      zh: "AI 语音与带屏项目的首选：向量指令加速神经网络推理，USB 原生、摄像头与 RGB 屏支持好。小智 AI 桌面机器人等主流项目默认目标芯片。",
      en: "The default choice for AI voice and screen projects: vector instructions speed up NN inference, with native USB plus solid camera and RGB LCD support. It is the default target for mainstream projects such as XiaoZhi AI.",
    },
    boards: ["ESP32-S3-DevKitC-1", "ESP32-S3-BOX-3", "M5Stack CoreS3", "XIAO ESP32S3"],
    officialUrl: `${DS}/esp32-s3`,
    confidence: "verified",
  },
  {
    slug: "esp32-c3",
    name: "ESP32-C3",
    family: "ESP32-C",
    cores: "1 × RISC-V (up to 160 MHz)",
    clock: "160 MHz",
    sram: "400 KB internal SRAM",
    flash: "No on-die flash — modules ship 4 MB flash",
    wifi: "Wi-Fi 4 (802.11 b/g/n, 2.4 GHz)",
    ble: "Bluetooth 5 LE",
    threadZigbee: "No",
    usb: "USB Serial/JTAG (not full OTG)",
    camera: "No camera interface",
    display: "SPI LCD",
    useCases: {
      zh: "低成本 Wi-Fi + BLE 主力：价格接近 ESP8266 但性能与安全性更好，适合插座、传感器、灯控等大批量设备。",
      en: "The low-cost Wi-Fi + BLE workhorse: ESP8266-class pricing with better performance and security — plugs, sensors and lighting controls at volume.",
    },
    boards: ["ESP32-C3-DevKitM-1", "XIAO ESP32C3", "ESP32-C3 SuperMini"],
    officialUrl: `${DS}/esp32-c3`,
    confidence: "verified",
  },
  {
    slug: "esp32-c6",
    name: "ESP32-C6",
    family: "ESP32-C",
    cores: "1 × high-performance RISC-V (160 MHz) + low-power core",
    clock: "160 MHz",
    sram: "512 KB HP SRAM",
    flash: "No on-die flash — modules ship 4/8 MB flash",
    wifi: "Wi-Fi 6 (802.11ax, 2.4 GHz)",
    ble: "Bluetooth 5 LE",
    threadZigbee: "Yes — 802.15.4 (Thread / Zigbee)",
    usb: "USB Serial/JTAG",
    camera: "No camera interface",
    display: "SPI LCD",
    useCases: {
      zh: "面向 Matter / Thread 的现代型号：Wi-Fi 6 + BLE + 802.15.4 三模，是做 Thread 边界路由器与 Matter 设备的合理起点。",
      en: "The modern Matter/Thread part: tri-radio Wi-Fi 6 + BLE + 802.15.4, a sensible starting point for Thread border routers and Matter devices.",
    },
    boards: ["ESP32-C6-DevKitC-1", "ESP32-C6-WROOM-1 module", "XIAO ESP32C6"],
    officialUrl: `${DS}/esp32-c6`,
    confidence: "verified",
  },
  {
    slug: "esp32-h2",
    name: "ESP32-H2",
    family: "ESP32-H",
    cores: "1 × RISC-V (up to 96 MHz)",
    clock: "96 MHz",
    sram: "320 KB internal SRAM",
    flash: "No on-die flash — modules ship 2/4 MB flash",
    wifi: "No Wi-Fi radio",
    ble: "Bluetooth 5 LE",
    threadZigbee: "Yes — 802.15.4 (Thread / Zigbee)",
    usb: "USB Serial/JTAG",
    camera: "No camera interface",
    display: "SPI LCD",
    useCases: {
      zh: "纯 802.15.4 + BLE 的低功耗节点芯片，没有 Wi-Fi。适合电池供电的 Thread/Zigbee 传感器与灯控终端。",
      en: "A pure 802.15.4 + BLE low-power node part with no Wi-Fi. Good for battery-powered Thread/Zigbee sensors and lighting endpoints.",
    },
    boards: ["ESP32-H2-DevKitM-1"],
    officialUrl: `${DS}/esp32-h2`,
    confidence: "verified",
  },
  {
    slug: "esp32-p4",
    name: "ESP32-P4",
    family: "ESP32-P",
    cores: "2 × RISC-V high-performance cores (up to 400 MHz) + LP core",
    clock: "400 MHz",
    sram: "768 KB internal SRAM (待核验)",
    flash: "No on-die flash — external flash on module/board",
    wifi: "No Wi-Fi radio — needs a companion radio SoC",
    ble: "No Bluetooth radio (companion SoC required)",
    threadZigbee: "No",
    usb: "USB 2.0 High-Speed OTG",
    camera: "Yes — MIPI-CSI",
    display: "MIPI-DSI plus SPI/parallel",
    useCases: {
      zh: "高性能多媒体型号：MIPI-CSI 摄像头与 MIPI-DSI 屏、USB 高速，适合带屏人机界面与视觉应用；本身没有无线，需要搭配 C6/S3 等联网芯片。",
      en: "The high-performance multimedia part: MIPI-CSI camera, MIPI-DSI display and high-speed USB for HMI and vision products. It has no radio of its own, so pair it with a C6/S3-class companion.",
    },
    boards: ["ESP32-P4-Function-EV-Board"],
    officialUrl: `${DS}/esp32-p4`,
    confidence: "unverified",
    note: {
      zh: "P4 为新近量产型号，部分规格（内部 SRAM 容量、开发板配置）以官方 datasheet 与产品页为准，此处标注待核验。",
      en: "P4 is a recent part; some values (internal SRAM size, board configuration) should be checked against the official datasheet and product page — flagged as unverified here.",
    },
  },
];

export const CHIP_BY_SLUG = new Map(CHIPS.map((c) => [c.slug, c]));
