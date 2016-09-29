---
title: SwipeRefreshLayout首次加载时显示刷新动画
date: 2016-07-31 19:23:45
categories: Android
tags:
toc: true
---

将原先：
```java
swipeRefreshLayout.setRefreshing(true);
```
更改为：
```java
swipeRefreshLayout.post(new Runnable() {
            
    @Override
    public void run() {
        swipeRefreshLayout.setRefreshing(true);
    }
});
```