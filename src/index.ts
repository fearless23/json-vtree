import VTree from "./vtree.js";
import { /*showJsonData,*/ createRootNode } from "./jsonToNode.js";

interface VisualizeOptions {
	json: unknown;
	container: HTMLElement;
	width?: number;
	height?: number;
}

export interface VisualizeOutput {
	/** tree produced from json */
	// tree: unknown;
	/** width of svg element created */
	width: number;
	/** height of svg element created */
	height: number;
	/** function to render svg on screen */
	render: () => void;
	/** update width of svg */
	update_width: (width: number) => VTree;
	/** update height of svg */
	update_height: (height: number) => VTree;
	/** get XML svg as a string */
	get_svg: () => string;
	/** set debug level, true/false; run render again to update */
	set_debug: (debug: boolean) => void;
}

export const visualize = ({
	json,
	container,
	width,
	height,
}: VisualizeOptions): VisualizeOutput => {
	const root = createRootNode(json);
	// const tree_root = showJsonData(root);
	const svg_width = width || container.clientWidth;
	const svg_height = height || 500;
	const vtree = new VTree(container, root, { width: svg_width, height: svg_height });
	return {
		// tree: tree_root,
		width: svg_width,
		height: svg_height,
		render: vtree.update,
		update_width: vtree.update_width,
		update_height: vtree.update_height,
		get_svg: vtree.get_svg_string,
		set_debug: vtree.set_debug,
	};
};
