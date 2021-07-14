```java
getWindow().getDecorView().setPadding(0, 0, 0, 0);

WindowManager.LayoutParams attr = getWindow().getAttributes();
attr.height = ViewGroup.LayoutParams.WRAP_CONTENT;
attr.width = ViewGroup.LayoutParams.MATCH_PARENT;
attr.gravity = Gravity.BOTTOM;
getWindow().setAttributes(attr);
```

attributes也可以分开设置：

```java
getWindow().getDecorView().setPadding(0, 0, 0, 0);

getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
getWindow().setGravity(Gravity.BOTTOM);
```

