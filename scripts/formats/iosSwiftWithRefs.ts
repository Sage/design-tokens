import camelCase from "lodash/camelCase.js";
import { DesignToken, Dictionary, FormatFnArguments } from "style-dictionary/types";

interface IOSSwiftOptions {
  className?: string
  modeName?: string
  outputReferences?: boolean
}

const swiftString = (value: unknown): string => JSON.stringify(String(value ?? ""))

const namespaceForReference = (reference: string, modeName = ""): string => {
  const root = reference.split(".")[0] ?? ""

  if (root === "global") {
    return "SageTokensGlobal"
  }

  const capitalizedRoot = root.charAt(0).toUpperCase() + root.slice(1)

  if (root === "mode") {
    return `SageTokens${modeName.charAt(0).toUpperCase()}${modeName.slice(1)}`
  }

  if (modeName === "common") {
    return `SageTokens${capitalizedRoot}`
  }

  return `SageTokens${modeName.charAt(0).toUpperCase()}${modeName.slice(1)}${capitalizedRoot}`
}

const referenceExpression = (reference: string, modeName = ""): string => {
  if (modeName === "adaptive" && reference.startsWith("mode.color.")) {
    const name = camelCase(reference)
    return `UIColor { traits in\n            traits.userInterfaceStyle == .dark ? SageTokensDark.${name} : SageTokensLight.${name}\n        }`
  }

  return `${namespaceForReference(reference, modeName)}.${camelCase(reference)}`
}

const colorExpression = (value: string, modeName = ""): string => {
  if (value.includes("{")) {
    return value.replace(/\{([^}]+)\}/g, (_, reference: string) => {
      return referenceExpression(reference, modeName)
    })
  }

  const rawHex = value.replace("#", "")
  const hex = rawHex.length === 3 || rawHex.length === 4
    ? rawHex.split("").map((character) => character + character).join("")
    : rawHex
  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) {
    const red = parseInt(hex.slice(0, 2), 16) / 255
    const green = parseInt(hex.slice(2, 4), 16) / 255
    const blue = parseInt(hex.slice(4, 6), 16) / 255
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return `UIColor(red: ${red.toFixed(3)}, green: ${green.toFixed(3)}, blue: ${blue.toFixed(3)}, alpha: ${alpha.toFixed(3)})`
  }

  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)
  if (rgba?.[1] && rgba[2] && rgba[3]) {
    const alpha = Number(rgba[4] ?? 1)
    return `UIColor(red: ${(Number(rgba[1]) / 255).toFixed(3)}, green: ${(Number(rgba[2]) / 255).toFixed(3)}, blue: ${(Number(rgba[3]) / 255).toFixed(3)}, alpha: ${alpha.toFixed(3)})`
  }

  return "UIColor.clear"
}

const scalarExpression = (value: unknown, modeName = ""): string => {
  if (typeof value === "string" && value.includes("{")) {
    return value.replace(/\{([^}]+)\}/g, (_, reference: string) => {
      return referenceExpression(reference, modeName)
    })
  }

  return CGFloatExpression(value)
}

const formatGradient = (value: string, modeName = "", deduplicate = true): string => {
  if (deduplicate && value === "linear-gradient(90deg, {mode.color.ai.stop-1}  0%, {mode.color.ai.stop-2} 40%, {mode.color.ai.stop-3} 90%)") {
    return referenceExpression("mode.color.action.ai.grad.default", modeName)
  }

  const match = value.match(/^linear-gradient\(\s*([\d.]+)deg\s*,\s*(.*)\)$/)
  if (!match) {
    return "SageTokenGradient(angle: CGFloat(0), stops: [])"
  }

  const stops = (match[2] ?? "").split(",").map((stop) => {
    const stopMatch = stop.trim().match(/^(.*?)\s+([\d.]+)%$/)
    const color = stopMatch?.[1] ?? ""
    const location = Number(stopMatch?.[2] ?? 0) / 100
    return `.init(color: ${colorExpression(color, modeName)}, location: CGFloat(${location.toFixed(3)}))`
  }).join(", ")

  return `SageTokenGradient(angle: CGFloat(${Number(match[1]).toFixed(2)}), stops: [${stops}])`
}

const CGFloatExpression = (value: unknown): string => {
  const stringValue = String(value ?? "")
  const percentage = stringValue.match(/^([\d.]+)%$/)

  if (percentage?.[1]) {
    return `CGFloat(${(Number(percentage[1]) / 100).toFixed(3)})`
  }

  if (stringValue.startsWith("CGFloat(")) {
    const expression = stringValue
      .replace(/CGFloat\(([-\d.]+)\)/g, "$1")
      .replace(/px/g, "")

    if (/^[\d.\s+*/()-]+$/.test(expression)) {
      const result = Function(`"use strict"; return (${expression})`)()
      if (typeof result === "number" && Number.isFinite(result)) {
        return `CGFloat(${result.toFixed(2)})`
      }
    }

    return "CGFloat(0)"
  }

  const number = Number(stringValue)
  return Number.isFinite(number) ? `CGFloat(${number.toFixed(2)})` : "CGFloat(0)"
}

const fontWeightExpression = (value: unknown): string => {
  const weights: Record<string, string> = {
    Regular: ".regular",
    Medium: ".medium",
    Bold: ".bold",
    Semibold: ".semibold",
  }

  return weights[String(value ?? "")] ?? ".regular"
}

const formatTypography = (value: Record<string, unknown>): string => {
  const paragraphSpacing = "paragraphSpacing" in value ? `, paragraphSpacing: ${CGFloatExpression(value["paragraphSpacing"])}` : ""
  return `SageTokenTypography(fontFamily: ${swiftString(value["fontFamily"])}, fontWeight: ${fontWeightExpression(value["fontWeight"])}, lineHeight: ${CGFloatExpression(value["lineHeight"])}, fontSize: ${CGFloatExpression(value["fontSize"])}${paragraphSpacing})`
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
  const original = token["original"]?.$value ?? token["original"]?.value
  const originalType = token["original"]?.$type ?? token["original"]?.type
  const value = token.$value ?? token.value
  const type = originalType ?? token.$type ?? token.type

  if (options.outputReferences && typeof original === "string" && original.match(/^\{[^}]+\}$/)) {
    return original.replace(/\{([^}]+)\}/g, (_, reference: string) => {
      return referenceExpression(reference, options.modeName)
    })
  }

  if (type === "typography" && value && typeof value === "object" && !Array.isArray(value)) {
    return formatTypography(value as Record<string, unknown>)
  }

  if (["boxShadow", "shadow"].includes(type ?? "") && Array.isArray(value)) {
    const shadowValue = (options.modeName === "adaptive" || options.outputReferences ? original ?? value : value) as Array<Record<string, unknown>>
    return formatShadow(shadowValue, options.modeName)
  }

  if (type === "color" && typeof original === "string" && original.startsWith("linear-gradient(")) {
    const isCanonicalModeGradient = (token["path"] ?? []).join(".") === "mode.color.action.ai.grad.default"
    return formatGradient(original, options.modeName, !isCanonicalModeGradient)
  }

  if (type === "color" && typeof value === "string") {
    return colorExpression(value, options.modeName)
  }

  if (["fontFamilies", "fontFamily", "fontSizes", "fontSize", "fontWeights", "fontWeight", "lineHeights", "lineHeight", "txtDecoration"].includes(type ?? "")) {
    return swiftString(value)
  }

  if (["dimension", "number", "borderWidth", "borderRadius", "sizing", "spacing", "opacity", "other", "paragraphSpacing"].includes(type ?? "")) {
    return scalarExpression(value, options.modeName)
  }

  if (options.outputReferences && typeof original === "string" && original.includes("{")) {
    return original.replace(/\{([^}]+)\}/g, (_, reference: string) => {
      return referenceExpression(reference, options.modeName)
    })
  }

  return String(token.$value ?? token.value)
}

  const compositeTypes = `
  public struct SageTokenGradientStop {
    public let color: UIColor
    public let location: CGFloat

    public init(color: UIColor, location: CGFloat) {
      self.color = color
      self.location = location
    }
  }

  public struct SageTokenGradient {
    public let angle: CGFloat
    public let stops: [SageTokenGradientStop]

    public init(angle: CGFloat, stops: [SageTokenGradientStop]) {
      self.angle = angle
      self.stops = stops
    }
  }

  public enum SageTokenShadowKind {
    case drop
    case inset
  }

  public struct SageTokenShadow {
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

  public struct SageTokenTypography {
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
  }
  `

export const iosSwiftWithRefs = ({dictionary, options}: FormatFnArguments): string => {
  const iosOptions = options as IOSSwiftOptions
  const properties = dictionary.allTokens
    .map((token: DesignToken) => `    public static let ${token.name} = ${formatValue(token, iosOptions)}`)
    .join("\n")

  const types = iosOptions.className === "SageTokensGlobal" ? `${compositeTypes}\n` : ""

  return `import UIKit

${types}

public enum ${iosOptions.className ?? "SageTokens"} {
${properties}
}
`
}