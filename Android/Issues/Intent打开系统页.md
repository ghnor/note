### 系统默认浏览器
```java
Uri webViewUri = Uri.parse(url);
Intent intent = new Intent(Intent.ACTION_VIEW, webViewUri);
context.startActivity(intent);
```

### 拨号界面
```java
Uri uri = Uri.parse("tel:" + tel);
Intent it = new Intent(Intent.ACTION_DIAL, uri);
context.startActivity(it);
```

### 直接拨打电话（需要权限）
```java
Uri uri = Uri.parse("tel:" + tel);
Intent it = new Intent(Intent.ACTION_CALL, uri);
context.startActivity(it);
```

### 打开APK
```java
Intent intent = new Intent(Intent.ACTION_VIEW);
intent.setDataAndType(Uri.fromFile(new File(path)), "application/vnd.android.package-archive");
context.startActivity(intent);
```

### 录音机
```java
Intent mi = new Intent(Media.RECORD_SOUND_ACTION);
context.startActivity(mi);
```

### 联系人列表
```java
Intent i = new Intent();
i.setAction(Intent.ACTION_GET_CONTENT);
i.setType("vnd.android.cursor.item/phone");
activity.startActivityForResult(i, requestCode);
```

### 联系人列表
```java
Uri uri = Uri.parse("content://contacts/people");
Intent it = new Intent(Intent.ACTION_PICK, uri);
activity.startActivityForResult(it, requestCode);
```

### 系统设置
```java
com.android.settings.AccessibilitySettings 辅助功能设置
com.android.settings.ActivityPicker 选择活动
com.android.settings.ApnSettings APN设置
com.android.settings.ApplicationSettings 应用程序设置
com.android.settings.BandMode 设置GSM/UMTS波段
com.android.settings.BatteryInfo 电池信息
com.android.settings.DateTimeSettings 日期和时间设置
com.android.settings.DateTimeSettingsSetupWizard 日期和时间设置
com.android.settings.DevelopmentSettings 应用程序设置=》开发设置
com.android.settings.DeviceAdminSettings 设备管理器
com.android.settings.DeviceInfoSettings 关于手机
com.android.settings.Display 显示——设置显示字体大小及预览
com.android.settings.DisplaySettings 显示设置
com.android.settings.DockSettings 底座设置
com.android.settings.IccLockSettings SIM卡锁定设置
com.android.settings.InstalledAppDetails 语言和键盘设置
com.android.settings.LanguageSettings 语言和键盘设置
com.android.settings.LocalePicker 选择手机语言
com.android.settings.LocalePickerInSetupWizard 选择手机语言
com.android.settings.ManageApplications 已下载（安装）软件列表
com.android.settings.MasterClear 恢复出厂设置
com.android.settings.MediaFormat 格式化手机闪存
com.android.settings.PhysicalKeyboardSettings 设置键盘
com.android.settings.PrivacySettings 隐私设置
com.android.settings.ProxySelector 代理设置
com.android.settings.RadioInfo 手机信息
com.android.settings.RunningServices 正在运行的程序（服务）
com.android.settings.SecuritySettings 位置和安全设置
com.android.settings.Settings 系统设置
com.android.settings.SettingsSafetyLegalActivity 安全信息
com.android.settings.SoundSettings 声音设置
com.android.settings.TestingSettings 测试——显示手机信息、电池信息、使用情况统计、Wifi、information、服务信息 
com.android.settings.TetherSettings 绑定与便携式热点   
com.android.settings.TextToSpeechSettings 文字转语音设置
com.android.settings.UsageStats 使用情况统计
com.android.settings.UserDictionarySettings 用户词典
com.android.settings.VoiceInputOutputSettings 语音输入与输出设置
com.android.settings.WirelessSettings 无线和网络设置


Intent intent = new Intent();
ComponentName comp = new ComponentName("com.android.settings", action);
intent.setComponent(comp);
intent.setAction("android.intent.action.VIEW");
activity.startActivityForResult(intent, 0);
```
