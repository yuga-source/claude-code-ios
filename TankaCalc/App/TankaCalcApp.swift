import SwiftUI
import SwiftData

@main
struct TankaCalcApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: FavoriteItem.self)
    }
}
