import SwiftUI
import SwiftData

struct FavoritesView: View {
    @Query(sort: \FavoriteItem.unitPrice) private var items: [FavoriteItem]
    @Environment(\.modelContext) private var modelContext

    @State private var sortOrder: SortOrder = .unitPrice
    @State private var searchText = ""
    @State private var selectedItem: FavoriteItem?

    enum SortOrder: String, CaseIterable {
        case unitPrice = "単価"
        case storeName = "店名"
        case productName = "商品名"
        case date = "登録日"
    }

    private var filtered: [FavoriteItem] {
        let base = items.filter {
            searchText.isEmpty
                || $0.productName.localizedStandardContains(searchText)
                || $0.storeName.localizedStandardContains(searchText)
        }
        switch sortOrder {
        case .unitPrice: return base.sorted { $0.unitPrice < $1.unitPrice }
        case .storeName: return base.sorted { $0.storeName < $1.storeName }
        case .productName: return base.sorted { $0.productName < $1.productName }
        case .date: return base.sorted { $0.createdAt > $1.createdAt }
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if items.isEmpty {
                    ContentUnavailableView(
                        "お気に入りがありません",
                        systemImage: "star.slash",
                        description: Text("計算タブで単価を計算してから保存してください")
                    )
                } else {
                    List {
                        ForEach(filtered) { item in
                            Button { selectedItem = item } label: {
                                FavoriteRowView(item: item)
                            }
                            .foregroundStyle(.primary)
                        }
                        .onDelete(perform: delete)
                    }
                    .searchable(text: $searchText, prompt: "商品名・店名で検索")
                }
            }
            .navigationTitle("お気に入り")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Picker("並び順", selection: $sortOrder) {
                            ForEach(SortOrder.allCases, id: \.self) { order in
                                Text(order.rawValue).tag(order)
                            }
                        }
                    } label: {
                        Label("並び替え", systemImage: "arrow.up.arrow.down")
                    }
                }
            }
            .sheet(item: $selectedItem) { item in
                FavoriteDetailView(item: item)
            }
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(filtered[index])
        }
    }
}

struct FavoriteRowView: View {
    let item: FavoriteItem

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(item.productName)
                    .font(.headline)
                Spacer()
                Text("¥\(item.unitPrice, specifier: "%.1f") / \(item.unitPriceBase)")
                    .font(.subheadline.bold())
                    .foregroundStyle(.orange)
            }
            HStack {
                Label(item.storeName, systemImage: "storefront")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("¥\(Int(item.price)) / \(item.quantity, specifier: "%.0f")\(item.unit)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
