# version 1.0.15

Added estimation learning fields to help track and improve time estimation accuracy over time.

- Added `epic` field for grouping related tasks (e.g., "Stripe Integration", "User Auth")
- Added `category` enum field: integration, feature, ui, fix, refactor, config
- Added `is_exploration` boolean to mark unfamiliar territory tasks
- Added `scope` enum field: small, medium, large
- New keybindings: `M` (edit metadata), `C` (quick category), `X` (toggle exploration)
- Metadata badges display in task list with color-coded categories
- TruncatedText component for epic names with ellipsis
