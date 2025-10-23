import { mergeAttributes, Node } from "@tiptap/core";
import type { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { SvelteNodeViewRenderer } from "svelte-tiptap";
import TagComponent from "./extensions/custom/tag.svelte";

// See `addAttributes` below
export interface TagNodeAttrs {
	/**
	 * The identifier for the selected item that was mentioned, stored as a `data-id`
	 * attribute.
	 */
	id: string | null;
	/**
	 * The label to be rendered by the editor as the displayed text for this mentioned
	 * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
	 */
	label?: string | null;

	/**
	 * Index signature to satisfy Record constraint.
	 */
	[key: string]: string | number | boolean | null | undefined;
}

export type TagOptions<
	SuggestionItem = unknown,
	Attrs extends Record<string, string | number | boolean | null | undefined> = TagNodeAttrs,
> = {
	/**
	 * The HTML attributes for a tag node.
	 * @default {}
	 * @example { class: 'foo' }
	 */
	HTMLAttributes: Record<string, object>;

	/**
	 * A function to render the label of a tag.
	 * @deprecated use renderText and renderHTML instead
	 * @param props The render props
	 * @returns The label
	 * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
	 */
	renderLabel?: (props: { options: TagOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => string;

	/**
	 * A function to render the text of a tag.
	 * @param props The render props
	 * @returns The text
	 * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
	 */
	renderText: (props: { options: TagOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => string;

	/**
	 * A function to render the HTML of a tag.
	 * @param props The render props
	 * @returns The HTML as a ProseMirror DOM Output Spec
	 * @example ({ options, node }) => ['span', { 'data-type': 'tag' }, `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`]
	 */
	renderHTML: (props: { options: TagOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => DOMOutputSpec;

	/**
	 * Whether to delete the trigger character with backspace.
	 * @default false
	 */
	deleteTriggerWithBackspace: boolean;

	/**
	 * The suggestion options.
	 * @default {}
	 * @example { char: '@', pluginKey: TagPluginKey, command: ({ editor, range, props }) => { ... } }
	 */
	suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, "editor">;
};

/**
 * The plugin key for the mention plugin.
 * @default 'tag'
 */
export const TagPluginKey = new PluginKey("tag");

export const Tag = Node.create<TagOptions>({
	name: "tag",
	priority: 101,
	group: "inline",
	inline: true,
	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
			renderText({ options, node }) {
				return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}}`;
			},
			deleteTriggerWithBackspace: false,
			renderHTML() {
				return ["tag", mergeAttributes(this.HTMLAttributes)];
			},
			suggestion: {
				char: "{",
				pluginKey: TagPluginKey,
				command: ({ editor, range, props }) => {
					const nodeAfter = editor.view.state.selection.$to.nodeAfter;
					const overrideSpace = nodeAfter?.text?.startsWith(" ");

					if (overrideSpace) {
						range.to += 1;
					}

					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{ type: this.name, attrs: props },
							{ type: "text", text: " " },
						])
						.run();

					// get reference to `window` object from editor element, to support cross-frame JS usage
					editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
				},
				allow: ({ state, range }) => {
					const $from = state.doc.resolve(range.from);
					const type = state.schema.nodes[this.name];
					const allow = !!$from.parent.type.contentMatch.matchType(type);

					return allow;
				},
			},
		};
	},

	addAttributes() {
		return {
			id: { default: null },
		};
	},

	parseHTML() {
		return [{ tag: "tag" }];
	},

	renderHTML({ HTMLAttributes }) {
		return ["tag", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return SvelteNodeViewRenderer(TagComponent);
	},

	addKeyboardShortcuts() {
		return {
			Backspace: () =>
				this.editor.commands.command(({ tr, state }) => {
					let isTag = false;
					const { selection } = state;
					const { empty, anchor } = selection;

					if (!empty) {
						return false;
					}

					state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
						if (node.type.name === this.name) {
							isTag = true;
							tr.insertText(
								this.options.deleteTriggerWithBackspace ? "" : this.options.suggestion.char || "",
								pos,
								pos + node.nodeSize,
							);

							return false;
						}
					});

					return isTag;
				}),
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});
