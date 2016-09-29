---
title: 首次安装在安装界面打开应用，退到后台再从桌面launcher打开应用，会打开两个应用
date: 2016-06-10 15:24:15
categories: Android
tags:
toc: true
---

# 问题描述

1. 在 package installers 安装界面安装完一个应用后，直接打开app，然后进入了 Activity_1, 此时再通过此activity用startActivity(intent)的方法打开 Activity_2.
2. 然后按home键返回桌面，在桌面点击app图标进入，你觉得应该进入的是 Activity_2，实际上却是Activity_1.
3. 然而还没完，这时候你按 back 返回键，会发现返回到了之前打开的 Activity_2，再按返回，又出现 launcherActivity_1. 也就是说系统重复实例化了Activity_1.
4. 退出app后再次点击桌面图标进入，反复试验，没有再出现这个问题。也就是说，这个问题（bug ？）只出现在操作步骤（1）后才会产生.

<!--more-->

# 解决方法

在`super.onCreate(...)`方法中插入代码

```java
if(!this.isTaskRoot()) { 
    //判断该Activity是不是任务空间的源Activity，"非"也就是说是被系统重新实例化出来
    //如果你就放在launcher Activity中话，这里可以直接return了
    Intent mainIntent=getIntent();
    String action=mainIntent.getAction();

    if (mainIntent.hasCategory(Intent.CATEGORY_LAUNCHER) && action.equals(Intent.ACTION_MAIN)) {
        finish();
        return; //finish()之后该活动会继续执行后面的代码，你可以logCat验证，加return避免可能的exception
    }
}
```