import { G } from "../types";
import Node from "../node/node";
import ArrayNode from "../node/array";
import { diagonalLink } from "../util";

const MARGIN = 10;
const HEIGHT = 50;
const DURATION = 1000;

const calcChildrenWidth = (node: Node) => {
	if (node.children.length === 0) {
		return { childrenWidth: 0 };
	}

	let w = 0;
	node.children.forEach((child) => {
		w += child.totalWidth;
	});
	w += (node.children.length - 1) * MARGIN;
	return { childrenWidth: w };
};

const calcTotalSize = (node: Node, height: number) => {
	if (node.children.length === 0) {
		return { totalWidth: node.width, totalHeight: node.height };
	}

	const totalWidth = Math.max(node.width, node.childrenWidth);

	let maxChildH = 0;

	node.children.forEach((child) => {
		maxChildH = Math.max(maxChildH, child.totalHeight);
	});

	const totalHeight = node.height + height + maxChildH;
	return { totalWidth, totalHeight };
};

const layout = (node: Node, height: number) => {
	if (node.children.length === 0) {
		return;
	}

	let x = Math.round(node.width / 2) - Math.round(node.childrenWidth / 2);
	const y = node.height + height;

	node.children.forEach((child) => {
		child.x = x + Math.round(child.totalWidth / 2) - Math.round(child.width / 2);
		child.y = y;

		(child.g as G)
			.transition()
			.duration(DURATION)
			.attr("transform", `translate(${child.x},${child.y})`);

		x += child.totalWidth + MARGIN;
	});
};

const renderLinks = (node: Node) => {
	const src = {
		x: node.linkX,
		y: node.linkY,
	};

	node.children.forEach((child) => {
		const dst = {
			x: child.x + child.linkX,
			y: child.y + child.linkY,
		};

		if (child instanceof ArrayNode) {
			if (child.children.length !== 0) {
				const gc = child.children[0];
				dst.x += gc.x + gc.linkX;
				dst.y += gc.y + gc.linkY;
			}
		}

		const link = (node.g as G)
			.insert("path", ":first-child")
			.attr("class", "vtree-link")
			.attr("d", diagonalLink({ source: src, target: src }));

		link
			.transition()
			.duration(DURATION)
			.attr("d", diagonalLink({ source: src, target: dst }));
	});
};

export default class TreeLayout {
	height: number;
	constructor(options: { height?: number } = {}) {
		this.height = options.height || HEIGHT;
	}

	layout(node: Node) {
		const { childrenWidth } = calcChildrenWidth(node);
		node.childrenWidth = childrenWidth;
		const { totalWidth, totalHeight } = calcTotalSize(node, this.height);
		node.totalWidth = totalWidth;
		node.totalHeight = totalHeight;

		layout(node, this.height);
	}

	renderLinks(node: Node) {
		renderLinks(node);
	}
}
