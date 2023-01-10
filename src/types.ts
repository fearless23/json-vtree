import * as d3 from "d3";
import ArrayNode from "./node/array.js";
// import DummyNode from './node/dummy';
import StringNode from "./node/string.js";
import TableNode from "./node/table.js";
export type G = d3.Selection<any, any, null, undefined>;
export type D3SVGG = d3.Selection<SVGGElement, any, null, undefined>;
export type D3SVGSVG = d3.Selection<SVGSVGElement, any, null, undefined>;
export type D3Zoom = d3.ZoomBehavior<any, any>;
export type PrimitiveValue = string | number | boolean | null;
export type ObjectTypeNode = StringNode | ArrayNode | TableNode;

export interface DiagonalData {
	source: {
		x: number;
		y: number;
	};
	target: {
		x: number;
		y: number;
	};
}
