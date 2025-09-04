package com.deverp.location

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import com.deverp.location.LocationService

class LocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocationModule"
    }

    @ReactMethod
    fun startService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        Log.d("LocationModule", "🚀 startService called with intent = $serviceIntent")
        ContextCompat.startForegroundService(reactContext, serviceIntent)
    }

    @ReactMethod
    fun setUserToken(token: String) {
        Log.d("LocationModule", "✅ Received token from JS  $token")
        LocationService.userToken = token
    }

    @ReactMethod
    fun stopService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        reactContext.stopService(serviceIntent)
    }
}
