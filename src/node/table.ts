import Node from "./node";
import { appendRectText, BBox } from "./util";
import { G, PrimitiveValue, D3SVGG } from "../types";

type TableRow = { g: D3SVGG; bbox: BBox }[];
type Table = TableRow[];

const calcMaxWidths = (tbl: Table) => {
	const maxW: number[] = [];

	for (let colI = 0; colI < tbl[0].length; colI++) {
		let w = 0;

		for (let rowI = 0; rowI < tbl.length; rowI++) {
			w = Math.max(w, tbl[rowI][colI].bbox.width);
		}

		maxW.push(w);
	}

	return maxW;
};

const calcMaxHeights = (tbl: Table) => {
	const maxH: number[] = [];

	tbl.forEach((row) => {
		let h = 0;

		row.forEach((col) => {
			h = Math.max(h, col.bbox.height);
		});

		maxH.push(h);
	});

	return maxH;
};

export default class TableNode extends Node {
	textPad = 4;
	type = "TableNode";
	linkName = "";
	constructor(data: unknown[][], children: Node[], linkName: string) {
		super(data, children);
		// const obj = {} as { [key: string]: unknown };
		// data.forEach(([k, v]) => (obj[k as string] = v))
		// console.log(`${linkName} ->`, obj)
		this.linkName = linkName;
	}

	_render(g: G) {
		const data = this.data as unknown[][];
		if (data.length === 0 || data[0].length === 0) {
			return;
		}

		const tbl = this.renderCells(g);
		const size = this.layoutCells(tbl);

		this.width = size.width;
		this.height = size.height;

		this.linkX = Math.round(this.width / 2);
		this.linkY = Math.round(this.height / 2);
	}

	renderCells(g: G) {
		const data = this.data as unknown[][];
		const tbl: Table = [];

		data.forEach((row) => {
			const tblRow: TableRow = [];
			row.forEach((col) => {
				const colG = g.append("g");
				const bbox = appendRectText({
					g: colG,
					x: 0,
					y: 0,
					text: col as PrimitiveValue,
					pad: this.textPad,
				});

				tblRow.push({ g: colG, bbox });
			});

			tbl.push(tblRow);
		});

		return tbl;
	}

	layoutCells(tbl: Table) {
		const maxW = calcMaxWidths(tbl);
		const maxH = calcMaxHeights(tbl);

		let x = 0;
		let y = 0;

		tbl.forEach((row, rowI) => {
			x = 0;

			row.forEach((col, colI) => {
				col.g.attr("transform", `translate(${x},${y})`);
				col.g
					.select("rect")
					.attr("width", maxW[colI])
					.attr("height", maxH[rowI]);

				x += maxW[colI];
			});

			y += maxH[rowI];
		});

		return { width: x, height: y };
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
