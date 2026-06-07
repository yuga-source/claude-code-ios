import SwiftData
import Foundation

@Model
final class FavoriteItem {
    var productName: String
    var storeName: String
    var price: Double
    var quantity: Double
    var unit: String
    var unitPrice: Double
    var unitPriceBase: String
    var barcode: String?
    var memo: String
    var createdAt: Date

    init(
        productName: String,
        storeName: String,
        price: Double,
        quantity: Double,
        unit: String,
        barcode: String? = nil,
        memo: String = ""
    ) {
        self.productName = productName
        self.storeName = storeName
        self.price = price
        self.quantity = quantity
        self.unit = unit
        self.barcode = barcode
        self.memo = memo
        self.createdAt = Date()

        let mu = MeasurementUnit(rawValue: unit) ?? .piece
        self.unitPrice = mu.unitPrice(price: price, quantity: quantity)
        self.unitPriceBase = mu.displayBase
    }
}
