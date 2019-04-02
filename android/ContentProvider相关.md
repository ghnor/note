# ContentProvider相关

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