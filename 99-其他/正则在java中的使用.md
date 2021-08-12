> [JAVA正则表达式：Pattern类与Matcher类详解(转)](https://www.cnblogs.com/ggjucheng/p/3423731.html)



首先需要注意到的是Java 中的反斜杠。

反斜杠 `\` 在 Java 中表示转义字符，这意味着 `\` 在 Java 拥有预定义的含义。

这里例举两个特别重要的用法：

- 在匹配 `.` 或 `{` 或 `[` 或 `(` 或 `?` 或 `$` 或 `^` 或 `*` 这些特殊字符时，需要在前面加上 `\\`，比如匹配 `.` 时，Java 中要写为 `\\.`，但对于正则表达式来说就是 `\.`。
- 在匹配 `\` 时，Java 中要写为 `\\\\`，但对于正则表达式来说就是 `\\`。

**注意**：Java 中的正则表达式字符串有两层含义，首先 Java 字符串转义出符合正则表达式语法的字符串，然后再由转义后的正则表达式进行模式匹配。



java中构造了三个相关的类：

* **Pattern**：是正则表达式的包装类，暴露静态compile方法供外部创建Pattern对象。
* **Matcher**：用来解释模式和执行与输入字符串相匹配的操作。和 Pattern 类一样 Matcher 类也是没有构造方法的，你需要通过调用 Pattern 对象的 matcher 方法来获得 Matcher 对象。
* **PatternSyntaxException**：正则解析异常的exception类。

```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexMatches
{
    private static final String REGEX = "\\bcat\\b";
    private static final String INPUT = "cat cat cat cattie cat";

    public static void main( String args[] ){
       Pattern p = Pattern.compile(REGEX);
       Matcher m = p.matcher(INPUT); // get a matcher object
       int count = 0;

       while(m.find()) {
         count++;
         System.out.println("Match number "+count);
         System.out.println("start(): "+m.start());
         System.out.println("end(): "+m.end());
      }
   }
}
```

**诉求一：检查该字符串是否符合正则表达式**

* `Pattern.matcher(String regex,CharSequence input)`

* `Matcher.matches() / Matcher.lookingAt() / Matcher.find()`

返回值是boolean，也就是说只能知道是否匹配，但是匹配的内容无从得知。

> 1. matches是整个匹配，只有整个字符序列完全匹配成功，才返回True，否则返回False。但如果前部分匹配成功，将移动下次匹配的位置。lookingAt是部分匹配，总是从第一个字符进行匹配,匹配成功了不再继续匹配，匹配失败了,也不继续匹配。find是部分匹配，从当前位置开始匹配，找到一个匹配的子串，将移动下次匹配的位置。
>
> 2. Mathcher的find和lookingAt()方法执行成功之后，会影响后续的find的执行，因为下一次find会从上次匹配成功的位置开始继续查找，如果不想这样可以使用reset()方法复原匹配器的状态。
>
> [JAVA正则表达式matcher中find,matches,lookingAt匹配字符串的区别](http://www.51gjie.com/java/770.html)

**诉求二：拿到匹配到的内容**

* `String.split(String regex)`
* `Pattern.split(CharSequence input)`

得到符合匹配的结果数组`String[]`。

```java
Pattern p=Pattern.compile("\\d+"); 
String[] str=p.split("我的QQ是:456456我的电话是:0532214我的邮箱是:aaa@aaa.com"); 

结果:str[0]="我的QQ是:" str[1]="我的电话是:" str[2]="我的邮箱是:aaa@aaa.com" 
```

* `Mathcer.start() / Matcher.end()`

* `Matcher.group()`

`start()`返回匹配到的子字符串在字符串中的索引位置。
`end()`返回匹配到的子字符串的最后一个字符在字符串中的索引位置。
`group()`返回匹配到的子字符串。

每个方法均有一个重载方法，分别是`start(int i)`，`end(int i)`，`group(int i)`专用于分组操作，`Mathcer`类还有一个`groupCount()`用于返回有多少组。

