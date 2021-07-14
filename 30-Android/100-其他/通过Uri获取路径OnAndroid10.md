[android 10（Q）上传图片及视频，访问媒体文件适配](https://www.codeleading.com/article/54742523762/)

[android10以上 uri转file uri转真实路径](https://blog.csdn.net/jingzz1/article/details/106188462)



android10以后，只需要考虑沙盒里的文件uri和共享文件(匿名uri)、通过文件选择器获取到的uri的转换；其他类型，要么转换不成File，要么拿不到,也就不用再考虑了。

沙盒里的文件(file开头)，可以直接转成File使用，共享文件(content开头)如果要操作，需要先复制到沙盒目录下。

android 7之前，任何Uri都可以拿到真实的文件路径，参看[[通过Uri获取路径]]。

android 7以及之后，应用间共享的文件路径需要通过FileProvider提供，不接受`file://`前缀的Uri，调用`FileProvider.getUriForFile()`获得`content://`前缀的Uri，这个Uri已经无法获取到真实文件路径。

android 10以及之后，系统存储变成分区存储（沙盒模式），媒体文件要求通过MediaStore API操作，非媒体文件则通过存储访问框架操作，拿到的Uri也无法获取到真实文件路径。

**最简单的方案，是拿到的Uri，通过ContentResolver拿到输入流，再写入自己应用的存储空间，此时可以自由的使用真实文件路径。**

```java
FileOutputStream fos = null;
BufferedInputStream bis = null;
try {
    File fileDir = getExternalCacheDir();
    if (!fileDir.exists()) fileDir.mkdirs();
    file = new File(fileDir, System.currentTimeMillis() + ".mp4");
    fos = new FileOutputStream(file);
    bis = new BufferedInputStream(getContentResolver().openInputStream(uri));
    if (fos != null && bis != null) {
        byte[] buffer = new byte[1024 * 4];
        int len;
        while ((len = bis.read(buffer)) != -1) {
            fos.write(buffer, 0, len);
        }
        fos.flush();
    }
} catch (FileNotFoundException e) {
    e.printStackTrace();
} catch (IOException e) {
    e.printStackTrace();
} finally {
    try {
        bis.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
    try {
        fos.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

