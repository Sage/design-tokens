# Design: Angereicherter Sage-Tokens-MCP (Phase 1)

**Datum:** 2026-05-27
**Status:** Entwurf zur Freigabe
**Topic:** Erweiterung des bestehenden `sage-tokens-mcp` um Light/Dark, Kontext (`$description`) und Schichten/Aliase.

## Problem

Der bestehende MCP (`/Users/ronnyhummitzsch/Projects/Sage-Design-Tokens/index.js`, 206 Zeilen)
wrappt das npm-Paket `@sage/design-tokens@18.5.0`, konkret den Export `js/common`.
Das ist der ärmste Output — reine `key → value`-Paare. Daraus folgen drei Defizite mit je
klarer Ursache:

| Defizit | Ursache (belegt) |
|---|---|
| **Light fehlt** | Bug, keine fehlenden Daten. `js/common` enthält `light`, aber `buildTokenIndex` (index.js:27) baut einen flachen Index per Token-Name ohne Kategorie-Präfix. `light`/`dark` teilen Keys (`modeColorNone`…); da `dark` nach `light` einsortiert wird, überschreibt dark alle light-Einträge → keine `category:"light"` mehr → Kategorie verschwindet. |
| **Kein Kontext** | Alle dist-Outputs (`js`, `json`, `css`, `scss`) sind abgeflacht. `$description` existiert nur in den Quelldateien `data/tokens/*.json`, und `data/` wird nicht ins npm-Paket publiziert. |
| **Keine Schichten** | dist ist voll aufgelöst. Die 4-Schicht-Architektur (core → global → mode → component) samt Alias-Referenzen und `$extensions` lebt ausschließlich in `data/tokens/*.json`. |

Kernpunkt: Kontext und Schichten existieren **nur** in `data/tokens/` dieses Repos — genau
das wirft der aktuelle MCP weg, weil er das npm-dist-Artefakt wrappt.

## Ziel & Scope

- **Phase 1 (dieser Spec):** Den MCP lokal gegen die Repo-Quelle laufen lassen, mit Light+Dark,
  Kontext und aufgelöster Alias-Kette. Datenquelle = lokales `design-tokens`-Repo
  (`git pull` + `npm run build` für Aktualität).
- **Phase 2 (eigener Spec, NICHT hier):** Das angereicherte Build-Format als PR upstream an
  Sage einbringen, sodass es Teil von `@sage/design-tokens` wird.

### Gewählter Ansatz: B — Angereichertes Build-Format

Ein neues style-dictionary-Format erzeugt ein angereichertes JSON. Begründung gegenüber
Alternativen:

- **A (eigener Resolver im MCP):** verworfen — würde die style-dictionary/sd-transforms-Auflösung
  (lch-Modifier, resolveMath, Modus-Overrides) reimplementieren; Korrektheitsrisiko bei Werten.
- **C (Hybrid-Merge aus `data/tokens` + `dist/json`):** verworfen — das Key-Mapping
  Quelle (`core.color.black`) ↔ dist (`modeColorBrandDefault`) baut style-dictionary intern;
  extern schwer korrekt nachzubauen, kein Upstream-Artefakt.
- **B:** Auflösung kommt aus der offiziellen Pipeline (Werte exakt wie im CSS), baut auf den
  vorhandenen `*WithRefs`-Formaten auf, und das angereicherte JSON IST das Phase-2-Upstream-Artefakt.

## Architektur

Alle drei Teile liegen im `design-tokens`-Repo (damit Phase 2 ein zusammenhängender PR-Ordner ist):

```
data/tokens/*.json  ──(build)──▶  dist/mcp/tokens.json  ──(liest)──▶  mcp/server.js  ──stdio──▶ Claude
   (Quelle: $desc,                 (angereichert,                      (dünner Wrapper)
    Aliase, Layer)                  light+dark, refs)
```

- Der MCP-Code zieht vom Parent (`…/Sage-Design-Tokens/index.js`) ins Repo nach `mcp/`.
- `.claude.json` (Eintrag `sage-design-tokens`) wird auf den neuen Pfad
  `…/Sage-Design-Tokens/design-tokens/mcp/server.js` umgestellt.

## Komponente 1: Angereichertes Token-Format

### Output-Schema (pro Token in `dist/mcp/tokens.json`)

```json
{
  "name": "button-primary-bg-default",
  "type": "color",
  "value": { "light": "#000000", "dark": "#FFFFFF" },
  "layer": "component",
  "category": "button",
  "reference": "{mode.color.brand.default}",
  "refChain": ["mode.color.brand.default", "core.color.black"],
  "description": "Base color for secondary, Tertiary and Subtle buttons…"
}
```

Feldherkunft:

- `name` — `token.name` (kebab-case, via `name/kebab`-Transform).
- `type` — `token.$type`.
- `value` — aufgelöster `token.value` aus der offiziellen Auflösung. Für mode-abhängige Tokens
  ein Objekt `{ light, dark }`; für mode-unabhängige (core/global) ein einzelner String.
- `layer` — abgeleitet aus dem Token-Pfad/Quelldatei: `core | global | mode | component`.
- `category` — Komponenten-/Dateiname (wie heute: `button`, `input`, `global`, …).
- `reference` — `token.original.$value`, falls es eine `{…}`-Referenz ist; sonst `null`.
- `refChain` — rekursiv aufgelöste Alias-Kette von der direkten Referenz bis zum Literal-Token.
- `description` — `token.$description` (kann fehlen → weglassen).

## Komponente 2: Build

- Neues Format `custom/json-enriched` in `scripts/formats/outputEnrichedJSON.ts`,
  registriert in `scripts/style-dictionary.ts` (analog zu `custom/json-with-refs`).
  Arbeitet über `dictionary.allTokens` und greift pro Token auf `name`, `value`,
  `original.$value`, `$type`, `$description` zu; `refChain` via rekursivem Folgen der Referenzen.
- Da der Build pro Modus getrennt läuft (`build.ts` iteriert `modes`), erzeugt das Format
  `dist/mcp/tokens.light.json` und `dist/mcp/tokens.dark.json`.
- Ein Schritt in `scripts/postbuild.ts` merged beide zu `dist/mcp/tokens.json` mit
  `value: { light, dark }`. Mode-unabhängige Tokens (identischer Wert in beiden) erhalten einen
  String. **Dieser bewusste Merge behebt den Light-Bug an der Wurzel** (light wird vereint statt
  überschrieben).

## Komponente 3: MCP-Server (`mcp/server.js`)

Dünner Wrapper, lädt beim Start `dist/mcp/tokens.json` in einen In-Memory-Index.
Tools (erweitert, abwärtskompatibel):

| Tool | Verhalten |
|---|---|
| `get_token(name, mode?)` | liefert Token mit `value` (beide Modi) + `reference` + `refChain` + `description` + `layer`. `mode?` (`light`\|`dark`) reduziert `value` auf einen String. Fuzzy-Fallback wie bisher. |
| `search_tokens(query, category?, layer?, limit?)` | neuer optionaler `layer`-Filter (`core`\|`global`\|`mode`\|`component`). Resultate enthalten `value` + `description`. |
| `list_categories()` | unverändert; `light` erscheint jetzt korrekt. |
| `list_tokens_by_category(category, limit?)` | Resultate zusätzlich mit `description`. |

Kein separates `get_token_chain`-Tool — die Kette steckt in `get_token` (YAGNI).

## Fehlerbehandlung

- Start ohne `dist/mcp/tokens.json` → klare Meldung „Build fehlt, führe `npm run build` aus"
  (kein stiller leerer Index).
- Token nicht gefunden → Fuzzy-Vorschläge (wie heute).
- Ungültiger `layer`/`mode` → Fehler mit erlaubten Werten.

## Tests (vitest)

- **Regression Light-Bug:** Ein `mode-color-*`-Token hat unterschiedliche `value.light`/`value.dark`,
  und `light` geht nicht verloren.
- **Format-Test:** `button-primary-bg-default` → prüft `value.light/dark`, `refChain`,
  `description`, `layer`.
- **MCP-Funktion:** `get_token`, `search_tokens` mit `layer`-Filter gegen ein Fixture-`tokens.json`.

## Bewusst außerhalb des Scope

- Nur stdio-Transport (kein HTTP).
- Kein Auto-Rebuild/Watch — Aktualität via `git pull` + `npm run build`.
- Keine weiteren Modi außer light/dark.
- Phase 2 (Upstream-PR an Sage) ist ein eigener Spec/Plan.

## Offene Risiken

- **`refChain`-Aufbau:** style-dictionary bietet Referenz-Utilities, aber die rekursive Auflösung
  über mehrere Schichten muss in der Implementierung gegen reale Tokens verifiziert werden
  (z. B. Tokens mit `$extensions`-Modifiern oder Math-Ausdrücken).
- **light/dark-Merge-Annahme:** Setzt voraus, dass Token-Namen über beide Modus-Builds identisch
  sind. In der Implementierung mit einem Diff der beiden Modus-Outputs verifizieren.
