# Glide

[Android图片加载框架最全解析（一），Glide的基本用法](https://blog.csdn.net/guolin_blog/article/details/53759439)

> [面试官：简历上最好不要写Glide，不是问源码那么简单](https://juejin.im/post/5dbeda27e51d452a161e00c8#heading-3)
>
> - 多种图片格式的缓存，适用于更多的内容表现形式（如Gif、WebP、缩略图、Video）
> - 生命周期集成（根据Activity或者Fragment的生命周期管理图片加载请求）
> - 高效处理Bitmap（bitmap的复用和主动回收，减少系统回收压力）
> - 高效的缓存策略，灵活（Picasso只会缓存原始尺寸的图片，Glide缓存的是多种规格），加载速度快且内存开销小（默认Bitmap格式的不同，使得内存开销是Picasso的一半）
>
> 首先，梳理一下必要的图片加载框架的需求：
>
> - 异步加载：线程池
> - 切换线程：Handler，没有争议吧
> - 缓存：LruCache、DiskLruCache
> - 防止OOM：软引用、LruCache、图片压缩、Bitmap像素存储位置
> - 内存泄露：注意ImageView的正确引用，生命周期管理
> - 列表滑动加载的问题：加载错乱、队满任务过多问题

> bitmap复用
>
> > [Bitmap复用](https://blog.csdn.net/zx7415963/article/details/78664073)
> >
> > bitmap .setPixels (BgraData, offset, stride, 0 , 0 , videoWidth, videoHeight) *;*
> >
> > - pixels 需要写入的颜色数据数组 H*W
> > - offset 从数组的哪个位置开始写入
> > - stride 一般来讲是数组的 W
> > - x 写入bitmap的起始点x
> > - y 写入bitmap的起始点y
> > - width 要从pixels中每行要获取的像素点数目
> > - height 要向bitmap中写入多少行
>
> [BitmapPool 了解吗？Glide 是如何实现 Bitmap 复用的？](https://blog.csdn.net/github_35186068/article/details/115754698)
>
> [拆 Glide 系列之 - Bitmap 复用](https://www.jianshu.com/p/d6cae68175f2)
>
> [Bitmap知识点集合](https://www.shangmayuan.com/a/39f136a4602d45519a598565.html)
>
> ```
> options.inMutable
> options.inBitmap
> ```

