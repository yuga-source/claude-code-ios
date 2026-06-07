import SwiftUI

struct PriceComparisonView: View {
    let keyword: String
    let currentUnitPrice: Double?
    let currentUnitBase: String?

    @State private var results: [PriceResult] = []
    @State private var isLoading = false
    @State private var error: String?
    @State private var searchKeyword: String

    init(keyword: String, currentUnitPrice: Double?, currentUnitBase: String?) {
        self.keyword = keyword
        self.currentUnitPrice = currentUnitPrice
        self.currentUnitBase = currentUnitBase
        _searchKeyword = State(initialValue: keyword)
    }

    var body: some View {
        NavigationStack {
            List {
                if let up = currentUnitPrice, let base = currentUnitBase {
                    Section("現在の単価") {
                        HStack {
                            Label("記録済み", systemImage: "star.fill")
                                .foregroundStyle(.orange)
                            Spacer()
                            Text("¥\(up, specifier: "%.2f") / \(base)")
                                .fontWeight(.bold)
                        }
                    }
                }

                Section("楽天市場の検索結果") {
                    if isLoading {
                        HStack {
                            ProgressView()
                            Text("検索中...")
                                .foregroundStyle(.secondary)
                        }
                    } else if let err = error {
                        Label(err, systemImage: "exclamationmark.triangle")
                            .foregroundStyle(.red)
                            .font(.caption)
                    } else if results.isEmpty {
                        Text("結果が見つかりませんでした")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(results) { result in
                            PriceResultRow(result: result)
                        }
                    }
                }

                Section("Amazon") {
                    Button {
                        openAmazon()
                    } label: {
                        Label("Amazonで検索", systemImage: "arrow.up.right.square")
                    }
                }
            }
            .navigationTitle("価格比較")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchKeyword, prompt: "キーワードを変更")
            .onSubmit(of: .search) { Task { await fetchResults() } }
            .task { await fetchResults() }
        }
    }

    private func fetchResults() async {
        isLoading = true
        error = nil
        do {
            results = try await RakutenAPIService.shared.search(keyword: searchKeyword)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    private func openAmazon() {
        let encoded = searchKeyword.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "https://www.amazon.co.jp/s?k=\(encoded)") {
            UIApplication.shared.open(url)
        }
    }
}

struct PriceResultRow: View {
    let result: PriceResult
    @State private var showSafari = false

    var body: some View {
        Button {
            if let url = URL(string: result.itemURL) {
                UIApplication.shared.open(url)
            }
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                Text(result.productName)
                    .font(.subheadline)
                    .lineLimit(2)
                    .foregroundStyle(.primary)
                HStack {
                    Text(result.shopName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("¥\(result.price)")
                        .font(.subheadline.bold())
                        .foregroundStyle(.red)
                }
            }
            .padding(.vertical, 2)
        }
    }
}
