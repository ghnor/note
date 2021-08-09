[Android解析WindowManager（二）Window的属性](https://blog.csdn.net/itachi85/article/details/77939884)



泛化地理解Android中的视图应该有两层，一是Window，二是View，Window更接近硬件层，View更接近软件层。

## Window的type

首先Window本身有层级的概念，分别是：

Activity级别的Window，比如每个Activity都是一个应用级别的Window；

依附于Activity级别的Window，比如PopupWindow；

系统级别Window，比如Toast。

> 这里我有点话想说，其实还应该设计一个真正Application级别的Window，它不会影响其他的应用，但是却在本应用内可以跨Activity显示。

上述的层级对应WindowManager.LayoutParams的type参数，总体上被分割成几个范围：

| Window                     | type参数范围 |
| -------------------------- | ------------ |
| Activity级别的Window       | 1~99         |
| 依附于Activity级别的Window | 1000~1999    |
| 系统级别Window             | 2000~2999    |

```java
public static final int FIRST_APPLICATION_WINDOW = 1;//1
public static final int TYPE_BASE_APPLICATION   = 1;//窗口的基础值，其他的窗口值要大于这个值
public static final int TYPE_APPLICATION        = 2;//普通的应用程序窗口类型
public static final int TYPE_APPLICATION_STARTING = 3;//应用程序启动窗口类型，用于系统在应用程序窗口启动前显示的窗口。
public static final int TYPE_DRAWN_APPLICATION = 4;
public static final int LAST_APPLICATION_WINDOW = 99;//2
```

```java
public static final int FIRST_SUB_WINDOW = 1000;//子窗口类型初始值
public static final int TYPE_APPLICATION_PANEL = FIRST_SUB_WINDOW;
public static final int TYPE_APPLICATION_MEDIA = FIRST_SUB_WINDOW + 1;
public static final int TYPE_APPLICATION_SUB_PANEL = FIRST_SUB_WINDOW + 2;
public static final int TYPE_APPLICATION_ATTACHED_DIALOG = FIRST_SUB_WINDOW + 3;
public static final int TYPE_APPLICATION_MEDIA_OVERLAY  = FIRST_SUB_WINDOW + 4; 
public static final int TYPE_APPLICATION_ABOVE_SUB_PANEL = FIRST_SUB_WINDOW + 5;
public static final int LAST_SUB_WINDOW = 1999;//子窗口类型结束值
```

```java
public static final int FIRST_SYSTEM_WINDOW     = 2000;//系统窗口类型初始值
public static final int TYPE_STATUS_BAR         = FIRST_SYSTEM_WINDOW;//系统状态栏窗口
public static final int TYPE_SEARCH_BAR         = FIRST_SYSTEM_WINDOW+1;//搜索条窗口
public static final int TYPE_PHONE              = FIRST_SYSTEM_WINDOW+2;//通话窗口
public static final int TYPE_SYSTEM_ALERT       = FIRST_SYSTEM_WINDOW+3;//系统ALERT窗口
public static final int TYPE_KEYGUARD           = FIRST_SYSTEM_WINDOW+4;//锁屏窗口
public static final int TYPE_TOAST              = FIRST_SYSTEM_WINDOW+5;//TOAST窗口
...
public static final int LAST_SYSTEM_WINDOW      = 2999;//系统窗口类型结束值
```

## Window的flag

