# Glide

[Android图片加载框架最全解析（一），Glide的基本用法](https://blog.csdn.net/guolin_blog/article/details/53759439)

[面试官：简历上最好不要写Glide，不是问源码那么简单](https://juejin.im/post/5dbeda27e51d452a161e00c8#heading-3)

> [Glide 三部曲之请求生命周期管控](https://www.jianshu.com/p/738ad4c99e44)
>
> 构建一个无页面的fragment，监听activity的生命周期
>
> [Glide 三部曲之图片加载流程](https://www.jianshu.com/p/9f5d95632120)
>
> 将图片描述信息，包括图片来源（地址包括网络url、本地磁盘路径、drawable资源）、图片格式（如果有的话）和要显示imageView包装为target。
>
> target基本包含整个加载流程，计算要显示imageView尺寸，依次判断缓存（还在显示的图片、视图已销毁但还在内存中的图片、本地磁盘中的图片，最后是网络），最后显示到视图上。
>
> 因为target中同时持有图片和视图的实例对象，也负责处理加载图片过程中异常情况，视图被销毁、新的图片需要载入同一个视图（典型的就是列表复用视图）。
>
> [Glide 三部曲之 Gif 加载原理](https://www.jianshu.com/p/f4f05cf8a5a7)
>
> gif图片会包装成gifDrawable，从首帧开始渲染，渲染完一帧，发送handle消息，再渲染下一帧。
>
> 每一帧的加载还是在traget中进行，最后都还是作为drawable交给imageView去显示。
>
> [Glide 番外篇之判断图片的类型](https://www.jianshu.com/p/03b6e71e9025)

