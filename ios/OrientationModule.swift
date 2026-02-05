import Foundation
import UIKit

@objc(OrientationModule)
class OrientationModule: NSObject {

  @objc
  func enableLandscape() {
    DispatchQueue.main.async {
      if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
        appDelegate.allowRotation = true
        UIDevice.current.setValue(UIInterfaceOrientation.landscapeRight.rawValue, forKey: "orientation")
      }
    }
  }

  @objc
  func disableLandscape() {
    DispatchQueue.main.async {
      if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
        appDelegate.allowRotation = false
        UIDevice.current.setValue(UIInterfaceOrientation.portrait.rawValue, forKey: "orientation")
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }
}
