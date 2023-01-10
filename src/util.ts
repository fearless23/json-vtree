import Node from "./node/node.js";
import { DiagonalData } from "./types.js";

const getAllNodes = (startingNode: Node): Node[] => {
	const nodes = [startingNode];
	const nodes2 = [];

	while (nodes.length !== 0) {
		const node = nodes.pop() as Node;
		nodes2.push(node);
		const children = node.children || [];
		nodes.push(...children);
	}

	return nodes2;
};

export const visitAfter = (node: Node, callback: (node: Node) => void) => {
	const nodes = getAllNodes(node);
	nodes.reverse().forEach(callback);
};

export const diagonalLink = (d: DiagonalData) => {
	return `M${d.source.x},${d.source.y}C${(d.source.x + d.target.x) / 2},${d.source.y} ${
		(d.source.x + d.target.x) / 2
	},${d.target.y} ${d.target.x},${d.target.y}`;
};
