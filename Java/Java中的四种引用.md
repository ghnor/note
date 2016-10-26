### 强引用(Strong Reference)
通常我们使用new操作符创建一个对象时所返回的引用即为强引用。  
```java
Object obj = new Object();
```
JVM 宁可抛出 OOM，也不会让 GC 回收具有强引用的对象。强引用不使用时，可以通过 obj = null 来显式的设置该对象的所有引用为 null，这样就可以回收该对象了。至于什么时候回收，取决于 GC 的算法，这里不做深究（其实我也不会）。

### 软引用(Soft Reference)
```java
SoftReference<String> softRef = new SoftReference<>(str);
```
如果一个对象只具有软引用，那么在内存空间足够时，垃圾回收器就不会回收它；如果内存空间不足了，就会回收这些对象的内存。只要垃圾回收器没有回收它，该对象就可以被使用。

软引用曾经常被用来作图片缓存，然而谷歌现在推荐用 LruCache 替代，因为 LRU 更高效。
>In the past, a popular memory cache implementation was a SoftReference or WeakReference bitmap cache, however this is not recommended. Starting from Android 2.3 (API Level 9) the garbage collector is more aggressive with collecting soft/weak references which makes them fairly ineffective. In addition, prior to Android 3.0 (API Level 11), the backing data of a bitmap was stored in native memory which is not released in a predictable manner, potentially causing an application to briefly exceed its memory limits and crash.[>原文](https://developer.android.com/training/displaying-bitmaps/cache-bitmap.html)

在 Android 2.3 以后，GC 会很频繁，导致释放软引用的频率也很高，这样会降低它的使用效率。并且 3.0 以前 Bitmap 是存放在 Native Memory 中，它的释放是不受 GC 控制的，所以使用软引用缓存 Bitmap 可能会造成 OOM。

### 弱引用(Weak Reference)
```java
WeakReference<String> weakRef = new WeakReference<>(str);
```
与软引用的区别在于：只具有弱引用的对象拥有更短暂的生命周期。因为在 GC 时，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存。不过，由于垃圾回收器是一个优先级很低的线程，因此不一定会很快发现那些只具有弱引用的对象。  
在 Android 中可以利用它来包装 Context 对象，避免内存泄露的发生。

### 虚引用(PhantomReference)
顾名思义，就是形同虚设，与其他几种引用都不同，虚引用并不会决定对象的生命周期，也无法通过虚引用获得对象实例。虚引用必须和引用队列（ReferenceQueue）联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。程序可以通过判断引用队列中是否存在该对象的虚引用，来了解这个对象是否将要被回收。
