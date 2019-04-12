# ANR

## ANR产生的原因是什么？怎么定位？

## 什么是ANR？什么情况会出现ANR？如何避免？在不看代码的情况下如何快速定位出现ANR问题所在？

* ANR（Application Not Responding，应用无响应）：当操作在一段时间内系统无法处理时，会在系统层面会弹出ANR对话框
* 产生ANR可能是因为5s内无响应用户输入事件、10s内未结束BroadcastReceiver、20s内未结束Service
* 想要避免ANR就不要在主线程做耗时操作，而是通过开子线程，方法比如继承Thread或实现Runnable接口、使用AsyncTask、IntentService、HandlerThread等

[如何分析ANR](https://www.jianshu.com/p/cfa9ed42e379)