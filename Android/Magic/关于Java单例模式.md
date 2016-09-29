---
title: 关于Java单例模式
date: 2016-06-16 22:20:20
categories: Android
tags:
toc: true
---

单例模式其实是最容易理解的一种设计模式。
单例模式应该保证在任何时候都只有一个实例，所以个人认为不能提供线程安全的单例模式其实根本不能算单例，很遗憾，甚至在教科书中你看到的都是这种非安全的单例。
网上总结的单例应该有五种，懒汉，恶汉，双重校验锁，枚举和静态内部类。想了解更多请浏览**扩展阅读**
这里只说明这两种，**静态内部类**和**枚举**。

<!--more-->

## 静态内部类
```java
public class Singleton {  
    private Singleton (){}  
    private static class SingletonHolder {  
        private static final Singleton INSTANCE = new Singleton();  
    } 
    public static final Singleton getInstance() {  
        return SingletonHolder.INSTANCE; 
    }  
}
```
我比较倾向于使用静态内部类的方法，这种方法也是《Effective Java》上所推荐的。
这种写法仍然使用 JVM 本身机制保证了线程安全问题；
由于 SingletonHolder 是私有的，除了 getInstance() 之外没有办法访问它，因此它是懒汉式的；
同时读取实例的时候不会进行同步，没有性能缺陷；也不依赖 JDK 版本。

## 枚举
```java
public enum Singleton{
    INSTANCE;
}
```
最简单的写法，但是如果是 Android，应该避免使用enum。
用法同样比一般单例简单，通过 Singleton.INSTANCE 来调用实例。
创建枚举默认就是线程安全的，所以不需要担心 double checked locking，而且还能防止反序列化导致重新创建新的对象。
需要注意的是，java 1.5才加入 enum 特性。

## 扩展阅读
[如何正确地写出单例模式](http://wuchong.me/blog/2014/08/28/how-to-correctly-write-singleton-pattern/)：对主要几种单例写法的整理，并分析其优缺点。
[Java 单例真的写对了么?](http://www.race604.com/java-double-checked-singleton/)：分析了双重校验锁普遍存在的一种错误写法
[深入理解Java内存模型（六）](http://www.infoq.com/cn/articles/java-memory-model-6)：关于 **final** 关键字的原理