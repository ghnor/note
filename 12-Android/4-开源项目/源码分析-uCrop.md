整个框架核心类就三个：`GestureCropImageView`、`CropImageView`、`TransformImageView`。

`GestureCropImageView`负责手势的监听；`CropImageView`负责处理图片和裁剪框的位置关系；`TransformImageView`执行处理真正的拖动、缩放事件。

### 如何判断图片是否填满了裁剪框

```java
// 判断图片是否填满了裁剪矩形框
protected boolean isImageWrapCropBounds() {
    // mCurrentImageCorners是当前图片的四个顶点坐标
    return isImageWrapCropBounds(mCurrentImageCorners);
}

protected boolean isImageWrapCropBounds(float[] imageCorners) {
    // 重置这个临时的Matrix
    mTempMatrix.reset();
    // 反向旋转，如果图片旋转了90度，反向旋转-90度，相当于旋正这张图片
    mTempMatrix.setRotate(-getCurrentAngle());

    // 拷贝一份当前图片的顶点坐标
    // imageCorners中的坐标是已经旋转过的图片的顶点坐标
    float[] unrotatedImageCorners = Arrays.copyOf(imageCorners, imageCorners.length);
    // 因为Matrix反向旋转过，所以执行mapPoints之后的坐标就是初始角度的图片顶点坐标
    // 当然不一定等于初始图片的顶点坐标，因为图片也会被拉伸
    mTempMatrix.mapPoints(unrotatedImageCorners);
    
    // 裁剪矩形框顶点坐标
    float[] unrotatedCropBoundsCorners = RectUtils.getCornersFromRect(mCropRect);
    mTempMatrix.mapPoints(unrotatedCropBoundsCorners);

    // 判断图片形成的矩形是否包含裁剪框形成的矩形
    // 上面旋正图片的原因就在这里，如果图片是倾斜的，那么图片顶点矩形框即便全部包含裁剪矩形框，也不能保证裁剪矩形框中真的有图片内容。
    return RectUtils.trapToRect(unrotatedImageCorners).contains(RectUtils.trapToRect(unrotatedCropBoundsCorners));
}
```

```java
// # RectUtils
// 将图片或者裁剪矩形的顶点坐标转换成一个最小的矩形RectF
public static RectF trapToRect(float[] array) {
    RectF r = new RectF(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY,
            Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY);
    for (int i = 1; i < array.length; i += 2) {
        float x = Math.round(array[i - 1] * 10) / 10.f;
        float y = Math.round(array[i] * 10) / 10.f;
        r.left = (x < r.left) ? x : r.left;
        r.top = (y < r.top) ? y : r.top;
        r.right = (x > r.right) ? x : r.right;
        r.bottom = (y > r.bottom) ? y : r.bottom;
    }
    r.sort();
    return r;
}
```

### 如何使图片填充裁剪框

```java
// 让图片填满裁剪矩形框
public void setImageToWrapCropBounds(boolean animate) {
    if (mBitmapLaidOut && !isImageWrapCropBounds()) {

        // 图片的中心点坐标
        float currentX = mCurrentImageCenter[0];
        float currentY = mCurrentImageCenter[1];
        // 当前图片缩放的比例
        float currentScale = getCurrentScale();

        // 裁剪框中心点坐标与图片中心点坐标的偏移量
        float deltaX = mCropRect.centerX() - currentX;
        float deltaY = mCropRect.centerY() - currentY;
        float deltaScale = 0;

        mTempMatrix.reset();
        mTempMatrix.setTranslate(deltaX, deltaY);

        // 对图片做平移变换
        final float[] tempCurrentImageCorners = Arrays.copyOf(mCurrentImageCorners, mCurrentImageCorners.length);
        mTempMatrix.mapPoints(tempCurrentImageCorners);

        // 判断一下，是不是将图片平移到裁剪矩形框的中心就可以填满裁剪矩形框
        boolean willImageWrapCropBoundsAfterTranslate = isImageWrapCropBounds(tempCurrentImageCorners);

        if (willImageWrapCropBoundsAfterTranslate) { // 只平移就可以填满裁剪矩形框
            // 如果平移就可以填满，就计算出最小的平移量
            final float[] imageIndents = calculateImageIndents();
            // 这里左上角的x轴坐标（imageIndents[0]）和右下角的x轴坐标（imageIndents[2]）肯定有一个是0或者二者都是0
            deltaX = -(imageIndents[0] + imageIndents[2]);
            // y轴坐标同理
            deltaY = -(imageIndents[1] + imageIndents[3]);
        } else { 
            // 这里的逻辑相当于将图片旋正，将裁剪矩形框反旋
            // 图片会比裁剪框小，所以去比较图片的宽高与裁剪框左右顶点的距离
            // 裁剪框可能被旋转了45度，所以左右顶点的距离不一定等于边长
            RectF tempCropRect = new RectF(mCropRect);
            mTempMatrix.reset();
            mTempMatrix.setRotate(getCurrentAngle());
            mTempMatrix.mapRect(tempCropRect);

            final float[] currentImageSides = RectUtils.getRectSidesFromCorners(mCurrentImageCorners);

            deltaScale = Math.max(tempCropRect.width() / currentImageSides[0],
                    tempCropRect.height() / currentImageSides[1]);
            deltaScale = deltaScale * currentScale - currentScale;
        }

        // 真正去移动和缩放图片，区分是否需要动画效果
        if (animate) {
            post(mWrapCropBoundsRunnable = new WrapCropBoundsRunnable(
                    CropImageView.this, mImageToWrapCropBoundsAnimDuration, currentX, currentY, deltaX, deltaY,
                    currentScale, deltaScale, willImageWrapCropBoundsAfterTranslate));
        } else {
            postTranslate(deltaX, deltaY);
            if (!willImageWrapCropBoundsAfterTranslate) {
                zoomInImage(currentScale + deltaScale, mCropRect.centerX(), mCropRect.centerY());
            }
        }
    }
}
```

```java
// 计算最小偏移量
private float[] calculateImageIndents() {
    // 又来了噢，反转图片，即旋正
    mTempMatrix.reset();
    mTempMatrix.setRotate(-getCurrentAngle());

    // 获取目前的图片和裁剪矩形框的顶点坐标转成数组
    float[] unrotatedImageCorners = Arrays.copyOf(mCurrentImageCorners, mCurrentImageCorners.length);
    float[] unrotatedCropBoundsCorners = RectUtils.getCornersFromRect(mCropRect);

    // 计算出旋转之后的顶点坐标数组
    mTempMatrix.mapPoints(unrotatedImageCorners);
    mTempMatrix.mapPoints(unrotatedCropBoundsCorners);

    // 又把顶点坐标数组重新转换为RectF矩阵
    RectF unrotatedImageRect = RectUtils.trapToRect(unrotatedImageCorners);
    RectF unrotatedCropRect = RectUtils.trapToRect(unrotatedCropBoundsCorners);

    float deltaLeft = unrotatedImageRect.left - unrotatedCropRect.left;
    float deltaTop = unrotatedImageRect.top - unrotatedCropRect.top;
    float deltaRight = unrotatedImageRect.right - unrotatedCropRect.right;
    float deltaBottom = unrotatedImageRect.bottom - unrotatedCropRect.bottom;

    // 这里还挺巧妙的，因为只需要x轴、y轴的偏移量，所以拿了左上角和右下角的顶点坐标
    // 其次因为此时图片经过平移就可以填满裁剪矩形框，所以deltaLeft和deltaRight只有会一个有效值，deltaTop和deltaBottom同理
    float indents[] = new float[4];
    indents[0] = (deltaLeft > 0) ? deltaLeft : 0;
    indents[1] = (deltaTop > 0) ? deltaTop : 0;
    indents[2] = (deltaRight < 0) ? deltaRight : 0;
    indents[3] = (deltaBottom < 0) ? deltaBottom : 0;

    // 旋转，再去计算在真正的旋转角度下图片需要的偏移量
    mTempMatrix.reset();
    mTempMatrix.setRotate(getCurrentAngle());
    mTempMatrix.mapPoints(indents);

    return indents;
}
```
