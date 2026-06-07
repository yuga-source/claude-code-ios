import Foundation

struct PriceResult: Identifiable {
    let id = UUID()
    let source: String
    let shopName: String
    let productName: String
    let price: Int
    let itemURL: String
    let imageURL: String?
}

// MARK: - Rakuten API

struct RakutenSearchResponse: Codable {
    let Items: [RakutenItemWrapper]

    struct RakutenItemWrapper: Codable {
        let Item: RakutenItem
    }

    struct RakutenItem: Codable {
        let itemName: String
        let itemPrice: Int
        let itemUrl: String
        let shopName: String
        let mediumImageUrls: [ImageURL]

        struct ImageURL: Codable {
            let imageUrl: String
        }
    }
}

extension RakutenSearchResponse.RakutenItem {
    func toPriceResult() -> PriceResult {
        PriceResult(
            source: "楽天市場",
            shopName: shopName,
            productName: itemName,
            price: itemPrice,
            itemURL: itemUrl,
            imageURL: mediumImageUrls.first?.imageUrl
        )
    }
}
