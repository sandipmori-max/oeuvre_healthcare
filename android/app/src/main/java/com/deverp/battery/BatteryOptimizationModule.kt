package com.deverp.battery

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryOptimizationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BatteryOptimization"
    }

    @ReactMethod
    fun isIgnoringBatteryOptimizations(promise: Promise) {
        try {
            val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isIgnoring = pm.isIgnoringBatteryOptimizations(reactContext.packageName)
            promise.resolve(isIgnoring)
        } catch (e: Exception) {
            promise.reject("ERR_OPT_CHECK", e)
        }
    }

   @ReactMethod
fun requestIgnoreBatteryOptimizations(promise: Promise) {
    try {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${reactContext.packageName}")
        }

        val activity = currentActivity
        if (activity != null) {
            activity.startActivity(intent)
            promise.resolve(true)
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        }
    } catch (e: Exception) {
        promise.reject("ERR_OPT_REQUEST", e)
    }
}

}
