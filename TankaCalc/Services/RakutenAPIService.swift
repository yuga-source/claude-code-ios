import Foundation

actor RakutenAPIService {
    static let shared = RakutenAPIService()

    private let baseURL = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706"

    private var applicationId: String {
        Bundle.main.infoDictionary?["RakutenApplicationId"] as? String ?? ""
    }

    func search(keyword: String) async throws -> [PriceResult] {
        guard !applicationId.isEmpty else { throw APIError.missingAPIKey }

        var components = URLComponents(string: baseURL)!
        components.queryItems = [
            URLQueryItem(name: "applicationId", value: applicationId),
            URLQueryItem(name: "keyword", value: keyword),
            URLQueryItem(name: "hits", value: "20"),
            URLQueryItem(name: "sort", value: "+itemPrice"),
            URLQueryItem(name: "format", value: "json")
        ]

        guard let url = components.url else { throw APIError.invalidURL }

        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }

        let decoded = try JSONDecoder().decode(RakutenSearchResponse.self, from: data)
        return decoded.Items.map { $0.Item.toPriceResult() }
    }
}

enum APIError: LocalizedError {
    case missingAPIKey
    case invalidURL
    case serverError

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "楽天APIキーが設定されていません。環境変数 RAKUTEN_APP_ID を設定してください。"
        case .invalidURL:
            return "URLの生成に失敗しました"
        case .serverError:
            return "サーバーエラーが発生しました"
        }
    }
}
