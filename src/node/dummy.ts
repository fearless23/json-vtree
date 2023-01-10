import { G } from "../types.js";
import Node from "./node.js";

export default class DummyNode extends Node {
	r = 4;
	type = "DummyNode";
	constructor(child: Node) {
		super(null, [child]);
	}

	render(g: G) {
		if (this.decorators.length === 0) {
			this._render(g); // if child node has this
			return;
		}

		let prevG = g.append("g");
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

	_render(g: G) {
		g.append("circle").attr("cx", this.r).attr("cy", this.r).attr("r", this.r);

		this.width = this.r * 2;
		this.height = this.r * 2;

		this.linkX = this.r;
		this.linkY = this.r;
	}
}
