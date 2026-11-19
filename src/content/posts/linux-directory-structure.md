---
title: 读懂 Linux 目录结构：每个目录到底放什么
published: 2026-11-19T23:20:00+08:00
description: 一份 Linux 根目录速查笔记，从 /bin 到 /sys，说清楚每个目录该放什么、不该放什么。
tags:
  - Linux
  - 学习笔记
category: 学习笔记
---

刚接触 Linux 时，最困惑的就是根目录下那一堆名字：`/bin`、`/sbin`、`/etc`、`/var`、`/proc`……到底谁放程序、谁放配置、谁放数据？

这份笔记按「存放内容」把它们分了几组，方便随时回查。

## 先记住一个标准：FHS

Linux 的目录布局基本遵循 **FHS（Filesystem Hierarchy Standard，文件系统层次标准）**。它规定每个目录的用途，好处是程序在任何发行版上都能找到该找的东西。

想查看系统自带的说明，可以直接：

```bash
man 7 hier
```

## 速查表

| 目录 | 存放什么 | 记忆点 |
| --- | --- | --- |
| `/` | 根目录，一切目录的起点 | 整个文件树的入口 |
| `/bin` | 普通用户和系统启动都需要的**基础命令**（ls、cp、cat） | bin = binary，可执行文件 |
| `/sbin` | 系统管理命令，一般需要 root（fdisk、mkfs、reboot） | s = system |
| `/lib` | `/bin`、`/sbin` 用到的**共享库**和内核模块 | library |
| `/usr` | 用户程序与只读数据，体量最大的一层 | Unix System Resources |
| `/etc` | 全系统的**配置文件**（如 `nginx.conf`、`passwd`、`fstab`） | edit to configure |
| `/home` | 普通用户的家目录，`/home/用户名` | 放个人文件 |
| `/root` | root 用户的家目录（不是 `/home/root`） | 管理员专属 |
| `/tmp` | 临时文件，重启后可能被清空 | temporary |
| `/var` | 会不断变化的数据：日志、缓存、队列、数据库 | variable |
| `/dev` | **硬件设备文件**，每个设备对应一个文件 | device |
| `/proc` | 内核与进程的虚拟信息（内存、CPU、每个进程） | process |
| `/sys` | 内核对象与设备树，udev 等据此工作 | system，较新的虚拟文件系统 |
| `/mnt` | 手动挂载点，比如临时挂个 U 盘、NFS | mount |
| `/media` | 系统自动挂载的可移动介质（U 盘、光盘） | 自动 vs 手动 |
| `/opt` | 额外安装的第三方软件，一个软件一个目录 | optional |
| `/srv` | 服务运行所需的数据（网站、FTP 根目录） | service |
| `/boot` | 内核 `vmlinuz`、`initrd`、GRUB 引导文件 | 启动相关 |
| `/run` | 运行期状态，开机后重建（PID、socket） | 内存里的 tmpfs |
| `/lost+found` | 文件系统损坏修复后找回的碎片 | 平时是空的 |

## 按用途分组的理解方式

### 程序与库：`/bin`、`/sbin`、`/lib`、`/usr`

这一组最容易混，一句话概括：

- `/bin`：**所有人都要用**的基础命令
- `/sbin`：**管理员才用**的系统命令
- `/lib`：上面两个目录里程序依赖的**库文件**
- `/usr`：更大一层的程序与资源，`/usr/bin`、`/usr/lib`、`/usr/local`、`/usr/share`

现代发行版（如 Ubuntu、Fedora）已经把 `/bin`、`/sbin`、`/lib` 做成了指向 `/usr` 下同名目录的**符号链接**，所以它们其实是同一份东西：

```bash
ls -l /bin
# lrwxrwxrwx 1 root root 7 ... /bin -> usr/bin
```

| 位置 | 典型内容 |
| --- | --- |
| `/usr/bin` | 用户安装的程序（curl、git、python3） |
| `/usr/sbin` | 非关键的系统管理程序 |
| `/usr/lib` | 共享库、语言运行时 |
| `/usr/local` | 源码编译安装的软件，避免被包管理器覆盖 |
| `/usr/share` | 与架构无关的资源：文档、图标、man 手册 |

### 配置与数据：`/etc`、`/var`

- `/etc`：**只放配置**，不放可执行程序。改完配置一般要 `systemctl restart` 对应服务。
- `/var`：**会增长、会滚动**的数据，典型子目录：

| 子目录 | 内容 |
| --- | --- |
| `/var/log` | 系统与服务日志（`syslog`、`auth.log`、`nginx/`） |
| `/var/lib` | 程序的状态数据（数据库文件、包管理器数据库） |
| `/var/cache` | 可再生的缓存（apt 下载的包） |
| `/var/spool` | 等待处理的任务（打印队列、邮件队列） |
| `/var/www` | Debian 系默认的网站根目录 |

判断技巧：**内容会随运行不断变化 → `/var`；一次写好基本不动 → `/etc`。**

### 用户空间：`/home`、`/root`

普通用户的家目录在 `/home` 下，root 的家目录单独放在 `/root`。这也是为什么 root 不需要「家」这个概念——它本来就无处不在。

### 临时与运行期：`/tmp`、`/run`

- `/tmp`：所有用户可写，带 sticky bit（只能删自己的文件），重启通常清空。
- `/run`：内存文件系统，存放运行中的 PID、锁文件、socket，开机重建。

写脚本时，长期保存的东西千万别放这两个目录。

### 虚拟文件系统：`/dev`、`/proc`、`/sys`

这三个目录**不占磁盘**（或只占极少），内容由内核动态生成，体现「Linux 一切皆文件」：

| 路径 | 作用 |
| --- | --- |
| `/dev/sda`、`/dev/nvme0n1` | 磁盘设备 |
| `/dev/null` | 黑洞，写进去的东西直接丢弃 |
| `/dev/zero` | 无限读出 0 字节 |
| `/dev/random`、`/dev/urandom` | 随机数 |
| `/dev/pts/` | 伪终端 |
| `/proc/cpuinfo`、`/proc/meminfo` | CPU、内存信息 |
| `/proc/<pid>/` | 单个进程的实时状态 |
| `/sys/class/`、`/sys/block/` | 设备与内核对象树 |

所以 `/dev` 里看到的「文件」并不是真正存在硬盘上的文件，而是**内核给你操作硬件的入口**。

### 挂载与外部软件：`/mnt`、`/media`、`/opt`、`/srv`

- `/mnt`：手动挂载，习惯上临时挂载都放这里。
- `/media`：桌面环境自动挂载 U 盘、光盘的地方。
- `/opt`：整包安装的第三方软件，例如 `/opt/google/chrome`。
- `/srv`：对外提供服务的业务数据。

### 启动相关：`/boot`

存放内核镜像 `vmlinuz-*`、初始内存盘 `initrd.img-*` 和 GRUB 配置。这里的东西一旦损坏，系统可能直接起不来，通常单独分区。

## 几个实用命令

```bash
ls /                 # 看根目录
df -h                # 各分区使用情况
du -sh /var/log      # 某个目录占多大
lsblk                # 块设备（对应 /dev 下的设备名）
man 7 hier           # FHS 官方说明
```

## 小结

按「内容是否会变」和「谁来用」记，比死记硬背目录名有效得多：

- **不变的程序** → `/usr`（`/bin`、`/sbin` 是现代版别名）
- **不变的配置** → `/etc`
- **会变的运行数据** → `/var`
- **用户自己的文件** → `/home`
- **一切皆文件的内核接口** → `/dev`、`/proc`、`/sys`

下次看到陌生命令时，先用 `which` 或 `type` 看看它落在哪个目录，目录结构自然就记住了。
