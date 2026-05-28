# Design: Angereicherter Sage-Tokens-MCP (Phase 1)

**Datum:** 2026-05-27
**Status:** Entwurf zur Freigabe
**Topic:** Eigenständiger MCP-Server im Repo, der die Sage Design Tokens mit
Light/Dark-Werten, `$description`-Kontext und aufgelösten Alias/Layer-Ketten ausliefert.
Ersetzt einen früheren externen Wrapper-Prototyp.

## Motivation

Ein früherer externer Wrapper-Prototyp konsumierte das publizierte npm-Paket
`@sage/design-tokens` (Export `js/common`) — den ärmsten dist-Output, reine
`key → value`-Paare. Drei strukturelle Defizite haben diese Architekturwahl getrieben;
jeder wird hier an der Wurzel gelöst:

| Defizit | Ursache |
|---|---|
| **Light fehlt** | Ein flacher Index per Token-Name ohne Modus-Präfix führt zu Namenskollisionen: `light`/`dark` teilen Keys (`modeColorNone`…), `dark` überschreibt `light` beim Indizieren → die Kategorie `light` verschwindet. Kein Datenverlust in der Quelle, ein Index-Bug. |
| **Kein Kontext** | Alle publizierten dist-Outputs (`js`, `json`, `css`, `scss`) sind abgeflacht. `$description` existiert nur in den Quelldateien `data/tokens/*.json`, und `data/` wird nicht ins npm-Paket publiziert. |
| **Keine Schichten** | Der dist ist voll aufgelöst. Die 4-Schicht-Architektur (core → global → mode → component) samt Alias-Referenzen und `$extensions` lebt ausschließlich in `data/tokens/*.json`. |

Kernpunkt: Kontext und Schichten existieren **nur** in `data/tokens/` dieses Repos. Ein
MCP, der das npm-dist-Artefakt von außen wrappt, kann sie strukturell nicht liefern;
ein MCP, der im Repo lebt und gegen die Quelle baut, kann es.

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

- Der MCP-Code lebt im Repo unter `mcp/` mit eigenem `package.json` und Dependencies —
  eigenständige Komponente ohne externe Pfade.
- Onboarding: `npm install` + `npm run build` im Repo-Root, `npm install` in `mcp/`,
  dann den MCP-Client (z. B. Claude Code) auf `mcp/server.js` zeigen lassen. Die genauen
  Schritte werden in `mcp/README.md` dokumentiert (separater Spec).

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
Tools:

| Tool | Verhalten |
|---|---|
| `get_token(name, mode?)` | liefert Token mit `value` (beide Modi) + `reference` + `refChain` + `description` + `layer`. `mode?` (`light`\|`dark`) reduziert `value` auf einen String. Fuzzy-Fallback bei Name-Mismatch. |
| `search_tokens(query, category?, layer?, limit?)` | Mehrwort-Substring-Suche über Token-Namen, optional gefiltert nach `category` und/oder `layer` (`core`\|`global`\|`mode`\|`component`). Resultate enthalten `value` + `description`. |
| `list_categories()` | listet alle Kategorien (`core`, `global`, `mode`, plus jede Komponente) mit Token-Anzahl. |
| `list_tokens_by_category(category, limit?)` | listet Tokens einer Kategorie mit Name, Wert und Beschreibung. |

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
