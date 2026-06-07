import SwiftUI
import SwiftData

struct CalculatorView: View {
    @Environment(\.modelContext) private var modelContext

    @State private var price: String = ""
    @State private var quantity: String = ""
    @State private var selectedUnit: MeasurementUnit = .gram
    @State private var showSaveSheet = false

    private var unitPrice: Double? {
        guard let p = Double(price), let q = Double(quantity), q > 0, p > 0 else { return nil }
        return selectedUnit.unitPrice(price: p, quantity: q)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("入力") {
                    HStack {
                        Text("価格")
                        Spacer()
                        TextField("例: 198", text: $price)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text("円")
                    }

                    HStack {
                        Text("量")
                        Spacer()
                        TextField("例: 500", text: $quantity)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Picker("", selection: $selectedUnit) {
                            ForEach(MeasurementUnit.allCases) { unit in
                                Text(unit.rawValue).tag(unit)
                            }
                        }
                        .pickerStyle(.menu)
                        .fixedSize()
                    }
                }

                Section("結果") {
                    if let up = unitPrice {
                        HStack {
                            Text("単価（\(selectedUnit.displayBase)あたり）")
                            Spacer()
                            Text("¥\(up, specifier: "%.1f")")
                                .font(.title2.bold())
                                .foregroundStyle(.orange)
                        }
                    } else {
                        Text("価格と量を入力してください")
                            .foregroundStyle(.secondary)
                    }
                }

                if unitPrice != nil {
                    Section {
                        Button(action: { showSaveSheet = true }) {
                            Label("お気に入りに保存", systemImage: "star.badge.plus")
                        }
                    }
                }
            }
            .navigationTitle("単価計算")
            .sheet(isPresented: $showSaveSheet) {
                SaveFavoriteSheet(
                    price: Double(price) ?? 0,
                    quantity: Double(quantity) ?? 0,
                    unit: selectedUnit
                )
            }
        }
    }
}

struct SaveFavoriteSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let price: Double
    let quantity: Double
    let unit: MeasurementUnit

    @State private var productName = ""
    @State private var storeName = ""
    @State private var memo = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("商品情報") {
                    TextField("商品名", text: $productName)
                    TextField("店名", text: $storeName)
                }

                Section("価格") {
                    LabeledContent("価格", value: "¥\(Int(price))")
                    LabeledContent("量", value: "\(quantity, specifier: "%.0f") \(unit.rawValue)")
                    LabeledContent("単価", value: "¥\(unit.unitPrice(price: price, quantity: quantity), specifier: "%.1f") / \(unit.displayBase)")
                }

                Section {
                    TextField("メモ（任意）", text: $memo, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
            }
            .navigationTitle("お気に入りに保存")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") { save() }
                        .disabled(productName.isEmpty || storeName.isEmpty)
                }
            }
        }
    }

    private func save() {
        let item = FavoriteItem(
            productName: productName,
            storeName: storeName,
            price: price,
            quantity: quantity,
            unit: unit.rawValue,
            memo: memo
        )
        modelContext.insert(item)
        dismiss()
    }
}
