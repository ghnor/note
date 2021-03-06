# WebView优化

[WebView性能、体验分析与优化](https://tech.meituan.com/2017/06/09/webviewperf.html)

---

一个加载网页的过程中，native、网络、后端处理、CPU都会参与，各自都有必要的工作和依赖关系；让他们相互并行处理而不是相互阻塞才可以让网页加载更快：

* WebView初始化慢，可以在初始化同时先请求数据，让后端和网络不要闲着。
* 常用 JS 本地化及延迟加载，使用第三方浏览内核
* 后端处理慢，可以让服务器分trunk输出，在后端计算的同时前端也加载网络静态资源。
* 脚本执行慢，就让脚本在最后运行，不阻塞页面解析。
* 同时，合理的预加载、预缓存可以让加载速度的瓶颈更小。
* WebView初始化慢，就随时初始化好一个WebView待用。
* DNS和链接慢，想办法复用客户端使用的域名和链接。

---

这是因为在客户端中，加载H5页面之前，需要先初始化WebView，在WebView完全初始化完成之前，后续的界面加载过程都是被阻塞的。

优化手段围绕着以下两个点进行：

* 预加载WebView。
* 加载WebView的同时，请求H5页面数据。

因此常见的方法是：

* 全局WebView。
* 客户端代理页面请求。WebView初始化完成后向客户端请求数据。
* asset存放离线包。

除此之外还有一些其他的优化手段：

* 脚本执行慢，可以让脚本最后运行，不阻塞页面解析。
* DNS链接慢，可以让客户端复用使用的域名与链接。
* React框架代码执行慢，可以将这部分代码拆分出来，提前进行解析。