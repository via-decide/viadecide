# Changelog

## Unreleased

### Added

- Restored the canonical 44 standalone digital assets under clean ViaDecide routes.
- Added a versioned 44-asset manifest and deterministic static/interaction regression gates.
- Added direct-route rewrites without changing the existing homepage, router, articles, PWA, or modal contracts.

### Fixed

- Resolved relative shared-asset loading when tools are opened from clean routes such as `/promptalchemy`.
- Made the shared tool registry resolve its manifest and metadata from the site root.
- Repaired Template Vault so saving a template immediately selects and displays it.
- Rebuilt the corrupted Seed Quality Scorer document to remove merged markup and duplicate IDs.
- Added local-first fallbacks to Growth Stage Engine when its optional server endpoint is unavailable.
