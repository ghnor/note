## 在 ViewPager 中使用 Fragment
### 启动
```java
MainActivity: onCreate
MainActivity: onStart
MainActivity: onResume
FragmentA: setUserVisibleHint ---> false
FragmentB: setUserVisibleHint ---> false
FragmentA: onAttach
FragmentA: onCreate
FragmentA: setUserVisibleHint ---> true
FragmentB: onAttach
FragmentB: onCreate
FragmentB: onCreateView
FragmentB: onViewCreated
FragmentB: onActivityCreated
FragmentA: onCreateView
FragmentA: onViewCreated
FragmentA: onActivityCreated
FragmentA: onStart
FragmentA: onResume
FragmentB: onStart
FragmentB: onResume
```

### 从 FragmentA 切换到 FragmentB
```java
FragmentC: setUserVisibleHint ---> false
FragmentA: setUserVisibleHint ---> false
FragmentB: setUserVisibleHint ---> true
FragmentC: onAttach
FragmentC: onCreate
FragmentC: onCreateView
FragmentC: onViewCreated
FragmentC: onActivityCreated
FragmentC: onStart
FragmentC: onResume
```

### 从 FragmentB 切换到 FragmentC
```java
FragmentB: setUserVisibleHint ---> false
FragmentC: setUserVisibleHint ---> true
FragmentA: onPause
FragmentA: onStop
FragmentA: onDestroyView
```

### 从 FragmentC 切回到 FragmentB
```java
FragmentA: setUserVisibleHint ---> false
FragmentC: setUserVisibleHint ---> false
FragmentB: setUserVisibleHint ---> true
FragmentA: onCreateView
FragmentA: onViewCreated
FragmentA: onActivityCreated
FragmentA: onStart
FragmentA: onResume
```

### 退出
```java
FragmentB: onPause
FragmentC: onPause
MainActivity: onPause
FragmentB: onStop
FragmentC: onStop
MainActivity: onStop
FragmentB: onDestroyView
FragmentB: onDestroy
FragmentB: onDetach
FragmentA: onDestroy
FragmentA: onDetach
FragmentC: onDestroyView
FragmentC: onDestroy
FragmentC: onDetach
MainActivity: onDestroy
```

## 动态使用 Fragment
### 启动
```java
MainActivity: onCreate
FragmentA: onAttach
FragmentA: onCreate
FragmentA: onCreateView
FragmentA: onViewCreated
FragmentA: onActivityCreated
FragmentA: onStart
MainActivity: onStart
MainActivity: onResume
FragmentA: onResume
```

### 从 FragmentA 切换到 FragmentB
```java
FragmentB: onAttach
FragmentB: onCreate
FragmentA: onPause
FragmentA: onStop
FragmentA: onDestroyView
FragmentA: onDestroy
FragmentA: onDetach
FragmentB: onCreateView
FragmentB: onViewCreated
FragmentB: onActivityCreated
FragmentB: onStart
FragmentB: onResume
```

### 退出
```java
FragmentA: onPause
MainActivity: onPause
FragmentA: onStop
MainActivity: onStop
FragmentA: onDestroyView
FragmentA: onDestroy
FragmentA: onDetach
MainActivity: onDestroy
```

## 静态使用 Fragment
### 启动
```java
MainActivity: onCreate
TestFragment: onAttach
TestFragment: onCreate
TestFragment: onCreateView
TestFragment: onViewCreated
TestFragment: onActivityCreated
TestFragment: onStart
MainActivity: onStart
MainActivity: onResume
TestFragment: onResume
```

### 退出
```java
TestFragment: onPause
MainActivity: onPause
TestFragment: onStop
MainActivity: onStop
TestFragment: onDestroyView
TestFragment: onDestroy
TestFragment: onDetach
MainActivity: onDestroy
```
