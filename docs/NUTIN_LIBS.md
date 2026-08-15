# nutin libs

## Overview

| Lib | Toggle | Depends on |
|---|---|---|
| **pipes** | always on (base template, not a feature flag) | — |
| **nutinMixins** | `nutinMixins` feature flag (CLI `nutin-mixins`) | — |
| **accessibility-components** | `accessibilityComponents` feature flag | — |
| **forms** | `forms` feature flag | accessibility-components (`FormControlHelper`) |
| **overlays** | `overlays` feature flag | — |

The CLI's `--libs` option and `standard`/`full` presets turn all four optional libs on
together; the `default` preset turns them all off.                                         
`forms` has a real code import from accessibility-components, which is why picking `forms` will install
`accessibilityComponents` to prevent build break.

## Pipes

`registerPipes()` (`src/libs/pipes/pipes.ts.hbs`) registers a fixed set of
transforms into the core `AppPipeRegistry` singleton, called once from
`main.ts`. This backs the `data-pipe="name[:args]|name2..."` attribute from
`NUTIN.md` — pipes run left-to-right, chained with `|`, and the result is
written into the element's `value`/`textContent`.

| Pipe | Signature | Behavior |
|---|---|---|
| `currency` | `(value: number, currency = 'USD', locale = 'en-US')` | `Intl.NumberFormat` currency formatting |
| `date` | `(value, locale = navigator.language, format = 'long', time = false)` | `format`: `'short' \| 'long' \| 'time'`; invalid date logs a warning and returns the raw value |
| `number` | `(value, decimals = 0)` | `Number(value).toFixed(parseInt(decimals))` |
| `uppercase` / `lowercase` | `(value)` | case conversion |
| `capitalize` | `(value)` | uppercase first char, lowercase rest |
| `capitalizeAll` | `(value)` | capitalizes each word (boundary: start, space, `.`, `,`, `"`, `'`), skips right after an apostrophe |
| `truncate` | `(value, length = 50, suffix = '...')` | slices + appends suffix past `parseInt(length)` |
| `default` | `(value, defaultValue = '')` | `value \|\| defaultValue` |
| `json` | `(value)` | `JSON.stringify(value, null, 2)`, falls back to `String(value)` |

Custom pipes are added the same way: `AppPipeRegistry.register(name, fn)`.
Duplicate names are skipped, not overwritten.

## nutinMixins

`src/libs/_index.scss.hbs` (base) does `@forward "nutin-mixins";` when the
`nutinMixins` feature is on. The library itself lives at
`src/libs/nutin-mixins/` (feature template, not base) and its
`_index.scss.hbs` forwards 10 category partials directly (`nutin-accessibility`,
`nutin-animation`, `nutin-grid`, `nutin-interaction`, `nutin-layout`,
`nutin-position`, `nutin-responsive`, `nutin-spacing`, `nutin-typography`,
`nutin-visual`) — there's no separate `utilities` module or `.u-*` classes;
everything here is consumption-only, meant to be `@include`d in component
SCSS.

**Mixins**, by category:

- **Responsive**: `respond-to($breakpoint)` — reads a config-merged
  `$breakpoints-config` (via the central config, see below) for the
  `small`/`medium`/`large`/`largest` breakpoint map, `max-width` media query.
- **Flexbox**: `flex-center`, `flex-between`, `flex-around` (only these
  three — no `flex-column`/`flex-row`/`flex-wrap`).
- **Grid**: `grid`, `fr-grid`, `fr-grid-rows`, `advanced-fr-grid`, `minmax-fr-grid`, `mixed-fr-grid`, `responsive-fr-grid`, `responsive-grid`, `grid-area`, `grid-column`, `grid-row`, `grid-template-areas`.
- **Spacing & sizing**: `margin-x`, `margin-y`, `padding-x`, `padding-y` (no `box($w, $h)`).
- **Typography**: `font($size, $weight: normal)`, `line-clamp($lines)`, `text-ellipsis`.
- **Position**: `absolute-center`, `fixed-full`, `pos($pos, $t, $r, $b, $l)`.
- **Background/border/shadow**: `bg-cover`, `bg-gradient($dir, $from, $to)`, `border(...)`, `box-shadow(...)`, `image-cover`, `rounded($radius: 4px)`.
- **Interaction & state**: `disabled` (generic — `pointer-events: none`,
  `cursor: not-allowed`, reduced opacity; not button-specific despite the
  name it used to go by), `hover-scale($scale: 1.05)`, `transition($props...)`
  (no `clearfix`/`cursor-pointer`/`hide`).
- **Accessibility**: `sr-only`.
- **Animation**: `bounce-in`, `fade-in`, `pulse`, `scale-up`, `shake`, `slide-in-left`, `spin` (each with `@keyframes`, `$duration`/`$delay` params — also config-integrated).

## Customizing component/overlay SCSS

accessibility-components, forms, and overlays all follow the same styling
convention: every visual unit's tunables live in a Sass map (`$<name>-config`,
plus a couple of standalone scalars like `$switch-thumb-offset`, derived from
their component's map), consumed internally via `map.get($<name>-config,
'key')`. Nothing is passed in from a template's `config`/`props` at the TS
level — these are build-time SCSS defaults, not runtime props.

**Override pattern: edit the one root config file.** There is exactly one
public Sass configuration entry point, `src/styles/_nutin-config.scss` — a
small file generated directly into your own project, not a library module
you import:

```scss
// src/styles/_nutin-config.scss (as generated)
$config: () !default;
```

Because you own this file outright, the natural way to override is to
**edit `$config` in place** — no indirection through another file needed.
For accessibility-components/forms/overlays, every `$<name>-config` map is
built by deep-merging its own literal defaults with `map.get($config,
'components', '<name>')` — the config key is always the variable name minus
the `$` prefix and trailing `-config` (e.g. `$modal-config` → `'modal'`,
`$anchored-overlay-config` → `'anchored-overlay'`, `$form-control-config` →
`'form-control'`). You only need to know this single path, not which
partial owns which map or where it lives:

```scss
// src/styles/_nutin-config.scss
$config: (
  'components': (
    'checkbox': (
      'color-primary': #ff6600, // ← only this one key is overridden
    ),
  ),
);
```

Because `map.deep-merge` merges recursively, you only list the keys you want
to change — everything else falls back to the component's own default. This
also composes across components/overlays in one place: extend the
`'components'` map with as many entries as you like (`'modal': (...)`,
`'form-control': (...)`, etc.) in that same `$config` map. Since Sass modules
are evaluated once and cached per compilation, every accessibility-components/
forms/overlays partial's own unconfigured `@use "../../../styles/nutin-config"
as config;` sees this same edited `$config` — including ones reached through
the `accessibility-components/_index.scss.hbs`, `overlays/_index.scss.hbs`,
and `forms/_index.scss.hbs` barrel forwards (the barrels themselves never
touch `nutin-config`; only the leaf partials that need a value do).

(You can alternatively configure `$config` via `@use "nutin-config" with
(...)` from `main.scss`, before `@use "../libs";` — Sass only allows this on
a module's very first load anywhere in the compilation, which is why the
ordering would matter there. Editing `_nutin-config.scss` directly sidesteps
that constraint entirely, since you're changing the module's own default
rather than configuring it from outside.)

**`nutinMixins` reads the same file, but a level shallower and outside the
`'components'` map.** Of its 10 category partials, only `nutin-responsive`
and `nutin-animation` read config, and they do so differently: `@use
"../../styles/nutin-config"` — two levels up, not three, since
`nutin-mixins/` partials sit directly under `src/libs/nutin-mixins/` rather
than in a further per-component subdirectory — and via top-level keys
instead of `'components'`-nested ones: `map.get($config, 'breakpoints')` and
`map.get($config, 'animations')`. Overriding these looks like:

```scss
// src/styles/_nutin-config.scss
$config: (
  'breakpoints': ('small': 480px),
  'animations': ('duration': 400ms),
);
```

— a sibling top-level key to `'components'`, not nested inside it.
`nutin-mixins/_index.scss.hbs` itself never `@use`s `nutin-config` (it's a
pure `@forward` barrel); only the two partials that need it reach for it
directly.

`src/styles/_nutin-config.scss` itself is only generated when at least one of
accessibility-components, forms, overlays, or `nutinMixins` is enabled — a
project with none of those four libs has no config file and nothing to edit.

For the shared overlay palette, overriding `'overlay-variables':
('semantic-colors': (...))` (backing `$semantic-colors` in
`core/_overlay-variables.scss.hbs`) changes the default for every overlay
that aliases it (`$snackbar-colors`, `$notification-banner-colors`,
`$emergency-dialog-colors`) at once; those per-component alias variables are
still plain `!default` scalars, so overriding one of them directly (the old
way, via a configured `@use` on that specific partial) still changes only
that overlay.

**Every color default below is a literal hex/rgba value.**

### accessibility-components config maps

| Map | Keys |
|---|---|
| `$avatar-config` | `font-family`, `border-radius-circle`, `border-radius-square`, `default-size`, `font-size-ratio`, `font-weight`, `initials-letter-spacing`, `color-surface`, `color-text-muted` |
| `$button-config` | `color-outline` |
| `$checkbox-config` | `gap`, `border-radius`, `transition-duration`, `label-font-size`, `disabled-opacity`, `input-size`, `input-border-width`, `checkmark-background-size`, `focus-outline-width`, `focus-outline-offset`, `label-line-height`, `color-border-strong`, `color-background`, `color-primary`, `color-disabled-bg`, `color-border`, `color-text` |
| `$picture-config` | `caption-margin-top`, `caption-font-size`, `caption-line-height`, `color-text-muted` |
| `$progress-config` | `gap`, `label-font-size`, `bar-border-radius`, `bar-transition-duration`, `label-font-weight`, `bar-height`, `indeterminate-duration`, `color-text-muted`, `color-surface`, `color-primary` |
| `$radio-group-config` | `legend-font-size`, `legend-margin-bottom`, `options-gap`, `option-gap`, `input-transition-duration`, `label-font-size`, `disabled-opacity`, `input-size`, `input-border-width`, `checked-inner-ring`, `checked-outer-ring`, `focus-outline-width`, `focus-outline-offset`, `label-line-height`, `color-text-muted`, `color-border-strong`, `color-background`, `color-primary`, `color-disabled-bg`, `color-border`, `color-text` |
| `$select-config` | `gap`, `label-font-size`, `control-padding-y`, `control-padding-x`, `control-font-family`, `control-font-size`, `control-border-radius`, `control-transition-duration`, `label-font-weight`, `control-border-width`, `control-line-height`, `focus-outline-width`, `focus-outline-offset`, `color-text-muted`, `color-surface`, `color-text`, `color-border`, `color-border-strong`, `color-primary`, `color-disabled-bg`, `color-disabled-text` |
| `$skeleton-config` | `border-radius`, `text-border-radius`, `line-border-radius`, `multiline-gap`, `pulse-duration`, `pulse-min-opacity`, `stagger-delay`, `last-line-width`, `circle-default-size`, `default-height`, `color-surface` |
| `$spinner-config` | `size`, `thickness`, `duration`, `size-sm`, `thickness-sm`, `size-lg`, `thickness-lg`, `size-xl`, `thickness-xl`, `color-primary`, `border-radius` |
| `$switch-config` | `gap`, `border-radius`, `transition-duration`, `label-font-size`, `track-width`, `track-height`, `thumb-size`, `disabled-opacity`, `thumb-shadow-offset-y`, `thumb-shadow-blur`, `thumb-shadow-color`, `focus-outline-width`, `focus-outline-offset`, `label-line-height`, `color-border-strong`, `color-background`, `color-primary`, `color-disabled-bg`, `color-disabled-text`, `color-text` |

`switch` also has a derived standalone scalar,
`$switch-thumb-offset: (track-height − thumb-size) × 0.5`, computed *from*
the merged `$switch-config` — override `$switch-config`'s (i.e. the
`'switch'` config entry's) `track-height`/`thumb-size` rather than trying to
set the offset directly, since it's recomputed from those two values.
`anchor`, `empty`, `focusable`,
and `visually-hidden` have no SCSS partial (unstyled/semantic) or, for
`visually-hidden`, plain hardcoded CSS with no config map.

### forms config map

| Map | Keys |
|---|---|
| `$form-control-config` | `gap`, `disabled-opacity`, `label-font-size`, `label-font-weight`, `line-height`, `required-line-height`, `input-padding-y`, `input-padding-x`, `input-border-width`, `input-border-radius`, `input-font-family`, `input-font-size`, `input-transition-duration`, `placeholder-opacity`, `focus-outline-width`, `focus-outline-offset`, `textarea-min-height`, `color-error`, `color-text-muted`, `color-surface`, `color-text`, `color-border`, `color-border-strong`, `color-primary`, `color-disabled-bg`, `color-disabled-text` |

All values are self-contained literals, same as every accessibility-components
map — no dependency on `src/styles/base/_variables.scss.hbs`, or on any
`var(--*)` CSS custom property, since none are defined anywhere in the base
template (see note below).

### overlays config maps

| Map | File | Keys |
|---|---|---|
| `$semantic-colors` (config key `'overlay-variables'` → `'semantic-colors'`) | `core/_overlay-variables.scss.hbs` | `success`, `error`, `info`, `warning`, `text` — shared palette; see aliasing note above |
| `$overlay-z-index` | `core/_overlay-variables.scss.hbs` | one key per layer (`base`, `sticky-header`, `sticky-footer`, `floating-button`, `sidebar`, `mobile-nav`, `dropdown`, `popover`, `tooltip`, `context-menu`, `snackbar`, `toast`, `notification-banner`, `modal-backdrop`, `modal`, `drawer-backdrop`, `drawer`, `fullscreen-overlay`, `blocking-loader`, `emergency-dialog`, `debug-panel`, `inspector`) — plain map, not `!default`, and deliberately **not** wired into the central config (see below) |
| `$overlay-runtime-config` | `core/_overlay-runtime.scss.hbs` | `z-index` (styles `.passive-overlay-region`) |
| `$anchored-overlay-config` | `core/_anchored-overlay-runtime.scss.hbs` | `transition-duration`, `initial-scale` |
| `$menu-item-config` | `core/_menu-overlay-runtime.scss.hbs` | `padding`, `disabled-opacity`, `color-text`, `color-secondary-hover`, `color-background` |
| `$modal-config` | `modal/_modal.scss.hbs` | `z-index`, `transition-duration`, `border-radius`, `initial-scale`, `close-button-size`, `footer-gap`, `footer-margin-top`, `footer-button-padding`, `shadow-offset-y`, `shadow-blur`, `shadow-fade`, `fullscreen-width`, `fullscreen-height`, `fullscreen-border-radius`, `color-overlay`, `color-background`, `color-text`, `color-secondary`, `color-secondary-hover` |
| `$drawer-config` | `drawer/_drawer.scss.hbs` | `transition-duration`, `width`, `height`, `content-padding`, `shadow-offset-y`, `shadow-blur`, `shadow-fade`, `color-overlay`, `color-background`, `color-text` |
| `$emergency-dialog-config` (+ `$emergency-dialog-colors: $semantic-colors`) | `emergency-dialog/_emergency-dialog.scss.hbs` | `accent-width`, `color-error` |
| `$blocking-loader-config` | `blocking-loader/_blocking-loader.scss.hbs` | `gap`, `message-font-size`, `message-font-weight`, `color-overlay`, `color-text` |
| `$dropdown-config` | `dropdown/_dropdown.scss.hbs` | `border-radius`, `min-width`, `content-padding`, `shadow-offset-y`, `shadow-blur`, `shadow-fade`, `color-background`, `color-text` |
| `$context-menu-config` | `context-menu/_context-menu.scss.hbs` | same keys as `$dropdown-config` |
| `$popover-config` | `popover/_popover.scss.hbs` | `border-radius`, `max-width`, `content-padding`, `shadow-offset-y`, `shadow-blur`, `shadow-fade`, `color-background`, `color-text` |
| `$tooltip-config` | `tooltip/_tooltip.scss.hbs` | `border-radius`, `font-size`, `max-width`, `content-padding`, `color-text`, `color-background` |
| `$snackbar-config` (+ `$snackbar-colors: $semantic-colors`) | `passive/_snackbar.scss.hbs` | `padding`, `border-radius`, `gap`, `stack-gap`, `offset`, `container-width`, `animation-duration`, `shadow-offset-y`, `shadow-blur`, `shadow-color` |
| `$notification-banner-config` (+ `$notification-banner-colors: $semantic-colors`) | `passive/_notification-banner.scss.hbs` | `padding`, `gap`, `actions-gap`, `close-font-size`, `animation-duration` |

**`$overlay-z-index` can't be overridden with this pattern at all** — unlike
every other map above, it's declared without `!default`
(`core/_overlay-variables.scss.hbs`), and Sass only allows `with (...)`
configuration on variables marked `!default`. This was a deliberate
exclusion when the rest of the table was wired into the central config, not
an oversight — to change the layering, the only option today is editing
`core/_overlay-variables.scss.hbs` directly (or, once generated, the
project's own copy of that file). Worth fixing upstream by adding it to the
central config too, like `semantic-colors`, if it's meant to be
user-configurable like the rest of this table.

## accessibility-components

### Architecture

Every component `extends Component<TElement, TConfig>` from core, following
core's standard shape: `config` (typed component data), `normalizeKeys`
(which config keys get i18n/pipe normalization), `props` (generic
`className`/`style`/`data-bind` keys), and the usual lifecycle hooks
(`onBeforeRender` for classes/ARIA attrs, `generateTemplate` for markup,
`onAfterRender` for querying rendered children and binding events). One more
hook shows up here too: `ButtonComponent` overrides `compose()` (core's hook
that normally just calls `addChildren()`) to append `ButtonManager`'s DOM
before falling through to `super.compose()`.

Two "manager" classes build DOM imperatively instead of via
`generateTemplate()`:
- **`AnchorManager`** — builds `<a>` elements from `IAnchorConfig`, handles
  external-link `rel`/`target`, and internal `#id` anchors (scroll + focus +
  live-region announcement — see Accessibility conventions below).
- **`ButtonManager`** — builds a container of dynamically generated
  `<button type="button">` elements from a `BaseButton[]` array, wiring each
  via the standard `data-event="click:onButtonClick_${index}"` convention.
  `ButtonComponent` itself only ever wraps a single `BaseButton` (see catalog
  below) — the array/multi-button support is `ButtonManager`'s, not exposed
  through `ButtonComponent`'s own constructor.

Shared stateless helpers (`utils/helpers/`): `AttributesHelper` (applies
`textContent`/`data-i18n`/`data-pipe`/`className`/`style`/`aria-label`),
`FocusableHelper` (action-mode vs link-mode ARIA + click/keyboard wiring),
`FormControlHelper` (label markup + checkbox/select change binding — this is
what `forms` imports), `LinkHelper` (external-target handling, new-tab
label suffix, Space-key anchor activation).

### Component catalog

| Component | Renders | Key config |
|---|---|---|
| `AnchorComponent` | `<a>` via `AnchorManager`; internal `#id` anchors get scroll+focus+announce, external get new-tab handling | `href`, `target`, `tagName` |
| `AvatarComponent` | `<img>` with initials fallback, or initials-only `<span>` (`role="img"` when no image) | `src`, `alt`, `initials`, `size`, `shape` |
| `ButtonComponent` | one dynamic `<button>` via `ButtonManager` (manager itself supports arrays) | `callback`, `ariaExpanded`, `ariaControls` |
| `CheckboxComponent` | `<label>` + native `<input type="checkbox">`, indeterminate support | `checked`, `indeterminate`, `onChange` |
| `EmptyComponent` | minimal placeholder `<div>`, optionally `data-optional` | `isOptional` |
| `FocusableComponent` | `<a>` (link mode) or `<div>` (action mode) general-purpose focusable primitive | `href`, `callback`, `ariaLabel` |
| `PictureComponent` | `<figure><picture>` with `<source>`s + fallback `<img>`, optional caption; `aria-hidden` when purely decorative | `sources`, `fallback`, `alt`, `captionI18nKey` |
| `ProgressComponent` | `<label>` + native `<progress>` | `value`, `max`, `labelKey` |
| `RadioGroupComponent` | `<fieldset><legend>` + radio options | `name`, `options[]`, `onChange` |
| `SelectComponent` | `<label>` + native `<select>` | `options[]`, `onChange` |
| `SkeletonComponent` | loading placeholder (`rect`/`circle`/`text`), always `aria-hidden` | `variant`, `width`, `height`, `lines` |
| `SpinnerComponent` | `role="status"` loading indicator | `size`, `color`, `label` (default `aria-label` "Loading") |
| `SwitchComponent` | same as checkbox, with `role="switch"` | `checked`, `onChange` |
| `VisuallyHiddenComponent` | `<span class="visually-hidden">` sr-only text | `textContent`, `i18nKey` |

Each visual component has a sibling `_<name>.component.scss.hbs` (missing
for `anchor`, `empty`, `focusable` — unstyled/semantic), forwarded from
`_index.scss.hbs`. Convention: a local `$<name>-config: (...) !default;`
Sass token map (literal sizes/transitions/colors — see
[Customizing component/overlay SCSS](#customizing-componentoverlay-scss)),
plus explicit `&:focus-visible` and disabled/state variants.

### Accessibility conventions

- **`ariaLabel` escape hatch** on nearly every interactive config, used when
  there's no visible text label — including `RadioGroupComponent`'s
  `<fieldset>`, for when neither `legendKey` nor `legendText` is given.
- **New-tab announcement**: external links get `target` + `rel="noopener
  noreferrer"` and `"(opens in new tab)"` appended to the label.
- **Internal-anchor scroll + focus + announce**: clicking (or Space-ing) an
  internal `href="#id"` anchor smooth-scrolls, temporarily focuses the
  target, and announces via a transient live region:
  ```ts
  private setFocus(target: HTMLElement | null): void {
    setTimeout(() => {
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
      target?.addEventListener('blur', () => target?.removeAttribute('tabindex'), { once: true });
    }, 100);
  }
  ```
  paired with a temporary `role="status" aria-live="polite"` region
  announcing "Navigated to \<target\>", removed after 3s.
- **Space-key activation**: native `<a>` only fires `click` on Enter, so
  `LinkHelper` explicitly wires Space too — but not uniformly: `AnchorManager`
  only wires it for internal (`#`-prefixed) anchors, external anchors get
  none, while `FocusableHelper` wires Space for any link-mode `href`
  regardless of internal/external.
- **Action-mode keyboard semantics**: a `div`-based focusable with a
  `callback` and no `href` gets `role="button"` + `tabindex="0"`, and both
  Enter and Space invoke the callback.
- **Decorative-content suppression**: `PictureComponent` sets
  `aria-hidden="true"` when `alt=""` and no caption; `AvatarComponent`
  marks its initials fallback `aria-hidden` since the parent already carries
  the label; skeletons and spinner rings are always `aria-hidden`.
- **Native elements preferred over ARIA** where possible — real
  `<input type="checkbox"|"radio">`, `<select>`, `<progress>`,
  `<fieldset><legend>` — `switch` is the one exception, layering
  `role="switch"` on `type="checkbox"` per the WAI-ARIA switch pattern.
- **Optional-label removal**: `FormControlHelper.renderLabel` always emits
  `data-optional` on the label `<span>`, so an unlabeled input doesn't leave
  a dangling empty span (core removes it post-render).

## forms

An **imperative** forms layer — no observables/reactive streams, no
Angular-style `valueChanges`.

```ts
interface IFormField {
  getValue(): string | boolean;
  validate(): boolean;
  get valid(): boolean;
  reset(): void;
  markAsTouched(): void;
  readonly element: HTMLElement;
}
```

- **`FormControlComponent`** — a core `Component` subclass that renders one
  `<label>` + `<input>`/`<textarea>` + inline error `<p>`, wires its own
  `blur`/`input` listeners, and implements `IFormField` directly. Uses
  `FormControlHelper.renderLabel` from accessibility-components — this is
  the concrete dependency behind the bundling in Overview.
- **`FormGroup`** — a plain (non-`Component`) class wrapping a native
  `<form>` + `Record<string, IFormField>`. Sets `novalidate`, intercepts
  `submit`, runs `markAsTouched()` + `validate()` on every field, and calls
  `onSubmit(values)` or `onValidationFail(invalidFieldNames)`; focuses the
  first invalid field on failure.
- **`asFormField(component, validators?, options?)`** — adapts any object
  with `getValue()`/`setValue()`/`element` (e.g. a `CheckboxComponent` or
  `SelectComponent` from accessibility-components) into an `IFormField`, so
  non-`FormControlComponent` fields can join a `FormGroup` too.

```ts
class FormGroup {
  constructor(formEl: HTMLFormElement, fields: Record<string, IFormField>, options?: IFormGroupOptions);
  getValues(): Record<string, string | boolean>;
  validate(): boolean; get valid(): boolean; reset(): void;
  getField(name: string): IFormField | undefined;
}
```

**Validators** — static methods on a `Validators` class (`Validators.required`,
`Validators.email`, ...), not bare functions (`type ValidatorFn = (value: string)
=> string | null` — `null` means valid):

| Validator | Checks |
|---|---|
| `required(value)` | non-empty after trim |
| `email(value)` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `minLength(min)` | `value.length >= min` |
| `maxLength(max)` | `value.length <= max` |
| `pattern(regex, errorKey?)` | `regex.test(value)` |
| `compose(...fns)` | runs in order, short-circuits on first failure |

Errors are string keys (e.g. `'validators.required'`), not display text —
`FormControlComponent` resolves them via `config.errorMessages?.[key] ??
key` and writes the result into an `aria-live="polite"` error node, sets
`aria-invalid="true"` on the input, and toggles a `form-control--error`
class. No event-bus involvement — forms are entirely local/synchronous.

## overlays

A layered runtime hierarchy, all extending core's `BaseComponent` directly
(not `Component` — overlays mount into `document.body`, not a parent's DOM
slot):

```
BaseComponent (core)
 └─ OverlayRuntime                — open()/close(), forces mountTarget: 'body'
     ├─ ModalOverlayRuntime       — focus trap, scroll lock, backdrop/dismiss
     ├─ PassiveOverlayRuntime<T>  — aria-live queue, max-stack, auto-dismiss
     └─ AnchoredOverlayRuntime    — anchor-relative position, outside-click/Escape dismiss
         └─ MenuOverlayRuntime    — role="menu", roving-tabindex arrow-key nav
```

- **`OverlayRuntime`** — abstract base; `open()` calls `render()`, `close()`
  calls `destroy()`.
- **`AnchoredOverlayRuntime`** — `setAnchor(el)`/`setAnchorPoint(x, y)`,
  `placement`/`offset` config with auto-flip on collision, reposition on
  `scroll`/`resize`, optional `trapFocus`, dismiss on outside-click (bound
  after a `setTimeout(0)` to dodge the opening click) or Escape.
- **`MenuOverlayRuntime`** — forces `trapFocus: false`, renders
  `role="menu"` items wired via `data-event="click:onItemClick:<index>"`,
  arrow-key/Home/End/Enter/Space navigation, closes on `focusout`.
- **`ModalOverlayRuntime`** — `role="dialog" aria-modal="true"`, locks page
  scroll, always activates the focus trap, optional dismiss button/backdrop
  click (gated by `dismissible`, default `true`), auto-`aria-labelledby`
  from the first heading or an explicit `dialogLabel`.
- **`PassiveOverlayRuntime<TItem>`** — `aria-live="polite"` region managing
  a FIFO queue (`_maxStack`, default 1); subclasses implement `_showItem`.

**`FocusTrapHelper`**: on `activate()` snapshots the previously focused
element, focuses the first focusable node inside the container (or the
container itself), sets `#app`'s `inert = true`, traps `Tab`/`Shift+Tab`,
handles `Escape` via `escapeDeactivates` (default `true`); on `deactivate()`
restores `inert = false` and refocuses the snapshot (`returnFocusOnDeactivate`,
default `true`).

### Concrete overlays

| Overlay | Extends | One-liner |
|---|---|---|
| `ModalOverlay` | `ModalOverlayRuntime` | full dialog, optional `fullscreen` |
| `DrawerOverlay` | `ModalOverlayRuntime` | slide-in panel from a configurable `edge` |
| `EmergencyDialogOverlay` | `ModalOverlayRuntime` | non-dismissible (`dismissible: false`, `escapeDeactivates: false`) |
| `BlockingLoaderOverlay` | `OverlayRuntime` (direct) | full-page `aria-busy` spinner overlay, locks scroll |
| `DropdownOverlay` | `MenuOverlayRuntime` | anchored menu bound to a trigger via `setAnchor` |
| `ContextMenuOverlay` | `MenuOverlayRuntime` | right-click menu, positioned via `setAnchorPoint(x, y)` |
| `PopoverOverlay` | `AnchoredOverlayRuntime` | anchored rich-content panel; `interactive` enables focus trap + `role="dialog"` |
| `TooltipOverlay` | `AnchoredOverlayRuntime` | `role="tooltip"`, hover/focus with show/hide delays, always `trapFocus: false` |
| `Snackbar` (`notify()`) | `PassiveOverlayRuntime<SnackbarItem>` | auto-dismissing toast queue |
| `NotificationBanner` (`showNotificationBanner()`) | `PassiveOverlayRuntime<Item>` | manually-dismissed banner queue; force-clears on view unmount |

**Event-bus tie-in is inconsistent** — only some overlays call the core
`Overlays` facade (`overlays.facade.ts.hbs`, see `NUTIN.md`):

- `ModalOverlay` — the only one that fires `modalOpened`/`modalClosed`
  (plus `overlayOpened('modal')`/`overlayClosed('modal')`).
- `DrawerOverlay`, `EmergencyDialogOverlay`, `BlockingLoaderOverlay` — fire
  generic `overlayOpened('<type>')`/`overlayClosed('<type>')` only, even
  though drawer/emergency-dialog also extend `ModalOverlayRuntime`.
- `DropdownOverlay`, `ContextMenuOverlay`, `PopoverOverlay`, `TooltipOverlay`,
  `Snackbar`, `NotificationBanner` — emit nothing on the bus.

**Z-index layering** (`$overlay-z-index` Sass map, `core/_overlay-variables.scss.hbs`):
sticky UI (100s) → anchored overlays (300s: dropdown 300, popover 310,
tooltip 320, context-menu 330) → passive (400s: snackbar 400, toast 410,
notification-banner 420) → modal (500s: backdrop 500, modal 510, drawer
520–530, fullscreen 540) → critical (600s: blocking-loader 600,
emergency-dialog 610).
