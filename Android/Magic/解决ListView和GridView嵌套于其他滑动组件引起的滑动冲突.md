---
title: 解决ListView和GridView嵌套于其他滑动组件引起的滑动冲突
date: 2016-07-24 10:00:27
categories: Android
tags:
toc: true
---
当我们将ListView和GridView相互嵌套，或者嵌套于其他滑动组件时，会造成不能滑动、数据显示不全等问题。

<!--more-->

解决方案不止一个。个人觉得比较方便的就是重写`onMeasure()`方法：
```java
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    // TODO Auto-generated method stub
    int expandSpec = MeasureSpec.makeMeasureSpec(
               Integer.MAX_VALUE >> 2, MeasureSpec.AT_MOST);
     
    super.onMeasure(widthMeasureSpec, expandSpec);
}
```

## StaticListView
```java
public class StaticListView extends ListView{

    public StaticListView(Context context) {
        super(context);
        // TODO Auto-generated constructor stub
    }
	
    public StaticListView(Context context, AttributeSet attrs) { 
        super(context, attrs);
        // TODO Auto-generated constructor stub
    }
	
    public StaticListView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        // TODO Auto-generated constructor stub
    }
	
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // TODO Auto-generated method stub
        int expandSpec = MeasureSpec.makeMeasureSpec(
                Integer.MAX_VALUE >> 2, MeasureSpec.AT_MOST);
         
        super.onMeasure(widthMeasureSpec, expandSpec);
    }
 
}
```

## StaticGridView
```java
public class StaticGridView extends GridView{

    public StaticGridView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        // TODO Auto-generated constructor stub
    }
	
    public StaticGridView(Context context, AttributeSet attrs) {
        super(context, attrs);
        // TODO Auto-generated constructor stub
    }
	
    public StaticGridView(Context context) {
        super(context);
        // TODO Auto-generated constructor stub
    }
	
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // TODO Auto-generated method stub
        int expandSpec = MeasureSpec.makeMeasureSpec(
                Integer.MAX_VALUE >> 2, MeasureSpec.AT_MOST);
        super.onMeasure(widthMeasureSpec, expandSpec);

    }
}
```