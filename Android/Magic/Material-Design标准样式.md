---
title: Material Design标准样式
date: 2016-06-19 19:48:50
tags:
categories: Android
---
TextView官方标准字体;Button Material Design标准样式;Ripple水波纹效果

<!--more-->

# TextView官方标准字体

![](/assets/images/Material-Design标准样式/TextView.jpg)

```java
style="@style/TextAppearance.AppCompat.Display4"
style="@style/TextAppearance.AppCompat.Display3"
style="@style/TextAppearance.AppCompat.Display2"
style="@style/TextAppearance.AppCompat.Display1"
style="@style/TextAppearance.AppCompat.Headline"
style="@style/TextAppearance.AppCompat.Title"
style="@style/TextAppearance.AppCompat.Subhead"
style="@style/TextAppearance.AppCompat.Body2"
style="@style/TextAppearance.AppCompat.Body1"
style="@style/TextAppearance.AppCompat.Caption"
style="@style/TextAppearance.AppCompat.Button"
```

# Button Material Design标准样式

![](/assets/images/Material-Design标准样式/Button.jpg)

```java
style="@style/Widget.AppCompat.Button"
style="@style/Widget.AppCompat.Button.Borderless"
style="@style/Widget.AppCompat.Button.Borderless.Colored"
style="@style/Widget.AppCompat.Button.Colored"
style="@style/Widget.AppCompat.Button.Small"
```

# 水波纹效果

```java
// 波纹有边界
android:background="?android:attr/selectableItemBackground"
// 波纹超出边界
android:background="?android:attr/selectableItemBackgroundBorderless"
```

![无界波纹](/assets/images/Material-Design标准样式/no-border.jpg) ![有界波纹](/assets/images/Material-Design标准样式/yes-border.jpg)

也可以再XML文件中直接来创建一个具有Ripple效果的XML文件
```java
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="@android:color/transparent">
    <item>
        <shape android:shape="oval">
            <solid android:color="?android:colorAccent"/>
        </shape>
    </item>
</ripple>
```
```java
android:background="@drawable/ripple"
```