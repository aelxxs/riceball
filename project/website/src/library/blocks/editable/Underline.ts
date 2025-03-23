import { Mark, markInputRule, markPasteRule, mergeAttributes } from "@tiptap/core";

export interface UnderlineOptions {
  /**
   * HTML attributes to add to the underline element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    underline: {
      /**
       * Set a underline mark
       * @example editor.commands.setUnderline()
       */
      setUnderline: () => ReturnType;
      /**
       * Toggle a underline mark
       * @example editor.commands.toggleUnderline()
       */
      toggleUnderline: () => ReturnType;
      /**
       * Unset a underline mark
       * @example editor.commands.unsetUnderline()
       */
      unsetUnderline: () => ReturnType;
    };
  }
}

/**
 * Matches a underline to a __underline__ on input.
 */
export const inputRegex = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/;

/**
 * Matches a underline to a __underline__ on paste.
 */
export const pasteRegex = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g;

/**
 * This extension allows you to create underline text.
 * @see https://www.tiptap.dev/api/marks/underline
 */
export const Underline = Mark.create<UnderlineOptions>({
  name: "underline",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "u",
      },
      {
        tag: "del",
      },
      {
        tag: "underline",
      },
      {
        style: "text-decoration",
        consuming: false,
        getAttrs: (style) => ((style as string).includes("line-through") ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["u", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setUnderline:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleUnderline:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetUnderline:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-u": () => this.editor.commands.toggleUnderline(),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ];
  },
});
