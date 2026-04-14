<template>
  <div class="design-inspector">
    <p class="bp-pill">Breakpoint: {{ breakpoint }}</p>

    <details class="grp" open>
      <summary class="grp-sum">Position</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item">
          <label>Position</label>
          <select :value="String(val('position') ?? '')" @change="onInput('position', $event)">
            <option value="">default</option>
            <option value="static">static</option>
            <option value="relative">relative</option>
            <option value="absolute">absolute</option>
            <option value="fixed">fixed</option>
            <option value="sticky">sticky</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Z-index</label>
          <input type="text" :value="str('zIndex')" placeholder="auto" @input="onInput('zIndex', $event)" />
        </div>
        <div class="prop-item">
          <label>Top</label>
          <input type="text" :value="str('top')" placeholder="0" @input="onInput('top', $event)" />
        </div>
        <div class="prop-item">
          <label>Right</label>
          <input type="text" :value="str('right')" @input="onInput('right', $event)" />
        </div>
        <div class="prop-item">
          <label>Bottom</label>
          <input type="text" :value="str('bottom')" @input="onInput('bottom', $event)" />
        </div>
        <div class="prop-item">
          <label>Left</label>
          <input type="text" :value="str('left')" @input="onInput('left', $event)" />
        </div>
        <div class="prop-item">
          <label>Overflow</label>
          <select :value="String(val('overflow') ?? '')" @change="onInput('overflow', $event)">
            <option value="">default</option>
            <option value="visible">visible</option>
            <option value="hidden">hidden</option>
            <option value="scroll">scroll</option>
            <option value="auto">auto</option>
            <option value="clip">clip</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Overflow X</label>
          <select :value="String(val('overflowX') ?? '')" @change="onInput('overflowX', $event)">
            <option value="">default</option>
            <option value="visible">visible</option>
            <option value="hidden">hidden</option>
            <option value="scroll">scroll</option>
            <option value="auto">auto</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Overflow Y</label>
          <select :value="String(val('overflowY') ?? '')" @change="onInput('overflowY', $event)">
            <option value="">default</option>
            <option value="visible">visible</option>
            <option value="hidden">hidden</option>
            <option value="scroll">scroll</option>
            <option value="auto">auto</option>
          </select>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Layout & spacing</summary>
      <div class="grp-body">
        <BSPropLayout :block="block" />
        <BSPropSpacing :block="block" />
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Text</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item wide">
          <BSFontPicker :blockId="block.id" propKey="fontFamily" :modelValue="val('fontFamily')" />
        </div>
        <div class="prop-item">
          <label>Size (px)</label>
          <input type="number" :value="num('fontSize')" @input="onInput('fontSize', $event)" />
        </div>
        <div class="prop-item">
          <label>Weight</label>
          <select :value="String(val('fontWeight') ?? 'normal')" @change="onInput('fontWeight', $event)">
            <option value="normal">normal</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="bold">bold</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Style</label>
          <select :value="String(val('fontStyle') ?? 'normal')" @change="onInput('fontStyle', $event)">
            <option value="normal">normal</option>
            <option value="italic">italic</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Align</label>
          <select :value="String(val('textAlign') ?? 'left')" @change="onInput('textAlign', $event)">
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
            <option value="justify">justify</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Line height</label>
          <input type="text" :value="str('lineHeight')" placeholder="1.4 or 24px" @input="onInput('lineHeight', $event)" />
        </div>
        <div class="prop-item">
          <label>Letter spacing</label>
          <input type="text" :value="str('letterSpacing')" placeholder="0.02em" @input="onInput('letterSpacing', $event)" />
        </div>
        <div class="prop-item">
          <label>Decoration</label>
          <select :value="String(val('textDecoration') ?? 'none')" @change="onInput('textDecoration', $event)">
            <option value="none">none</option>
            <option value="underline">underline</option>
            <option value="line-through">line-through</option>
            <option value="overline">overline</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Transform</label>
          <select :value="String(val('textTransform') ?? 'none')" @change="onInput('textTransform', $event)">
            <option value="none">none</option>
            <option value="uppercase">uppercase</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">capitalize</option>
          </select>
        </div>
        <div class="prop-item">
          <label>White space</label>
          <select :value="String(val('whiteSpace') ?? 'normal')" @change="onInput('whiteSpace', $event)">
            <option value="normal">normal</option>
            <option value="nowrap">nowrap</option>
            <option value="pre">pre</option>
            <option value="pre-wrap">pre-wrap</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Color</label>
          <div class="color-picker">
            <input type="color" :value="hex('color')" @input="onInput('color', $event)" />
            <input type="text" :value="str('color')" placeholder="#111" @input="onInput('color', $event)" />
          </div>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Background</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item">
          <label>Color</label>
          <div class="color-picker">
            <input type="color" :value="hex('backgroundColor')" @input="onInput('backgroundColor', $event)" />
            <input type="text" :value="str('backgroundColor')" @input="onInput('backgroundColor', $event)" />
          </div>
        </div>
        <div class="prop-item wide">
          <label>Image URL</label>
          <input type="text" :value="str('backgroundImage')" placeholder="url(...)" @input="onInput('backgroundImage', $event)" />
        </div>
        <div class="prop-item">
          <label>Size</label>
          <input type="text" :value="str('backgroundSize')" placeholder="cover" @input="onInput('backgroundSize', $event)" />
        </div>
        <div class="prop-item">
          <label>Position</label>
          <input type="text" :value="str('backgroundPosition')" placeholder="center" @input="onInput('backgroundPosition', $event)" />
        </div>
        <div class="prop-item">
          <label>Repeat</label>
          <select :value="String(val('backgroundRepeat') ?? '')" @change="onInput('backgroundRepeat', $event)">
            <option value="">default</option>
            <option value="no-repeat">no-repeat</option>
            <option value="repeat">repeat</option>
            <option value="repeat-x">repeat-x</option>
            <option value="repeat-y">repeat-y</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Attachment</label>
          <select :value="String(val('backgroundAttachment') ?? '')" @change="onInput('backgroundAttachment', $event)">
            <option value="">default</option>
            <option value="scroll">scroll</option>
            <option value="fixed">fixed</option>
            <option value="local">local</option>
          </select>
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Border</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item wide">
          <label>Border shorthand</label>
          <input type="text" :value="str('border')" placeholder="1px solid #ccc" @input="onInput('border', $event)" />
        </div>
        <div class="prop-item">
          <label>Width</label>
          <input type="text" :value="str('borderWidth')" @input="onInput('borderWidth', $event)" />
        </div>
        <div class="prop-item">
          <label>Style</label>
          <select :value="String(val('borderStyle') ?? '')" @change="onInput('borderStyle', $event)">
            <option value="">default</option>
            <option value="none">none</option>
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Color</label>
          <div class="color-picker">
            <input type="color" :value="hex('borderColor')" @input="onInput('borderColor', $event)" />
            <input type="text" :value="str('borderColor')" @input="onInput('borderColor', $event)" />
          </div>
        </div>
        <div class="prop-item">
          <label>Radius</label>
          <input type="text" :value="str('borderRadius')" placeholder="8px" @input="onInput('borderRadius', $event)" />
        </div>
        <div class="prop-item">
          <label>Outline</label>
          <input type="text" :value="str('outline')" @input="onInput('outline', $event)" />
        </div>
        <div class="prop-item">
          <label>Outline offset</label>
          <input type="text" :value="str('outlineOffset')" @input="onInput('outlineOffset', $event)" />
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Shadow & blur</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item wide">
          <label>Box shadow</label>
          <input type="text" :value="str('boxShadow')" placeholder="0 4px 12px rgba(0,0,0,.12)" @input="onInput('boxShadow', $event)" />
        </div>
        <div class="prop-item wide">
          <label>Text shadow</label>
          <input type="text" :value="str('textShadow')" @input="onInput('textShadow', $event)" />
        </div>
        <div class="prop-item wide">
          <label>Filter</label>
          <input type="text" :value="str('filter')" placeholder="blur(2px)" @input="onInput('filter', $event)" />
        </div>
        <div class="prop-item wide">
          <label>Backdrop filter</label>
          <input type="text" :value="str('backdropFilter')" placeholder="blur(8px)" @input="onInput('backdropFilter', $event)" />
        </div>
      </div>
    </details>

    <details class="grp" open>
      <summary class="grp-sum">Appearance</summary>
      <div class="grp-body prop-grid">
        <div class="prop-item">
          <label>Opacity</label>
          <input type="text" :value="str('opacity')" placeholder="1" @input="onInput('opacity', $event)" />
        </div>
        <div class="prop-item">
          <label>Visibility</label>
          <select :value="String(val('visibility') ?? '')" @change="onInput('visibility', $event)">
            <option value="">default</option>
            <option value="visible">visible</option>
            <option value="hidden">hidden</option>
          </select>
        </div>
        <div class="prop-item">
          <label>Cursor</label>
          <input type="text" :value="str('cursor')" placeholder="pointer" @input="onInput('cursor', $event)" />
        </div>
        <div class="prop-item">
          <label>Mix blend</label>
          <input type="text" :value="str('mixBlendMode')" placeholder="multiply" @input="onInput('mixBlendMode', $event)" />
        </div>
        <div class="prop-item">
          <label>Transform</label>
          <input type="text" :value="str('transform')" placeholder="rotate(2deg)" @input="onInput('transform', $event)" />
        </div>
        <div class="prop-item">
          <label>Transform origin</label>
          <input type="text" :value="str('transformOrigin')" placeholder="center" @input="onInput('transformOrigin', $event)" />
        </div>
        <div class="prop-item">
          <label>Aspect ratio</label>
          <input type="text" :value="str('aspectRatio')" placeholder="16 / 9" @input="onInput('aspectRatio', $event)" />
        </div>
        <div class="prop-item wide">
          <label>Custom classes</label>
          <input type="text" :value="str('customClasses')" placeholder="Tailwind utilities…" @input="onInput('customClasses', $event)" />
        </div>
        <template v-if="block.type === 'image'">
          <div class="prop-item">
            <label>Object fit</label>
            <select :value="String(val('objectFit') ?? '')" @change="onInput('objectFit', $event)">
              <option value="">default</option>
              <option value="contain">contain</option>
              <option value="cover">cover</option>
              <option value="fill">fill</option>
              <option value="none">none</option>
              <option value="scale-down">scale-down</option>
            </select>
          </div>
          <div class="prop-item">
            <label>Object position</label>
            <input type="text" :value="str('objectPosition')" placeholder="center" @input="onInput('objectPosition', $event)" />
          </div>
        </template>
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
const { val, onInput, breakpoint } = useBlockPropBinding(() => props.block);

function str(key: string): string {
  const v = val(key);
  if (v === undefined || v === null) return "";
  return String(v);
}

function num(key: string): string {
  const v = val(key);
  if (v === undefined || v === null || v === "") return "";
  return String(v);
}

/** Valor seguro para input type=color (evita vacío inválido). */
function hex(key: string): string {
  const raw = str(key);
  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) return raw;
  return "#000000";
}
</script>

<style scoped>
.design-inspector {
  padding-bottom: 16px;
}
.bp-pill {
  margin: 10px 14px 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.grp {
  border-bottom: 1px solid var(--border-subtle);
}
.grp-sum {
  list-style: none;
  cursor: pointer;
  padding: 10px 14px;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--bg-surface-alt);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.grp-sum::-webkit-details-marker {
  display: none;
}
.grp-body {
  padding: 8px 12px 14px;
}
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.prop-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-item.wide {
  grid-column: 1 / -1;
}
.prop-item label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
}
.prop-item input,
.prop-item select {
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: 6px;
  padding: 7px 8px;
  color: var(--text-main);
  font-size: 12px;
  outline: none;
}
.color-picker {
  display: flex;
  gap: 4px;
}
.color-picker input[type="color"] {
  padding: 0;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-main);
  border-radius: 4px;
  cursor: pointer;
}
.color-picker input[type="text"] {
  flex: 1;
}
</style>
