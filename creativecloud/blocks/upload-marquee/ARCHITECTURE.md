# Upload-Marquee Shell + Fragment Injection Architecture

## Purpose

The **upload-marquee** block was originally a monolithic component that combined layout, content, and interactive UI (dropzone, buttons, drag-and-drop) in a single block. As new interactive patterns emerged (prompt bars, card selectors, multi-step flows), the block accumulated conditional logic for each variant, creating tight coupling between the CC repo (which owns the block) and the Unity repo (which owns workflows and interactivity).

This architecture decouples the two concerns:

- **CC repo** owns the **shell** — layout, branding, content, media, and a generic slot for interactive elements.
- **Unity repo** owns the **fragments** — self-contained interactive UI modules (dropzone, prompt, card selector) that are injected into the shell's slot at runtime.

## Benefits


| Benefit              | Description                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reduced coupling** | The upload-marquee block no longer needs to know about dropzones, prompts, or any specific interactive UI. Adding a new fragment requires zero changes to the CC repo. |
| **Faster rollouts**  | New fragments are developed entirely within Unity. No cross-repo PRs needed to add or modify interactive UI.                                                           |
| **Reusability**      | The same shell works for any combination of fragments. Fragments are reusable across different shells.                                                                 |
| **Scalability**      | Multiple fragments can target the same shell via separate Unity blocks. Each fragment is independently loaded and managed.                                             |
| **Maintainability**  | Clear ownership boundaries. Shell code is ~200 lines lighter. Fragment code is co-located with its workflow logic.                                                     |


## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│  Page                                                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  upload-marquee block (CC repo)                      │  │
│  │  ┌─────────────────────┐  ┌───────────────────────┐  │  │
│  │  │  Left Column        │  │  Right Column         │  │  │
│  │  │  ┌───────────────┐  │  │  ┌─────────────────┐  │  │  │
│  │  │  │ Branding      │  │  │  │ Media           │  │  │  │
│  │  │  │ Heading       │  │  │  │ (picture/video) │  │  │  │
│  │  │  │ Description   │  │  │  └─────────────────┘  │  │  │
│  │  │  │ CTA           │  │  │                       │  │  │
│  │  │  └───────────────┘  │  └───────────────────────┘  │  │
│  │  │  ┌───────────────┐  │                             │  │
│  │  │  │.interactive-  │◄─── Unity injects fragment here│  │
│  │  │  │ container     │  │                             │  │
│  │  │  │ (SLOT)        │  │                             │  │
│  │  │  └───────────────┘  │                             │  │
│  │  └─────────────────────┘                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  unity block (Unity repo)                            │  │
│  │  - workflow-upload, fragment-dropzone                │  │
│  │  - Feature/error config rows                         │  │
│  │  - Fragment content row (last row)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Shell Initialization (CC repo)

`upload-marquee.js` parses the authored block (2-3 rows: background, marquee copy, optional media) and builds a layout with:

- **Left column**: branding, heading, description, CTA, and an empty `.interactive-container` div (the "slot")
- **Right column**: viewport-responsive media (images/videos)

The shell does not create any interactive UI. It simply provides the slot and waits for Unity to populate it.

### 2. Workflow Orchestration (Unity repo)

When the Unity block initializes, `workflow.js` does the following:

1. **Detects the fragment**: Reads `fragment-dropzone` (or `fragment-prompt`, etc.) from the Unity block's class list via `getFragmentName()`.
2. **Finds the target shell**: Walks backwards through DOM siblings (skipping other `.unity` blocks) to find the `upload-marquee` block.
3. **Resolves the slot**: Uses `target-config.json` to look up the `.interactive-container` selector for the `upload-marquee` target.
4. **Loads the fragment**: Dynamically imports the fragment's JS and CSS from `unitylibs/core/fragments/<name>/`.
5. **Renders the fragment**: Calls `fragment.render()`, which builds the interactive DOM and appends it to the slot.
6. **Merges action maps**: Combines the fragment's returned action map (e.g., `{ '.drop-zone': 'upload' }`) with any shell-level actions from `target-config.json` (e.g., `{ '.upload-marquee-cta': 'redirect' }`).
7. **Binds actions**: Passes the merged action map to `action-binder.js`, which attaches event listeners for upload, redirect, etc.

### 3. Fragment Contract

Every fragment implements the same interface:

```javascript
export default class SomeFragment {
  constructor(slot, contentRow, workflowCfg) {
    this.slot = slot;           // The .interactive-container element
    this.contentRow = contentRow; // The last <div> row in the Unity block
    this.workflowCfg = workflowCfg;
  }

  async render() {
    // Build DOM and append to this.slot
    // Return an action map for the workflow to bind
    return {
      '.some-selector': 'someAction',
    };
  }
}
```

### 4. Backward Compatibility

The changes to `workflow.js` are fully backward-compatible:

- *No `fragment-` class?** The existing code paths execute: `renderWidget: true` for hero-marquee/showcase-marquee (widget path), or direct `actionMap` binding for the upload block (non-marquee path).
- `**getTarget()` sibling skip**: Only activates when a `.unity` sibling is found, which doesn't affect single-Unity-block pages.
- `**createInteractiveArea()` fragment path**: Only activates when `getFragmentName()` returns a value.

## Content Authoring

### Upload-Marquee Block (3 rows)


| Row | Purpose          | Content                                        |
| --- | ---------------- | ---------------------------------------------- |
| 1   | Background       | Background image                               |
| 2   | Marquee Copy     | Branding logos, heading, description, CTA link |
| 3   | Media (optional) | 1-3 columns of viewport-specific images/videos |


```
| upload-marquee (static-links)                                      |
|--------------------------------------------------------------------|
| [background image]                                                 |
|--------------------------------------------------------------------|
| [firefly logo] [ff lockup logo]                                    |
| # Remove an Object from a photo.                                   |
| Use the eraser tool in Adobe Firefly...                            |
| **[Edit Photos](product-url)**                                     |
| Get started with an image                                          |
|--------------------------------------------------------------------|
| [mobile turtle img] | [tablet turtle img] | [desktop turtle img]   |
```

### Unity Block (with fragment)

The Unity block specifies the workflow AND the fragment in its class list. The last row contains authored content for the fragment.

```
| unity (workflow-upload, product-firefly, feature-upload-image, fragment-dropzone, dark)|
|----------------------------------------------------------------------------------------|
| :feature-upload-image:                                                                 |
| :error-filesize: File size larger than 100MB                                           |
| :error-request: Unable to process the request                                          |
| :error-filetype: We are unable to process this file type.                              |
| :error-filecount: Only one file can be uploaded at a time.                             |
| :error-filemindimension: Image is smaller than minimum dimensions...                   |
| :verb-removeObject:                                                                    |
|----------------------------------------------------------------------------------------|
| :cgen:  |    promoid=QTV3NS2W&mv=other                                                 |
|----------------------------------------------------------------------------------------|
| [mobile dropzone content] | [tablet dropzone content] | [desktop dropzone content]     |
```

Each dropzone content column contains:

- Upload icon and call-to-action text (e.g., "Upload your image")
- Helper text (e.g., "Or drag and drop here")
- File requirements (e.g., "File must be JPEG, PNG, or WEBP and up to 100MB.")
- Terms of use / privacy policy links

### Why the Last Row is Fragment Content (authoring convention)

The Unity block uses a **"last row = fragment content"** convention: no matter how many rows exist above it, `getFragmentContentRow()` always reads `rows[rows.length - 1]`. This is a deliberate design choice.

#### The block structure has clear zones

A Unity block is read top-to-bottom with a predictable layout:


| Zone             | Position               | Content                                                                                | Consumer                                                                               |
| ---------------- | ---------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Workflow config  | First rows             | Feature flags, error messages, analytics keys (`:icon:` list items)                    | `getEnabledFeatures()` in `workflow.js` — scans `<ul><li><span class="icon">` elements |
| Middleware rows  | Middle rows (optional) | Additional config like `:cgen:` values, A/B test flags, or any future key-value rows   | Read by action-binder or workflow-specific logic                                       |
| Fragment content | **Always last**        | The visible UI content the fragment will render (text, icons, terms, viewport columns) | `getFragmentContentRow()` — always `rows[rows.length - 1]`                             |


Authors can add any number of configuration rows in the middle without breaking the fragment. The code never counts rows or uses hardcoded indices for intermediate rows — it reads the first rows for icon-based config (which is parsed by class matching, not position), and it reads the last row for fragment content. Everything in between is invisible to the fragment.

#### Why this is better than the alternatives

**Alternative 1: Use a fixed row index (e.g., "row 3 is always fragment content").**  
This breaks the moment someone adds a new config row (like `:cgen:`). Authors would need to remember which row number the fragment expects, and adding any new workflow config would shift the index. Fragile and error-prone.

**Alternative 2: Use a marker class or special syntax to identify the fragment row.**
This adds authoring complexity — authors would need to remember to tag the row with a specific class or keyword. It also requires additional parsing logic in the code to scan all rows looking for the marker. The "last row" convention is simpler: authors know their UI content goes at the bottom, period.

**Alternative 3: Put fragment content in the upload-marquee block instead of the Unity block.**
This re-introduces cross-repo coupling. The CC repo would need to know about fragment-specific content structure, and changes to fragment UI content would require CC repo updates. Keeping fragment content in the Unity block means the fragment owns its own content end-to-end.

#### The convention is intuitive for authors

From an author's perspective, the Unity block reads like a form:

1. **Top**: "What workflow and fragment am I using?" (the class list)
2. **Middle**: "What are the settings?" (error messages, feature flags, cgen values)
3. **Bottom**: "What does the user see?" (the fragment's visible content)

This mirrors how authors already think about block configuration in Franklin/Milo — metadata and settings come first, visual content comes last. The last-row convention requires no special knowledge beyond "put your fragment's display content in the final row."

#### The convention is resilient to change

If a new workflow feature requires an additional config row (e.g., `:experiment-variant:`, `:redirect-url:`), the author simply adds a row anywhere above the last row. The fragment code doesn't change. The config-parsing code doesn't change (it matches by icon class, not position). Only the last row remains special, and only the fragment reads it.

## Future Extensibility

### Prompt Fragment

A `fragment-prompt` module can be created at `unitylibs/core/fragments/prompt/` to inject a text prompt bar (for Firefly text-to-image workflows) into the same shell slot.

### Card Selector Fragment

A `fragment-card-selector` module can render a row of clickable design cards above a dropzone, enabling style-first workflows.

### Multi-Fragment Composition

Multiple fragments can target the same shell by authoring multiple Unity blocks:

```
[upload-marquee block]
[unity block — fragment-card-selector, workflow-firefly]
[unity block — fragment-dropzone, workflow-upload]
```

Each Unity block independently:

1. Finds the shared upload-marquee shell (via `getTarget()` sibling skip).
2. Injects its fragment into the `.interactive-container` slot.
3. Binds its own action map.

### Cross-Fragment Data Sharing

Fragments are **independent by default**. A single fragment authored alone works with no extra wiring. When multiple fragments are composed on the same shell, data sharing follows a tiered approach — use the simplest mechanism that fits.

#### Tier 1: No communication needed (most cases)

Each fragment operates independently. The card-selector stores a style choice, the dropzone handles upload. They never interact directly.

#### Tier 2: Shared data at action time

When two fragments contribute data to the same workflow action (e.g., card selection + uploaded image both go to the connector API), fragments write metadata to a shared location — either `data-`* attributes on the target block or a property on `workflowCfg`. The action-binder reads all values at submission time, the same way a form handler reads multiple fields on submit.

```javascript
// Card-selector fragment stores its choice
targetBlock.dataset.selectedStyle = 'cartoon';

// Action-binder reads it when building the connector API payload
const style = this.block.dataset.selectedStyle;
```

No events needed. Fragments remain unaware of each other.

#### Tier 3: Real-time UI reactivity (rare)

Only needed when one fragment's UI must visually react the instant another fragment's interaction happens — before any workflow action fires. For example, uploading an image enables a "Generate" button in a prompt fragment, or a preview fragment immediately shows a thumbnail.

In this case, use custom DOM events on the shared target block:

```javascript
// Fragment A dispatches
targetBlock.dispatchEvent(new CustomEvent('unity:asset-ready', {
  detail: { assetId: '...' },
}));

// Fragment B listens
targetBlock.addEventListener('unity:asset-ready', (e) => {
  // Update UI based on e.detail
});
```

This pattern keeps fragments decoupled — a fragment that dispatches events works fine even if no listener exists (single-fragment authoring). A fragment that listens gracefully does nothing if the event never fires.

## Performance

### LCP (Largest Contentful Paint)

The shell architecture is **neutral to positive** for LCP:

- Critical above-the-fold content (background, branding, heading, media images) remains in the shell and is rendered immediately by the CC block. None of this depends on Unity.
- Media images use optimized `<picture>` elements with WebP/JPEG sources and eager loading for the active viewport.
- Fragment loading happens in parallel with (or after) the initial paint, so interactive UI does not block LCP. The LCP candidate (typically the hero media image) is always rendered by the shell, never by a fragment.

### CLS (Cumulative Layout Shift)

The `.interactive-container` slot has a `min-height: 180px` placeholder that prevents layout shift when the fragment injects content. Once populated (`:not(:empty)`), the min-height is removed to allow natural sizing. This means the page layout is stable from the shell's first paint — fragment injection fills an already-allocated space rather than pushing content down.

### Asset Caching

Fragment JS and CSS are loaded via `priorityLoad()`, which uses `<link rel="preload">` hints for CSS. Browser-level HTTP caching applies to all fragment assets, so repeat visits serve from disk cache with zero network cost.

### Multi-Fragment Composition Performance

A common concern: "Does authoring two Unity blocks (two fragments) double the performance cost?" The short answer is **no** — and in several respects it's better than the alternatives.

#### What actually loads per Unity block

Each Unity block triggers:


| Asset                               | Size  | Cached across blocks?                                                                                                                                                                                                |
| ----------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target-config.json`                | ~1 KB | Yes — browser deduplicates identical fetches within the same page. Two Unity blocks using `workflow-upload` fetch the same URL; the second resolves from the HTTP cache or the in-flight request.                    |
| `action-binder.js`                  | ~8 KB | Yes — same deduplication.                                                                                                                                                                                            |
| `fragment JS` (e.g., `dropzone.js`) | ~5 KB | Each fragment loads its own JS, but only once. A second Unity block with a *different* fragment (e.g., `card-selector.js`) loads a different ~5 KB file — this is new code that's needed regardless of architecture. |
| `fragment CSS`                      | ~3 KB | Same as above — each fragment's CSS loads once.                                                                                                                                                                      |


The workflow-shared resources (`target-config.json`, `action-binder.js`) are fetched once and reused. The only incremental cost of a second fragment is its own JS + CSS, which is code you need no matter how you architect it.

#### Comparison to alternatives


| Approach                                              | Payload                                                                                               | Unused code loaded?                                                   | Cross-repo coupling                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| **Monolithic upload-marquee** (all variants baked in) | One large JS bundle (~15-20 KB) containing dropzone + prompt + card-selector logic                    | Yes — every variant's code loads even if only one is authored         | High — every new variant requires a CC repo change |
| **Milo fragments**                                    | Separate HTTP requests for full HTML documents, then block decoration and script loading per fragment | No, but each fragment is a full page fetch with HTML parsing overhead | Medium                                             |
| **This architecture** (dynamic ES module imports)     | Only the authored fragment's JS + CSS (~5-8 KB each) are imported                                     | No — you load exactly what's authored, nothing more                   | None — CC repo is unchanged when adding fragments  |


The monolithic approach is worse because it loads all variant code unconditionally. Milo fragments are worse because each involves a full document fetch, HTML parsing, and block decoration pipeline. Dynamic `import()` of a small ES module is the lightest mechanism available — the browser fetches a single JS file, compiles it, and executes a `render()` method that builds DOM.

#### Execution cost

Fragment code is lightweight in terms of main-thread work:

- **DOM construction**: Each fragment builds 10-20 DOM nodes (a dropzone container, a button, a file input, a few paragraphs). This takes <1ms.
- **Event listener attachment**: 3-5 listeners per fragment (click, keydown, drag events). Negligible cost.
- **No heavy computation**: No image processing, no canvas rendering, no layout thrashing. Fragments are pure DOM builders.

For two fragments, the total main-thread work is roughly 2ms — well below the 50ms long-task threshold that impacts INP (Interaction to Next Paint) or TBT (Total Blocking Time).

#### Initialization order and parallelism

In Franklin/Milo, blocks initialize in DOM order. The shell (`upload-marquee`) always initializes first because it precedes the Unity blocks in the DOM. By the time the first Unity block's `getTarget()` runs, the `.interactive-container` slot already exists. The `intEnbReendered` polling mechanism in `workflow.js` handles any edge-case timing with a 100ms retry (up to 20s timeout), so there's no risk of a race condition.

Multiple Unity blocks on the same page initialize sequentially (each awaits its `init()`), so fragment injection order matches authoring order. The second fragment appends after the first, giving authors visual control over stacking.

#### Network waterfall

```
Shell (upload-marquee.js + .css)     ████████░░░░░░░░░░░░░░░░░░
  └─ Renders layout + slot                   ░░░░░░░░░░░░░░░░░░

Unity block 1 init                           ████░░░░░░░░░░░░░░
  ├─ target-config.json (fetch)              ██░░░░░░░░░░░░░░░░
  ├─ action-binder.js (fetch)                ██░░░░░░░░░░░░░░░░
  ├─ card-selector.js (import)                 ██░░░░░░░░░░░░░░
  ├─ card-selector.css (preload)               █░░░░░░░░░░░░░░░
  └─ render + bind                               █░░░░░░░░░░░░░

Unity block 2 init                                 ████░░░░░░░░
  ├─ target-config.json (cache hit)                █░░░░░░░░░░░
  ├─ action-binder.js (cache hit)                  █░░░░░░░░░░░
  ├─ dropzone.js (import)                            ██░░░░░░░░
  ├─ dropzone.css (preload)                          █░░░░░░░░░
  └─ render + bind                                     █░░░░░░░
```

The second Unity block benefits from cached shared resources. Its only new network requests are the fragment's own JS and CSS. Total incremental latency for a second fragment is roughly one round-trip for the JS import (~50-100ms on a typical connection), executing in parallel with CSS preload.

#### Summary

Multi-fragment composition adds **minimal incremental cost** (one small JS + CSS file per additional fragment) with **zero wasted payload** (nothing loads unless authored). It outperforms both the monolithic approach (which loads unused variant code) and Milo fragments (which pay full document-fetch overhead per fragment). The main-thread execution cost is negligible (<2ms per fragment), and shared workflow resources are browser-deduplicated across Unity blocks.

## Known Constraints & FAQ

### What happens if a fragment fails to load?

If the fragment JS 404s, the network is down, or `render()` throws an exception, the `.interactive-container` slot remains empty. The shell itself is unaffected — branding, heading, CTA, and media all render normally. The CTA link (`Edit Photos`), if authored, still works as a direct link to the product, so the user has a functional fallback path even without the interactive fragment.

On the engineering side, `workflow.js` imports the fragment inside `init()`, which is called within a try/catch at the block-initialization level (Franklin/Milo's block loader catches errors from block `init()` functions). A load failure would surface in:

- **Browser DevTools console** — the `import()` rejection or `render()` error is visible.
- **Lana (logging)** — Unity's existing error logging (`window.lana?.log`) can be extended to capture fragment load failures.

If stricter resilience is needed in the future, `workflow.js` can wrap the fragment import in its own try/catch and fall back to the `else` branch (direct action map binding), so shell-level actions like the CTA redirect still get wired even when the fragment fails. This is a small enhancement that can be added without architectural changes.

### Are fragments truly reusable across different shells?

The fragment *code* (the JS class) is shell-agnostic — it receives a slot element, builds DOM, and appends to it. The fragment doesn't import or reference the shell. However, the fragment *CSS* is currently scoped under `.upload-marquee-block` (e.g., `.upload-marquee-block .drop-zone { ... }`). This means the styles only apply when the fragment renders inside an `upload-marquee` shell.

This is intentional for the current scope: it prevents fragment styles from leaking into unrelated parts of the page. If a fragment needs to work inside a second shell in the future, the CSS scoping strategy is straightforward to extend:

- **Option A: Dual-scope selectors.** Add the new shell's class alongside the existing one: `.upload-marquee-block .drop-zone, .hero-marquee-block .drop-zone { ... }`. Minimal change.
- **Option B: Shell-agnostic parent class.** Both shells add a shared class (e.g., `.unity-shell`) and fragment CSS scopes to that instead. One-time migration.
- **Option C: CSS layers or `:where()`.** Use low-specificity selectors that don't depend on the shell class at all. Modern approach, works if browser support allows.

For now, scoping to `.upload-marquee-block` is the right trade-off — it keeps styles contained and avoids premature abstraction. The path to multi-shell reuse is clear and doesn't require rethinking the architecture.

### Can two fragments have conflicting action map selectors?

In multi-fragment composition, each Unity block gets its own action-binder instance. However, each action-binder calls `block.querySelectorAll(selector)` on the shared target block (`upload-marquee`). If two fragments create elements with the same CSS selector (e.g., both have a `.submit-button`), both action-binders would find and bind to both fragments' elements, causing duplicate or incorrect event handling.

**This is prevented by convention**: each fragment uses distinct, namespaced selectors for its interactive elements. For example:

- Dropzone fragment: `.drop-zone`, `#file-upload`
- Prompt fragment: `.prompt-bar`, `.prompt-submit`
- Card-selector fragment: `.card-selector-item`, `.card-selector-confirm`

The fragment contract should be understood as: **a fragment owns its selectors**, and fragment authors must not reuse selectors from other fragments. This is the same convention that applies to any component-based system (React components don't share internal class names, web components use shadow DOM, etc.).

If this becomes a recurring concern with many fragments, a future enhancement could namespace selectors automatically (e.g., `.fragment-dropzone .drop-zone` scoped via a wrapper div), but this adds complexity that isn't warranted for the current set of fragments.

### What if an author forgets `fragment-dropzone` in the Unity block's class list?

If the `fragment-`* class is omitted, `getFragmentName()` returns `null` and the fragment code path is skipped entirely. The Unity block falls through to the existing `else` branch, which sets `this.actionMap = this.targetConfig.actionMap`. For the `upload-marquee` target, this action map only contains `{ '.upload-marquee-cta': 'redirect' }` — so the CTA link, if authored, still gets its redirect binding, but no dropzone renders.

The author would see the shell with branding, heading, CTA, and media, but an empty interactive area. This is a **visible and obvious** authoring mistake — the empty space makes it immediately clear something is missing, prompting the author to check the Unity block configuration.

To further reduce this risk:

- **Authoring documentation** (separate from this architecture doc) should include copy-paste block templates with the correct class lists pre-filled.
- **A future validation enhancement** could log a console warning when a Unity block targets `upload-marquee` but has no `fragment-`* class (i.e., the slot exists but nothing will fill it). This is a small check in `workflow.js` that doesn't affect the architecture.

### Can fragments be placed in different positions within the shell?

Currently, all fragments inject into a single `.interactive-container` slot in the left column, below the marquee content. This is a deliberate constraint — it keeps the shell simple and covers all current designs (dropzone below copy, prompt below copy, card-selector + dropzone stacked below copy).

If a future design requires interactive content in a different position (e.g., a selector *above* the CTA, or interactive elements in the right column alongside media), the shell would need an additional named slot. This is a straightforward extension:

```javascript
// Shell creates a second slot
const secondarySlot = createTag('div', { class: 'interactive-container-secondary' });
rightCol.append(secondarySlot);
```

```json
// target-config.json adds a secondary selector
"upload-marquee": {
  "selector": ".interactive-container",
  "selectorSecondary": ".interactive-container-secondary"
}
```

The fragment would receive the appropriate slot based on its target configuration. This requires a shell change (adding a new slot) but not an architectural change — the fragment contract, workflow orchestration, and action binding all work the same way regardless of where the slot lives in the DOM.

The single-slot design is intentional for now: it avoids speculative complexity. Adding a second slot when a real design requires it is a small, isolated change to the shell.

### Is there a loading gap on slow networks before the fragment appears?

Yes. On fast connections the gap is imperceptible (~100-200ms), but on slower connections (e.g., 3G) there may be a visible delay.

The shell paints immediately — background, branding, heading, CTA, and media are all built from inline authored content with no external fetches beyond the block's own JS/CSS (which Milo already loaded). The `.interactive-container` slot sits empty at its `min-height` placeholder until the Unity block finishes loading.

The Unity block needs to sequentially fetch:

1. `target-config.json` + `action-binder.js` (~9 KB combined)
2. `dropzone.js` + `dropzone.css` (~8 KB combined)
3. Execute `render()`

On a slow 3G connection (~400 Kbps effective), those ~17 KB of sequential fetches could take 300-500ms. During that window, the user sees a complete-looking marquee with an empty space where the interactive content should be.

#### How this compares to the old monolithic approach

In the old architecture, the dropzone DOM was built by `upload-marquee.js` itself during `init()`. All the code was in one file, so there was no second network fetch — the dropzone appeared as part of the initial block render. However, the dropzone was **not interactive** until Unity's `action-binder.js` loaded afterward and bound the upload/redirect handlers. With the new architecture, the dropzone appears and is interactive at the same moment (after the fragment renders and actions bind).


| Approach         | What user sees during load gap                                 | Interactive when visible?                         |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| Old monolithic   | Dropzone appears early but is non-functional until Unity loads | No — click does nothing until action-binder loads |
| New architecture | Empty placeholder, then dropzone appears fully functional      | Yes — works immediately on render                 |


Both approaches have a loading gap — they differ in what the user sees during it.

#### Mitigation: CSS skeleton placeholder

Since an empty gap is possibly a concern, the shell can render a lightweight CSS-only skeleton inside the slot that disappears the instant the fragment populates it. This requires no JS and no architectural change:

```css
.upload-marquee-block .interactive-container:empty::before {
  content: '';
  display: block;
  height: 160px;
  border: 2px dashed rgb(255 255 255 / 20%);
  border-radius: 8px;
  background: radial-gradient(circle, rgb(255 255 255 / 8%) 1px, transparent 1px);
  background-size: 26px 26px;
  margin-top: 24px;
}
```

This renders a ghost outline of the dropzone shape during the loading gap, signaling to the user that interactive content is coming. The `:empty` pseudo-class ensures it vanishes the moment the fragment appends its first child to the slot.

**Note:** The dashed-border skeleton visually hints at a dropzone. If the shell later hosts non-dropzone fragments (e.g., a prompt bar), the skeleton should be replaced with a more neutral shape (e.g., a simple pulsing bar) so it doesn't set incorrect expectations about what's loading.

## File Map


| File                                               | Repo  | Role                                                         |
| -------------------------------------------------- | ----- | ------------------------------------------------------------ |
| `blocks/upload-marquee/upload-marquee.js`          | CC    | Shell — layout, branding, media, slot                        |
| `blocks/upload-marquee/upload-marquee.css`         | CC    | Shell styles (no dropzone styles)                            |
| `core/fragments/dropzone/dropzone.js`              | Unity | Fragment — dropzone DOM, drag-drop, accessibility            |
| `core/fragments/dropzone/dropzone.css`             | Unity | Fragment styles (dropzone-specific)                          |
| `core/workflow/workflow.js`                        | Unity | Orchestrator — fragment detection, loading, action merging   |
| `core/workflow/workflow-upload/target-config.json` | Unity | Target configuration — selectors, action maps per block type |
| `core/workflow/workflow-upload/action-binder.js`   | Unity | Action binding — upload, redirect, error handling            |


