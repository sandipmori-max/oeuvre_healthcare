package com.oeuvre.location

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import com.oeuvre.location.LocationService
import com.facebook.react.bridge.ReadableArray
import com.oeuvre.location.UserData


class LocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocationModule"
    }



    @ReactMethod
    fun startService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        Log.d(
            "LocationModule",
            "✅ startService called with intent = $serviceIntent"
        )
        ContextCompat.startForegroundService(reactContext, serviceIntent)
    }

    @ReactMethod
    fun setUserTokens(data: ReadableArray) {
        for (i in 0 until data.size()) {
            val item = data.getMap(i)  // Each element is a ReadableMap
            val token = item?.getString("token")
            val link = item?.getString("link")

            if (token != null && link != null) {
                val entry = UserData(token, link)

                // Avoid duplicates
                if (!LocationService.userDataList.contains(entry)) {
                    LocationService.userDataList.add(entry)
                }
            }
        }
        Log.d("LocationModule", "✅ Received token-link pairs: ${LocationService.userDataList}")
    }

    @ReactMethod
    fun stopService() {
        Log.d(
            "LocationModule",
            "❌ stopService called"
        )
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        reactContext.stopService(serviceIntent)
    }
}
