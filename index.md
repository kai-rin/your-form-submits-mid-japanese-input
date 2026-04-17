---
title: Your Form Submits Mid-Japanese Input
---

## Why am I here?

If someone gave you a link to this page, they probably think your web form unintentionally submits when users hit the Enter key to confirm their IME input. This is most commonly reported by Japanese users, but affects anyone using an Input Method Editor (IME) -- including Chinese (Pinyin) and Korean (Hangul) input.

This page will give you a brief description of what this problem is, why it happens, why it's a big deal, and how to fix it.

## What's the problem?

Japanese text input uses an IME. Instead of each key producing a final character, the user types a pronunciation and then **converts** it to the correct characters. Here's what typing "明日" (asu, meaning "tomorrow") looks like:

1. The user types `a-s-u` -- the IME converts this to hiragana in real time: **あす** (shown underlined, meaning composition is still in progress)
2. The user presses Space to convert to kanji -- the IME suggests: **明日**
3. The user presses Enter to **confirm** the selection

That Enter at step 3 is not a "submit" -- it means "yes, this is the text I want." But if your form submits on Enter, it fires here and the user never gets to finish typing their message.

The same process applies to Chinese (Pinyin) and Korean (Hangul) input methods -- any language where an IME converts keystrokes into final characters through a confirmation step.

## Is it a big deal? The form still submits, right?

Imagine a user trying to type "明日の会議は10時からです" (Tomorrow's meeting starts at 10). Here's what actually happens on a broken form:

> Types `a-s-u` → presses Space to convert to 明日 → presses Enter to confirm → **form submits immediately.**

The user never gets past the first word. This is especially painful in:

- **Chat interfaces** (messaging apps, AI assistants, customer support widgets) -- every Enter to confirm a conversion sends an incomplete message. The user has to delete or edit each accidental message, one fragment at a time -- assuming your app even supports that.
- **AI generation tools** (image generators, video generators, and similar prompt-based UIs) -- a half-finished prompt kicks off a generation that the user never intended. They waste time waiting for an unwanted result, or have to cancel and start over.

To put it another way -- no one wants web forms constantly interrupting the input process like this:

- Tomorrow's [Send]
- meeting [Send]
- starts [Send]
- at [Send]
- 10 [Send]

This is what it feels like to type that sentence.

## How can we fix it?

### The quick fix: check `isComposing`

The browser already knows when an IME conversion is in progress. You just need to check:

```javascript
element.addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  // Handle Enter key for form submission here
});
```

[`event.isComposing`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing) is `true` whenever the user is in the middle of IME input. The `keyCode === 229` check is a fallback for Safari, which fires `compositionend` before `keydown` -- causing `isComposing` to already be `false` when the keydown event fires. This dual check is [recommended by MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime) and works in all modern browsers (Chrome 56+, Firefox 31+, Safari 10.1+, Edge 79+).

### Alternative: change how submission works

Some forms avoid this problem entirely through design:

- **Use a submit button only** -- don't bind Enter to submission at all.
- **Use Shift+Enter to submit** -- this is how Slack, Discord, and many chat apps work. Enter inserts a line break or confirms IME input; Shift+Enter sends.

The key point: **never let a bare Enter keypress trigger form submission** without checking whether the user is composing text.

## What about other languages?

This problem affects any language that uses an IME -- not just Japanese. Chinese (Pinyin, Zhuyin), Korean (Hangul), and others all go through a composition step that uses the Enter key. The `isComposing` fix shown above works for all of them.

This site was created from the author's firsthand experience with Japanese input, but the underlying issue and the fix are universal. If you encounter this problem with any IME-based input, the same solution applies.

## More Resources

- MDN: [keydown events with IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime)
- MDN: [KeyboardEvent.isComposing](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing)
- Wikipedia: [Input method](https://en.wikipedia.org/wiki/Input_method), [Japanese input method](https://en.wikipedia.org/wiki/Japanese_input_method)

## Changelog

- **2026-04-17** -- Added `isComposing` code example and Safari fallback explanation. Expanded scope to cover Chinese and Korean IME. Replaced dead W3C link with MDN references. Added concrete examples for chat interfaces and AI generation tools.
- **2024-03-17** -- Initial publication.

## Author

Kairin - [X](https://x.com/ckrunch)
