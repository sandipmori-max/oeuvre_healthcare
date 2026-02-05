import Foundation
import CoreLocation
import UIKit

class LocationService: NSObject, CLLocationManagerDelegate {

    static let shared = LocationService()
    
    private let locationManager = CLLocationManager()
    private var timer: Timer?
    var userDataList: [(token: String, link: String)] = []
 
       private var lastSentLocation: CLLocation?
     private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.distanceFilter = 5
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }
    
    func start() {
        print("▶️ [LocationService] start() called")
        
        let status = CLLocationManager.authorizationStatus()
        if status == .notDetermined {
            locationManager.requestAlwaysAuthorization()
        } else if status == .denied || status == .restricted {
            print("❌ [LocationService] Location permission denied")
            return
        }
        
        locationManager.startUpdatingLocation()
        requestLocationNow()
        startTimer()
      
      if CLLocationManager.significantLocationChangeMonitoringAvailable() {
                  locationManager.startMonitoringSignificantLocationChanges()
                  print("📡 [LocationService] SLC monitoring started")
              }
    }
    
    func stop() {
        print("🛑 [LocationService] stop() called")
        locationManager.stopUpdatingLocation()
        timer?.invalidate()
        timer = nil
    }
    
    private func requestLocationNow() {
        print("🔥 [LocationService] requestLocationNow() called")
        if let loc = locationManager.location {
            handleNewLocation(loc)
        }
    }
    
    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true, block: { [weak self] _ in
            guard let self = self else { return }
            if let loc = self.locationManager.location {
                self.handleNewLocation(loc)
            } else {
                print("⚠️ [LocationService] No location available yet")
            }
        })
        print("✅ [LocationService] 1-minute timer scheduled")
    }
    
  private func handleNewLocation(_ location: CLLocation) {
         // Check if last location sent exists and distance threshold
         if let last = lastSentLocation {
             let distance = location.distance(from: last)
             if distance < 5 { // 5 meters threshold
                 print("⚠️ [LocationService] Location changed only \(distance)m, skipping API")
                 return
             }
         }
         
         lastSentLocation = location
         print("📍 [LocationService] New location: \(location.coordinate.latitude), \(location.coordinate.longitude)")
         
         for user in userDataList {
             sendLocation(user.token, user.link, location)
         }
     }
    
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
                print("❌ [LocationService] Failed to sync location: \(err)")
            } else {
              if let data = data, let respString = String(data: data, encoding: .utf8) {
                         print("✅ [LocationService] API called for token: \(token)")
                         print("✅ [LocationService] API Response: \(respString)")
                     } else {
                         print("✅ [LocationService] API called for token: \(token) but response is nil")
                     }
                     if let resp = resp {
                         print("✅ [LocationService] URLResponse: \(resp)")
                     }
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
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways {
            print("✅ [LocationService] Permission granted → startUpdatingLocation")
            locationManager.startUpdatingLocation()
        } else {
            print("❌ [LocationService] Permission denied")
        }
    }
}

