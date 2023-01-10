/**
 * Node
 *
 * A tree consists of nodes and links.
 * A node consists of the following fields:
 *
 * - id : auto increment ID.
 * - data : data which may be displayed.
 *          The data format is determined by the renderer.
 * - children : children of the node
 */

import * as dd3 from "d3";
import ArrayLayout from "../layout/array";
import LinkNameDecorator from "../decorator/linkName";

type G = dd3.Selection<any, any, null, undefined>;

let curMaxId = 0;

export default class Node {
	id: number = 0;
	data: unknown;
	children: Node[] = [];
	width: number = 0;
	height: number = 0;
	linkX: number = 0;
	linkY: number = 0;

	decorators: LinkNameDecorator[] = [];
	layout?: ArrayLayout;
	// calculated properties
	childrenWidth: number = 0;
	totalWidth: number = 0;
	totalHeight: number = 0;
	margin: number = 0;
	textPad: number = 0;
	r: number = 0;
	x: number = 0;
	y: number = 0;
	g: G | null = null; // inserted by createTreeGroups
	type = "Node";

	constructor(data: any, children: Node[], layout?: ArrayLayout) {
		this.id = ++curMaxId;
		this.data = data;
		this.children = children;
		this.layout = layout;
	}

	render(_g: G) {}
}
