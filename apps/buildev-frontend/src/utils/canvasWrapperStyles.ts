/**
 * Construye el objeto de estilo inline del contenedor `.canvas-block` a partir de props ya mergeadas (incl. responsive).
 *
 * @param p Props efectivas del bloque.
 * @returns Estilos listos para `:style` en el wrapper del canvas.
 */
export function canvasWrapperStylesFromMergedProps(p: Record<string, unknown>): Record<string, string> {
    const s: Record<string, string> = {};
    const pick = (key: keyof typeof p | string, outKey?: string) => {
        const v = p[key];
        if (v === undefined || v === null) return;
        const str = String(v).trim();
        if (str === "") return;
        s[outKey ?? String(key)] = str;
    };

    pick("width");
    pick("height");
    pick("minWidth");
    pick("maxWidth");
    pick("minHeight");
    pick("maxHeight");
    pick("margin");
    pick("marginTop");
    pick("marginRight");
    pick("marginBottom");
    pick("marginLeft");
    pick("padding");
    pick("paddingTop");
    pick("paddingRight");
    pick("paddingBottom");
    pick("paddingLeft");
    pick("position");
    pick("top");
    pick("right");
    pick("bottom");
    pick("left");
    pick("zIndex");
    pick("overflow");
    pick("overflowX");
    pick("overflowY");
    pick("opacity");
    pick("visibility");
    pick("cursor");
    pick("mixBlendMode");
    pick("transform");
    pick("transformOrigin");
    pick("display");
    pick("flexDirection");
    pick("flexWrap");
    pick("alignItems");
    pick("justifyContent");
    pick("alignContent");
    pick("gap");
    pick("rowGap");
    pick("columnGap");
    pick("gridTemplateColumns");
    pick("gridTemplateRows");
    pick("gridAutoFlow");
    pick("flexGrow");
    pick("flexShrink");
    pick("flexBasis");
    pick("order");
    pick("backgroundColor");
    pick("backgroundImage");
    pick("backgroundSize");
    pick("backgroundPosition");
    pick("backgroundRepeat");
    pick("backgroundAttachment");
    pick("background", "background");
    pick("border");
    pick("borderWidth");
    pick("borderStyle");
    pick("borderColor");
    pick("borderRadius");
    pick("outline");
    pick("outlineOffset");
    pick("boxShadow");
    pick("textShadow");
    pick("filter");
    pick("backdropFilter");
    pick("aspectRatio");
    return s;
}
