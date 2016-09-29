---
title: Activity相关Flag使用
date: 2016-07-28 07:38:12
categories: Android
tags:
toc: true
---

&nbsp;

<!--more-->

# FLAG_ACTIVITY_NEW_TASK
等同于"singleTask"启动模式

# FLAG_ACTIVITY_SINGLE_TOP
等同于"singleTop"启动模式

# FLAG_ACTIVITY_CLEAR_TOP
具有此标记的Activity，当它启动时，在同一个任务栈中所有位于它上面的Activity都要出栈。
这个标记一般会和singleTask启动模式一起出现。
在这种情况下，被启动的Activity的实例如果已经存在，那么系统就会调用它的onNewIntent。
如果被启动的Activity采用standard模式启动，那么它连同它之上的Activity都要出栈，系统会创建新的Activity实例并放入栈顶。
singleTask启动模式默认具有此标记的效果。

# FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
具有这个标记的Activity不会出现在历史Activity的列表中。
等同于在XML中指定Activity的属性android:excludeFromRecents="true"。


# 清空Activity栈
```java
intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
```