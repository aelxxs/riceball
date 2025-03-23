<script lang="ts">
  import type { DashboardGuild } from "$lib/types";
  import { markdownToHTML, serializer } from "@riceball/markdown";
  import CharacterCount from "@tiptap/extension-character-count";
  import Image from "@tiptap/extension-image";
  import Placeholder from "@tiptap/extension-placeholder";
  import StarterKit from "@tiptap/starter-kit";
  import twemoji from "@twemoji/api";
  import { onMount } from "svelte";
  import { createEditor, Editor, EditorContent } from "svelte-tiptap";
  import { type Readable } from "svelte/store";
  import { fade } from "svelte/transition";
  import EmojiPicker from "../emoji-picker/emoji-picker.svelte";
  import { Underline } from "./Underline";
  import {
    ChannelMention,
    Emoji,
    RoleMention,
    TagExtention,
  } from "./extensions/index.svelte";

  type Props = {
    type: "text" | "textarea";
    placeholder: string;
    value?: string | null;
    maxLength: number | null;
    guild: DashboardGuild;
    class?: string;
    noEmojiPicker?: boolean;
    styled?: boolean;
    editable?: boolean;
  };

  let {
    type = "textarea",
    placeholder,
    value = $bindable(),
    maxLength = 2000,
    guild,
    class: className,
    noEmojiPicker = false,
    styled = false,
    editable = $bindable(true),
  }: Props = $props();

  const channels = guild.itemizedChannels;
  const roles = guild.itemizedRoles;

  let editor = $state() as Readable<Editor>;

  onMount(() => {
    const extensions = [
      Image.configure({
        HTMLAttributes: { class: "tiptap-img" },
        inline: true,
      }),
      StarterKit.configure({
        horizontalRule: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ChannelMention.configure({ data: channels }),
      RoleMention.configure({ data: roles }),
      TagExtention.configure({
        data: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
          { value: "tag3", label: "Tag 3" },
        ],
      }),
      Emoji,
      Placeholder.configure({
        placeholder: placeholder ?? "Start typing...",
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Underline,
    ];

    const content = markdownToHTML(value ?? "", {
      channels: guild.channels,
      roles: guild.roles,
    });

    editor = createEditor({
      editable,
      content: content,
      editorProps: {
        attributes: {
          class:
            type === "text"
              ? `rich-text ${className}`
              : `rich-textarea ${className}`,
        },
      },
      extensions,
    });
  });

  $effect(() => {
    if ($editor) {
      value = serializer.serialize($editor.state.doc);
    }
  });

  $effect(() => {
    if ($editor) {
      if (!editable) {
        $editor.setOptions({ editable: false });
      } else {
        $editor.setOptions({ editable: true });
      }
    }
  });

  const getEmojiSrc = (emoji: { src?: string; unified?: string }) => {
    if (emoji.src) return emoji.src;
    // emoji.unified = emoji.unified?.endsWith("-fe0f")
    //   ? emoji.unified.slice(0, -5)
    //   : emoji.unified;

    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${emoji.unified}.svg`;
  };

  let emojiPickerOpen = $state(false);
  let emojiPickerHover = $state(false);

  let isFocused = $derived($editor?.isFocused);

  const lineCount = $derived.by(() => {
    if (!$editor) return 0;
    return $editor.getText().split("\n").length;
  });

  const characterCount = $derived.by(() => {
    if (!$editor) return 0;
    return $editor.storage.characterCount.characters();
  });
</script>

<div class="textarea" class:pad-right={!noEmojiPicker} class:styled>
  <EditorContent editor={$editor} />
  {#if maxLength && lineCount > 1}
    <small class="character-count">
      {characterCount} / {maxLength}
      <EmojiPicker
        bind:open={emojiPickerOpen}
        {guild}
        onEmojiPick={(emoji) => {
          $editor.commands.setImage({
            src: getEmojiSrc(emoji),
            title: emoji.native ?? emoji.id,
          });
          $editor = $editor;
        }}
      />
    </small>
  {/if}
  {#if !noEmojiPicker}
    <div class="emoji-picker" transition:fade={{ duration: 200 }}>
      <EmojiPicker
        bind:open={emojiPickerOpen}
        {guild}
        onEmojiPick={(emoji) => {
          // console.log("emoji pick");
          // const em = twemoji.parse(emoji.native, {
          //   folder: "svg",
          //   ext: ".svg",
          // });

          // console.log({ em });

          $editor.commands.setImage({
            src: getEmojiSrc(emoji),
            title: emoji.native ?? emoji.id,
          });
          $editor = $editor;
        }}
      />
    </div>
  {/if}
</div>

<style is:global>
  .textarea {
    flex: 1;
    position: relative;
    width: 100%;
    overflow-wrap: break-word;
  }

  .styled {
    width: 100%;
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-body);
    letter-spacing: var(--letter-spacing-normal);
    border: 1px solid var(--clr-bg-border);
    border: 1.5px solid transparent;
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-xs);
    color: var(--txt-main);
    background-color: var(--clr-bg-input);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    outline: 2px solid transparent;
    resize: vertical;
  }

  .styled::placeholder {
    color: var(--txt-main);
    opacity: 0.5;
  }

  .styled:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    resize: none;
  }

  /* .styled:hover {
    border-color: var(--clr-bg-border-hover);
  } */

  /* .styled:focus-within {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.25rem hsl(var(--clr-bg-border-hover-hsl) / 0.35);
  } */

  .pad-right {
    padding-right: 2.75rem;
  }

  .character-count {
    position: absolute;
    inset: auto 0 0 auto;
    opacity: 0.5;
  }

  .styled .character-count {
    inset: auto var(--space-2xs) var(--space-2xs) auto;
  }

  .emoji-picker {
    /* z-index: 100000; */
    position: absolute;
    inset: 0 0 auto auto;
  }

  .styled .emoji-picker {
    inset: var(--space-2xs) var(--space-2xs) auto auto;
  }

  :global(.tiptap-img) {
    display: inline-block;
    width: 20px;
    vertical-align: middle;
  }

  :global(.tag) {
    background-color: var(--clr-bg-input-hover);
    padding: 0.25rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-weight: medium;
    color: var(--txt-bold);
  }

  :global(.rich-text),
  :global(.rich-textarea) {
    width: 100%;
    overflow-wrap: break-word;
    position: relative;
    cursor: text;
    color: var(--txt-main);
    outline: 0;
  }

  /* :global(.rich-text) {
    min-height: auto;
  }

  :global(.rich-text:disabled),
  :global(.rich-textarea:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }

  :global(.rich-text:hover),
  :global(.rich-textarea:hover) {
    border-color: var(--clr-bg-border-hover);
  }*/

  /* :global(.rich-text:focus),
  :global(.rich-textarea:focus) {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.25rem hsl(var(--clr-bg-border-hover-hsl) / 0.35);
  } */
</style>
