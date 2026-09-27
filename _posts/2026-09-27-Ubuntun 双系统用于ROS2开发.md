---
layout: post
title: "Ubuntu 双系统 + ROS2开发环境的搭建"
date: 2026-09-27 
tags: [晚上晚上好]
---
# Ubuntu 双系统 + ROS 2 开发环境搭建

> **来源**：与DeepSeek对话 —— <https://chat.deepseek.com/share/xm5hxre6y2x8385c9u>的整理
> **原始问题**：Win 装双系统，用于 ROS 2 开发，应该装哪个 Linux
> 关键步骤请以 [ROS 2 官方文档](https://docs.ros.org/) 为准

---

## 目录

- [一、装哪个 Linux？](#一装哪个-linux)
- [二、完整安装流程（四步）](#二完整安装流程四步)
- [三、Windows 侧配置答疑](#三windows-侧配置答疑)
- [四、下载链接汇总](#四下载链接汇总)
- [五、备选方案对比](#五备选方案对比)
- [六、重要提醒](#六重要提醒)

---

## 一、装哪个 Linux？

### 结论

**首选 Ubuntu 的 LTS（长期支持）版本**——ROS 2 官方对 Ubuntu 支持最完善，社区资源也最丰富。

| 你的 ROS 2 版本 | 对应 Ubuntu | 说明 |
|---|---|---|
| **Humble Hawksbill** | **22.04 LTS** (Jammy Jellyfish) | 广泛使用的 LTS，非常稳定，教程和社区讨论最成熟 |
| **Jazzy Jalisco** | **24.04 LTS** (Noble Numbat) | 较新的 LTS，新特性更多，支持周期更长 |

> **新手建议**：追求最稳定的开发体验和最多的教程参考 → **Ubuntu 22.04 + ROS 2 Humble** 是最稳妥的组合。

### 安装前的关键准备（概览）

| 项目 | 要点 |
|---|---|
| **BIOS 设置** | 关闭 **Secure Boot**，启动模式设为 **UEFI**（最关键的一步，能避免安装失败和驱动不兼容） |
| **磁盘空间** | 在 Windows「磁盘管理」中压缩出未分配空间，**至少 50GB**；要做 Gazebo 仿真建议 **100GB 以上** |
| **启动盘** | 8GB 以上 U 盘 + **Rufus** 工具写入 ISO |
| **系统时间** | 双系统下 Windows 把 BIOS 时间当本地时间、Ubuntu 当 UTC，会导致时间不一致。Ubuntu 中执行 `timedatectl set-local-rtc 1` 解决 |

---

## 二、完整安装流程（四步）

> 核心流程：**备份与准备 → 制作启动盘 → 安装 Ubuntu → 安装 ROS 2**

### 📋 第一步：安装前的必要准备

> ⚠️ 这一步很关键，跳过或操作不当可能导致**安装失败或数据丢失**。

#### 1. 备份重要数据
涉及磁盘分区操作，建议将重要文件备份到外部硬盘或云端。

#### 2. 关闭 Windows 快速启动

这个功能会让 Windows 处于**混合休眠**状态，可能导致 Linux 无法正常访问硬盘。

1. 打开 **控制面板**（`Win + R` → 输入 `control` → 回车）
2. 右上角「查看方式」改为 **大图标** 或 **小图标**
3. 点击 **电源选项**
4. 左侧菜单点击 **选择电源按钮的功能**
5. 点击上方的 **更改当前不可用的设置**（需要管理员权限，通常显示为蓝色链接）
6. 在「关机设置」中**取消勾选** `启用快速启动(推荐)`
7. 点击 **保存修改**

#### 3. 关闭 BitLocker 加密

**如果开启了 BitLocker，Ubuntu 安装程序将无法识别硬盘分区。**

1. 控制面板 → **系统和安全** → **BitLocker 驱动器加密**
2. 找到系统盘（通常是 C 盘），点击 **关闭 BitLocker**
3. 等待解密完成

> 也可以在 Windows 搜索栏直接搜索「BitLocker」进入。

#### 4. 创建磁盘空闲空间

1. 右键「此电脑」→ **管理** → **磁盘管理**
2. 右键 C 盘（或其他空间充裕的分区）→ **压缩卷**
3. 输入压缩量：
   - **至少 50GB**
   - **建议 100GB（即 102400 MB）** —— ROS 2 + Gazebo 仿真 + 各种工具占用较大
4. 点击 **压缩**
5. 完成后会出现一块**黑色的「未分配」空间**

> **重要**：保持这块黑色空间为「未分配」状态，**不需要新建分区，也不需要格式化**。Ubuntu 安装程序会自动识别并占用它。

#### 5. 制作 Ubuntu 启动盘

- 准备一个 **8GB 以上的空 U 盘**（制作过程会格式化，提前备份数据）
- 从 Ubuntu 官网或国内镜像站下载 **Ubuntu 桌面版 ISO**
- 用 **Rufus** 写入

详细步骤见下方「[四、下载链接汇总](#四下载链接汇总)」与「[Rufus 制作要点](#rufus-制作要点)」。

---

### 🚀 第二步：开始安装 Ubuntu 系统

#### 1. 从 U 盘启动
重启电脑，开机时**反复按启动菜单键**（常见：`F12` / `F10` / `F9` / `Esc`，取决于电脑品牌），在菜单中选择带 **`UEFI:`** 前缀的 U 盘项。

#### 2. 进入安装界面
选择 **Try or Install Ubuntu**。

#### 3. 关键分区步骤

| 情况 | 操作 |
|---|---|
| **推荐（最简单）** | 在「安装类型」界面选择 **与 Windows Boot Manager 共存**（或「安装 Ubuntu，与 Windows 共存」） |
| 若没有该选项 | 选择 **其他选项**，手动把之前预留的「未分配空间」创建为 `/`（根分区，**ext4** 格式），可选再建 `/home`（ext4） |

#### 4. 完成安装
按提示设置用户名、密码，等待安装完成。重启后会出现 **GRUB 菜单**，可选择进入 Ubuntu 或 Windows。

---

### 🤖 第三步：在 Ubuntu 中安装 ROS 2

> 以下以 **ROS 2 Jazzy（对应 Ubuntu 24.04）** 为例，官方步骤。

#### 1. 设置语言环境

```bash
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

#### 2. 添加 ROS 2 软件源

```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y

sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" \
  | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

> 💡 如果 `raw.githubusercontent.com` 下载失败（国内常见），可改用镜像加速或手动下载 key 文件。

#### 3. 安装 ROS 2 桌面版

```bash
sudo apt update
sudo apt upgrade
sudo apt install ros-jazzy-desktop ros-dev-tools
```

#### 4. 配置环境变量

把 ROS 2 环境自动加载到终端配置中，这样每次打开新终端都能直接用 `ros2` 命令：

```bash
echo "source /opt/ros/jazzy/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

---

### ✅ 第四步：验证安装

打开终端运行：

```bash
ros2 run rviz2 rviz2
```

**能看到 Rviz2 的图形界面弹出**，就说明一切就绪了。

---

## 三、Windows 侧配置答疑

> 这一节是实际操作中卡住的几个点。

### 3.1 在 Windows 11 找不到「快速启动」

**原因**：Windows 11 中「快速启动」不在「电源和电池」主界面，藏在更深的「控制面板」里。

**完整路径**：

```
控制面板 → 电源选项 → 选择电源按钮的功能 → 更改当前不可用的设置 → 取消勾选「启用快速启动」
```

**详细步骤**：

1. 点击任务栏「搜索」图标（放大镜），输入 `控制面板` 打开；或按 `Win + R` 输入 `control` 回车
2. 右上角「查看方式」改为 **大图标** / **小图标**
3. 点击 **电源选项**
4. 左侧点击 **选择电源按钮的功能**
5. 点击 **更改当前不可用的设置**（蓝色链接，需管理员权限）
6. 在「关机设置」中找到 **启用快速启动(推荐)**，取消勾选
7. 点击 **保存修改**

**关于笔记本的电源模式**：「电源模式」显示「平衡」、「节能模式」在 30% 时开启——**这些都不需要改**，属于日常电源管理，不影响 Ubuntu 安装。

### 3.2 控制面板里根本没有「启用快速启动」选项

这在 Windows 11 某些版本或特定配置下是正常的，通常意味着**你的电脑本来就没开启快速启动**，对装双系统反而是好事。

**用命令确认**：以管理员身份打开终端（`Win + X` → Windows 终端(管理员)），执行：

```cmd
powercfg /a
```

| 输出 | 含义 |
|---|---|
| **休眠不可用** | 绝对没有开启快速启动，可直接跳过 |
| **休眠可用** | 但界面看不到「快速启动」→ 通常只是界面显示问题，不影响安装 |

**如果仍想彻底关闭**（可选）：

```cmd
powercfg /h off
```

这个命令会关闭休眠功能，同时彻底关闭快速启动。执行后**重启一次**，再执行 `powercfg /a` 确认显示「休眠不可用」。

### 3.3 BitLocker 检查

在 Windows 搜索栏搜索「BitLocker」，或进入 **控制面板 → 系统和安全 → BitLocker 驱动器加密**。

| 界面表现 | 含义 | 操作 |
|---|---|---|
| 没有显示盘符列表，也没提示解锁或备份密钥 | C 盘**未加密** | 无需操作，直接跳过 |
| 系统盘显示「已启用」 | 已加密 | **必须先关闭**，等解密完成再装 Ubuntu，否则会导致安装失败或数据丢失 |

### 3.4 进度梳理（自查清单）

- [x] 备份重要数据（涉及磁盘分区，有风险，务必确认）
- [x] 关闭 Windows 快速启动
- [x] 关闭 BitLocker 加密
- [ ] **创建磁盘空闲空间**（为 Ubuntu 准备分区）
- [ ] 制作 Ubuntu 启动盘
- [ ] 重启进 BIOS 关闭 Secure Boot，调整启动项
- [ ] 安装 Ubuntu 系统
- [ ] 安装 ROS 2

> **比快速启动更重要的两件事**：
> 1. **确认 BitLocker 是否加密**（加密了必须先解密）
> 2. **确认 BIOS 里 Secure Boot 已关闭、启动模式是 UEFI**（对 Ubuntu 能否正常启动至关重要）

---

## 四、下载链接汇总

### Ubuntu 24.04 LTS 镜像

| 来源 | 地址 |
|---|---|
| **清华大学镜像站（推荐，速度快）** | <https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/noble/> |
| Ubuntu 官方源 | <https://releases.ubuntu.com/noble/> |

**选文件的要点**：

- 文件名类似 `ubuntu-24.04.4-desktop-amd64.iso`
- **必须带 `desktop` 字样**——这才是含图形界面的桌面版
- 文件大小约 **6.2 GB**；如果只有几百 MB，那是服务器版或 Minimal 版，需要重新下载

### Rufus 下载

| 来源 | 地址 |
|---|---|
| Rufus 官网（中文） | <https://rufus.ie/zh/> |

Rufus 是**绿色软件**，下载后无需安装，双击即可运行。

### Rufus 制作要点

1. 打开 Rufus，在「设备」中选中你的 U 盘
2. 点击「选择」，加载下载好的 Ubuntu ISO
3. **关键设置**：
   - 「分区类型」选 **GPT**
   - 「目标系统」选 **UEFI (非 CSM)**
   
   > 这两项对现代电脑是正确且最稳妥的选择，能避免很多启动问题
4. 其他保持默认，点击「开始」
5. 若弹出警告提示，选择 **「以 ISO 镜像模式写入」**
6. 等待几分钟到十几分钟，显示「准备就绪」即完成

---

## 五、备选方案对比

除了双系统，还有两种选择：

| 方案 | 优点 | 缺点 | 适用场景 |
|---|---|---|---|
| **双系统** | 性能原生，能流畅跑 Gazebo，可连接真实硬件 | 需要分区、配置 BIOS，有一定操作风险 | **对性能要求高**、要跑仿真或接真实硬件 |
| **WSL2** | 启动快，与 Windows 无缝交互，性能接近原生，支持 GPU 加速 | 图形界面支持有限 | 主要写代码和编译，偶尔用 RViz |
| **虚拟机**（VMware 等） | 最安全，不折腾双系统 | **GPU 加速支持有限**，跑 Gazebo 非常卡顿 | 只是初步了解 ROS 2 |

> **结论**：需要流畅运行 Gazebo 仿真或连接真实硬件 → **双系统**更合适。

---

## 六、重要提醒

### 引导问题
安装后如果开机直接进入 Windows，可在 BIOS 中调整启动顺序，**把 ubuntu 调到 Windows Boot Manager 之前**。

### 系统时间
Ubuntu 和 Windows 对硬件时间的解读方式不同（Windows 视为本地时间，Ubuntu 视为 UTC），会导致时间不一致。在 Ubuntu 终端执行：

```bash
timedatectl set-local-rtc 1
```

---


