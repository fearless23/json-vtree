import * as _d3 from "d3";
import Node from "./node/node.js";
import { visitAfter } from "./util.js";
import TableNode from "./node/table.js";
import ArrayNode from "./node/array.js";
import StringNode from "./node/string.js";
import TreeLayout from "./layout/tree.js";
import ArrayLayout from "./layout/array.js";
import { G, D3Zoom, D3SVGSVG } from "./types.js";

const WIDTH = 960;
const HEIGHT = 800;
const MARGIN = 20;

const DEFAULT_TREE_LAYOUT_HEIGHT = 50;
const DEBUG_TREE_LAYOUT_HEIGHT = 100;

const style = `
  .vtree-node text { font: 14px sans-serif; }
  .vtree-link { fill: none; stroke: #888; stroke-width: 2px; }
  .vtree-table { stroke-width: 2px; stroke: steelblue; }
  path.vtree-table { fill: white; }
  g.vtree-node rect { fill: white; stroke: black; stroke-width: 1px; }
  g.vtree-node rect.number-text { fill: #d8f0ed; }
  g.vtree-node rect.string-text { fill: #e7f0db; }
  g.vtree-node rect.boolean-text { fill: #e1d8f0; }
  g.vtree-node rect.null-text { fill: #888; }
`;

interface VTreeOptions {
	width?: number;
	height?: number;
}

interface VTreeD3 {
	container?: G;
	zoomListener?: D3Zoom;
	svg?: D3SVGSVG;
	g?: G;
}

export default class VTree {
	#_width: number;
	#_height: number;
	#root: ArrayNode;
	#defaultLayout: TreeLayout;
	#_debug: boolean;
	#d3: VTreeD3 = {};

	constructor(container: HTMLElement, root: ArrayNode, options: VTreeOptions = {}) {
		this.#root = root;
		this.#defaultLayout = new TreeLayout({ height: DEFAULT_TREE_LAYOUT_HEIGHT });
		this.#_width = options.width || WIDTH;
		this.#_height = options.height || HEIGHT;
		this.#_debug = false;

		this.update = this.update.bind(this);
		this.update_width = this.update_width.bind(this);
		this.update_height = this.update_height.bind(this);
		this.get_svg_string = this.get_svg_string.bind(this);
		this.debug_vtree = this.debug_vtree.bind(this);

		this.#d3.container = _d3.select(container);

		this.#d3.zoomListener = _d3
			.zoom()
			.scaleExtent([0.1, 10])
			.on("zoom", ({ transform }) => {
				if (this.#d3.g) {
					this.#d3.g.attr("transform", transform);
					// this.d3.g.attr('transform', `translate(${translate})scale(${scale})`);
				}
			});

		this.#d3.svg = (this.#d3.container as G)
			.append("svg")
			.attr("class", "vtree")
			.attr("width", this.#_width)
			.attr("height", this.#_height)
			.call(this.#d3.zoomListener);
	}

	update_width(width: number) {
		this.#_width = width;
		(this.#d3.container as G).select("svg").attr("width", width);
		return this;
	}

	update_height(height: number) {
		this.#_height = height;
		(this.#d3.container as G).select("svg").attr("height", height);
		return this;
	}

	debug_vtree(debug: boolean) {
		if (debug) {
			this.#defaultLayout.height = DEBUG_TREE_LAYOUT_HEIGHT;
		} else {
			this.#defaultLayout.height = DEFAULT_TREE_LAYOUT_HEIGHT;
		}
		this.#_debug = debug;
		return this;
	}

	/** set debug level, true/false; run render again to update */
	set_debug(debug: boolean) {
		this.#_debug = debug;
	}

	get_svg_string() {
		const svg = (this.#d3.svg as D3SVGSVG).node() as SVGSVGElement;
		const serializer = new XMLSerializer();
		let source = serializer.serializeToString(svg);
		if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
			source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
		}
		if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
			source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
		}

		source = `<?xml version="1.0" standalone="no"?>\r\n${source}`;
		return source;
	}

	#createTreeGroups(parentG: G, depth: number) {
		let hasChildren = false;

		const g = parentG
			.selectAll("g.vtree-node")
			.data(function (d) {
				if (d.children.length !== 0) {
					hasChildren = true;
				}

				return d.children;
			})
			.enter()
			.append("g")
			.attr("class", "vtree-node")
			.each(function (d) {
				(d as Node).g = _d3.select(this);
			});

		if (hasChildren) {
			this.#createTreeGroups(g, depth + 1);
		}
	}

	update() {
		const root = {
			id: 1,
			children: [this.#root],
		};

		(this.#d3.svg as D3SVGSVG).selectAll("*").remove();
		(this.#d3.svg as D3SVGSVG).append("style").text(style);

		this.#_debugDrawGrid();

		const g: unknown = (this.#d3.svg as D3SVGSVG)
			.selectAll("g.vtree-root")
			.data([root])
			.enter()
			.append("g")
			.attr("class", "vtree-root");

		this.#d3.g = g as G;

		this.#createTreeGroups(this.#d3.g, 0);

		visitAfter(this.#root, (node) => {
			node.render(node.g as G);

			// root has hideLinks:true Arraylayout
			// ArrayNode has hideLinks:false ArrayLayout
			// StringNode has no layout
			// TableNode has no layout
			// DummyNode has no layout

			// this.defaultLayout = new TreeLayout({ height: DEFAULT_TREE_LAYOUT_HEIGHT });

			// So, layout = ArrayLayout or TreeLayout
			const layout = node.layout || this.#defaultLayout;
			layout.layout(node);
			layout.renderLinks(node);
		});

		if (this.#_debug) {
			visitAfter(this.#root, (node) => {
				this.#_debugDrawNodeInfo(node);
			});
		}

		this.#setRootPos();

		return this;
	}

	#setRootPos() {
		this.#root.x = Math.round((this.#_width - this.#root.width) / 2);
		this.#root.y = Math.round((this.#_height - this.#root.totalHeight) / 2);

		if (this.#root.y < MARGIN) {
			this.#root.y = MARGIN;
		}

		(this.#root.g as G).attr("transform", `translate(${this.#root.x},${this.#root.y})`);
	}

	#_debugGetG() {
		if (!this.#_debug) return;
		const g = (this.#d3.svg as D3SVGSVG).select("g.debug-info");
		if (!g.empty()) return g;
		return (this.#d3.svg as D3SVGSVG).append("g").attr("class", "debug-info");
	}

	#_debugDrawGrid() {
		if (!this.#_debug) return;
		const g = this.#_debugGetG() as G;
		g.append("line")
			.style("stroke", "red")
			.attr("x1", this.#_width / 2)
			.attr("y1", 0)
			.attr("x2", this.#_width / 2)
			.attr("y2", this.#_height);
		g.append("line")
			.style("stroke", "red")
			.attr("x1", 0)
			.attr("y1", this.#_height / 2)
			.attr("x2", this.#_width)
			.attr("y2", this.#_height / 2);
	}

	#_debugDrawNodeInfo(node: Node) {
		if (node instanceof ArrayNode) return;
		// node rect
		(node.g as G)
			.append("rect")
			.style("fill", "none")
			.style("stroke", "tomato")
			.attr("x", -1)
			.attr("y", -1)
			.attr("width", node.width + 2)
			.attr("height", node.height + 2);

		// node total rect
		(node.g as G)
			.append("rect")
			.style("fill", "none")
			.style("stroke", "mediumpurple")
			.attr("x", (node.width - node.totalWidth) / 2)
			.attr("y", 0)
			.attr("width", node.totalWidth)
			.attr("height", node.totalHeight);

		// x, y
		const xy = (node.g as G).append("text").text(`x=${node.x} y=${node.y}`);

		const bbox = (xy.node() as SVGTextElement).getBBox();
		const x = node.width / 2;
		let y = node.height + bbox.height + 2;

		xy.attr("x", x).attr("y", y).attr("text-anchor", "middle");

		y += bbox.height + 2;

		// width, height
		(node.g as G)
			.append("text")
			.text(`w=${node.width} h=${node.height}`)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle");

		y += bbox.height + 2;

		// totalWidth, totalHeight
		(node.g as G)
			.append("text")
			.text(`tw=${node.totalWidth} th=${node.totalHeight}`)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle");

		y += bbox.height + 2;

		// childrenWidth
		(node.g as G)
			.append("text")
			.text(`cw=${node.childrenWidth}`)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle");
	}
}

export const operations = {
	node: {
		Node: Node,
		String: StringNode,
		Table: TableNode,
		Array: ArrayNode,
	},
	layout: {
		Tree: TreeLayout,
		Array: ArrayLayout,
	},
};
