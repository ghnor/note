# IPC/Binder

[Android跨进程通信：图文详解 Binder机制原理](https://blog.csdn.net/carson_ho/article/details/73560642)

[如何在android面试中说清楚android中binder机制的实现过程](https://blog.csdn.net/zhencheng20082009/article/details/62227956)

[写给 Android 应用工程师的 Binder 原理剖析](https://segmentfault.com/a/1190000014295945)

[Binder系列—开篇](http://gityuan.com/2015/10/31/binder-prepare/)

[Android aidl Binder框架浅析](https://blog.csdn.net/lmj623565791/article/details/38461079)

[Android进程间通信（IPC）机制Binder简要介绍和学习计划](https://blog.csdn.net/luoshengyang/article/details/6618363/)

[Android 进程间通信](http://wuxiaolong.me/2018/02/15/AndroidIPC/)

[图解Android中的binder机制](https://juejin.im/post/5e89f717f265da47e6491496#heading-0)

[可能是讲解 Binder 机制最好的文章](https://juejin.im/entry/5786afbb8ac2470060665499)

[Binder AIDL proxy stub](https://www.jianshu.com/p/be340e73e44b)

## 为什么选择Binder

- 性能方面
  - 共享内存 0次数据拷贝
  - Binder 1次数据拷贝
  - Socket/管道/消息队列 2次数据拷贝

## Binder是如何做到一次拷贝的

Binder借助了内存映射mmap的方法，在内核空间和接收方用户空间的数据缓存区之间做了一层内存映射，就相当于直接拷贝到了接收方用户空间的数据缓存区，从而减少了一次数据拷贝。

## 内存映射mmap原理

MMAP内存映射的实现过程，总的来说可以分为三个阶段： 

**（一）进程启动映射过程，并在虚拟地址空间中为映射创建虚拟映射区域**

1. 进程在用户空间调用库函数mmap，原型：void *mmap(void *start, size_t length, int prot, int flags, int fd, off_t offset);
2. 在当前进程的虚拟地址空间中，寻找一段空闲的满足要求的连续的虚拟地址
3. 为此虚拟区分配一个vm_area_struct结构，接着对这个结构的各个域进行了初始化
4. 将新建的虚拟区结构（vm_area_struct）插入进程的虚拟地址区域链表或树中

**（二）调用内核空间的系统调用函数mmap（不同于用户空间函数），实现文件物理地址和进程虚拟地址的一一映射关系**

1. 为映射分配了新的虚拟地址区域后，通过待映射的文件指针，在文件描述符表中找到对应的文件描述符，通过文件描述符，链接到内核“已打开文件集”中该文件的文件结构体（struct file），每个文件结构体维护着和这个已打开文件相关各项信息。
2. 通过该文件的文件结构体，链接到file_operations模块，调用内核函数mmap，其原型为：int mmap(struct file *filp, struct vm_area_struct *vma)，不同于用户空间库函数。
3. 内核mmap函数通过虚拟文件系统inode模块定位到文件磁盘物理地址。
4. 通过remap_pfn_range函数建立页表，即实现了文件地址和虚拟地址区域的映射关系。此时，这片虚拟地址并没有任何数据关联到主存中。

**（三）进程发起对这片映射空间的访问，引发缺页异常，实现文件内容到物理内存（主存）的拷贝** 

注：前两个阶段仅在于创建虚拟区间并完成地址映射，但是并没有将任何文件数据的拷贝至主存。真正的文件读取是当进程发起读或写操作时。

进程的读或写操作访问虚拟地址空间这一段映射地址，通过查询页表，发现这一段地址并不在物理页面上。因为目前只建立了地址映射，真正的硬盘数据还没有拷贝到内存中，因此引发缺页异常。

1. 缺页异常进行一系列判断，确定无非法操作后，内核发起请求调页过程。
2. 调页过程先在交换缓存空间（swap cache）中寻找需要访问的内存页，如果没有则调用nopage函数把所缺的页从磁盘装入到主存中。
3. 之后进程即可对这片主存进行读或者写的操作，如果写操作改变了其内容，一定时间后系统会自动回写脏页面到对应磁盘地址，也即完成了写入到文件的过程。

注：修改过的脏页面并不会立即更新回文件中，而是有一段时间的延迟，可以调用msync()来强制同步, 这样所写的内容就能立即保存到文件里了。

## Binder机制是如何跨进程的

1. Binder驱动
   1. 在内核空间创建一块接收缓存区
   2. 实现地址映射：将内核缓存区、接收进程用户空间映射到同一接收缓存区

2. 发送进程通过系统调用（copy_from_user）将数据发送到内核缓存区。由于内核缓存区和接收进程用户空间存在映射关系，故相当于也发送了接收进程的用户空间，实现了跨进程通信。

服务端实现Binder接口：

```java
public class BookManagerService extends Service {

    private static final String TAG = "BMS";

    private CopyOnWriteArrayList<Book> mBookList = new CopyOnWriteArrayList<>();

    private Binder mBinder = new IBookManager.Stub() {
        @Override
        public List<Book> getBookList() throws RemoteException {
            return mBookList;
        }

        @Override
        public void addBook(Book book) throws RemoteException {
            mBookList.add(book);
        }
    };

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        arrivedNewBook(null);
    }
}
```

客户端调用Binder接口：

```java
public class MainActivity extends AppCompatActivity {

    private IBinder mIBinder;

    private IBookManager mIBookManager;

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            mIBinder = iBinder;
            mIBookManager = IBookManager.Stub.asInterface(iBinder);
	    			try {
                List<Book> list = mIBookManager.getBookList();
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
          
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Intent intent = new Intent(this, BookManagerService.class);
        bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onDestroy() {
        unbindService(mServiceConnection);
        super.onDestroy();
    }
}
```

我们声明的接口IMyAidlInterface包含了一个静态内部类Stub，并且Stub也继承了IMyAidlInterface，所以Stub是IMyAidlInterface的具体实现，而Stub又是一个抽象类，最终的实现在RemoteService中
 Stub内部包含了一个静态内部类Proxy，同样实现了接口IMyAidlInterface


在asInterface方法中首先会判断Binder是否处在当前进程，如果在同一个进程下的话，那么asInterface()将返回服务端的Stub对象本身，如果不是同一个进程，那么asInterface()返回是Stub.Proxy对象。