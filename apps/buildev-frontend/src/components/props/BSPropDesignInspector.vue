<template>
  <div class="design-inspector">
    <div class="inspector-head">
      <span class="head-title">Design</span>
      <span class="bp-pill">{{ breakpoint }}</span>
    </div>

    <details class="grp" open>
      <summary class="grp-sum">Position</summary>
      <div class="grp-body">
        <div class="row-3">
          <div class="prop-item">
            <label>X</label>
            <input type="text" :value="str('left')" placeholder="0" @input="onInput('left', $event)" />
          </div>
          <div class="prop-item">
            <label>Y</label>
            <input type="text" :value="str('top')" placeholder="0" @input="onInput('top', $event)" />
          </div>
          <div class="prop-item">
            <label>Z</label>
            <input type="text" :value="str('zIndex')" placeholder="0" @input="onInput('zIndex', $event)" />
          </div>
        </div>
        <div class="row-2">
          <div class="prop-item">
            <label>Mode</label>
            <select :value="String(val('position') ?? 'relative')" @change="onInput('position', $event)">
              <option value="static">static</option>
              <option value="relative">relative</option>
              <option value="absolute">absolute</option>
              <option value="fixed">fixed</option>
              <option value="sticky">sticky</option>
            </select>
          </div>
          <div class="prop-item">
            <label>Overflow</label>
            <select :value="String(val('overflow') ?? 'visible')" @change="onInput('overflow', $event)">
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
              <option value="auto">auto</option>
              <option value="scroll">scroll</option>
            </select>
          </div>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Layout</summary>
      <div class="grp-body">
        <div class="flow-row">
          <button type="button" class="flow-btn" :class="{ active: str('display') === 'block' }" @click="setDisplay('block')">Block</button>
          <button type="button" class="flow-btn" :class="{ active: str('display') === 'flex' }" @click="setDisplay('flex')">Flex</button>
          <button type="button" class="flow-btn" :class="{ active: str('display') === 'grid' }" @click="setDisplay('grid')">Grid</button>
        </div>
        <BSPropLayout :block="block" />
        <BSPropSpacing :block="block" />
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Appearance</summary>
      <div class="grp-body row-2">
        <div class="prop-item">
          <label>Opacity</label>
          <input type="text" :value="str('opacity')" placeholder="1" @input="onInput('opacity', $event)" />
        </div>
        <div class="prop-item">
          <label>Radius</label>
          <input type="text" :value="str('borderRadius')" placeholder="0" @input="onInput('borderRadius', $event)" />
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Text</summary>
      <div class="grp-body">
        <BSFontPicker :blockId="block.id" propKey="fontFamily" :modelValue="str('fontFamily')" />
        <div class="row-2">
          <div class="prop-item">
            <label>Weight</label>
            <select :value="String(val('fontWeight') ?? '400')" @change="onInput('fontWeight', $event)">
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
            </select>
          </div>
          <div class="prop-item">
            <label>Size</label>
            <input type="text" :value="str('fontSize')" placeholder="16px" @input="onInput('fontSize', $event)" />
          </div>
        </div>
        <div class="row-2">
          <div class="prop-item">
            <label>Color</label>
            <div class="color-picker">
              <input type="color" :value="hex('color')" @input="onInput('color', $event)" />
              <input type="text" :value="str('color')" placeholder="#09090B" @input="onInput('color', $event)" />
            </div>
          </div>
          <div class="prop-item">
            <label>Line height</label>
            <input type="text" :value="str('lineHeight')" placeholder="normal" @input="onInput('lineHeight', $event)" />
          </div>
        </div>
        <div class="row-2">
          <div class="prop-item">
            <label>Letter spacing</label>
            <input type="text" :value="str('letterSpacing')" placeholder="0px" @input="onInput('letterSpacing', $event)" />
          </div>
          <div class="prop-item">
            <label>Align</label>
            <div class="segmented">
              <button type="button" class="seg-btn" :class="{ active: str('textAlign') === 'left' }" @click="setProp('textAlign', 'left')">L</button>
              <button type="button" class="seg-btn" :class="{ active: str('textAlign') === 'center' }" @click="setProp('textAlign', 'center')">C</button>
              <button type="button" class="seg-btn" :class="{ active: str('textAlign') === 'right' }" @click="setProp('textAlign', 'right')">R</button>
              <button type="button" class="seg-btn" :class="{ active: str('textAlign') === 'justify' }" @click="setProp('textAlign', 'justify')">J</button>
            </div>
          </div>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Background</summary>
      <div class="grp-body row-2">
        <div class="prop-item wide">
          <label>Fill</label>
          <select :value="String(val('backgroundType') ?? 'solid')" @change="onInput('backgroundType', $event)">
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div class="prop-item wide">
          <label>Color</label>
          <div class="color-picker">
            <input type="color" :value="hex('backgroundColor')" @input="onInput('backgroundColor', $event)" />
            <input type="text" :value="str('backgroundColor')" placeholder="#FFFFFF" @input="onInput('backgroundColor', $event)" />
          </div>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Border</summary>
      <div class="grp-body row-2">
        <div class="prop-item">
          <label>Style</label>
          <select :value="String(val('borderStyle') ?? 'solid')" @change="onInput('borderStyle', $event)">
            <option value="none">none</option>
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Width</label>
          <input type="text" :value="str('borderWidth')" placeholder="1px" @input="onInput('borderWidth', $event)" />
        </div>
        <div class="prop-item wide">
          <label>Color</label>
          <div class="color-picker">
            <input type="color" :value="hex('borderColor')" @input="onInput('borderColor', $event)" />
            <input type="text" :value="str('borderColor')" placeholder="#09090B" @input="onInput('borderColor', $event)" />
          </div>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Shadow & blur</summary>
      <div class="grp-body row-2">
        <div class="prop-item wide">
          <label>Preset</label>
          <select :value="String(val('shadowPreset') ?? 'none')" @change="onShadowPresetChange">
            <option value="none">None</option>
            <option value="drop">Drop shadow</option>
            <option value="soft">Soft</option>
            <option value="lifted">Lifted</option>
          </select>
        </div>
        <div class="prop-item wide">
          <label>Filter</label>
          <input type="text" :value="str('filter')" placeholder="blur(2px)" @input="onInput('filter', $event)" />
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { BSBlock } from "@buildersite/sdk";
import { useBlockPropBinding } from "../../composables/useBlockPropBinding";
import BSFontPicker from "./editors/BSFontPicker.vue";
import BSPropLayout from "./BSPropLayout.vue";
import BSPropSpacing from "./BSPropSpacing.vue";

const props = defineProps<{ block: BSBlock }>();
const { val, setProp, onInput, breakpoint } = useBlockPropBinding(() => props.block);

function str(key: string): string {
  const v = val(key);
  if (v === undefined || v === null) return "";
  return String(v);
}

function hex(key: string): string {
  const raw = str(key);
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw;
  return "#000000";
}

function setDisplay(display: "block" | "flex" | "grid"): void {
  setProp("display", display);
}

function onShadowPresetChange(e: Event): void {
  const preset = (e.target as HTMLSelectElement).value;
  setProp("shadowPreset", preset);
  if (preset === "none") setProp("boxShadow", "none");
  if (preset === "drop") setProp("boxShadow", "0 8px 20px rgba(0, 0, 0, 0.18)");
  if (preset === "soft") setProp("boxShadow", "0 4px 12px rgba(0, 0, 0, 0.12)");
  if (preset === "lifted") setProp("boxShadow", "0 12px 30px rgba(0, 0, 0, 0.2)");
}
</script>

<style scoped>
.design-inspector {
  padding-bottom: 16px;
}

.inspector-head {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-surface-alt);
  border-bottom: 1px solid var(--border-subtle);
}

.head-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--text-main);
}

.bp-pill {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-input);
  color: var(--text-dim);
  border: 1px solid var(--border-main);
  text-transform: uppercase;
}

.grp {
  border-bottom: 1px solid var(--border-subtle);
}

.grp-sum {
  list-style: none;
  cursor: pointer;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.02em;
}

.grp-sum::-webkit-details-marker {
  display: none;
}

.grp-body {
  padding: 0 12px 14px;
}

.row-2,
.row-3 {
  display: grid;
  gap: 8px;
  margin-bottom: 8px;
}

.row-2 {
  grid-template-columns: 1fr 1fr;
}

.row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.prop-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.prop-item.wide {
  grid-column: 1 / -1;
}

.prop-item label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.prop-item input,
.prop-item select {
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: 8px;
  padding: 8px 9px;
  color: var(--text-main);
  font-size: 12px;
  outline: none;
}

.flow-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.flow-btn {
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border-main);
  background: var(--bg-input);
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.flow-btn.active {
  border-color: var(--brand-primary);
  color: var(--text-main);
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.35);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.seg-btn {
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-main);
  background: var(--bg-input);
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.seg-btn.active {
  border-color: var(--brand-primary);
  color: var(--text-main);
}

.color-picker {
  display: flex;
  gap: 4px;
}

.color-picker input[type="color"] {
  padding: 0;
  width: 34px;
  min-width: 34px;
  height: 34px;
  border: 1px solid var(--border-main);
  border-radius: 8px;
  cursor: pointer;
}

.color-picker input[type="text"] {
  flex: 1;
}
</style>
