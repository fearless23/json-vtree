[![Publish to NPM](https://github.com/fearless23/json-vtree/actions/workflows/publish.yml/badge.svg)](https://github.com/fearless23/json-vtree/actions/workflows/publish.yml)

## JSON Visualizer
- Convert JSON to Visual Tree (SVG, PNG)
- Visualize JSON

### How to use
```tsx
import { Button } from "@mantine/core";
import { useRef, useState } from "react";
import { visualize, VisualizeOutput } from "@jaspreet23/json-vtree";

// this is optimized, new TreeNode is not created for every json change
// new TreeNode is only created once vtree.render is called
export const JsonVisualize = ({
	width,
	height,
	json,
}: {
	height?: number;
	width?: number;
	json: unknown;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [vtree, set_vtree] = useState<VisualizeOutput | null>(null);
	const [svg_text, set_svg_text] = useState("");
	const on_click_render = async () => {
		set_vtree(null);
		const container = containerRef.current as HTMLDivElement;
		if (!container) return;
		container.innerHTML = "";
		const vtree = visualize({ width, height, json, container });
		set_vtree(vtree);
		vtree.render();
	};

	const on_show_image = () => {
		set_svg_text(vtree.get_svg());
	};

	return (
		<>
			{vtree && <Button onClick={on_show_image}>Show Image</Button>}
			<Button onClick={on_click_render} variant="outline">
				Render
			</Button>
			<div
				style={{ border: "1px solid black", background: "white", height: "500px" }}
				ref={containerRef}
			/>
			{svg_text && (
				<img
					src={`data:image/svg+xml;utf8,${encodeURIComponent(svg_text)}`}
					alt={"Dfd"}
					style={{ width: "100%", minHeight: "500px" }}
				/>
			)}
		</>
	);
};
```