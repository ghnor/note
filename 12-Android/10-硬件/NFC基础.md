## NFC相关AndroidManifest配置

权限：`<uses-permissionandroid:name="Android.permission.NFC"/>`

特殊功能限制，让你的应用在googleplay上被声明使用者必须拥有nfc功能：`<uses-feature android:name="android.hardware.nfc"android:required="true"/>`


## Android NFC 开发中的几个类

|常用类|说明|
|--|--|
|NfcManager|用来管理Android设备中所有NFC Adapter。因为大部分Android设备只支持一个NFC Adapter，因此可以直接使用getDefaultAdapter来获取系统的NfcAdapter。|
|NfcAdapter|手机的NFC硬件设备，更专业的称呼是NFC适配器。该类可以用来定义一个Intent使系统在检测到NFC Tag时通知用户定义的Activity，并提供用来注册Foreground Tag消息发送的方法等。|
|Tag|代表一个被动式NFC对象，比如一张公交卡，Tag可以理解成能被手机NFC读写的对象。当Android检测到一个Tag时，会创建一个Tag对象，将其放在Intent对象中，然后发送到相应的Activity。|

|数据处理类|支持协议|
|--|--|
|IsoDep|ISO-DEP（ISO 14443-4）|
|MifareClassic|Mifare Classic|
|MifareUltralight|Mifare Ultralight|
|Ndef、NdefFormatable|NDEF|
|NfcA|NFC-A（ISO-14443-3A）|
|NfcB|NFC-B（ISO-14443-3B）|
|NfcF|NFC-F（JIS 6319-4）|
|NfcV|NFC-V（ISO 15693）|

## NFC调度系统

NFC调度是指手机检测到NFC对象后如何处理，调度系统分为前台调度系统（Foreground Dispatch System）和标签调度系统（NFC Tag Dispatch System）。

### 前台调度系统

NFC前台调度系统是一种用于在运行的程序中（前台呈现的Activity）处理Tag的技术，即前台调度系统允许Activity拦截Intent对象，并且声明该Activity的优先级比其他的处理Intent对象的Activity高。前台调度系统在一些涉及需要在前台呈现的页面中直接获取或推送NFC信息时十分方便。

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    // 1. 创建一个PendingIntent对象，以便Android系统能够在扫描到NFC标签时，用它来封装NFC标签的详细信息
    mPendingIntent = PendingIntent.getActivity(this, 0, 
            new Intent(this, getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), 0);

    // 2. 创建Intent过滤器
    mIntentFilter = new IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED);

    // 3. 创建一个处理NFC标签技术的数组
    mTechLists = new String[][]{new String[]{IsoDep.class.getName()}};
}

@Override
protected void onResume() {
    super.onResume();

    // 4. 在主线程中调用enableForegroundDispatch()方法，一旦NFC标签接触到手机，这个方法就会被激活
    mNfcAdapter.enableForegroundDispatch(this, mPendingIntent, 
            new IntentFilter[]{mIntentFilter}, mTechLists);
    // 如果第三个参数为null，此时根据Manifest文件中<intent-filter>定义的优先级处理
    // 如果第四个参数为null，我们需要自己实现数据的解析
    // mNfcAdapter.enableForegroundDispatch(this, mPendingIntent, null, null);
}

@Override
protected void onPause() {
    super.onPause();

    // 5. 挂起前台调度
    mNfcAdapter.disableForegroundDispatch(this);
}

@Override
protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    // 6. 处理Intent回调给我们的信息
}
```

### 标签调度系统

|标签调度优先级|IntentFilter>action|
|--|--|
|高|ACTION_NDEF_DISCOVERED|
|中|ACTION_TECH_DISCOVERED|
|低|ACTION_TAB_DISCOVERED|

主要是在AndroidManifest中对需要的Activity配置intent-filter。

* 过滤ACTION_TAG_DISCOVERED
```xml
<intent-filter>
    <action android:name="android.nfc.action.TAG_DISCOVERED"/>
    <category android:name="android.intent.category.DEFAULT"/>
</intent-filter>
```
这个最简单，也是最后一个被尝试接受intent的选项。

* 过滤ACTION_NDEF_DISCOVERED
```xml
<intent-filter>
    <action android:name="android.nfc.action.NDEF_DISCOVERED"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <data android:mimeType="text/plain" />
</intent-filter>
```
其中最重要的应该算是data的mimeType类型了，这个定义的越准确，intent指向你这个activity的成功率就越高，否则系统可能不会发出你想要的NDEF intent了。

* 过滤ACTION_TECH_DISCOVERED

你首先需要在你的<project-path>/res/xml下面创建一个过滤规则文件。名字任取，比如可以叫做nfc_tech_filter.xml。这个里面定义的是nfc实现的各种标准，每一个nfc卡都会符合多个不同的标准，个人理解为这些标准有些相互之间也是兼容的。你可以在检测到nfc标签后使用getTechList()方法来查看你所检测的tag到底支持哪些nfc标准。一个nfc_tech_filter.xml中可以定义多个<tech-list>结构组。

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <tech-list>
        <tech>android.nfc.tech.NfcA</tech>
    </tech-list>
    ...
    <tech-list>
        <tech>android.nfc.tech.NfcB</tech>
    </tech-list>
</resources>
```

```xml
<activity>
    <intent-filter>
        <action android:name="android.nfc.action.TECH_DISCOVERED"/>
    </intent-filter>
    <meta-data android:name="android.nfc.action.TECH_DISCOVERED"
        android:resource="@xml/nfc_tech_filter" />
</activity>
```

## 从Intent中获取数据集

intent中可能携带的数据有下面三种，具体哪个里面有数据取决于检测到的NFC tag中的数据类型：

1. EXTRA_TAG（必须）
2. ECTRA_NDEF_MESSAGES（可选）
3. EXTRA_ID（可选）

通过ACTION_NDEF_DISCOVERED类型的Intent获取NDEF信息：
```java
if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(getIntent().getAction())) {
    Parcelable[] rawMsgs = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
    NdefMessage[] msgs;
    if (rawMsgs != null) {
        msgs = new NdefMessage[rawMsgs.length];
        for (int i = 0; i < rawMsgs.length; i++) {
            msgs[i] = (NdefMessage) rawMsgs[i];
        }
    }
}
```

或者，可以从Intent中获取Tag 对象，tag对象中包含了数据和数据类型：

```java
Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
```

参考：
[NFC基础](http://blog.csdn.net/zoeice/article/details/9714867)  
[Android Beam 详细实现步骤](http://blog.csdn.net/kehrwang/article/details/9904161)  
[android NFC开发](http://blog.csdn.net/qq_16064871/article/details/50166841)  
[NFC_Demo](https://github.com/fangmd/NFC_Demo/blob/master/app/src/main/java/com/doublefang/nfcdemo/tech/FeliCa.java)