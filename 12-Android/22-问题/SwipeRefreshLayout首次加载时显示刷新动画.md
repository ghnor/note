将原先：
```java
swipeRefreshLayout.setRefreshing(true);
```
更改为：
```java
swipeRefreshLayout.post(new Runnable() {
            
    @Override
    public void run() {
        swipeRefreshLayout.setRefreshing(true);
    }
});
```