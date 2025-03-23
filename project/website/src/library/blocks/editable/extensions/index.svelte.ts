import { Node, mergeAttributes } from "@tiptap/core";

import type { SelectItem } from "$lib/blocks/select/select.svelte";
import { channelMention, roleMention } from "@discordjs/formatters";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  type ClientRectObject,
  type VirtualElement,
} from "@floating-ui/dom";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import { mount, unmount, type ComponentProps } from "svelte";
import { SvelteNodeViewRenderer } from "svelte-tiptap";
import EmojiList from "../EmojiList.svelte";
import SuggestionList from "../SuggestionList.svelte";
import DiscordMention from "./custom/discord-mention.svelte";

export interface DiscordMentionOptions {
  type: "channel" | "role" | "everyone" | "here" | "emoji";
  char: string;
  data: SelectItem[];
}

export const CustomSuggestion = Node.create<DiscordMentionOptions>({
  atom: true,
  group: "inline",
  inline: true,

  addAttributes() {
    return {
      type: { default: null },
      name: { default: null },
      mention: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "discord-mention" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["discord-mention", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return SvelteNodeViewRenderer(DiscordMention);
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        items: ({ query }) => {
          return this.options.data.filter((item) => {
            return item.label.toLowerCase().includes(query.toLowerCase());
          });
        },
        char: this.options.char,
        editor: this.editor,
        pluginKey: new PluginKey(this.options.type),
        render: () => {
          let component: SuggestionList;
          let componentProps: ComponentProps<typeof SuggestionList> = $state(null!);

          let container: HTMLDivElement;
          let autoUpdateCleanup: () => void;

          return {
            onStart: (props) => {
              container = document.createElement("div");

              Object.assign(container.style, {
                position: "absolute",
                zIndex: 10000,
                opacity: 0,
                transform: "translate3d(0, -4px, 0) scale(0.95)",
                transition: "all 0.2s ease-in-out",
              });

              this.editor.view.dom.parentNode?.appendChild(container);

              componentProps = {
                type: this.options.type as any,
                items: props.items,
                command: props.command,
              };

              component = mount(SuggestionList, {
                target: container,
                props: componentProps,
              });

              const reference: VirtualElement = {
                getBoundingClientRect() {
                  return props.clientRect?.() as ClientRectObject;
                },
              };

              const updatePosition = () =>
                computePosition(reference, container, {
                  placement: "bottom-start",
                  middleware: [offset(6), flip()],
                }).then(({ x, y }) => {
                  Object.assign(container.style, {
                    top: `${y}px`,
                    left: `${x}px`,
                  });
                  requestAnimationFrame(() => {
                    Object.assign(container.style, {
                      opacity: 1,
                      transform: "translate3d(0, 0, 0) scale(1)",
                    });
                  });
                });

              autoUpdateCleanup = autoUpdate(reference, container, updatePosition);
            },
            onExit: () => {
              unmount(component);
              container.remove();
              autoUpdateCleanup();
            },
            onUpdate: (props) => {
              componentProps.items = props.items;
            },
            onKeyDown: (props) => {
              if (!component) return false;

              switch (props.event.key) {
                case "ArrowDown":
                  component.scrollDown();
                  return true;
                case "ArrowUp":
                  component.scrollUp();
                  return true;
                case "Enter":
                  component.selectHighlighted();
                  return true;
                default:
                  return false;
              }
            },
          };
        },
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
              {
                type: "discord-mention",
                attrs: {
                  type: this.options.type,
                  name: props.label,
                  mention: getMention(this.options.char, props.value),
                },
              },
              { type: "text", text: " " },
            ])
            .run();

          // get reference to `window` object from editor element, to support cross-frame JS usage
          editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
        },
      }),
    ];
  },
});

const getMention = (type: string, id: string) => {
  let raw = "";

  if (type === "role") {
    raw = roleMention(id);
  } else if (type === "channel") {
    raw = channelMention(id);
  } else if (type === "everyone") {
    raw = "@everyone";
  } else if (type === "here") {
    raw = "@here";
  }

  return raw;
};

export const TagExtention = CustomSuggestion.extend({
  name: "tag-mention",
  addOptions() {
    return {
      type: "role" as const,
      char: "{",
      data: [],
    };
  },
});

export const ChannelMention = CustomSuggestion.extend({
  name: "channel-mention",
  addOptions() {
    return {
      type: "channel" as const,
      char: "#",
      data: [],
    };
  },
});

export const RoleMention = CustomSuggestion.extend({
  name: "role-mention",
  addOptions() {
    return {
      type: "role" as const,
      char: "@",
      data: [],
    };
  },
});

type EmojiOptions = {
  SearchIndex: any;
};

export const Emoji = Node.create<EmojiOptions>({
  atom: true,
  group: "inline",
  inline: true,

  addAttributes() {
    return {
      type: { default: null },
      name: { default: null },
      mention: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return SvelteNodeViewRenderer(DiscordMention);
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        items: async ({ query }) => {
          const { SearchIndex } = await import("emoji-mart");

          const searchResults = await SearchIndex.search(query);

          console.log(searchResults);
          if (!searchResults) return [];

          return searchResults.map((result) => {
            const emoji = result.skins[0];

            return {
              label: emoji.shortcodes,
              value: getEmojiSrc(emoji),
              src: getEmojiSrc(emoji),
            };
          });
        },
        char: ":",
        editor: this.editor,
        pluginKey: new PluginKey("emoji"),
        render: () => {
          let component: EmojiList;
          let componentProps: ComponentProps<typeof EmojiList> = $state(null!);

          let container: HTMLDivElement;
          let autoUpdateCleanup: () => void;

          return {
            onStart: (props) => {
              // don't render if there are no items
              container = document.createElement("div");

              Object.assign(container.style, {
                position: "absolute",
                zIndex: 10000,
                opacity: 0,
                transform: "translate3d(0, -4px, 0) scale(0.95)",
                transition: "all 0.2s ease-in-out",
              });

              this.editor.view.dom.parentNode?.appendChild(container);

              componentProps = {
                items: props.items,
                command: props.command,
              };

              component = mount(EmojiList, {
                target: container,
                props: componentProps,
              });

              const reference: VirtualElement = {
                getBoundingClientRect() {
                  return props.clientRect?.() as ClientRectObject;
                },
              };

              const updatePosition = () =>
                computePosition(reference, container, {
                  placement: "bottom-start",
                  middleware: [offset(6), flip()],
                }).then(({ x, y }) => {
                  Object.assign(container.style, {
                    top: `${y}px`,
                    left: `${x}px`,
                  });
                  requestAnimationFrame(() => {
                    Object.assign(container.style, {
                      opacity: 1,
                      transform: "translate3d(0, 0, 0) scale(1)",
                    });
                  });
                });

              autoUpdateCleanup = autoUpdate(reference, container, updatePosition);
            },
            onExit: () => {
              unmount(component);
              container.remove();
              autoUpdateCleanup();
            },
            onUpdate: (props) => {
              componentProps.items = props.items;
            },
            onKeyDown: (props) => {
              if (!component) return false;

              switch (props.event.key) {
                case "ArrowDown":
                  component.scrollDown();
                  return true;
                case "ArrowUp":
                  component.scrollUp();
                  return true;
                case "Enter":
                  component.selectHighlighted();
                  return true;
                default:
                  return false;
              }
            },
          };
        },
        command: ({ editor, range, props }) => {
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(" ");

          if (overrideSpace) {
            range.to += 1;
          }

          console.log(props);

          editor.commands.setImage({
            src: props.src,
            alt: props.label,
          });

          // add space

          // get reference to `window` object from editor element, to support cross-frame JS usage
          editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
        },
      }),
    ];
  },
});

const getEmojiSrc = (emoji: { src?: string; unified?: string }) => {
  if (emoji.src) return emoji.src;
  // emoji.unified = emoji.unified?.endsWith("-fe0f") ? emoji.unified.slice(0, -5) : emoji.unified;
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${emoji.unified}.svg`;
};
