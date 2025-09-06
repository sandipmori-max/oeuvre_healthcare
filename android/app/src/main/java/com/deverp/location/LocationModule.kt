package com.deverp.location

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import com.deverp.location.LocationService
import com.facebook.react.bridge.ReadableArray


class LocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocationModule"
    }

    @ReactMethod
    fun startService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        Log.d("LocationModule", "✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅  startService called with intent = $serviceIntent")
        ContextCompat.startForegroundService(reactContext, serviceIntent)
    }

    @ReactMethod
    fun setUserTokens(tokens: ReadableArray) {
        for (i in 0 until tokens.size()) {
            val token = tokens.getString(i)
            if (token != null && !LocationService.userTokens.contains(token)) {
                LocationService.userTokens.add(token)
            }
        }
        Log.d("LocationModule", "✅ Received tokens: ${LocationService.userTokens}")
    }


    @ReactMethod
    fun stopService() {
         Log.d("LocationModule", "❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌")
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        reactContext.stopService(serviceIntent)
    }
}
