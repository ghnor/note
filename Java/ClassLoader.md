## JVM类加载器结构

首先JVM中有三个已存在的Loader：

* BootStrap
* ExtClassLoader
* AppClassLoader

BootStrap允许用null来代替：

> [Returns the class loader for the class. Some implementations may use null to represent the bootstrap class loader. This method will return null in such implementations if this class was loaded by the bootstrap class loader.](https://docs.oracle.com/javase/6/docs/api/java/lang/Class.html#getClassLoader())

此外，开发者也可以自己实现一个类加载器。在大部分情况下，AppClassLoader就是最常接触到的类加载器了。

## 类加载的委托机制原则

* 由下到上加载，顶层加载不了再交给下层加载，如果回到底层位置加载还加载不到，那就会报ClassNotFound错误了。
* 由上述引申，JVMClassLoader这个类为什么输出的类加载器名称是AppClassLoader呢，原因就是先找到顶层的Boot类加载器发现找不到这个类，然后继续找ext类加载器还是找不到，最后在AppClassLoder中找到这个类。所以这个类的加载器就是AppClassLoader了。
* 为什么System和List类的类加载器是Boot类加载器？  
因为Boot类加载器加载的默认路径就是/jre/lib 这个目录下的rt.jar。ext加载器的默认路径是/jre/lib/ext/*.jar。  
这2个目录下面当然无法找到我们的JVMClassLoader类了  
注意这里的根目录是你jdk的安装目录

这样，因为每次都会从最顶层的类加载开始尝试加载，所以一个已经加载过的类就不会被重复加载。

### 源码

```java
protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // 看这个类加载过没有如果加载过就不在继续加载了
            Class c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                        //先看有没有爸爸类加载器如果有就继续“递归”调用loadclass这个方法
                        c = parent.loadClass(name, false);
                    } else {
                        //如果没有爸爸类加载器了，就说明到头了。看看
                        //祖先bootstrap类加载器中有没有
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }

                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    //如果没有找到就调用自己的findclass找这个类。
                    c = findClass(name);

                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
```

### 自定义类加载器

```java

```

## Android类加载器结构

两个默认类加载器：

* DexClassLoader
* PathClassLoader

DexClassLoader可以加载任何路径的apk/dex/jar  
PathClassLoader只能加载/data/app中的apk，也就是已经安装到手机中的apk。这个也是PathClassLoader作为默认的类加载器的原因，因为一般程序都是安装了，在打开，这时候PathClassLoader就去加载指定的apk(解压成dex，然后在优化成odex)就可以了。

```java
public class DexClassLoader extends BaseDexClassLoader {

    public DexClassLoader(String dexPath, String optimizedDirectory,
            String librarySearchPath, ClassLoader parent) {
        super(dexPath, new File(optimizedDirectory), librarySearchPath, parent);
    }
}
```

```java
public class PathClassLoader extends BaseDexClassLoader {

    public PathClassLoader(String dexPath, ClassLoader parent) {
        super(dexPath, null, null, parent);
    }

    public PathClassLoader(String dexPath, String librarySearchPath, ClassLoader parent) {
        super(dexPath, null, librarySearchPath, parent);
    }
}
```
