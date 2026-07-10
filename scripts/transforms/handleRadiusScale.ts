import type { DesignToken } from "style-dictionary/types";

export const radiusScaleFilter = (token: DesignToken): boolean => {
  const path = token["path"] ?? [];
  return (
    path[0] === "global" &&
    path[1] === "radius" &&
    (path[2] === "container" || path[2] === "action") &&
    path[path.length - 1] !== "circle"
  );
};

const buildScaleExpr = (token: DesignToken, scaleRef: string): string => {
  // base = core dimension already resolved (scale is 1 at build time, so this == the unscaled core value)
  const base = String(token.$value ?? token.value);
  return `calc(${base} * ${scaleRef})`;
};

export const handleRadiusScaleCSS = (token: DesignToken): string =>
  buildScaleExpr(token, "var(--global-radius-scale)");

export const handleRadiusScaleScss = (token: DesignToken): string =>
  buildScaleExpr(token, "$global-radius-scale");
