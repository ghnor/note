---
title: 方形布局 SquareLayout
date: 2016-08-20 22:32:29
categories: Android
tags:
toc: true
---

有时候需要显示方形的布局，但又懒得每次获取手机屏幕的尺寸。就可以直接把布局的宽高直接设成一致。

<!--more-->

```java
import android.content.Context;
import android.util.AttributeSet;
import android.widget.RelativeLayout;
 
public class SquareLayout extends RelativeLayout {
    public SquareLayout(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }
 
    public SquareLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
 
    public SquareLayout(Context context) {
        super(context);
    }
 
    @SuppressWarnings("unused")
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // For simple implementation, or internal size is always 0.
        // We depend on the container to specify the layout size of
        // our view. We can't really know what it is since we will be
        // adding and removing different arbitrary views and do not
        // want the layout to change as this happens.
        setMeasuredDimension(getDefaultSize(0, widthMeasureSpec), getDefaultSize(0, heightMeasureSpec));
 
        // Children are just made to fill our space.
        int childWidthSize = getMeasuredWidth();
        int childHeightSize = getMeasuredHeight();
        //高度和宽度一样
        heightMeasureSpec = widthMeasureSpec = MeasureSpec.makeMeasureSpec(childWidthSize, MeasureSpec.EXACTLY);
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }
}
```