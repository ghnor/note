# ContentProvider相关

[Android Loader 机制，让你的数据加载更加轻松](https://www.jianshu.com/p/337c138a56c8)

[Android-使用ContentProvider来初始化你的sdk（一）](https://blog.csdn.net/a1018875550/article/details/102760643)

[从App启动理解ContentProvider的创建](https://blog.csdn.net/a1018875550/article/details/102962780)

[Android之通过ContentProvider实现两个app(进程间)间通信以及函数调用](https://blog.csdn.net/u011068702/article/details/80820985)

[Android源码解析--ContentProvider的创建及启动流程](https://blog.csdn.net/qq475703980/article/details/102654750)

[ContentResolver与ContentProvider的搭配使用](https://blog.csdn.net/qq475703980/article/details/102241698)

当一个应用程序需要把自己的数据暴露给其他程序使用时，该就用程序就可通过提供ContentProvider来实现；  
其他应用程序就可通过ContentResolver来操作ContentProvider暴露的数据。  
一旦某个应用程序通过ContentProvider暴露了自己的数据操作接口，那么不管该应用程序是否启动，其他应用程序都可以通过该接口来操作该应用程序的内部数据，包括增加数据、删除数据、修改数据、查询数据等。  
ContentProvider以某种Uri的形式对外提供数据，允许其他应用访问或修改数据；  
其他应用程序使用ContentResolver根据Uri去访问操作指定数据。  
步骤：  

1. 定义自己的ContentProvider类，该类需要继承Android提供的ContentProvider基类。  
2. 在AndroidManifest.xml文件中注册个ContentProvider，注册ContenProvider时需要为它绑定一个URL。  
   例：android:authorities="com.myit.providers.MyProvider"  
   说明：authorities就相当于为该ContentProvider指定URL。注册后，其他应用程序就可以通过该Uri来访问MyProvider所暴露的数据了。

接下来，使用ContentResolver操作数据，Context提供了如下方法来获取ContentResolver对象。  
一般来说，ContentProvider是单例模式，当多个应用程序通过ContentResolver来操作 ContentProvider提供的数据时，ContentResolver调用的数据操作将会委托给同一个ContentProvider处理。  
使用ContentResolver操作数据只需两步：  

1. 调用Activity的ContentResolver获取ContentResolver对象。  
2. 根据需要调用ContentResolver的insert()、delete()、update()和query()方法操作数据即可。



##  对 ContentProvider 的理解

ContentProvider作为四大组件之一，其主要负责存储和共享数据。与文件存储、SharedPreferences存储、SQLite数据库存储这几种数据存储方法不同的是，后者保存下的数据只能被该应用程序使用，而前者可以让不同应用程序之间进行数据共享，它还可以选择只对哪一部分数据进行共享，从而保证程序中的隐私数据不会有泄漏风险。

## ContentProvider、ContentResolver、ContentObserver 之间的关系

* ContentProvider：管理数据，提供数据的增删改查操作，数据源可以是数据库、文件、XML、网络等，ContentProvider为这些数据的访问提供了统一的接口，可以用来做进程间数据共享。
* ContentResolver：ContentResolver可以为不同URI操作不同的ContentProvider中的数据，外部进程可以通过ContentResolver与ContentProvider进行交互。
* ContentObserver：观察ContentProvider中的数据变化，并将变化通知给外界。

## ContentProvider 是如何实现数据共享的？
## ContentProvider 的权限管理？

* 读写分离
* 权限控制-精确到表级
* URL控制

## Android 系统为什么会设计 ContentProvider？

## 关键字

UriMatcher

ContentUris

