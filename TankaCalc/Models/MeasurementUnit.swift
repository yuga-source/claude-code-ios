import Foundation

enum MeasurementUnit: String, CaseIterable, Identifiable, Codable {
    case gram = "g"
    case kilogram = "kg"
    case milligram = "mg"
    case milliliter = "ml"
    case liter = "L"
    case piece = "個"
    case sheet = "枚"
    case bottle = "本"
    case bag = "袋"
    case box = "箱"
    case pack = "パック"

    var id: String { rawValue }

    var category: UnitCategory {
        switch self {
        case .gram, .kilogram, .milligram: return .weight
        case .milliliter, .liter: return .volume
        default: return .count
        }
    }

    var toGramFactor: Double {
        switch self {
        case .gram: return 1
        case .kilogram: return 1000
        case .milligram: return 0.001
        default: return 1
        }
    }

    var toMilliliterFactor: Double {
        switch self {
        case .milliliter: return 1
        case .liter: return 1000
        default: return 1
        }
    }

    var displayBase: String {
        switch category {
        case .weight: return "100g"
        case .volume: return "100ml"
        case .count: return rawValue
        }
    }

    func unitPrice(price: Double, quantity: Double) -> Double {
        guard quantity > 0 else { return 0 }
        switch category {
        case .weight:
            let grams = quantity * toGramFactor
            return price / grams * 100
        case .volume:
            let ml = quantity * toMilliliterFactor
            return price / ml * 100
        case .count:
            return price / quantity
        }
    }
}

enum UnitCategory: String {
    case weight = "重量"
    case volume = "容量"
    case count = "個数"
}
