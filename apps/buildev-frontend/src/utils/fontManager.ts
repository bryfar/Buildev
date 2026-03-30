import fontList from "../data/fontList.json";
import WebFont from "webfontloader";

const requestedFonts = new Set<string>();

/**
 * Checks if a font has already been loaded.
 */
export const isFontRequested = (font: string) => {
	return requestedFonts.has(font);
};

/**
 * Dynamically loads a Google Font via webfontloader.
 * It prevents duplicate network requests for the same font+weight combination.
 */
export const setFont = (font: string | null, weight: string | null = "400") => {
	let fontId = font || "";
	return new Promise((resolve) => {
		if (!font) {
			return resolve(font);
		}

		weight = weight || "400";
		if (weight && ["100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(weight)) {
			fontId = `${font}:${weight}`;
		}

		if (isFontRequested(fontId)) {
			return resolve(fontId);
		}

		requestedFonts.add(fontId);

		WebFont.load({
			google: {
				families: [fontId],
			},
			active: () => resolve(fontId),
			inactive: () => resolve(fontId),
		});
	});
};

/**
 * Parses an HTML string, extracts all font-family values, and loads them dynamically.
 * This is crucial when rendering saved content that requires fonts not initially loaded.
 */
export function setFontFromHTML(html: string) {
	const fontFamilies = html.match(/font-family: ([^;"]+)["|;]/g)?.map((fontFamily) => {
		return fontFamily.replace(/font-family: ([^;"]+)["|;]/, "$1");
	});
	if (fontFamilies) {
		fontFamilies.forEach((fontFamily) => {
			setFont(fontFamily, null);
		});
	}
}

export { fontList };
