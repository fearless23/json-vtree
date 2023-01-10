import * as dd3 from "d3";

type G = dd3.Selection<any, any, null, undefined>;
const pad = 4;

export default class LinkNameDecorator {
	linkName: string;
	constructor(linkName: string) {
		this.linkName = linkName;
	}

	render(g: G, width: number) {
		const t = g.append("text").text(this.linkName);
		const svg = t.node() as SVGTextElement;
		const b = svg.getBBox();
		const textW = Math.ceil(b.width);
		const textH = Math.ceil(b.height);
		const textTotalW = textW + pad * 2;

		let newW = width;
		if (textTotalW > width) newW = textTotalW;

		const textTotalH = textH + pad;

		const dw = newW - width;
		const dh = textTotalH;
		const dx = Math.round(dw / 2);
		const dy = textTotalH;

		t.attr("x", Math.round(newW / 2))
			.attr("y", textH)
			.attr("text-anchor", "middle");

		return { dx, dy, dw, dh };
	}
}
