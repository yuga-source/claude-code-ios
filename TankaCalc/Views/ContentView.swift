import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            CalculatorView()
                .tabItem {
                    Label("計算", systemImage: "cart.badge.questionmark")
                }

            FavoritesView()
                .tabItem {
                    Label("お気に入り", systemImage: "star.fill")
                }

            BarcodeScannerView()
                .tabItem {
                    Label("スキャン", systemImage: "barcode.viewfinder")
                }
        }
    }
}
