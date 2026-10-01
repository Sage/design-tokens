import camelCase from "lodash/camelCase.js"
import { DesignToken, FormatFnArguments } from "style-dictionary/types"

interface IOSSwiftOptions {
  className?: string
  componentName?: string
  modeName?: string
  outputReferences?: boolean
}

const COMPOSITE_TYPES = new Set(["boxShadow", "shadow"])
const STRING_TYPES = new Set([
  "fontFamilies", "fontFamily", "fontSizes", "fontSize", "fontWeights",
  "fontWeight", "lineHeights", "lineHeight", "txtDecoration",
])
const SCALAR_TYPES = new Set([
  "dimension", "number", "borderWidth", "borderRadius", "sizing", "spacing",
  "opacity", "other", "paragraphSpacing",
])
const SUPPORTED_TYPES = new Set([
  "color", "typography", ...COMPOSITE_TYPES, ...STRING_TYPES, ...SCALAR_TYPES,
])

const originalValue = (token: DesignToken): unknown => {
  return token["original"]?.$value ?? token["original"]?.value
}

const tokenValue = (token: DesignToken): unknown => token.$value ?? token.value

const tokenType = (token: DesignToken): string => {
  return token["original"]?.$type ?? token["original"]?.type ?? token.$type ?? token.type ?? ""
}

export const isIOSSwiftToken = (token: DesignToken): boolean => {
  const type = tokenType(token)

  if (!SUPPORTED_TYPES.has(type)) return false
  if (type === "color" && typeof originalValue(token) !== "string") return false

  return type !== "typography" || !(token["path"] ?? []).join(".").includes(".font.fluid.")
}

const isThemedToken = (token: DesignToken): boolean => {
  return tokenType(token) === "color" || COMPOSITE_TYPES.has(tokenType(token))
}

const swiftString = (value: unknown): string => JSON.stringify(String(value ?? ""))
const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const namespaceForReference = (reference: string, modeName = ""): string => {
  const root = reference.split(".")[0] ?? ""

  if (root === "global") return "SageTokensGlobal"
  if (root === "mode") return `SageTokens${titleCase(modeName)}`

  return modeName === "common"
    ? `SageTokens${titleCase(root)}`
    : `SageTokens${titleCase(modeName)}${titleCase(root)}`
}

const referenceExpression = (reference: string, modeName = ""): string => {
  const name = camelCase(reference)

  if (modeName === "adaptive" && reference.startsWith("mode.color.")) {
    return `UIColor { traits in
            traits.userInterfaceStyle == .dark ? SageTokensDark.${name} : SageTokensLight.${name}
        }`
  }

  return `${namespaceForReference(reference, modeName)}.${name}`
}

const replaceReferences = (value: string, modeName = ""): string => {
  return value.replace(/\{([^}]+)\}/g, (_, reference: string) => {
    return referenceExpression(reference, modeName)
  })
}

const colorExpression = (value: string, modeName = ""): string => {
  if (value.includes("{")) return replaceReferences(value, modeName)
  if (value.startsWith("UIColor(")) return value
  if (value === "transparent") return "UIColor.clear"

  const shorthand = value.match(/^#([\da-f]{3,4})$/i)?.[1]
  const hex = shorthand
    ? [...shorthand].map(character => character.repeat(2)).join("")
    : value.match(/^#([\da-f]{6}(?:[\da-f]{2})?)$/i)?.[1]
  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)

  const channels = hex
    ? [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      ]
    : rgba?.[1] && rgba[2] && rgba[3]
      ? [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4] ?? 1)]
      : undefined

  if (!channels) throw new Error(`Unsupported iOS color value: ${value}`)

  return `UIColor(red: ${(channels[0]! / 255).toFixed(3)}, green: ${(channels[1]! / 255).toFixed(3)}, blue: ${(channels[2]! / 255).toFixed(3)}, alpha: ${channels[3]!.toFixed(3)})`
}

const CGFloatExpression = (value: unknown): string => {
  const stringValue = String(value ?? "")

  if (/^CGFloat\([-\d.]+\)$/.test(stringValue)) return stringValue

  const percentage = stringValue.match(/^([-\d.]+)%$/)
  if (percentage?.[1]) return `CGFloat(${(Number(percentage[1]) / 100).toFixed(3)})`

  const expression = stringValue.replace(/CGFloat\(([-\d.]+)\)/g, "$1").replace(/px/g, "")
  if (/^[-\d.\s+*/()]+$/.test(expression)) {
    const result = Function(`"use strict"; return (${expression})`)()
    if (typeof result === "number" && Number.isFinite(result)) {
      return `CGFloat(${result.toFixed(2)})`
    }
  }

  const scalar = stringValue.match(/^([-\d.]+)(?:px)?$/)
  if (!scalar?.[1]) throw new Error(`Unsupported iOS scalar value: ${stringValue}`)

  return `CGFloat(${Number(scalar[1]).toFixed(2)})`
}

const scalarExpression = (value: unknown, modeName = ""): string => {
  return typeof value === "string" && value.includes("{")
    ? replaceReferences(value, modeName)
    : CGFloatExpression(value)
}

const formatGradient = (value: string, modeName = ""): string => {
  const match = value.match(/^linear-gradient\(\s*([\d.]+)deg\s*,\s*(.*)\)$/)
  if (!match?.[1] || !match[2]) throw new Error(`Unsupported iOS gradient value: ${value}`)

  const stops = match[2].split(",").map((stop) => {
    const stopMatch = stop.trim().match(/^(.*?)\s+([\d.]+)%$/)
    if (!stopMatch?.[1] || !stopMatch[2]) throw new Error(`Unsupported iOS gradient stop: ${stop}`)

    return `.init(color: ${colorExpression(stopMatch[1], modeName)}, location: CGFloat(${(Number(stopMatch[2]) / 100).toFixed(3)}))`
  }).join(", ")

  return `SageTokenGradient(angle: CGFloat(${Number(match[1]).toFixed(2)}), stops: [${stops}])`
}

const fontWeightExpression = (value: unknown): string => {
  const weights: Record<string, string> = {
    Regular: ".regular",
    Medium: ".medium",
    Bold: ".bold",
    Semibold: ".semibold",
  }

  if (value === undefined || value === null) return ".regular"

  const weight = weights[String(value)]
  if (!weight) throw new Error(`Unsupported iOS font weight: ${String(value)}`)

  return weight
}

const formatTypography = (value: Record<string, unknown>): string => {
  const paragraphSpacing = "paragraphSpacing" in value
    ? `, paragraphSpacing: ${CGFloatExpression(value["paragraphSpacing"])}`
    : ""

  return `SageTokenTypography(fontFamily: ${swiftString(value["fontFamily"])}, fontWeight: ${fontWeightExpression(value["fontWeight"])}, lineHeight: ${CGFloatExpression(value["lineHeight"] ?? 0)}, fontSize: ${CGFloatExpression(value["fontSize"])}${paragraphSpacing})`
}

const formatShadow = (value: Array<Record<string, unknown>>, modeName = ""): string => {
  const layers = value.map((layer) => {
    const kind = layer["type"] === "innerShadow" ? ".inset" : ".drop"
    const x = layer["offsetX"] ?? layer["x"]
    const y = layer["offsetY"] ?? layer["y"]

    return `.init(x: ${scalarExpression(x, modeName)}, y: ${scalarExpression(y, modeName)}, blur: ${scalarExpression(layer["blur"], modeName)}, spread: ${scalarExpression(layer["spread"], modeName)}, color: ${colorExpression(String(layer["color"] ?? ""), modeName)}, kind: ${kind})`
  }).join(", ")

  return `[SageTokenShadow]([${layers}])`
}

const formatValue = (token: DesignToken, options: IOSSwiftOptions): string => {
  const original = originalValue(token)
  const value = tokenValue(token)
  const type = tokenType(token)

  if (options.outputReferences && typeof original === "string" && /^\{[^}]+\}$/.test(original)) {
    return replaceReferences(original, options.modeName)
  }

  if (type === "typography" && value && typeof value === "object" && !Array.isArray(value)) {
    return formatTypography(value as Record<string, unknown>)
  }

  if (COMPOSITE_TYPES.has(type) && Array.isArray(value)) {
    const source = options.modeName === "adaptive" || options.outputReferences ? original ?? value : value
    return formatShadow(source as Array<Record<string, unknown>>, options.modeName)
  }

  if (type === "color" && typeof original === "string" && original.startsWith("linear-gradient(")) {
    return formatGradient(original, options.modeName)
  }

  if (type === "color" && typeof value === "string") return colorExpression(value, options.modeName)
  if (STRING_TYPES.has(type)) return swiftString(value)
  if (SCALAR_TYPES.has(type)) return scalarExpression(value, options.modeName)

  if (options.outputReferences && typeof original === "string" && original.includes("{")) {
    return replaceReferences(original, options.modeName)
  }

  return String(value)
}

const renderEnum = (tokens: DesignToken[], className: string, options: IOSSwiftOptions): string => {
  const properties = tokens
    .map(token => `    public static let ${token.name} = ${formatValue(token, options)}`)
    .join("\n")

  return `public enum ${className} {
${properties}
}`
}

const compositeTypes = `public struct SageTokenGradientStop: Sendable {
    public let color: UIColor
    public let location: CGFloat

    public init(color: UIColor, location: CGFloat) {
        self.color = color
        self.location = location
    }
}

public struct SageTokenGradient: Sendable {
    public let angle: CGFloat
    public let stops: [SageTokenGradientStop]

    public init(angle: CGFloat, stops: [SageTokenGradientStop]) {
        self.angle = angle
        self.stops = stops
    }
}

public enum SageTokenShadowKind: Sendable {
    case drop
    case inset
}

public struct SageTokenShadow: Sendable {
    public let x: CGFloat
    public let y: CGFloat
    public let blur: CGFloat
    public let spread: CGFloat
    public let color: UIColor
    public let kind: SageTokenShadowKind

    public init(x: CGFloat, y: CGFloat, blur: CGFloat, spread: CGFloat, color: UIColor, kind: SageTokenShadowKind) {
        self.x = x
        self.y = y
        self.blur = blur
        self.spread = spread
        self.color = color
        self.kind = kind
    }
}

public struct SageTokenTypography: Sendable {
    public let fontFamily: String
    public let fontWeight: UIFont.Weight
    public let lineHeight: CGFloat
    public let fontSize: CGFloat
    public let paragraphSpacing: CGFloat?

    public init(fontFamily: String, fontWeight: UIFont.Weight, lineHeight: CGFloat, fontSize: CGFloat, paragraphSpacing: CGFloat? = nil) {
        self.fontFamily = fontFamily
        self.fontWeight = fontWeight
        self.lineHeight = lineHeight
        self.fontSize = fontSize
        self.paragraphSpacing = paragraphSpacing
    }
}`

export const iosSwiftWithRefs = ({dictionary, options}: FormatFnArguments): string => {
  const iosOptions = options as IOSSwiftOptions
  let declarations: string

  if (iosOptions.componentName) {
    const component = titleCase(iosOptions.componentName)
    const themedTokens = dictionary.allTokens.filter(isThemedToken)
    const commonTokens = dictionary.allTokens.filter(token => !isThemedToken(token))
    const namespaces = [
      renderEnum(themedTokens, `SageTokensLight${component}`, {...iosOptions, modeName: "light"}),
      renderEnum(commonTokens, `SageTokens${component}`, {...iosOptions, modeName: "common"}),
      renderEnum(themedTokens, `SageTokensDark${component}`, {...iosOptions, modeName: "dark"}),
    ]

    declarations = namespaces.join("\n\n")
  } else {
    declarations = renderEnum(
      dictionary.allTokens,
      iosOptions.className ?? "SageTokens",
      iosOptions,
    )
  }

  const types = iosOptions.className === "SageTokensGlobal" ? `${compositeTypes}\n\n` : ""
  return `import UIKit\n\n${types}${declarations}\n`
}
