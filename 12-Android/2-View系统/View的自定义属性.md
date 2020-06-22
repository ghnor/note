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
    // ... 其他构造函数

    public TestView(Context context, @androidx.annotation.Nullable AttributeSet attrs,
                    int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
      
        TypedArray typedArray = context.obtainStyledAttributes(
                attrs,
                R.styleable.TestView,
                0,
                0);
    }
}
```

## 一、obtainStyledAttributes()方法

通过obtainStyledAttributes()方法获取view的属性，该方法有多个重载方法，最多有四个入参，分别是：`AttributeSet set`、`@StyleableRes int[] attrs`、`@AttrRes int defStyleAttr`、`@StyleRes int defStyleRes`。

`AttributeSet set`是xml中属性的集合，简单地理解为是map，那么内部的数据结构就是：

```json
{
  "layout_width": "match_parent",
  "layout_height": "wrap_content",
  "test": "自定义View的属性"
}
```

## 二、@StyleableRes int[] attrs

先看第二个参数`R.styleable.TestView`，首先styleable和attr没有依赖关系，每个attr都对应R文件中一个int类型的id，styleable则是一个int[]数组。

attr对应view的某个属性，styleable只不过是view属性的集合。

如果移除掉styleable，那么上面的代码可以写成：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    // 移除了declare-styleable
    <attr name="test" format="string"/>
</resources>
```

```java
int[] testView = {R.attr.test}; // 手动去拼装一个int数组
TypedArray typedArray = context.obtainStyledAttributes(
                attrs,
                testView,
                0,
                0);
```

## 三、@StyleRes int defStyleRes

再看第四个属性，即style样式。在Java代码中通过`R.style.***`引用，在xml中通过`@style/***`引用。

**1. 定义一个style样式**

```xml
<style name="Style_TestView">
    <item name="test">Style_TestView</item>
</style>
```

**2. 修改方法**

```java
TypedArray typedArray = context.obtainStyledAttributes(
                attrs,
                R.styleable.TestView,
                0,
                R.style.Style_TestView);
```

## 四、@AttrRes int defStyleAttr

继续看第三个属性，即attr预定义样式。

> An attribute in the current theme that contains a reference to a style resource that supplies default values for the view.

文档说明该属性是一个指向当前theme中style索引，作为view的默认样式，所以attr预定义样式是跟随主题theme变化的，在Java代码中通过R.attr.***方式引用。

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

**4. 修改方法**

```java
TypedArray typedArray = context.obtainStyledAttributes(
                attrs,
                R.styleable.TestView,
                R.attr.attrRef,
                0);
```

## 五、优先级

这些属性会互相覆盖。优先级大致是：XML直接使用具体的某个属性 > XML中使用style或者attr > 代码中的defStyleAttr > 代码中的defStyleRef。

## 六、补充

除了上面的一些引用方式之外，可能还有看到例如`@android:style/***`或者`?android:attr/***`等。带上`android`关键字的话，是系统自带的style样式或者attr预定义样式。

||style样式|attr预定义样式|
|-|-|-|
|自定义的|R.style.***<br>@style/***|R.attr.***<br>?attr/***|
|系统自带的|android.R.style.***<br>@android:style/***<br>@style/android:***|android.R.attr.***<br>?android:attr/***<br>?attr/android:***|

## 七、其他

style和attr是相互包含的关系。

attr可以定义一个format是reference的属性，它就能指向一个style；同样地，style中可以定义很多个attr属性，甚至是在style中嵌套引用其他style。

因为attr可以在theme中去赋值，所以通过`?attr/`或者`R.attr.`引用的就是theme中定义的某个attr属性的值，所以能够跟随theme的改变而改变，这一点在第五部分已经提及，但是需要强调的是这个特性并不局限于作为obtainStyledAttributes()方法的入参生效，在xml中完全可以通过`style="?attr/attrRef"`达到一样的效果。

## 参考

[Android 自定义View属性相关细节](https://mp.weixin.qq.com/s?__biz=MzAxMTI4MTkwNQ==&mid=2650820236&idx=1&sn=6dec4ff1efeda3224b5a40fdad862404&scene=23&srcid=052467lBVXuy6kVDfO1gzlRT#rd)  
[Android 深入理解Android中的自定义属性](https://blog.csdn.net/lmj623565791/article/details/45022631)  
[Android中 @和?区别以及?attr/**与@style/**等的区别](https://blog.csdn.net/xx326664162/article/details/64125654)  
[android中?attr/**与@drawable/**或@color/**等的区别](https://blog.csdn.net/u011153817/article/details/50015213)  
[Android xml中 @和?区别，style和attr小结](https://blog.csdn.net/RichieZhu/article/details/52490521)
