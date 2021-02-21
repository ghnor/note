**使用AIDL来进行进程间通信的流程，分为服务端和客户端两个方面。**

1. 创建AIDL接口文件

2. 服务端

	服务端首先创建一个Service用来监听客户端的连接请求，然后创建一个AIDL文件，将暴露给客户端的接口在AIDL文件中声明，最后在Service中实现这个AIDL接口。

3. 客户端

	客户端首先绑定服务端的Service，绑定成功后，将服务端返回的Binder对象转为AIDL接口。
	
## 1 基本的AIDL应用

最基础的AIDL应用

### 1. 创建AIDL接口文件

**AIDL支持的数据类型**

* 基本数据类型（int、long、char、boolean、double等）；

* String和CharSequence；

* List：只支持ArrayList，里面每个元素都必须能够被AIDL支持；

* Map：只支持HashMap，里面的每个元素都必须被AIDL支持，包括key和value；

* Parcelable：所有实现了Parcelable接口的对象；

* AIDL：所有的AIDL接口本身也可以在AIDL文件中使用。

**需要注意几点：**

* 自定义的Parcelable对象和AIDL对象必须显示import进来；

* 自定义的Parcelable对象，必须创建一个和它同名的AIDL文件，并在其中声明它为Parcelable类型；

* AIDL中除了基本数据类型，其他类型的参数必须标上方向：in、out或者inout，in表示输入型参数，out表示输出型参数，inout表示输入输出型参数；

* AIDL接口中只支持方法，不支持声明静态常量。

**示例代码：**

`IBookManager.aidl`：

```java
package com.ghnor.ipc;

import com.ghnor.ipc.Book;

interface IBookManager {
    List<Book> getBookList();
    void addBook(in Book book);
}
```

`Book.java`：

```java
package com.ghnor.ipc;

import android.os.Parcel;
import android.os.Parcelable;

public class Book implements Parcelable {
    public int bookId;
    public String bookName;

    public Book(int bookId, String bookName) {
        this.bookId = bookId;
        this.bookName = bookName;
    }

    protected Book(Parcel in) {
        bookId = in.readInt();
        bookName = in.readString();
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(bookId);
        dest.writeString(bookName);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<Book> CREATOR = new Creator<Book>() {
        @Override
        public Book createFromParcel(Parcel in) {
            return new Book(in);
        }

        @Override
        public Book[] newArray(int size) {
            return new Book[size];
        }
    };
}
```

`Book.aidl`：

```java
package com.ghnor.ipc;

parcelable Book;
```

### 2. 服务端

```java
package com.ghnor.ipc;

import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.os.RemoteCallbackList;
import android.os.RemoteException;
import android.support.annotation.Nullable;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

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

> 因为AIDL方法是在服务端的Binder线程池中执行的，所以这里使用了支持并发读/写的CopyOnWriteArrayList。

> 前面我们提到，AIDL中能够使用的List只有ArrayList，但是我们这里却使用了CopyOnWriteArrayList（注意它不是继承自ArrayList）。为什么能否正常工作呢？这是因为AIDL中所支持的是抽象的List，而List只是一个接口，因此虽然服务端返回的是CopyOnWriteArrayList，但是在Binder中会按照List规范去访问数据并最终形成一个新的ArrayList传递给客户端。类似的还有ConcurrentHashMap。

### 3. 客户端

```java
package com.ghnor.ipc;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v7.app.AppCompatActivity;

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

> 需要注意的是，getBookList方法在服务端可能需要执行很久，所以会引起ANR。

## 添加回调

让服务端可以主动通知客户端。

1. 创建一个AID接口；

2. 服务端添加AIDL接口入参的方法；

3. 客户端实现AIDL接口。

### 1. 创建AIDL接口

创建一个IOnNewBookArrivedListener.aidl接口文件

```java
package com.ghnor.ipc;

import com.ghnor.ipc.Book;

interface IOnNewBookArrivedListener {
    void onNewBookArrived(in Book newBook);
}
```

在原来的IBookManager.aidl中先添加两个方法。

```java
package com.ghnor.ipc;

import com.ghnor.ipc.Book;
import com.ghnor.ipc.IOnNewBookArrivedListener;

interface IBookManager {
    List<Book> getBookList();
    void addBook(in Book book);
    void registerListener(IOnNewBookArrivedListener listener);
    void unregisterListener(IOnNewBookArrivedListener listener);
}
```

### 2. 服务端添加AIDL接口入参的方法

修改服务端Service，实现IBookManager.Stub新添加的两个方法。

```java
package com.ghnor.ipc;

import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.os.RemoteCallbackList;
import android.os.RemoteException;
import android.support.annotation.Nullable;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class BookManagerService extends Service {

    private static final String TAG = "BMS";

    private CopyOnWriteArrayList<Book> mBookList = new CopyOnWriteArrayList<>();

    private RemoteCallbackList<IOnNewBookArrivedListener> mListeners = new RemoteCallbackList<>();

    private Binder mBinder = new IBookManager.Stub() {
        @Override
        public List<Book> getBookList() throws RemoteException {
            return mBookList;
        }

        @Override
        public void addBook(Book book) throws RemoteException {
            mBookList.add(book);
        }

        @Override
        public void registerListener(IOnNewBookArrivedListener listener) throws RemoteException {
            mListeners.register(listener);
        }

        @Override
        public void unregisterListener(IOnNewBookArrivedListener listener) throws RemoteException {
            mListeners.unregister(listener);
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
        arrivedNewBook(new Book(0x01, "new Book " + 0x01));
    }

    private void arrivedNewBook(Book book) {
        final int n = mListeners.beginBroadcast();
        for (int i = 0; i < n; i++) {
            IOnNewBookArrivedListener listener = mListeners.getBroadcastItem(i);
            if (listener != null) {
                try {
                    listener.onNewBookArrived(book);
                } catch (RemoteException e) {
                    e.printStackTrace();
                }
            }
        }
        mListeners.finishBroadcast();
    }
}
```

> 接口的集合类使用了RemoteCallbackList，它是系统专门提供的用于删除扩进程listener的接口。它有两个特点，一是：当客户端进程终止后，它会自动移出客户端注册的listener；二是：内部自动实现了线程同步的功能。

> 尽管RemoteCallbackList名字带List，但它并不是一个List，它的遍历必须按照上面arrivedNewBook方法中的方式进行，beginBroadcast和finishBroadcast必须要配对使用。

### 3. 客户端实现AIDL接口

```java
package com.ghnor.ipc;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.support.v7.app.AppCompatActivity;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private IBookManager mIBookManager;

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            mIBookManager = IBookManager.Stub.asInterface(iBinder);
            try {
                List<Book> list = mIBookManager.getBookList();
                mIBookManager.registerListener(listener);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            try {
                mIBookManager.unregisterListener(listener);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
        }
    };

    private IOnNewBookArrivedListener listener = new IOnNewBookArrivedListener.Stub() {

        @Override
        public void onNewBookArrived(Book newBook) throws RemoteException {

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

> 实现IOnNewBookArrivedListener接口不能直接new这个接口，而是通过IOnNewBookArrivedListener的内部类Stub实现。

> onNewBookArrived方法是在客户端的Binder线程池中执行的，因此，如果要进行UI操作，需要通过Handler切换到客户端的主线程中去执行。

## Binder意外死亡

* 设置DeathRecipient监听，当Binder死亡时，会收到binderDied方法的回调，在binderDied方法中重连远程服务；

* 在onServiceDisconnected中重连远程服务。

上述两种方式的区别是：onServiceDisconnected在客户端的UI线程中被调用，而binderDied在客户端的Binder线程池中被回调。也就是说，在binderDied方法中我们不能访问UI。

### 1. 声明一个DeathReceipient对象

```java
private IBinder.DeathRecipient mDeathRecipient = new IBinder.DeathRecipient() {
	@Override
	public void binderDied() {
		if (mIBookManager == null) {
			return;
		}
		mIBookManager.asBinder().unlinkToDeath(mDeathRecipient, 0);
		mIBookManager = null;
		// TODO: 这里重新绑定远程Service
	}
};
```

### 客户端绑定远程服务成功后（onServiceConnected方法），给binder设置死亡代理

```java
iBinder.linkToDeath(mDeathRecipient, 0);
```

linkToDeath的第二个参数是个标记位，直接设为0即可。

当Binder死亡的时候客户端就会收到通知。另外，通过Binder的isBinderAlive方法也可以判断Binder是否死亡。
