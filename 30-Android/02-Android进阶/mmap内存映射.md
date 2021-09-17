[Android中mmap原理及应用简析](https://juejin.im/post/5c3ec9ebf265da61223a93de#heading-2)

[从内存映射mmap说开去](https://juejin.im/post/5caaf564f265da24d60e9c8d#heading-2)

> [认真分析mmap：是什么 为什么 怎么用](https://www.cnblogs.com/huxiao-tee/p/4660352.html)
>
> ### mmap相关函数
>
> 开辟映射内存空间：`void *mmap(void *start, size_t length, int prot, int flags, int fd, off_t offset);`
>
> 关闭映射：`int munmap( void * addr, size_t len );`
>
> 同步一次内存和文件内容：`int msync( void *addr, size_t len, int flags );`
>
> ### 使用细节
>
> 1、使用mmap需要注意的一个关键点是，mmap映射区域大小必须是物理页大小(page_size)的整倍数（32位系统中通常是4k字节）。原因是，内存的最小粒度是页，而进程虚拟地址空间和内存的映射也是以页为单位。为了匹配内存的操作，mmap从磁盘到虚拟地址空间的映射也必须是页。
>
> 2、内核可以跟踪被内存映射的底层对象（文件）的大小，进程可以合法的访问在当前文件大小以内又在内存映射区以内的那些字节。也就是说，如果文件的大小一直在扩张，只要在映射区域范围内的数据，进程都可以合法得到，这和映射建立时文件的大小无关。具体情形参见“情形三”。
>
> 3、映射建立之后，即使文件关闭，映射依然存在。因为映射的是磁盘的地址，不是文件本身，和文件句柄无关。同时可用于进程间通信的有效地址空间不完全受限于被映射文件的大小，因为是按页映射。

> [mmap 函数：原理与使用(含代码)](https://www.jianshu.com/p/187eada7b900)
>
> 扩展文件大小：`lseek(fd, size_lim_-1, SEEK_SET);`

