import { G, PrimitiveValue } from "../types.js";
import Node from "./node.js";
import { appendRectText } from "./util.js";

export default class StringNode extends Node {
	textPad: number = 4;
	type = "StringNode";
	constructor(data: PrimitiveValue) {
		super(data, []);
	}

	_render(g: G) {
		const bbox = appendRectText({
			g,
			x: 0,
			y: 0,
			text: this.data as PrimitiveValue,
			pad: this.textPad,
		});

		this.width = bbox.width;
		this.height = bbox.height;

		this.linkX = Math.round(this.width / 2);
		this.linkY = Math.round(this.height / 2);
	}

	render(g: G) {
		if (this.decorators.length === 0) {
			this._render(g); // if child node has this
			return;
		}

		var prevG = g.append("g");
		this._render(prevG);

		this.decorators.forEach((decorator) => {
			const newG = g.append("g");

			const dbbox = decorator.render(newG, this.width);

			if (dbbox.dw || dbbox.dh) {
				this.width += dbbox.dw;
				this.height += dbbox.dh;
			}

			if (dbbox.dx || dbbox.dy) {
				prevG.attr("transform", `translate(${dbbox.dx},${dbbox.dy})`);

				this.linkX += dbbox.dx;
				this.linkY += dbbox.dy;
			}

			prevG = newG;
		});
	}
}
