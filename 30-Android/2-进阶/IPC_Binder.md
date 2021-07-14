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