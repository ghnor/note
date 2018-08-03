> The density-independent pixel is equivalent to one physical pixel on a 160 dpi screen, the baseline density assumed by the platform (as described later in this document). At run time, the platform transparently handles any scaling of the dip units needed, based on the actual density of the screen in use. The conversion of dip units to screen pixels is simple: pixels = dips * (density / 160). For example, on 240 dpi screen, 1 dip would equal 1.5 physical pixels. 

160dpi时，dp和px的比例是1：1。

px = dp * (dpi / 160)

```java
public static int dp2px(Context context, float dpVal) {
    return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP,
            dpVal, context.getResources().getDisplayMetrics());
}

public static int dp2px(Context context, float dipValue) {
    final float scale = context.getResources().getDisplayMetrics().density;
    return (int) (dipValue * scale + 0.5f);
}

public static int sp2px(Context context, float spVal) {
    return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP,
            spVal, context.getResources().getDisplayMetrics());
}

public static int sp2px(Context context, float spValue) {
    final float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
    return (int) (spValue * fontScale + 0.5f);
}

public static float px2dp(Context context, float pxVal) {
    final float scale = context.getResources().getDisplayMetrics().density;
    return (pxVal / scale + 0.5f);
}

public static float px2sp(Context context, float pxVal) {
    final float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
    return (pxVal / fontScale + 0.5f);
}
```