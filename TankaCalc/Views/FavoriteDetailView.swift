import SwiftUI

struct FavoriteDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @Bindable var item: FavoriteItem

    @State private var showComparison = false
    @State private var isEditing = false

    var body: some View {
        NavigationStack {
            Form {
                Section("商品情報") {
                    if isEditing {
                        TextField("商品名", text: $item.productName)
                        TextField("店名", text: $item.storeName)
                    } else {
                        LabeledContent("商品名", value: item.productName)
                        LabeledContent("店名", value: item.storeName)
                    }
                }

                Section("価格・量") {
                    if isEditing {
                        HStack {
                            Text("価格")
                            Spacer()
                            TextField("価格", value: $item.price, format: .number)
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                            Text("円")
                        }
                        HStack {
                            Text("量")
                            Spacer()
                            TextField("量", value: $item.quantity, format: .number)
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                            Text(item.unit)
                        }
                    } else {
                        LabeledContent("価格", value: "¥\(Int(item.price))")
                        LabeledContent("量", value: "\(item.quantity, specifier: "%.0f") \(item.unit)")
                        LabeledContent("単価") {
                            Text("¥\(item.unitPrice, specifier: "%.2f") / \(item.unitPriceBase)")
                                .foregroundStyle(.orange)
                                .fontWeight(.bold)
                        }
                    }
                }

                if let barcode = item.barcode {
                    Section("バーコード") {
                        LabeledContent("JAN", value: barcode)
                        Button("楽天で比較") {
                            showComparison = true
                        }
                    }
                }

                if !item.memo.isEmpty || isEditing {
                    Section("メモ") {
                        if isEditing {
                            TextField("メモ", text: $item.memo, axis: .vertical)
                                .lineLimit(3, reservesSpace: true)
                        } else {
                            Text(item.memo)
                        }
                    }
                }

                Section {
                    LabeledContent("登録日") {
                        Text(item.createdAt, style: .date)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle(item.productName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button(isEditing ? "完了" : "編集") {
                        if isEditing { recalculate() }
                        isEditing.toggle()
                    }
                }
            }
            .sheet(isPresented: $showComparison) {
                if let barcode = item.barcode {
                    PriceComparisonView(keyword: barcode, currentUnitPrice: item.unitPrice, currentUnitBase: item.unitPriceBase)
                }
            }
        }
    }

    private func recalculate() {
        let mu = MeasurementUnit(rawValue: item.unit) ?? .piece
        item.unitPrice = mu.unitPrice(price: item.price, quantity: item.quantity)
        item.unitPriceBase = mu.displayBase
    }
}
