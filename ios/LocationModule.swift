import Foundation
import CoreLocation
import React

@objc(LocationModule)
class LocationModule: NSObject, CLLocationManagerDelegate {

    private let locationManager = CLLocationManager()
    private var userDataList: [[String: String]] = []

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }

    @objc
    func startService() {
        DispatchQueue.main.async {
            self.locationManager.requestAlwaysAuthorization()
            self.locationManager.startUpdatingLocation()
            print("🚀 Location service started")
        }
    }

    @objc
    func stopService() {
        locationManager.stopUpdatingLocation()
        print("🛑 Location service stopped")
    }

    @objc
    func setUserTokens(_ data: [[String: String]]) {
        self.userDataList = data
        print("🔐 User tokens set: \(data.count) items")
    }

    // MARK: - CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        print("📍 New Location: \(location.coordinate.latitude), \(location.coordinate.longitude)")

        for user in userDataList {
            let token = user["token"] ?? ""
            let link = user["link"] ?? ""
            sendLocation(token: token, link: link, location: "\(location.coordinate.latitude),\(location.coordinate.longitude)")
        }
    }

    private func sendLocation(token: String, link: String, location: String) {
        guard let url = URL(string: "\(link)/msp_api.aspx/syncLocation") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["token": token, "location": location])
        URLSession.shared.dataTask(with: request).resume()
    }

    @objc
    static func requiresMainQueueSetup() -> Bool { true }
}
