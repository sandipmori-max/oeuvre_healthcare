import Foundation
import CoreLocation
import UIKit

class LocationService: NSObject, CLLocationManagerDelegate {

    static let shared = LocationService()
    
    private let locationManager = CLLocationManager()
    var userDataList: [(token: String, link: String)] = []
    private var lastSentLocation: CLLocation?

    private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.distanceFilter = 10
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = true
    }

    // MARK: START TRACKING (Check-in)
    func start() {
        print("▶️ [LocationService] start() called")

        let status = CLLocationManager.authorizationStatus()

        if status == .notDetermined {
            locationManager.requestAlwaysAuthorization()
            return
        }

        if status == .denied || status == .restricted {
            print("❌ Location permission denied")
            return
        }

        startForegroundTracking()
        startBackgroundTracking()
    }

    // MARK: STOP TRACKING (Check-out)
    func stop() {
        print("🛑 stop() called")
        locationManager.stopUpdatingLocation()
        locationManager.stopMonitoringSignificantLocationChanges()
    }

    // MARK: Foreground tracking
    private func startForegroundTracking() {
        print("📍 Foreground tracking started")
        locationManager.startUpdatingLocation()
    }

    // MARK: Background tracking (Apple safe)
    private func startBackgroundTracking() {
        if CLLocationManager.significantLocationChangeMonitoringAvailable() {
            locationManager.startMonitoringSignificantLocationChanges()
            print("📡 Significant location monitoring started")
        }
    }

    // MARK: Handle location
    private func handleNewLocation(_ location: CLLocation) {

        if let last = lastSentLocation {
            let distance = location.distance(from: last)
            if distance < 10 {
                print("⚠️ Location changed only \(distance)m, skipping API")
                return
            }
        }

        lastSentLocation = location

        print("📍 New location: \(location.coordinate.latitude), \(location.coordinate.longitude)")

        for user in userDataList {
            sendLocation(user.token, user.link, location)
        }
    }

    // MARK: API Call
    private func sendLocation(_ token: String, _ link: String, _ location: CLLocation) {

        let json: [String: Any] = [
            "token": token,
            "location": "\(location.coordinate.latitude),\(location.coordinate.longitude)"
        ]

        let secureLink = link.replacingOccurrences(of: "http://", with: "https://")

        guard let url = URL(string: "\(secureLink)/msp_api.aspx/syncLocation"),
              let data = try? JSONSerialization.data(withJSONObject: json) else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = data

        var bgTask = UIBackgroundTaskIdentifier.invalid
        bgTask = UIApplication.shared.beginBackgroundTask(expirationHandler: {
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = .invalid
        })

        URLSession.shared.dataTask(with: request) { data, resp, err in
            if let err = err {
                print("❌ Failed to sync location: \(err)")
            } else {
                print("✅ Location synced for token: \(token)")
            }
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = .invalid
        }.resume()
    }

    // MARK: CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        handleNewLocation(loc)
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus

        if status == .authorizedAlways {
            print("✅ Always permission granted")
            startForegroundTracking()
            startBackgroundTracking()
        }
    }
}
