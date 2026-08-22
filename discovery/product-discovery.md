# Product Discovery

This document records decisions confirmed during product discovery. It will grow as the product proposition, audience, scope, and success measures are resolved.

## Confirmed decisions

### 1. Designing clothes is the primary outcome

The first version must treat designing clothes as a primary user outcome. The digital wardrobe, outfit visualisation, materials library, creator portfolio, and marketplace are supporting or future capabilities unless later discovery demonstrates that one is essential to completing the core design journey.

This changes the product's initial positioning from a general digital wardrobe into a fashion-creation product. The exact fidelity and endpoint of the design experience remain unresolved.

### 2. The first design output is a visual concept

A completed design in the first version communicates how a garment should look. A user can begin with a garment shape, apply colours, materials, and patterns, adjust supported visual details, add notes, and save the result.

The first version will not promise production-ready measurements, printable sewing patterns, technical specifications, or instructions sufficient to manufacture the garment. Later versions may add construction guidance, potentially including AI-generated steps, measurements, patterns, or other tools that help turn a visual concept into a real garment. These are future directions rather than first-version commitments.

### 3. Build a focused website prototype, not a large platform

The immediate goal is to design and build a good, working website. It should make the Creative Corner understandable and enjoyable for people without professional fashion-design training, especially aspiring and new designers.

The project is not currently committing to a startup-scale product, professional fashion software, a complete marketplace, subscriptions, advertising, local-shop partnerships, or AI construction guidance. Those ideas may remain in a future-possibilities document, but they must not expand the scope of the website being designed now.

The current design process will concentrate on the website's information hierarchy, navigation, visual identity, and a small but coherent interactive creation journey.

### 4. Garment reshaping is essential; freehand drawing is deferred

The first Creative Corner will start from existing garment shapes. A user must be able to personalize the outline using a cutting interaction; merely changing the garment's colour or surface appearance is insufficient.

A general freehand drawing tool is not required for the current website and may be added later. The precise meaning and interaction model of “cutting” must be resolved before the feature can be designed.

### 5. Cutting can remove any selected part of a garment

The cutting interaction must not be restricted to predefined areas such as sleeves, necklines, or hems. A user can select and remove any portion of the garment shape, enabling cropped, asymmetric, cut-out, and other personalised silhouettes.

The selection gesture, preview behaviour, and handling of disconnected garment pieces still need to be defined. Cutting must be reversible through undo so experimentation does not destroy the user's work.

### 6. Cutting uses a previewed lasso selection

The user marks a cut by tracing a closed, freeform lasso with a mouse or finger. The proposed removal is visually shaded before it is applied. The user can apply or cancel the preview, and can undo an applied cut.

The lasso may overlap a garment edge to alter its outer silhouette or remain inside the garment to make a cut-out. The website must not guess or remove anything before showing the preview.

### 7. Disconnected garment pieces remain on the canvas

When Cutting separates part of a garment from its main body, the disconnected piece remains visible on the design canvas. The website must not automatically discard it. This permits a Visual Design Concept to contain multiple garment pieces and leaves room for users to reuse cut portions creatively.

Disconnected pieces can be selected, moved, and rotated independently. Resizing, reattaching, and other transformations are not yet agreed.

### 8. Discovery grilling is paused

Further product questions are deliberately postponed at the user's request. The next session should resume from the unresolved questions below rather than reopening confirmed decisions.

## Open questions

- Who is the first version primarily designed for?
- Which supporting capabilities are essential to the first complete design journey?
- Can disconnected Garment Pieces be manually deleted, resized, or reattached?
- How should the website's three sections be presented now that creation is the primary focus?
- Which garment shapes are included in the first working website?
- What surface customisation is required: colour, visual texture, repeating pattern, or all three?
- How are designs saved in the prototype?
- What should work on touchscreens as well as with a mouse?
