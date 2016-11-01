> [Android内存泄漏总结](http://blog.xuanzhangjiong.xyz/2016/03/01/Android%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E6%80%BB%E7%BB%93/)  
> [内存泄露从入门到精通三部曲之基础知识篇](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=21&highlight=%E5%86%85%E5%AD%98%E6%B3%84%E9%9C%B2%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A%E4%B8%89%E9%83%A8%E6%9B%B2%E4%B9%8B%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86%E7%AF%87)  
> [内存泄露从入门到精通三部曲之排查方法篇](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=62&highlight=%E5%86%85%E5%AD%98%E6%B3%84%E9%9C%B2%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A%E4%B8%89%E9%83%A8%E6%9B%B2%E4%B9%8B%E6%8E%92%E6%9F%A5%E6%96%B9%E6%B3%95%E7%AF%87)  
> [内存泄露从入门到精通三部曲之常见原因与用户实践](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=125&highlight=%E5%86%85%E5%AD%98%E6%B3%84%E9%9C%B2%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A%E4%B8%89%E9%83%A8%E6%9B%B2%E4%B9%8B%E5%B8%B8%E8%A7%81%E5%8E%9F%E5%9B%A0%E4%B8%8E%E7%94%A8%E6%88%B7%E5%AE%9E%E8%B7%B5)

# 什么是内存泄露
当一个对象已经不需要再使用了，本该被回收时，而有另外一个正在使用的对象持有它的引用从而导致它不能被回收，这导致本该被回收的对象不能被回收而停留在堆内存中，这种情况就称为内存泄漏(Memory Leak)。

# 常见的内存泄露及解决

## 单例造成的内存泄露
由于单例的静态特性使得单例的生命周期和应用的生命周期一样长，这就说明了如果一个对象已经不需要使用了，而单例对象还持有该对象的引用，那么这个对象将不能被正常回收，这就导致了内存泄漏。
```java
public class Singleton {
    private static Singleton instance;
    private Context context;
    private Singleton(Context context) {
        this.context = context;
    }
    public static Singleton getInstance(Context context) {
        if (instance != null) {
            instance = new Singleton(context);
        }
        return instance;
    }
}
```
如果传入的是Activity的context，那么当context对应的Activity被退出时，因为该单例持有context的引用，这部分内存就无法被回收。

**解决：**  

将Activity的context替换为Application的context。
```java
public class Singleton {
    private static Singleton instance;
    private Context context;
    private Singleton(Context context) {
        this.context = context.getApplicationContext();;
    }
    public static Singleton getInstance(Context context) {
        if (instance != null) {
            instance = new Singleton(context);
        }
        return instance;
    }
}
```
但是实际上，ApplicationContext与ActivityContext在职能上是有区别的。有些情况下只能使用ActivityContext，如果碰到这种情况，就要考虑是否有更合理的设计以代替单例模式。

## 非静态内部类造成的内存泄露
在 Java 中，非静态内部类（包括匿名内部类，如Handler、Runnable匿名内部类容易导致内存泄露）会持有外部类对象（如Activity）的强引用，而静态的内部类则不会引用外部类对象。  
当内部类对象的生命周期长于外部类对象时，因为内部类对象持有外部类对象的引用，导致外部类对象无法被回收，就会造成内存泄露的发生。

### 1. 非静态内部类创建静态实例造成的内存泄漏
```java
public class MainActivity extends AppCompatActivity {
    private static InternalClass mInternalClass = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if(mInternalClass == null){
            mInternalClass = new InternalClass();
        }
        //...
    }
    class InternalClass {
		//...
    }
}
```

**解决：**  

将该内部类设为静态内部类或将该内部类抽取出来封装成一个单例，如果需要使用Context，请使用ApplicationContext。
```java
public class MainActivity extends AppCompatActivity {
    private static InternalClass mInternalClass = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if(mInternalClass == null){
            mInternalClass = new InternalClass();
        }
        //...
    }
    static class InternalClass {
		//...
    }
}
```

### 2. Handler造成的内存泄露
```java
public class MainActivity extends AppCompatActivity {
    private Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            //...
        }
    };
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        Message message = Message.obtain();
        mHandler.sendMessage(message);
    }
}
```
Handler是在一个Looper线程中不断轮询处理消息，那么当这个Activity退出时消息队列中还有未处理的消息或者正在处理消息，而消息队列中的Message持有Handler实例的引用，Handler实例又持有Activity的引用，所以导致该Activity的内存资源无法及时回收，引发内存泄漏。

**解决：**

通过静态内部类+弱引用解决。
```java
public class MainActivity extends AppcompatActivity {
	StaticHandler mHandler = new StaticHandler(this);
#
	static class StaticHandler extends Handler {
		WeakReference<MainActivity> activityReference;

		StaticHandler(MainActivity activity) {
			activityReference = new WeakReference<>(activity);
		}

		@Override
		public void handleMessage(Message msg) {
			MainActivity activity = activityReference.get();
			if (activity != null) {
				//...
			}
		}
	}
}
```
但是Looper线程的消息队列中还是可能会有待处理的消息，所以我们在Activity的Destroy时或者Stop时应该移除消息队列中的消息。
```java
@Override
protected void onDestroy() {
	super.onDestroy();
	mHandler.removeCallbacksAndMessages(null);
}
```
也可以使用`mHandler.removeCallbacks();`或`mHandler.removeMessages();`来移除指定的Runnable和Message。

### 3. Thread造成的内存泄露

同上，线程 Thread 对象的 run 任务未执行完之前，它是不会被释放的，而我们经常在 Activity 中 new 一个线程来执行耗时任务，通常也都是通过匿名内部类的方法构造线程对象，因此非常容易导致 Activity 无法及时释放。

## WebView的内存泄漏

Android 中的 WebView 存在很大的兼容性问题，有些 WebView 甚至存在内存泄露的问题。所以通常根治这个问题的办法是为 WebView 开启另外一个进程，通过 AIDL 与主进程进行通信， WebView 所在的进程可以根据业务的需要选择合适的时机进行销毁，从而达到内存的完整释放。

## AlertDialog造成的内存泄露
```java
new AlertDialog.Builder(this)
	.setPositiveButton("Baguette", new DialogInterface.OnClickListener() {
		@Override public void onClick(DialogInterface dialog, int which) {
			MyActivity.this.makeBread();
		}
	})
	.show();
```
DialogInterface.OnClickListener 的匿名实现类持有了 MainActivity 的引用；

而在 AlertDialog 的实现中，OnClickListener 类将被包装在一个 Message 对象中（具体可以看 AlertController 类的 setButton 方法），而且这个 Message 会在其内部被复制一份（AlertController 类的 mButtonHandler 中可以看到），两份 Message 中只有一个被 recycle，另一个（OnClickListener 的成员变量引用的 Message 对象）将会泄露！

解决办法：
* Android 5.0 以上不存在此问题；
* Message 对象的泄漏无法避免，但是如果仅仅是一个空的 Message 对象，将被放入对象池作为后用，是没有问题的；
* 让 DialogInterface.OnClickListener 对象不持有外部类的强引用，如用 static 类实现；
* 在 Activity 退出前 dismiss dialog!

## Drawable引起的内存泄露
*Android 在 4.0 以后已经解决了这个问题。这里可以跳过。*

当我们屏幕旋转时，默认会销毁掉当前的 Activity，然后创建一个新的 Activity 并保持之前的状态。在这个过程中，Android 系统会重新加载程序的UI视图和资源。假设我们有一个程序用到了一个很大的 Bitmap 图像，我们不想每次屏幕旋转时都重新加载这个 Bitmap 对象，最简单的办法就是将这个 Bitmap 对象使用 static 修饰。
```java
private static Drawable sBackground;

@Override
protected void onCreate(Bundle state) {
	super.onCreate(state);

	TextView label = new TextView(this);
	label.setText("Leaks are bad");

	if (sBackground == null) {
		sBackground = getDrawable(R.drawable.large_bitmap);
	}
	label.setBackgroundDrawable(sBackground);

	setContentView(label);
}
```
但是上面的方法在屏幕旋转时有可能引起内存泄露，因为，当一个 Drawable 绑定到了 View 上，实际上这个 View 对象就会成为这个 Drawable 的一个 callback 成员变量，上面的例子中静态的 sBackground 持有 TextView 对象的引用，而 TextView 持有 Activity 的引用。当屏幕旋转时，Activity 无法被销毁，这样就产生了内存泄露问题。

该问题主要产生在 4.0 以前，因为在 2.3.7 及以下版本 Drawable 的 setCallback 方法的实现是直接赋值，而从 4.0.1 开始，setCallback 采用了弱引用处理这个问题，避免了内存泄露问题。

## 资源未关闭造成的内存泄露
* BroadcastReceiver，ContentObserver 之类的没有解除注册啊；
* File，Cursor，Stream 之类的没有 close 啊；
* 无限循环的动画在 Activity 退出前没有停止啊；
* 一些其他的该 release 的没有 release，该 recycle 的没有 recycle…等等。

# 总结

我们不难发现，大多数问题都是 static 造成的！

* 在使用 static 时一定要小心，关注该 static 变量持有的引用情况。在必要情况下使用弱引用的方式来持有一些引用。
* 在使用非静态内部类时也要注意，毕竟它们持有外部类的引用。（高端一点的使用 RxJava 的同学在 subscribe 时也要注意 unSubscribe 哦）。
* 保持对对象生命周期的敏感，特别注意单例、静态对象、全局性集合等的生命周期，注意在生命周期结束时释放资源。
* 使用属性动画时，不用的时候请停止(尤其是循环播放的动画)，不然会产生内存泄露（Activity 无法释放）（View 动画不会）。
* 在涉及到Context时先考虑ApplicationContext，当然它并不是万能的，对于有些地方则必须使用Activity的Context。

# 几种内存检测工具的介绍

* Memory Monitor
* Allocation Tracker
* Heap Viewer
* LeakCanary
