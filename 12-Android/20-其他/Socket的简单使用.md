初始化Socket

```java
Socket so = new Socket(HOST, PORT);
```

发送数据

```java
try {
    if (!socket.isClosed() && !socket.isOutputShutdown()) {
        OutputStream os = socket.getOutputStream();
        String message = "xxxxxx";
        os.write(message.getBytes());
        os.flush();
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

接受数据

```java
try {
    InputStream is = socket.getInputStream();
    byte[] buffer = new byte[1024 * 4];
    int length = 0;
    while (!socket.isClosed() && !socket.isInputShutdown()
            && isStart && ((length = is.read(buffer)) != -1)) {
        if (length > 0) {
            String message = new String(Arrays.copyOf(buffer, length)).trim();
        }
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

设置连接超时时间

```java
socket.connect(new InetSocketAddress(HOST, PORT), 300); //单位：ms
```

设置响应超时时间

```java
socket.setSoTimeout(300); //单位：ms
```