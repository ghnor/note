## Matrix @Tencent

Matrix 当前监控范围包括：应用安装包大小，帧率变化，启动耗时，卡顿，慢方法，SQLite 操作优化，文件读写，内存泄漏等等。

* PK Checker: 针对 APK 安装包的分析检测工具，根据一系列设定好的规则，检测 APK 是否存在特定的问题，并输出较为详细的检测结果报告，用于分析排查问题以及版本追踪
* Resource Canary: 基于 WeakReference 的特性和 [Square Haha](https://github.com/square/haha) 库开发的 Activity 泄漏和 Bitmap 重复创建检测工具
* Trace Canary: 监控界面流畅性、启动耗时、页面切换耗时、慢函数及卡顿等问题
* SQLite Lint: 按官方最佳实践自动化检测 SQLite 语句的使用质量
* IO Canary: 检测文件 IO 问题，包括：文件 IO 监控和 Closeable Leak 监控