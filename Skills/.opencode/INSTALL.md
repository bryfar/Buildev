# Installing Buildev Skills for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Add to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["buildev-skills@git+https://github.com/bryfar/buildev-skills.git"]
}
```

Restart OpenCode. The plugin auto-installs and registers all skills.

## Updating

Restarts OpenCode to pull the latest version automatically.

To pin a specific version:

```json
{
  "plugin": ["buildev-skills@git+https://github.com/bryfar/buildev-skills.git#v0.7.0"]
}
```

## Uninstalling

Remove the plugin line from `opencode.json` and restart OpenCode.