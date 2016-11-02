```java
/**
 * 调整窗口的透明度
 * @param from >= 0 && from <= 1.0f
 * @param to >= 0 && to <= 1.0f
 * 
 **/
private void dimBackground(final float from, final float to) {
    final Window window = getWindow();
    ValueAnimator valueAnimator = ValueAnimator.ofFloat(from, to);
    valueAnimator.setDuration(500);
    valueAnimator.addUpdateListener(new AnimatorUpdateListener() {
        @Override
        public void onAnimationUpdate(ValueAnimator animation) {
            WindowManager.LayoutParams params = window.getAttributes();
            params.alpha = (Float) animation.getAnimatedValue();
            window.setAttributes(params);
        }
    });

    valueAnimator.start();
}
```
