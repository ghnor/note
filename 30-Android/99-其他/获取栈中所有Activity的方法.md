作者：俗人浮生
链接：https://www.jianshu.com/p/3f74a06a71a1
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。



在开发中，有时需要获取自己APP栈中所有的activity，比如实现在某个activity中彻底退出整个APP，如果此时我们能够获取到当前栈中所有的activity，那么逐个finish掉就OK了。当然，要实现退出整个APP也不是一定要这么做，这只是一种思路而已。

##### 方法1、获取activity栈（不行）

很多人会马上想到通过获取系统activity栈的办法来实现，相应的步骤大概是这样子的：

```csharp
   //先申请权限
  <uses-permission android:name="android.permission.GET_TASKS" />
  //获取activity任务栈
  ActivityManager activityManager=(ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
   //参数1是指最大任务栈数，一般APP也就只有一个任务栈
  ActivityManager.RunningTaskInfo runningTaskInfo = activityManager.getRunningTasks(1).get(0);
```

方法倒是很简单，到这里我们就获取到任务栈的相关信息：RunningTaskInfo，然而里面只包含有像什么id啊，顶部activity名字啊，运行中activity个数等等信息，而无法获取到栈中所有activity实例，故无法达到目的。

##### 方法2、基类收集

方法也非常简单，我们在自定义的Application中维护一个Activity实例列表：List<Activity> activitys
 然后在activity基类中进行收集，比如在onCreate中add，在onDestroy中remove
 这样就可以获取到栈中所有activity了，一般这么做简单粗暴，貌似也没多大问题
 有的人也许会担心，如果上面这个Activity实例列表中某个activity被系统回收了，那么如果我们使用它的话岂不是很容易就空指针异常了，其实这完成可以避免的，比如最简单的，你可以在使用前进行非空判断，你也可以使用弱引用，总之该方法还是具有可行性的。

##### 方法3、ActivityLifecycleCallbacks收集

上面的方法可行是可行，就是得在基类中进行收集，如果某个activity不继承基类，就收集不了，而使用ActivityLifecycleCallbacks却能解决这个问题，方法也非常简单：



```java
    registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override
            public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
                    //可以在这里add
            }

            @Override
            public void onActivityStarted(Activity activity) {

            }

            @Override
            public void onActivityResumed(Activity activity) {

            }

            @Override
            public void onActivityPaused(Activity activity) {

            }

            @Override
            public void onActivityStopped(Activity activity) {

            }

            @Override
            public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

            }

            @Override
            public void onActivityDestroyed(Activity activity) {
                     //可以在这里remove
            }
        });
```

如上面代码所示，我们直接在自定义的Application中加入这段代码即可，这样我们就得以获取到Activity相应的生命周期，如上面注释所标记的，我们便可完成activity列表的维护了。

##### 方法4、反射大法

通常来说，很多功能的实现最终总可以通过发射来完成的，不然怎么叫做“反射大法”呢！
 看过ActivityThread源码的都会注意到里面有这么一个东东：

```dart
final ArrayMap<IBinder, ActivityClientRecord> mActivities = new ArrayMap<>();
```

没错，它就是系统帮我们收集到的activity集合，下面我们直接上代码：

```dart
public List<Activity> getAllActivitys(){
        List<Activity> list=new ArrayList<>();
        try {
            Class<?> activityThread=Class.forName("android.app.ActivityThread");
            Method currentActivityThread=activityThread.getDeclaredMethod("currentActivityThread");
            currentActivityThread.setAccessible(true);
            //获取主线程对象
            Object activityThreadObject=currentActivityThread.invoke(null);
            Field mActivitiesField = activityThread.getDeclaredField("mActivities");
            mActivitiesField.setAccessible(true);
            Map<Object,Object> mActivities = (Map<Object,Object>) mActivitiesField.get(activityThreadObject);
            for (Map.Entry<Object,Object> entry:mActivities.entrySet()){
                Object value = entry.getValue();
                Class<?> activityClientRecordClass = value.getClass();
                Field activityField = activityClientRecordClass.getDeclaredField("activity");
                activityField.setAccessible(true);
                Object o = activityField.get(value);  
                list.add((Activity) o);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }
```

代码就是这么简单，需要注意一点就是，上面ActivityThread中的是ArrayMap，但我们反射却只能用Map来接收，这是因为ArrayMap是API 19才引进来的，所以我们只能用其父类来接了。
 另外，如果你仔细阅读了ActivityThread的源码就会发现mActivities收集的逻辑（put）是在onCreate和onStart之后的，所以，如果你在某个activity的onCreate和onStart调用上面方法的话，你将得不到当前activity的实例，而如果你在onResume中调用的话，则可以获取到当前activity实例！