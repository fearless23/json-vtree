import { G, PrimitiveValue } from "../types";
const MAX_LEN = 32;

interface AppendBBoxOptions {
	g: G;
	x: number;
	y: number;
	text: PrimitiveValue;
	pad: number;
}

const getClassName = (d: any) => {
	let name = "";
	const type = typeof d;

	if (d === null) {
		return "null-text";
	} else if (type === "string") {
		name = "string-text";
	} else if (type === "number") {
		name = "number-text";
	} else if (type === "boolean") {
		name = "boolean-text";
	} else {
		name = "unknown-text";
	}

	return name;
};

export const appendRectText = (params: AppendBBoxOptions) => {
	const { g, x, y, pad } = params;

	let text = params.text;
	if (typeof text === "string" && text.length > MAX_LEN) {
		text = `${text.substring(0, MAX_LEN)}...`;
	}

	const rect = g.append("rect").attr("class", getClassName(text));
	const t = g.append("text").text(text);
	const svg = t.node() as SVGTextElement;
	const b = svg.getBBox();
	const w = Math.ceil(b.width);
	const h = Math.ceil(b.height);

	t.attr("x", x + pad).attr("y", y + pad + h);
	const bbox = new BBox(x, y, w + pad * 2, h + pad * 2);

	rect.attr("x", bbox.x).attr("y", bbox.y).attr("width", bbox.width).attr("height", bbox.height);

	return bbox;
};

export class BBox {
	x = 0;
	y = 0;
	width = 0;
	height = 0;
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}
