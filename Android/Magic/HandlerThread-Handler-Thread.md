Handler会关联一个单独的线程和消息队列。
Handler默认关联主线程，虽然要提供Runnable参数 ，但默认是直接调用Runnable中的run()方法。也就是默认下会在主线程执行，如果在这里面的操作会有阻塞，界面也会卡住。
如果要在其他线程执行，可以使用HandlerThread。
HandlerThread继承于Thread，所以它本质就是个Thread。与普通Thread的差别就在于，主要的作用是建立了一个线程，并且创立了消息队列，有来自己的looper,可以让我们在自己的线程中分发和处理消息。

# 1. HandlerThread的使用

```java
//Handler handler = new Handler() {
//...
//}
HandlerThread uIhandlerThread = new HandlerThread("update");
uIhandlerThread.start();
//Handler UIhandler = new Handler(uIhandlerThread.getLooper());
Handler uIhandler = new Handler(uIhandlerThread.getLooper(), new Callback() {
	public boolean handleMessage(Message msg) {
	Bundle b = msg.getData();
	int age = b.getInt("age");
	String name = b.getString("name");
	System.out.println("age is " + age + ", name is" + name);
	System.out.println("Handler--->" + Thread.currentThread().getId());
	System.out.println("handlerMessage");
	return true;
	}
});
```

当要停止uIhandlerThread执行时用：
```java
if (uIhandlerThread != null) {
	pointThread.quit();
}
```

# 2. Handler的应用

## 2.1. 定义handler
在主线程使用handler只需要实例化即可。
在非主线程中使用时，需要先实例化一个子线程的Looper对象。

### 2.1.1. 在主线程定义Handler

```java
public class MyHandler extends Handler {
	@Override
	public boolean handleMessage(Message msg) {
		......
	}
}
MyHandler myHandler = new MyHandler();
```

OR

```java
Handler myHandler = new Handler(new Callback() {
	// 参数也可以为(this.getMainLooper(), new Callback(){})不写则默认为主进程的Looper
	@Override
	public boolean handleMessage(Message msg) {
		......
		return false;
	}
});
```

OR

```java
Handler myHandler = new Handler() {
	@Override
	public void handleMessage(Message msg) {
		super.handleMessage(msg);
	}
};
```

### 2.1.2. 在非主线程定义Handler

```java
new Thread(new Runnable() {
	@Override
	public void run() {
		Looper.prepare();
		handler = new Handler() {
			public void handleMessage(Message msg) {
				// process incoming messages here
			}
		};
		Looper.loop();
	}
});
```

## 2.2. Handler启动Runnable
```java
if (myHandler != null) {
	myHandler.post(runnable);
}
```
**使用post方法时，直接调用Thread或Runnable的run方法，所有处理都在主线程中进行，并没有开启定义的Thread或Runnable新的线程！**

## 2.3. Handler发送Message
```java
//Message msg = new Message();
//myHandler.sendMessage(msg);
////myHandler.sendEmptyMessage(intWhat);
Message msg = myHandler.obtainMessage(); //可以从handler中拿出message，省去了重新实例化的内存开销
msg.sendToTarget();
```

## 2.4. Handler停止运行
```java
if(myHandler != null) {
	myHandler.removeCallbacks(senderObj);
}
```

# 3. 线程的应用

## 3.1. 关于Thread和Runnable的区别

Thread和Runnable是实现java多线程的两种方式，Thread是类，Runnable为接口，建议使用Runnable来实现多线程。
如果让一个线程实现Runnable接口，那么当调用这个线程的对象开启多个线程时，可以让这些线程调用同一个变量；
若这个线程是由继承Thread类而来，则要通过内部类来实现上述的功能，利用的就是内部类可任意访问外部类变量这个特性。

## 3.2. 实现Runnable接口

```java
public class ThreadTest {
	public void main() {
		MyRunnable mt = new MyRunnable();
		new Thread(mt).start(); //通过实现Runnable的类的对象来开辟第一个线程
		new Thread(mt).start(); //通过实现Runnable的类的对象来开辟第二个线程
		new Thread(mt).start(); //通过实现Runnable的类的对象来开辟第三个线程
		//由于这三个线程是通过同一个对象mt开辟的，所以run()里方法访问的是同一个index
		/**
		  * 上面说到也可以用handler.post()启动这个runnable
		  * 差别在于是否开启新线程来执行处理。
		  */
	}
}
```
```java
//实现Runnable接口
public class MyRunnable implements Runnable {
	int index=0;
	public void run() {
		for(;index<=200;)
		System.out.println(Thread.currentThread().getName()+":"+index++);
	}
}
```

## 3.3. 继承Thread

```java
public class ThreadTest {
	public static void main(String[] args) {
		MyThread mt=new MyThread();
		mt.getThread().start(); //通过返回内部类的对象来开辟第一个线程
		mt.getThread().start(); //通过返回内部类的对象来开辟第二个线程
		mt.getThread().start(); //通过返回内部类的对象来开辟第三个线程
		//由于这三个线程是通过同一个匿名对象来开辟的，所以run()里方法访问的是同一个index
	}
}
```
```java
public class MyThread {
	int index=0;
	//定义一个内部类，继承Thread
	private class InnerClass extends Thread {
		public void run() {
			for(;index<=200;)
			System.out.println(getName()+":"+index++);
		}
	}
	//这个函数的作用是返回InnerClass的一个匿名对象
	Thread getThread() {
		return new InnerClass();
	}
}
```

## 3.4. 实例化Thread

```java
Thread thread = new Thread() {
	@Override
	public void run() {
		super.run();
		....
	}
};
thread.start();
```

OR

```java
Thread thread = new Thread(new Runnable() {
	@Override
	public void run() {
		....
	}
});
thread.start();
```

## 3.5. 实例化Runnable

```java
Runnable r = new Runnable() {

	@Override
	public void run() {
		....
	}
};
new Thread(r).start();
```

# 4. 扩展阅读
[Android异步消息处理机制完全解析，带你从源码的角度彻底理解](http://blog.csdn.net/guolin_blog/article/details/9991569)
[Android 异步消息处理机制 让你深入理解 Looper、Handler、Message三者关系](http://blog.csdn.net/lmj623565791/article/details/38377229)
[Android HandlerThread 完全解析](http://blog.csdn.net/lmj623565791/article/details/47079737)