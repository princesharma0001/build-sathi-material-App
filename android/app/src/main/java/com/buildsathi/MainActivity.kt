package com.neevsathi

import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.os.Build
import android.os.Bundle
import android.provider.Settings

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    createNotificationChannel()
  }

private fun createNotificationChannel() {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

    val channelId = "default"

    val channel = NotificationChannel(
      channelId,
      "BuildSathi Notifications",
      NotificationManager.IMPORTANCE_HIGH
    )

    channel.description = "BuildSathi push notifications"

    val audioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    channel.setSound(
      Settings.System.DEFAULT_NOTIFICATION_URI,
      audioAttributes
    )

    channel.enableVibration(true)

    val notificationManager =
      getSystemService(NotificationManager::class.java)

    notificationManager.createNotificationChannel(channel)
  }
}

  override fun getMainComponentName(): String = "BuildSathi"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(
        this,
        mainComponentName,
        fabricEnabled
      )
}