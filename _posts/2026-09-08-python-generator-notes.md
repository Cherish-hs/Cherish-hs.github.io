---
layout: post
title: "Python 学习笔记：生成器、装饰器与上下文管理器"
date: 2026-09-08 20:30:00 +0800
tags: [Python, 学习笔记]
---

整理最近练习中遇到的三个 Python 进阶知识点：**生成器**、**装饰器**和**上下文管理器**。
它们的共同点是：都能让代码更优雅、更省内存。

<!--more-->

## 1. 生成器（Generator）

使用 `yield` 的函数叫做生成器函数，调用它不会立即执行，而是返回一个生成器对象，
每次 `next()` 才执行到下一个 `yield`：

```python
def count_up(n):
    i = 0
    while i < n:
        yield i
        i += 1

for num in count_up(3):
    print(num)   # 0 1 2
```

生成器**惰性求值**，处理大数据时不会一次性占用全部内存。

生成器表达式写法类似列表推导式，但用圆括号：

```python
total = sum(x * x for x in range(1_000_000))   # 不会生成百万元素的列表
```

## 2. 装饰器（Decorator）

装饰器可以在不修改原函数的情况下给它"加功能"，比如计时、日志：

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)              # 保留原函数名和文档字符串
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time() - start:.3f}s")
        return result
    return wrapper

@timer
def slow_task():
    time.sleep(1)

slow_task()   # slow_task 耗时 1.001s
```

> 记得用 `@wraps(func)`，否则被装饰函数的 `__name__` 和 `__doc__` 会变成 wrapper 的。

## 3. 上下文管理器（Context Manager）

上下文管理器保证资源（文件、连接）被正确释放，即 `with` 语句的原理：

```python
# 方式一：类实现 __enter__ / __exit__
class OpenFile:
    def __init__(self, path, mode):
        self.f = open(path, mode, encoding="utf-8")

    def __enter__(self):
        return self.f

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()

# 方式二：contextlib 装饰器，更简洁
from contextlib import contextmanager

@contextmanager
def open_file(path, mode):
    f = open(path, mode, encoding="utf-8")
    try:
        yield f
    finally:
        f.close()

with open_file("test.txt", "w") as f:
    f.write("hello")
```

## 小结

| 特性 | 关键字/方法 | 典型用途 |
| --- | --- | --- |
| 生成器 | `yield` | 惰性序列、节省内存 |
| 装饰器 | `@decorator` | 日志、计时、权限校验 |
| 上下文管理器 | `__enter__`/`__exit__`、`@contextmanager` | 资源自动释放 |

这三个特性在阅读框架源码时经常出现，掌握后写代码会顺手很多。
