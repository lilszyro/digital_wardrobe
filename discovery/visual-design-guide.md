# Visual Design Guide

These diagrams translate the confirmed discovery decisions into visual models. They describe the intended website experience, not a commitment to a large application or a final technical architecture.

## Diagram set

### Website map

Source: [`../docs/diagrams/website-map.puml`](../docs/diagrams/website-map.puml)

This information map keeps the existing three-section idea while making Creative Corner the primary destination. It highlights which areas are part of the focused website and isolates later ideas so they do not silently become current scope.

### Creative Corner user journey

Source: [`../docs/diagrams/creative-corner-journey.puml`](../docs/diagrams/creative-corner-journey.puml)

An activity diagram fits this journey because it shows the user's choices, experimentation loop, and route from choosing a garment to saving a Visual Design Concept.

### Cutting interaction states

Source: [`../docs/diagrams/cutting-tool-states.puml`](../docs/diagrams/cutting-tool-states.puml)

A state diagram makes the safety behaviour explicit: tracing a lasso does not alter the garment until the preview is confirmed, and an applied cut can be undone.

### Creative Corner desktop wireframe

Source: [`../docs/diagrams/creative-corner-wireframe.puml`](../docs/diagrams/creative-corner-wireframe.puml)

The wireframe gives the ideas a spatial form. It prioritises the garment canvas, keeps creation controls nearby, and separates the shape/material library from the contextual controls for cutting and manipulating pieces. It is a thinking aid rather than final visual styling.

## Questions exposed by the diagrams

- Should the homepage continue to give all three sections equal visual weight when designing is the primary outcome?
- Should the wardrobe supply garments that can be opened in Creative Corner, or remain a separate outfit-planning area?
- Which starter garment shapes make the prototype feel useful without creating too much content work?
- Does “material” mean a purely visual texture in this version, or should it include real fabric information?
- Should a saved design live only in the browser, be downloadable as an image, or require an account?
- On a phone, should lasso cutting use a finger, a stylus, or both?
- Can disconnected Garment Pieces be deleted, resized, layered, duplicated, or reattached?

## Suggested next grilling point

When discovery resumes, begin with the homepage hierarchy: decide whether Creative Corner is the main call to action and how prominently My Clothes and My Accessories should appear. That decision affects the navigation and every wireframe that follows.
