import Foundation

@objc(LocationModule)
class LocationModule: NSObject {

    @objc
    func startService() {
        print("📍 [LocationModule] startService() CALLED from JS")
        LocationService.shared.start()
        print("✅ [LocationModule] LocationService.start() executed")
    }

    @objc
    func stopService() {
        print("🛑 [LocationModule] stopService() CALLED from JS")
        LocationService.shared.stop()
        print("✅ [LocationModule] LocationService.stop() executed")
    }

    @objc
    func setUserTokens(_ data: [[String: String]]) {
        print("📦 [LocationModule] setUserTokens() CALLED")
        print("📦 [LocationModule] Raw data from JS: \(data)")

        LocationService.shared.userDataList.removeAll()
        print("🧹 [LocationModule] Cleared existing userDataList")

        for (index, item) in data.enumerated() {
            let token = item["token"]
            let link = item["link"]

            if let token = token, let link = link {
                LocationService.shared.userDataList.append((token, link))
                print("✅ [LocationModule] Added token-link pair: \(token) | \(link)")
            } else {
                print("❌ [LocationModule] Invalid token/link at index \(index)")
            }
        }

        print("📊 [LocationModule] Final userDataList count: \(LocationService.shared.userDataList.count)")
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
