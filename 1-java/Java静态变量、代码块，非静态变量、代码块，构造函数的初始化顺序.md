静态成员变量 = 静态代码块 > 非静态成员变量 = 非静态代码块 > 构造函数  
```java
public class InitialOrderTest {
    // 静态成员变量
    public static String staticField = "静态成员变量";
    // 非静态成员变量
    public String field = "非静态成员变量";
    // 静态代码块
    static {
        System.out.println(staticField);
        System.out.println("静态代码块");
    }
    // 非静态代码块
    {
        System.out.println(field);
        System.out.println("非静态代码块");
    }
    // 构造函数
    public InitialOrderTest() {
        System.out.println("构造函数");
    }
    public static void main(String[] args) {
        new InitialOrderTest();
    }
}

输出：  

静态成员变量
静态代码块
非静态成员变量
非静态代码块
构造函数
```
**子类继承父类**  
父类-静态成员变量 = 父类-静态代码块 > 子类-静态成员变量 = 子类-静态代码块 > 父类-非静态成员变量 = 父类-非静态代码块 > 父类-构造函数 > 子类-非静态成员变量 = 子类-非静态代码块 > 子类-构造函数
```java
public class Parent {
    // 静态成员变量
    public static String p_StaticField = "父类-静态成员变量";
    
    // 非静态成员变量
    public String p_Field = "父类-非静态成员变量";
    // 静态代码块
    static {
        System.out.println(p_StaticField);
        System.out.println("父类-静态代码块");
    }
    // 非静态代码块
    {
        System.out.println(p_Field);
        System.out.println("父类-非静态代码块");
    }
    // 构造函数
    public Parent() {
        System.out.println("父类-构造函数");
    }
}
public class SubClass extends Parent {
    // 静态成员变量
    public static String s_StaticField = "子类-静态成员变量";
    
    // 非静态成员变量
    public String s_Field = "子类-非静态成员变量量";
    // 静态代码块
    static {
        System.out.println(s_StaticField);
        System.out.println("子类-静态代码块");
    }
    // 非静态代码块
    {
        System.out.println(s_Field);
        System.out.println("子类-非静态代码块");
    }
    // 构造函数
    public SubClass() {
        System.out.println("子类-构造函数");
    }
    
    public static void main(String[] args) {
        new SubClass();
    }
}

输出：

父类-静态成员变量
父类-静态代码块
子类-静态成员变量
子类-静态代码块
父类-非静态成员变量
父类-非静态代码块
父类-构造函数
子类-非静态成员变量
子类-非静态代码块
子类-构造函数
```

### 补充

> [Java重写方法与初始化的隐患](http://www.jianshu.com/p/cdc5adb40bb7)

**父类构造方法中调用了某个方法, 这个方法恰好被子类重写**，调用顺序变成了：  
父类非静态成员变量和非静态代码块 ---> 父类构造方法 ---> 子类重写的某个方法 ---> 子类非静态成员变量和非静态代码块 ---> 子类构造方法
