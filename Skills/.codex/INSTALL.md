# Installing Buildev Skills for Codex

## Prerequisites

- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bryfar/buildev-skills.git ~/.codex/buildev-skills
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/buildev-skills/skills ~/.agents/skills/buildev-skills
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\buildev-skills" "$env:USERPROFILE\.codex\buildev-skills\skills"
   ```

3. **Restart Codex** to discover the skills.

## Updating

```bash
cd ~/.codex/buildev-skills && git pull
```

## Uninstalling

```bash
rm ~/.agents/skills/buildev-skills
rm -rf ~/.codex/buildev-skills
```