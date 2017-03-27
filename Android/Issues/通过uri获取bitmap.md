常见的比如从系统图库选择了一张图片会得到一个Uri。

```java
Bitmap bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
```

或者，直接使用getBitmap方法的内部实现：

```java
Bitmap bitmap = null;
try {
    bitmap = BitmapFactory.decodeStream(context.getContentResolver().openInputStream(uri));
} catch (FileNotFoundException e) {
    e.printStackTrace();
}
```