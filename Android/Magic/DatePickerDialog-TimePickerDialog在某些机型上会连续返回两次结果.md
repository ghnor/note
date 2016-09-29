---
title: 'DatePickerDialog, TimePickerDialog在某些机型上会连续返回两次结果'
date: 2016-06-10 16:46:55
categories: Android
tags:
---

继承系统的dialog，重写onStop方法

<!--more-->

```java
class CustomTimePicker extends TimePickerDialog {

    public CustomTimePicker(Context context, OnTimeSetListener callBack, 
            int hourOfDay, int minute, boolean is24HourView) {
        super(context, callBack, hourOfDay, minute, is24HourView);
    }

    @Override
    protected void onStop() {}
}
```

一样地，重写DatePickerDialog

```java
class CustomDataPicker extends DatePickerDialog {

    public CustomDataPicker(Context context, OnDateSetListener callBack,
            int year, int monthOfYear, int dayOfMonth) {
        super(context, callBack, year, monthOfYear, dayOfMonth);
    }

    @Override
    protected void onStop() {}
}
```