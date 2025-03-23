import { Node } from "prosemirror-model";

export type NodeSerializerOptions = {
	state: MarkdownSerializerState;
	node: Node;
	parent: Node;
	index: number;
};
export type NodeSerializerSpec = (options: NodeSerializerOptions) => void;
export type NodeSerializerSpecs = Record<string, NodeSerializerSpec>;

export class MarkdownSerializerState {
	private nodes: NodeSerializerSpecs;
	private delimiter = "";
	private closed: Node | null;
	private inTightList: boolean;

	public out: string;

	public constructor(nodes: NodeSerializerSpecs) {
		this.nodes = nodes;
		this.delimiter = "";
		this.out = "";
		this.closed = null;
		this.inTightList = false;
	}

	public flushClose(size = 1) {
		if (this.closed) {
			this.ensureNewLine();
			if (size > 1) {
				let delimMin = this.delimiter;
				const trim = /\s+$/.exec(delimMin);
				if (trim) delimMin = delimMin.slice(0, delimMin.length - trim[0].length);
				for (let i = 1; i < size; i++) this.out += delimMin + "\n";
			}
			this.closed = null;
		}
	}

	public wrapBlock(newDelimiter: string, firstDelim: string | null, node: Node, f: () => void) {
		const oldDelimiter = this.delimiter;

		console.log({ oldDelimiter, newDelimiter });
		this.write(firstDelim || newDelimiter);
		this.delimiter = this.delimiter + newDelimiter;
		f();
		this.delimiter = oldDelimiter;
		this.closeBlock(node);
	}

	public atBlank() {
		return /(^|\n)$/.test(this.out);
	}

	public ensureNewLine() {
		if (!this.atBlank()) this.out += "\n";
	}

	public write(content?: string) {
		this.flushClose();
		if (this.delimiter && this.atBlank()) this.out += this.delimiter;
		if (content) this.out += content;
	}

	public closeBlock(node: Node) {
		this.closed = node;
	}

	public text(text: string, escape = true) {
		const lines = text.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const startOfLine = this.atBlank() || this.closed;
			this.write();
			this.out += escape ? this.esc(lines[i], Boolean(startOfLine)) : lines[i];
			if (i != lines.length - 1) this.out += "\n";
		}
	}

	public render(node: Node, parent: Node, index: number) {
		const spec = this.nodes[node.type.name];
		if (!spec) throw new Error(`Can't find node spec for type '${node.type.name}'`);
		spec({ state: this, node, parent, index });
	}

	public renderContent(parent: Node) {
		parent.forEach((node, _, i) => {
			this.render(node, parent, i);
		});
	}

	// Serialize a mark on a piece of text
	public renderMark(mark: any, text: string) {
		switch (mark.type.name) {
			case "bold":
				return `**${text}**`;
			case "code":
				return `\`${text}\``;
			case "italic":
				return `*${text}*`;
			case "strike":
				return `~~${text}~~`;
			case "underline":
				return `__${text}__`;
			default:
				return text; // For any unhandled marks, return the text unchanged
		}
	}

	// Modify renderInline to handle marks
	public renderInline(parent: Node) {
		parent.forEach((node, _, i) => {
			if (node.isText) {
				let text = node.text ?? "";

				if (node.marks) {
					node.marks.forEach((mark) => {
						text = this.renderMark(mark, text);
					});
				}
				this.text(text, false);
			} else {
				this.render(node, parent, i);
			}
		});
	}

	public renderList(node: Node, delim: string, firstDelim: (n: number) => string): void {
		if (this.closed && this.closed.type === node.type) {
			this.flushClose(3);
		} else if (this.inTightList) {
			this.flushClose(1);
		} else {
			this.flushClose(2);
		}

		const prevTight = this.inTightList;
		this.inTightList = true;
		node.forEach((child, _, i) => {
			if (i) this.flushClose(1);
			this.wrapBlock(delim, firstDelim(i), node, () => this.render(child, node, i));
		});
		this.inTightList = prevTight;
	}

	public esc(str: string, startOfLine?: boolean): string {
		str = str.replace(/[`*\\~\[\]]/g, "\\$&");
		if (startOfLine) str = str.replace(/^[:#\-*+]/, "\\$&").replace(/^(\d+)\./, "$1\\.");
		return str;
	}

	public quote(str: string): string {
		const wrap = !str.includes(`"`) ? `""` : !str.includes(`'`) ? `''` : `()`;
		return wrap[0] + str + wrap[1];
	}

	public repeat(str: string, n: number): string {
		let out = "";
		for (let i = 0; i < n; i++) out += str;
		return out;
	}

	public getEnclosingWhitespace(text: string) {
		return {
			leading: (/^(\s+)/.exec(text) || [])[0],
			trailing: (/(\s+)$/.exec(text) || [])[0],
		};
	}

	public trimWhitespace() {
		// remove all leading/trailing whitespace and newlines, tabs, and spaces, etc
		this.out = this.out.trim();
	}
}

export class MarkdownSerializer {
	private nodes: NodeSerializerSpecs;

	public constructor(nodes: NodeSerializerSpecs) {
		this.nodes = nodes;
	}

	public serialize(content: Node) {
		const state = new MarkdownSerializerState(this.nodes);
		state.renderContent(content);
		state.trimWhitespace();

		// Post-process to handle newlines after headings
		let output = state.out;
		// output = output.replace(/<!--HEADING_END-->\n+/g, "\n");
		output = output.replace(/<!--HEADING_END-->/g, "");

		return output;
	}
}

export const serializer = new MarkdownSerializer({
	blockquote: ({ state, node }) => {
		state.wrapBlock("> ", null, node, () => state.renderContent(node));
		state.out = state.out.replace(/\n>(\s*)$/g, "");
	},
	paragraph: ({ state, node }) => {
		if (!node.textContent) {
			return state.write("\n");
		}
		state.renderInline(node);
		state.closeBlock(node);
	},
	image: ({ state, node }) => {
		state.write(node.attrs.title);
	},
	heading: ({ state, node }) => {
		state.write(state.repeat("#", node.attrs.level) + " ");
		state.renderInline(node);
		state.closeBlock(node);
		state.write("<!--HEADING_END-->"); // Add a marker after each heading
	},
	bulletList: ({ state, node }) => {
		state.renderList(node, "  ", () => (node.attrs.bullet || "*") + " ");
	},
	listItem: ({ state, node }) => {
		state.renderContent(node);
	},
	codeBlock: ({ state, node }) => {
		// Make sure the front matter fences are longer than any dash sequence within it
		const backticks = node.textContent.match(/`{3,}/gm);
		const fence = backticks ? backticks.sort().slice(-1)[0] + "`" : "```";

		state.write(fence + (node.attrs.params || "") + "\n");
		state.text(node.textContent, false);
		// Add a newline to the current content before adding closing marker
		state.write("\n");
		state.write(fence);
		state.closeBlock(node);
	},
	tag: ({ state, node }) => {
		state.write(`{${node.attrs.id}}`);
	},
	hardBreak: ({ parent, state, node, index }) => {
		for (let i = index + 1; i < parent.childCount; i++) {
			if (parent.child(i).type != node.type) {
				state.write("\n");
				return;
			}
		}
	},
	mention: ({ state, node }) => {
		state.write(`${node.attrs.mention}`);
	},
	"channel-mention": ({ state, node }) => {
		state.write(`${node.attrs.channel}`);
	},
});
