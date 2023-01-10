import Node from "./node.js";
import ArrayLayout from "../layout/array.js";
import { G } from "../types.js";

const defaultLayout = new ArrayLayout();

const MARGIN = 10;

export default class ArrayNode extends Node {
	margin: number = MARGIN;
	type = "ArrayNode";
	constructor(nodes: Node[], layout?: ArrayLayout, options: { margin?: number } = {}) {
		if (!layout) layout = defaultLayout;
		super(null, nodes, layout);
		this.margin = options.margin || MARGIN;
	}

	render(_g: G) {}
}
