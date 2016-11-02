1. 给Activity在清单文件里设置全屏；  
2. 在该Activity执行Finish之前，执行下面语句：
```java
getWindow().setFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN, WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
```
