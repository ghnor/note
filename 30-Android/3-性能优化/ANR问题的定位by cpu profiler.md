[使用 CPU Profiler 检查 CPU 活动](https://developer.android.com/studio/profile/cpu-profiler?hl=zh-cn#top_of_page)

以前都是通过`TraceView`和`DDMS`来定位分析ANR问题，AS后来更新了CPU Profiler，可以看到任意方法执行的时间，当然也可以帮助我们定位ANR问题。

比较具体的用法，请参考官方文档。

通过在MainaActivity的某个Click事件中调用Thread.sleep()来模拟一次ANR。

![image-20200902191501312](https://shanghai-1252949174.cos.ap-shanghai.myqcloud.com/202009021915013TCwc8.png)

很直接可以看到onClick占用了很大的cpu时间，右键点击Jump to Source可以跳到MainActivity中。