[![Publish to NPM](https://github.com/fearless23/json-vtree/actions/workflows/publish.yml/badge.svg)](https://github.com/fearless23/json-vtree/actions/workflows/publish.yml)

## JSON Visualizer
- Convert JSON to Visual Tree (SVG, PNG)
- Visualize JSON

### How to use
```tsx
import { Button } from ".///";
import { useRef, useState } from "react";
import { visualize, VisualizeOutput } from "@jaspreet23/json-vtree";

type JsonVisualizeParams = { height?: number; width?: number; json: unknown };

const SvgAsImage = ({ svgText }: { svgText: string }) => (
	<img
		src={`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`}
		alt={"json-vtree"}
		style={{ width: "100%", minHeight: "500px" }}
	/>
);

// this is optimized, new TreeNode is not created for every json change
// new TreeNode is only created once vtree.render is called
export const JsonVisualize = ({ width, height, json }: JsonVisualizeParams) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [vtree, setVtree] = useState<VisualizeOutput | null>(null);
	const [svgText, setSvgText] = useState("");
	const onShowImage = () => setSvgText(vtree.get_svg());
	const onClickRender = async () => {
		setVtree(null);
		const container = containerRef.current as HTMLDivElement;
		if (!container) return;
		container.innerHTML = "";
		const vtree = visualize({ width, height, json, container });
		setVtree(vtree);
		vtree.render();
	};

	return (
		<>
			{vtree && <Button onClick={onShowImage}>Show Image</Button>}
			<Button onClick={onClickRender}>Render</Button>
			<div style={{ height: "500px" }} ref={containerRef} />
			{svgText && <SvgAsImage svgText={svgText} />}
		</>
	);
};
```