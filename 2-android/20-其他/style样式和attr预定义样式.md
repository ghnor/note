先看一下，一般自定义View都需要实现的一些模板代码。

**1. 定义自定义属性**

res/values/attrs.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="TestView">
        <attr name="test" format="string"/>
    </declare-styleable>
</resources>
```

**2. 继承View**

```Java
public class TestView extends View {
    public static final String TAG = TestView.class.getSimpleName();

    public TestView(Context context) {
        super(context);
        Log.e(TAG, "-->1<--");
        init(context, null, 0, 0);
    }

    public TestView(Context context, @androidx.annotation.Nullable AttributeSet attrs) {
        super(context, attrs);
        Log.e(TAG, "-->2<--");
        init(context, attrs, 0, 0);
    }

    public TestView(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                    int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        Log.e(TAG, "-->3<--");
        init(context, attrs, 0, 0);
    }

    public TestView(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                    int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        Log.e(TAG, "-->4<--");
        init(context, attrs, 0, 0);
    }

    private void init(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                      int defStyleAttr, int defStyleRes) {
        TypedArray typedArray = context.obtainStyledAttributes(
                attrs,
                R.styleable.TestView,
                0,
                0);
        String test = typedArray.getString(R.styleable.TestView_test);

        Log.e(TAG, "test = " + test);

        typedArray.recycle();
    }
}
```

这里我们注意看一下obtainStyledAttributes方法，它有四个参数，分别是：`AttributeSet set`、`@StyleableRes int[] attrs`、`@AttrRes int defStyleAttr`、`@StyleRes int defStyleRes`。

重点看后两个参数，也就是defStyleAttr和defStyleRes。defStyleRes对应普通的style样式，即：通过`@style/***`或者`R.style.***`方式使用；defStyleAttr对应attr预定义样式，即：通过`?attr/***`或者`R.attr.***`方式使用。二者的区别是attr预定义样式。

**3. XML布局**

```xml
<com.example.zhang.myapplication.TestView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

**运行结果：**

```
E/TestView: -->2<--
E/TestView: test = null
```

## @StyleRes int defStyleRes

先看第四个属性，即style样式。在Java代码中style样式通过R.style.***的方式引用。

**1. 定义一个style样式**

```xml
<style name="Style_TestView">
    <item name="test">Style_TestView</item>
</style>
```

**2. 修改init方法**

```java
private void init(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                    int defStyleAttr, int defStyleRes) {
    TypedArray typedArray = context.obtainStyledAttributes(
            attrs,
            R.styleable.TestView,
            0,
            R.style.Style_TestView);
    String test = typedArray.getString(R.styleable.TestView_test);

    Log.e(TAG, "test = " + test);

    typedArray.recycle();
}
```

**运行结果：**

```
-->2<--
test = Style_TestView
```

### 在XML中使用style样式

为了方便比较在XML中使用和Java代码中使用时的优先级顺序，我们再定义一个新的style样式。

在XML中，style样式通过`@style/***`方式引用。

**1. 定义一个style样式**

```
<style name="Style_TestView_XML">
    <item name="test">Style_TestView_XML</item>
</style>
```

**2. 修改XML布局**

```xml
<com.example.zhang.myapplication.TestView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    style="@style/Style_TestView_XML"/>
```

**运行结果：**

```
-->2<--
test = Style_TestView_XML
```

## @AttrRes int defStyleAttr

继续看第三个属性，即attr预定义样式。

> An attribute in the current theme that contains a reference to a style resource that supplies default values for the view.

文档说明该属性是一个指向默认style的索引。attr预定义样式是跟随主题Theme变化的，在Java代码中通过R.attr.***方式引用。

**1. 修改attrs.xml**

添加一个attrRef的属性，类型为引用类型。

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="TestView">
        <attr name="test" format="string"/>
    </declare-styleable>
    <attr name="attrRef" format="reference"/>
</resources>
```

**2. 定义一个style样式**

```xml
<style name="Attr_TestView">
    <item name="test">Attr_TestView</item>
</style>
```

**3. 在Theme中添加一个属性**

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <!-- Customize your theme here. -->
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
    <item name="colorAccent">@color/colorAccent</item>

    <item name="attrRef">@style/Attr_TestView</item>
</style>
```

**4. 修改init方法**

```java
private void init(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                    int defStyleAttr, int defStyleRes) {
    TypedArray typedArray = context.obtainStyledAttributes(
            attrs,
            R.styleable.TestView,
            R.attr.attrRef,
            R.style.Style_TestView);
    String test = typedArray.getString(R.styleable.TestView_test);

    Log.e(TAG, "test = " + test);

    typedArray.recycle();
}
```

**运行结果：**

```
E/TestView: -->2<--
E/TestView: test = Attr_TestView
```

### 在XML中使用attr预定义样式

同样为了比较优先级顺序，再定义一套style和attr。

**1. 修改attrs.xml**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="TestView">
        <attr name="test" format="string"/>
    </declare-styleable>
    <attr name="attrRef" format="reference"/>
    <attr name="attrRefXml" format="reference"/>
</resources>
```

**2. 定义style样式**

```xml
<style name="Attr_TestView_XML">
    <item name="test">Attr_TestView_XML</item>
</style>
```

**3. 在Theme中添加一个属性**

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
    <!-- Customize your theme here. -->
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
    <item name="colorAccent">@color/colorAccent</item>

    <item name="attrRef">@style/Attr_TestView</item>
    <item name="attrRefXml">@style/Attr_TestView_XML</item>
</style>
```

**4. 修改XML布局**

```xml
<com.example.zhang.myapplication.TestView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    style="?attr/attrRefXml"/>
```

**运行结果：**

```
E/TestView: -->2<--
E/TestView: test = Attr_TestView_XML
```

## 优先级

这些属性会互相覆盖。优先级大致是：XML直接使用具体的某个属性 > XML中使用style或者attr > 代码中的defStyleAttr > 代码中的defStyleRef。

## 补充

除了上面的一些引用方式之外，可能还有看到例如`@android:style/***`或者`?android:attr/***`等。带上`android`关键字的话，是系统自带的style样式或者attr预定义样式。

||style样式|attr预定义样式|
|-|-|-|
|自定义的|R.style.***<br>@style/***|R.attr.***<br>?attr/***|
|系统自带的|android.R.style.***<br>@android:style/***<br>@style/android:***|android.R.attr.***<br>?android:attr/***<br>?attr/android:***|

## 参考

[Android 自定义View属性相关细节](https://mp.weixin.qq.com/s?__biz=MzAxMTI4MTkwNQ==&mid=2650820236&idx=1&sn=6dec4ff1efeda3224b5a40fdad862404&scene=23&srcid=052467lBVXuy6kVDfO1gzlRT#rd)  
[Android中 @和?区别以及?attr/**与@style/**等的区别](https://blog.csdn.net/xx326664162/article/details/64125654)  
[android中?attr/**与@drawable/**或@color/**等的区别](https://blog.csdn.net/u011153817/article/details/50015213)  
[Android xml中 @和?区别，style和attr小结](https://blog.csdn.net/RichieZhu/article/details/52490521)