import { G } from "../types";
import Node from "../node/node";
import { diagonalLink } from "../util";

const DURATION = 1000;

const calcChildrenWidth = (node: Node) => {
	if (node.children.length === 0) {
		return { childrenWidth: 0 };
	}

	let w = 0;
	node.children.forEach((child) => {
		w += child.totalWidth;
	});
	w += (node.children.length - 1) * node.margin;
	return { childrenWidth: w };
};

const calcTotalSize = (node: Node) => {
	if (node.children.length === 0) {
		return { totalWidth: node.width, totalHeight: node.height };
	}

	const totalWidth = Math.max(node.width, node.childrenWidth);

	let maxChildH = 0;

	node.children.forEach((child) => {
		maxChildH = Math.max(maxChildH, child.totalHeight);
	});

	return { totalWidth, totalHeight: maxChildH };
};

const layout = (node: Node) => {
	if (node.children.length === 0) {
		return;
	}

	let x = -Math.round(node.childrenWidth / 2);
	const y = 0;

	node.children.forEach((child) => {
		child.x = x + Math.round(child.totalWidth / 2) - Math.round(child.width / 2);
		child.y = y;

		(child.g as G)
			.transition()
			.duration(DURATION)
			.attr("transform", `translate(${child.x},${child.y})`);

		x += child.totalWidth + node.margin;
	});
};

const renderLinks = (node: Node) => {
	if (node.children.length === 0) {
		return;
	}

	let h = node.children[0].linkY;

	node.children.forEach((child) => {
		h = Math.min(h, child.linkY);
	});

	const orig = { x: 0, y: 0 };

	for (let i = 1; i < node.children.length; i++) {
		const prev = node.children[i - 1];
		const child = node.children[i];

		const src = {
			x: prev.x + prev.linkX,
			y: prev.y + h,
		};

		const dst = {
			x: child.x + child.linkX,
			y: child.y + h,
		};

		const link = (node.g as G)
			.insert("path", ":first-child")
			.attr("class", "vtree-link")
			.attr("d", diagonalLink({ source: orig, target: orig }));

		link
			.transition()
			.duration(DURATION)
			.attr("d", diagonalLink({ source: src, target: dst }));
	}
};

export default class ArrayLayout {
	hideLinks: boolean = false;
	constructor(options: { hideLinks?: boolean } = {}) {
		this.hideLinks = !!options.hideLinks;
	}

	layout(node: Node) {
		const { childrenWidth } = calcChildrenWidth(node);
		node.childrenWidth = childrenWidth;

		const { totalWidth, totalHeight } = calcTotalSize(node);
		node.totalWidth = totalWidth;
		node.totalHeight = totalHeight;

		layout(node);
	}

	renderLinks(node: Node) {
		if (!this.hideLinks) {
			renderLinks(node);
		}
	}
}
