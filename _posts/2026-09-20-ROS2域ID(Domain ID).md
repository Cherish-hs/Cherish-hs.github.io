# 同学的海龟，我的键盘：从“串台”现象理解 ROS 2 Domain ID

同学在自己电脑上打开了 `turtlesim` 海龟界面，你却在另一台电脑上敲下：

bash

```
ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0}, angular: {z: 1.0}}"
```



结果，同学屏幕上的海龟真的动了。

你可能会想：我是不是“串台”了？为什么我能控制他的海龟？更奇怪的是，有时候你执行 `ros2 node list`，却根本看不到他的节点。

这背后其实就是 **ROS 2 Domain ID、DDS 自动发现、逻辑网络和物理网络** 共同作用的结果。本文重点只讲清楚一件事：**Domain ID 到底做了什么。**

------

## 1. 什么是 ROS 2 域 ID

ROS 2 中的 **域 ID（Domain ID）** 是一个用于隔离通信的逻辑标识。

只有 `ROS_DOMAIN_ID` 完全相同的节点，才有可能互相发现、互相通信。
如果域 ID 不同，即使在同一台电脑、同一个 Wi-Fi 下，它们也像处于两个互不相通的世界。

一句话：

> **域 ID 决定“谁和谁在同一个 ROS 2 逻辑网络里”。**

默认情况下：

bash

```
ROS_DOMAIN_ID=0
```



多人共用同一网络时，如果都用默认域 `0`，就很容易出现“我能控制你的海龟”这种串台现象。

------

## 2. 域 ID 如何实现隔离

ROS 2 底层通信由 DDS 完成。DDS 本身就有 Domain 概念，`ROS_DOMAIN_ID` 最终会传给 DDS 的 DomainParticipant。

DDS 会根据域 ID 计算出不同的 **UDP 端口号**，因此：

- 不同域 ID 使用不同端口
- 不同域的节点默认不会互相发现
- 即使底层是同一张物理网络，也能在逻辑上隔开

这就是域 ID 实现逻辑隔离的核心机制。

------

## 3. 域 ID、物理网络与逻辑网络

- **物理网络**：网线、交换机、Wi-Fi、IP 地址等真实链路。它决定“数据包能不能到达对方”。
- **逻辑网络**：在物理网络之上，通过软件规则划分出的虚拟通信组。域 ID 就是 ROS 2 划分逻辑网络的方式。它决定“到达之后，对方愿不愿意理你”。

| 场景                  | 物理网络 | 域 ID | 能否通信         |
| :-------------------- | :------- | :---- | :--------------- |
| 同一 Wi-Fi，同一域 ID | 连通     | 相同  | ✅ 能             |
| 同一 Wi-Fi，不同域 ID | 连通     | 不同  | ❌ 不能，逻辑隔离 |
| 不同 Wi-Fi，同一域 ID | 不通     | 相同  | ❌ 不能，物理隔离 |
| 不同 Wi-Fi，不同域 ID | 不通     | 不同  | ❌ 不能           |

核心结论：

> **域 ID 相同，只是“愿意互相通信”；物理网络连通，才是“能够互相通信”。两者缺一不可。**

不同逻辑网络可以共享同一物理网络：大家共用同一套交换机、Wi-Fi 和带宽，但 ROS 2 层面互相看不到、收不到。

------

## 4. 如何设置域 ID

临时设置：

bash

```
export ROS_DOMAIN_ID=72
```



永久设置：

bash

```
echo 'export ROS_DOMAIN_ID=72' >> ~/.bashrc
source ~/.bashrc
```



查看当前域 ID：

bash

```
echo $ROS_DOMAIN_ID
```



没有设置时，默认是 `0`。

------

## 5. 域 ID 的取值范围

| 操作系统        | 推荐安全范围     | 原因                       |
| :-------------- | :--------------- | :------------------------- |
| Linux           | 0-101 和 215-232 | 临时端口通常在 32768-60999 |
| macOS / Windows | 0-166            | 临时端口通常在 49152-65535 |

注意事项：

- 同一台电脑、同一域 ID 下，每个进程会占用 2 个端口。
- 进程数超过约 **120 个** 时，端口可能溢出，占用相邻域 ID 的端口，引发冲突。
- 不同团队、不同机器人，建议分配不同域 ID。
- 不要长期多人共用默认域 `0`。

------

## 6. 域 ID 与 DDS 的关系

ROS 2 通信层次：

text

```
ROS 2 节点 / rclcpp / rclpy
        ↓
RMW 抽象层
        ↓
DDS 实现（Fast DDS、Cyclone DDS 等）
        ↓
RTPS / UDP / 共享内存
        ↓
物理网络
```



域 ID 在 DDS 中的位置：

- 每个节点会创建一个 DomainParticipant
- DomainParticipant 属于某个 Domain
- 不同 Domain 默认不能互相发现
- 同一个 Domain 内，通过 RTPS 的 SPDP / SEDP 互相发现

很多“话题存在但收不到”的问题，其实是 QoS 不匹配，而不是域 ID 问题。

------

## 7. 同物理网络 + 同域 ID，`ros2 node list` 一定能看到吗？

正常情况下，是的。

如果双方在同一个物理网络、`ROS_DOMAIN_ID` 相同、DDS 自动发现正常，那么：

bash

```
ros2 node list
```



通常能看到对方节点。

但注意：

> **同物理网络 + 同域 ID 只是必要条件，不是绝对保证。**

以下情况可能导致看不到：

1. 域 ID 实际不一致
2. 设置了 `ROS_LOCALHOST_ONLY=1`
3. 多播被阻挡
4. 不在同一子网
5. 防火墙或安全软件拦截
6. 不同 RMW 实现或版本兼容问题
7. 节点已退出或还没启动
8. ROS 2 daemon 缓存异常
9. 多网卡选错接口

快速验证：

bash

```
echo $ROS_DOMAIN_ID
echo $ROS_LOCALHOST_ONLY
ros2 node list
ros2 topic list
```



如果 `ping` 通，但 `ros2 node list` 看不到，多半是多播、防火墙、子网或 RMW 配置问题。

------

## 8. 为什么能操控海龟，但 `ros2 node list` 看不到节点？

核心原因：

> **ROS 2 的“话题通信”和“节点发现”是两套可以独立工作的机制。**

你能操控别人的海龟，说明：

- 你通过 `ros2 topic pub` 向 `/turtle1/cmd_vel` 发送消息
- DDS 的话题通信是正常的
- DataWriter 和 DataReader 匹配成功

但 `ros2 node list` 看不到节点，说明：

- 节点发现元数据没有成功获取

关键点：

- DDS 底层发现机制只知道 Participant 和 Endpoint
- DDS 本身不知道 ROS 2 的“节点名”概念
- ROS 2 会通过内置话题 `ros_discovery_info` 发布节点元数据
- `ros2 node list` 必须收到这些元数据，才能列出节点名

所以可能出现：

text

```
话题通信正常 ✅
节点发现元数据缺失 ❌
```



于是就能控制海龟，但看不到节点。

常见原因包括：

- ROS 2 daemon 缓存异常
- 多播不稳定
- 防火墙拦截
- 网络接口选择错误
- 不同 DDS 实现或版本兼容问题
- 节点元数据意外丢失

推荐排查顺序：

1. 确认域 ID 一致：

   bash

   ```
   echo $ROS_DOMAIN_ID
   ```

   

2. 绕过 daemon：

   bash

   ```
   ros2 node list --no-daemon
   ```

   

3. 重启 daemon：

   bash

   ```
   ros2 daemon stop
   ros2 daemon start
   ```

   

4. 测试多播：

   bash

   ```
   ros2 multicast send
   ros2 multicast receive
   ```

   

5. 检查防火墙和网络接口。

6. 检查 `ROS_LOCALHOST_ONLY` 和 RMW 配置。

------

## 9. 域 ID 常见坑与最佳实践

### 常见坑

- 多人共用默认域 `0`，导致节点、话题“串台”
- 忘记设置 `ROS_DOMAIN_ID`，以为隔离了其实没有
- Wi-Fi 多播不稳定，导致发现时好时坏
- 跨子网、跨物理网络时，误以为同域 ID 就能通
- 防火墙拦截 DDS UDP 端口
- QoS 不匹配，误判为域 ID 问题
- 多网卡导致 DDS 绑定错误接口

### 最佳实践

- 不同团队、不同机器人分配不同 `ROS_DOMAIN_ID`

- 固定域 ID，写入 `~/.bashrc` 或启动脚本

- 避免使用默认域 `0` 做多机调试

- 跨域通信使用 `domain_bridge`

- 跨物理网络使用 VPN、DDS Router 或 Discovery Server

- 多播不稳定时，配置单播 peers 或 Discovery Server

- 排查问题时先确认：

  bash

  ```
  echo $ROS_DOMAIN_ID
  echo $ROS_LOCALHOST_ONLY
  ros2 node list --no-daemon
  ros2 topic list
  ```

  

------

## 10. 全文总结

- **域 ID 是 ROS 2 在 DDS 层划分逻辑网络的核心标识。**
- 同域 ID 才能互相发现和通信，不同域 ID 默认完全隔离。
- 域 ID 只能做逻辑隔离，不能跨越物理网络。
- 不同逻辑网络可以共享同一物理网络，底层资源共用，上层通信隔离。
- 同物理网络 + 同域 ID 时，`ros2 node list` 通常能发现节点，但受多播、防火墙、daemon、RMW 等因素影响。
- 能操控海龟却看不到节点，是因为话题通信和节点发现是两套独立机制，节点元数据可能丢失。
- 排查域 ID 相关问题时，优先检查：域 ID 是否一致、是否 localhost-only、daemon 是否正常、多播是否通畅、防火墙是否拦截。

一句话：

> **域 ID 决定逻辑网络，物理网络决定可达性，DDS 负责发现与通信。三者配合，才构成完整的 ROS 2 通信链路。**