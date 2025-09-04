package com.deverp.location

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import java.net.HttpURLConnection
import java.net.URL

class LocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var lastLocation: Location? = null
    private val handler = Handler()

    companion object {
        var userToken: String? = null
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        startForeground(1, createNotification())

        startLocationUpdates()
        startRepeatingSync()
    }

   override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("LocationService", "Service started/restarted")
        return START_STICKY
    }


    private fun createNotification(): Notification {
        val channelId = "location_service_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Location Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("ERP Location Tracking")
            .setContentText("Your location is being tracked in background")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true) 
            .build()
    }

    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            1000  
        ).setMinUpdateDistanceMeters(0f)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                super.onLocationResult(locationResult)
                if (locationResult.locations.isNotEmpty()) {
                    lastLocation = locationResult.locations.last()
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            request,
            locationCallback,
            mainLooper
        )
    }

    private fun startRepeatingSync() {
        val runnable = object : Runnable {
            override fun run() {
                lastLocation?.let { handleNewLocation(it) }
                handler.postDelayed(this, 30_000) 
            }
        }
        handler.post(runnable)
    }

    private fun handleNewLocation(location: Location) {
        Log.d("LocationService", "📍 New location: ${location.latitude}, ${location.longitude}")

        val token = userToken ?: return
        Log.d("LocationService", "🔑 Using token: $token")

        Thread {
            try {
                val url = URL("http://payroll.deverp.net/devws/msp_api.aspx/syncLocation")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/json")

                val json = """
                    {
                      "token": "$token",
                      "location": "${location.latitude},${location.longitude}"
                    }
                """.trimIndent()

                conn.outputStream.use { it.write(json.toByteArray()) }
                val response = conn.inputStream.bufferedReader().readText()
                Log.d("LocationService", "✅ API Response: $response")
            } catch (e: Exception) {
                Log.e("LocationService", "❌ Failed to sync location", e)
            }
        }.start()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
        handler.removeCallbacksAndMessages(null)
    }
}
