import StringNode from "./node/string";
import ArrayNode from "./node/array";
import ArrayLayout from "./layout/array";
import TableNode from "./node/table";
import DummyNode from "./node/dummy";
import LinkNameDecorator from "./decorator/linkName";
import { PrimitiveValue, ObjectTypeNode } from "./types";

const isPrimitive = (d: any) => {
	const type = typeof d;
	if (d === null || type === "string" || type === "number" || type === "boolean") {
		return true;
	}
	return false;
};

const detectJsonType = (json: unknown) => {
	if (isPrimitive(json)) return "PRIMITIVE";
	if (Array.isArray(json)) {
		const data = json as unknown[];
		const some_non_primitive = data.some((i) => !isPrimitive(i));
		return some_non_primitive ? "ARRAY" : "PRIMITIVE_ARRAY";
	}
	return "OBJECT";
};

const handlePrimitiveType = (json: unknown, linkName: string) => {
	const data = json as PrimitiveValue;
	const node = new StringNode(data);
	if (linkName) {
		node.decorators.push(new LinkNameDecorator(linkName));
	}
	return node;
};

const handleArrayType = (json: unknown, linkName: string) => {
	const data = json as unknown[];
	const nodes = [];

	data.forEach((item, i) => {
		if (Array.isArray(item)) {
			const y = jsonToNode(item, "");
			const node = new DummyNode(y);
			node.decorators.push(new LinkNameDecorator(`${linkName}[${i}]`));
			nodes.push(node);
		} else {
			const node = jsonToNode(item, `${linkName}[${i}]`);
			nodes.push(node);
		}
	});

	// empty array
	if (nodes.length === 0) {
		const node = jsonToNode(null, `${linkName}[]`);
		nodes.push(node);
	}

	return new ArrayNode(nodes);
};

type Row = [string, unknown];
const handleObjectType = (json: unknown, linkName: string) => {
	const data = json as { [key: string]: unknown };
	const tbl: Row[] = [];
	const children: ObjectTypeNode[] = [];

	Object.keys(data).forEach((key) => {
		const value = data[key];

		const type = detectJsonType(value);

		if (type === "PRIMITIVE") {
			tbl.push([key, value]);
		} else if (type === "PRIMITIVE_ARRAY") {
			tbl.push([key, (value as unknown[]).join(", ")]);
		} else {
			children.push(jsonToNode(value, key));
		}
	});

	const table_data = tbl.length === 0 ? [[" ", " "]] : tbl;
	const node = new TableNode(table_data, children, linkName);
	if (linkName) {
		node.decorators.push(new LinkNameDecorator(linkName));
	}
	return node;
};

export const jsonToNode = (json: unknown, linkName: string): ObjectTypeNode => {
	const type = detectJsonType(json);

	// string node -> no layout
	if (type === "PRIMITIVE") return handlePrimitiveType(json, linkName);

	if (type === "PRIMITIVE_ARRAY") {
		const data = (json as PrimitiveValue[]).join(", ");
		return handlePrimitiveType(data, linkName);
	}
	// get default layout:new ArrayLayout(); and margin=10
	if (type === "ARRAY") return handleArrayType(json, linkName);

	// string node -> no layout
	return handleObjectType(json, linkName);
};

export const showJsonData = (jsonToNodeData: ObjectTypeNode): unknown => {
	const children = jsonToNodeData.children;
	const data = jsonToNodeData.data;
	const type = jsonToNodeData.type;
	const decorators = jsonToNodeData.decorators.map((i) => i.linkName);

	const childs = JSON.parse(JSON.stringify(children.map((i) => showJsonData(i as ObjectTypeNode))));

	const show = {
		id: jsonToNodeData.id,
		children: childs,
		data: JSON.parse(JSON.stringify(data)),
		type,
		decorators,
	};

	return show;
};

export const createRootNode = (json: unknown, rootName: string = "root") => {
	const data = jsonToNode(json, rootName);
	const root = new ArrayNode([], new ArrayLayout({ hideLinks: true }));
	root.children = [data];
	return root;
};
