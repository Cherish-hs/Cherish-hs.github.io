---
title: "二维码与条形码识别系统"
description: "基于 Python、OpenCV 与 Pyzbar 的实时识别工具，支持结果可视化、CSV 记录与识别内容处理。"
field: COMPUTER VISION
order: 1
cover: /assets/images/opencv/图像识别.png
cover_alt: "二维码识别原理示意：定位二维码并读取识别内容"
repo_url: https://github.com/Cherish-hs/qr-code-recognition
tags: [Python, OpenCV, Pyzbar]
---

## 项目简介

这个项目围绕二维码与条形码识别展开，将图像获取、码区定位、内容解码和识别结果处理串联起来。通过 Python 组织程序逻辑，使用 OpenCV 处理图像，并结合 Pyzbar 读取二维码和条形码中的数据。

它也是一次将计算机视觉基础知识应用到实际工具中的实践：从理解图像中的像素，到把识别信息转化为可查看、可记录的结果。

## 图像处理与识别

识别过程可以拆分为几个步骤：先读取图像或视频帧，再进行必要的图像处理；随后检测码区、解码内容，最后将位置和识别信息展示出来。

![图像识别原理示意：定位二维码、解析类型和内容]({{ '/assets/images/opencv/图像识别.png' | relative_url }})

*图像识别示意：把图像中的码区转换为类型、内容与位置等结构化信息。*

## 主要功能

- **二维码与条形码识别**：通过 Pyzbar 解析码区中的数据。
- **识别结果可视化**：结合 OpenCV，将检测位置与识别内容反馈到图像中。
- **CSV 记录**：保存识别信息，便于后续整理与处理。
- **识别内容处理**：在得到解码结果后，由 Python 继续组织业务逻辑。

## 技术组成

| 技术 | 在项目中的作用 |
| --- | --- |
| Python | 程序逻辑、结果处理与数据记录 |
| OpenCV | 图像获取、预处理与可视化 |
| Pyzbar | 二维码和条形码的检测与解码 |

## 相关学习记录

图像处理是识别流程的基础。了解像素、颜色通道和常用处理方法，有助于理解程序为什么能从画面中找到并读取信息。

![图像处理基础知识示意]({{ '/assets/images/opencv/图像处理.png' | relative_url }})

*图像处理学习示意，配合项目理解图像数据与处理步骤。*

{% assign cv_posts = site.posts | where_exp: 'post', "post.title contains 'OpenCV'" %}
{% for post in cv_posts %}
- 延伸阅读：[{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}

## 查看代码

具体的环境依赖、运行入口和使用方式，以仓库中的说明为准。可以通过下方入口查看源码与项目资料。
