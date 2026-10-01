// swift-tools-version: 6.1
import PackageDescription

let package = Package(
    name: "SageDesignTokens",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "SageDesignTokens", targets: ["SageDesignTokens"]),
    ],
    targets: [
        .target(
            name: "SageDesignTokens",
            path: "Sources/SageDesignTokens",
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
    ]
)
