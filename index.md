---
title: Your Form Submits Mid-Japanese Input
image: /assets/og-image.png
---

## Why am I here?

If someone gave you a link to this page, they probably think your web form unintentionally submits when users hit the Enter key to confirm their IME input. This is most commonly reported by Japanese users, but affects anyone using an Input Method Editor (IME) -- including Chinese (Pinyin) and Korean (Hangul) input.

This page will give you a brief description of what this problem is, why it happens, why it's a big deal, and how to fix it. There's also a [demo you can try](#see-the-bug-for-yourself) -- no Japanese keyboard required.

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

Don't take my word for it, though. You can feel it yourself:

## See the bug for yourself

You don't need a Japanese keyboard for this. The demo below **simulates a Japanese IME**: press any letter keys and it composes Japanese for you, then Space converts and Enter confirms -- exactly the keystrokes a Japanese user makes. Your keystrokes are fed to two chat forms at the same time: one with the naive Enter-to-send handler, one with the fix from this page.

Try to send "明日の会議は10時からです" (*Tomorrow's meeting starts at 10*):

<div class="ime-demo" id="ime-demo" tabindex="0" aria-label="Interactive IME simulation demo">
  <div class="ime-demo-prompt"><span id="ime-demo-instruction" aria-live="polite">Press <strong>▶ Watch it happen</strong> below, or just start typing any letters -- the simulated IME turns them into Japanese.</span></div>
  <div class="ime-demo-panes">
    <div class="ime-pane ime-pane-broken">
      <div class="ime-pane-title">❌ Naive form<span class="ime-pane-sub">submits on every Enter</span></div>
      <div class="ime-pane-messages" id="ime-msgs-broken"></div>
      <div class="ime-pane-inputrow"><div class="ime-pane-input" id="ime-input-broken"></div><div class="ime-pane-sendbtn">Send</div></div>
    </div>
    <div class="ime-pane ime-pane-fixed">
      <div class="ime-pane-title">✅ Fixed form<span class="ime-pane-sub">checks isComposing</span></div>
      <div class="ime-pane-messages" id="ime-msgs-fixed"></div>
      <div class="ime-pane-inputrow"><div class="ime-pane-input" id="ime-input-fixed"></div><div class="ime-pane-sendbtn">Send</div></div>
    </div>
  </div>
  <div class="ime-demo-keys">
    <button type="button" class="ime-key" id="ime-key-type">a b c …</button>
    <button type="button" class="ime-key" id="ime-key-space">Space</button>
    <button type="button" class="ime-key" id="ime-key-enter">Enter ⏎</button>
    <button type="button" class="ime-ctrl" id="ime-key-auto">▶ Watch it happen</button>
    <button type="button" class="ime-ctrl" id="ime-key-reset">↺ Reset</button>
  </div>
  <div class="ime-demo-summary" id="ime-demo-summary"></div>
</div>

<p class="ime-smallprint">This demo simulates the standard IME flow (type the reading → Space to convert → Enter to confirm). Real IMEs have more features, but the Enter step is exactly what breaks. And yes -- the demo's own key handling uses the very <code>isComposing</code> check described below.</p>

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

### Using React, Vue, or another framework?

The same check applies inside your framework's event handlers -- the only difference is where the event object comes from.

**React** -- read the flag from the native event, since the synthetic event may not expose `isComposing` directly:

```jsx
const onKeyDown = (e) => {
  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};
```

**Vue** -- `v-model` on text inputs already waits for composition to finish before updating your data, but that does *not* protect your own `@keydown.enter` handler. Check the event yourself:

```html
<textarea @keydown.enter="onEnter"></textarea>
```

```javascript
onEnter(e) {
  if (e.isComposing || e.keyCode === 229) return;
  e.preventDefault();
  this.send();
}
```

### Alternative: change how submission works

Some forms avoid this problem entirely through design:

- **Use a submit button only** -- don't bind Enter to submission at all.
- **Use Ctrl+Enter (or Cmd+Enter on macOS) to submit** -- a deliberate modifier key combination avoids accidental submission. Enter handles line breaks and IME confirmation; Ctrl/Cmd+Enter sends.

The key point: **never let a bare Enter keypress trigger form submission** without checking whether the user is composing text.

### How to test it with a real IME

You don't need to know Japanese to test your own form. Every major OS ships an IME for free:

1. Add a Japanese input method in your OS settings (Windows: "Microsoft IME"; macOS: "Japanese -- Romaji"; Linux: ibus/fcitx with mozc).
2. Switch to it in your form's text field and type `konnichiha` -- you'll see こんにちは composing with an underline.
3. Press Space (it becomes 今日は or こんにちは), then press Enter to confirm.
4. If your form submitted on that Enter, you have this bug.

<details class="ime-inspector">
<summary><strong>Bonus: live event inspector</strong> -- see the exact events your IME fires</summary>
<div class="ime-inspector-body">
<p>Type in the box below with an IME active and watch <code>keydown</code>, <code>compositionstart</code>/<code>update</code>/<code>end</code> fire, including what the fix would do with each Enter. (Without an IME you'll still see <code>keydown</code> events -- <code>isComposing</code> just stays <code>false</code>.)</p>
<textarea id="ime-inspector-input" rows="2" placeholder="Type here (with an IME if you have one)…"></textarea>
<div class="ime-inspector-log" id="ime-inspector-log" aria-live="off"></div>
<button type="button" class="ime-ctrl" id="ime-inspector-clear">Clear log</button>
</div>
</details>

## What about other languages?

This problem affects any language that uses an IME -- not just Japanese. Chinese (Pinyin, Zhuyin), Korean (Hangul), and others all go through a composition step that uses the Enter key. The `isComposing` fix shown above works for all of them.

This site was created from the author's firsthand experience with Japanese input, but the underlying issue and the fix are universal. If you encounter this problem with any IME-based input, the same solution applies.

## More Resources

- MDN: [keydown events with IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime)
- MDN: [KeyboardEvent.isComposing](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing)
- Wikipedia: [Input method](https://en.wikipedia.org/wiki/Input_method), [Japanese input method](https://en.wikipedia.org/wiki/Japanese_input_method)

## Changelog

- **2026-07-16** -- Added an interactive demo that simulates IME typing (no IME needed), a live event inspector, framework notes for React and Vue, and steps for testing with a real IME.
- **2026-04-17** -- Added `isComposing` code example and Safari fallback explanation. Expanded scope to cover Chinese and Korean IME. Replaced dead W3C link with MDN references. Added concrete examples for chat interfaces and AI generation tools.
- **2024-03-17** -- Initial publication.

## Author

Kairin - [X](https://x.com/ckrunch)

<style>
.ime-demo { border: 1px solid #d0d0d0; border-radius: 10px; padding: 12px; background: #fafafa; outline: none; }
.ime-demo:focus, .ime-demo:focus-within { border-color: #39c; box-shadow: 0 0 0 2px rgba(51,153,204,.25); }
.ime-demo-prompt { min-height: 2.4em; font-size: 14px; color: #333; margin-bottom: 10px; padding: 6px 8px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }
.ime-demo-prompt kbd { border: 1px solid #bbb; border-bottom-width: 2px; border-radius: 4px; padding: 0 5px; background: #f2f2f2; font-size: 12px; }
.ime-hint-flash { animation: ime-flash .5s; }
@keyframes ime-flash { 0% { background: #fff3cd; } 100% { background: #fff; } }
.ime-demo-panes { display: flex; gap: 10px; flex-wrap: wrap; }
.ime-pane { flex: 1 1 210px; min-width: 200px; border: 1px solid #ddd; border-radius: 8px; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
.ime-pane-broken { border-top: 3px solid #d73a49; }
.ime-pane-fixed { border-top: 3px solid #2da44e; }
.ime-pane-title { font-size: 13px; font-weight: bold; padding: 6px 8px; border-bottom: 1px solid #eee; }
.ime-pane-sub { display: block; font-weight: normal; font-size: 11px; color: #888; }
.ime-pane-messages { flex: 1; min-height: 130px; max-height: 180px; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.ime-empty { color: #bbb; font-size: 12px; text-align: center; margin: auto; }
.ime-bubble { align-self: flex-end; max-width: 90%; border-radius: 12px 12px 2px 12px; padding: 5px 9px; font-size: 14px; }
.ime-bubble-premature { background: #ffe5e8; border: 1px solid #f1b8bf; }
.ime-bubble-ok { background: #dcf5e3; border: 1px solid #b3e0c0; }
.ime-badge { font-size: 10px; margin-top: 2px; }
.ime-bubble-premature .ime-badge { color: #c0293a; }
.ime-bubble-ok .ime-badge { color: #1a7f37; }
.ime-sysline { align-self: center; color: #999; font-size: 11px; font-style: italic; }
.ime-pane-inputrow { display: flex; gap: 6px; border-top: 1px solid #eee; padding: 6px; align-items: center; }
.ime-pane-input { flex: 1; min-height: 1.5em; border: 1px solid #ccc; border-radius: 6px; padding: 3px 6px; font-size: 14px; background: #fff; overflow-wrap: anywhere; }
.ime-composing { border-bottom: 2px dotted #555; }
.ime-converted { background: #b8d8ff; }
.ime-placeholder { color: #bbb; font-size: 12px; }
.ime-pane-sendbtn { font-size: 12px; background: #39c; color: #fff; border-radius: 6px; padding: 4px 9px; user-select: none; }
.ime-demo-keys { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
button.ime-key, button.ime-ctrl { font-size: 13px; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
button.ime-key { border: 1px solid #aaa; border-bottom-width: 3px; background: #fff; font-family: monospace; }
button.ime-key:active { border-bottom-width: 1px; transform: translateY(2px); }
button.ime-ctrl { border: 1px solid #39c; background: #eaf5fb; color: #1a6a94; }
.ime-demo-summary { margin-top: 8px; font-size: 14px; }
.ime-demo-summary:not(:empty) { border-left: 3px solid #39c; padding: 6px 10px; background: #f0f7fb; border-radius: 0 6px 6px 0; }
.ime-smallprint { font-size: 12px; color: #888; }
.ime-inspector-body textarea { width: 100%; box-sizing: border-box; font-size: 14px; padding: 6px; margin: 8px 0 6px; }
.ime-inspector-log { font-family: monospace; font-size: 11.5px; white-space: pre; overflow: auto; max-height: 220px; min-height: 80px; background: #1e1e1e; color: #ccc; border-radius: 6px; padding: 8px; margin-bottom: 6px; }
.ime-log-comp { color: #7fd4ff; }
.ime-log-blocked { color: #ffd479; }
.ime-log-submit { color: #ff8090; }
@media (prefers-reduced-motion: reduce) { .ime-hint-flash { animation: none; } }
</style>

<script>
(function () {
  "use strict";
  var CHUNKS = [
    { kana: ["あ", "あす", "あすの", "あすのか", "あすのかい", "あすのかいぎ", "あすのかいぎは"], converted: "明日の会議は" },
    { kana: ["1", "10", "10じ", "10じか", "10じから", "10じからで", "10じからです"], converted: "10時からです" }
  ];
  var demo = document.getElementById("ime-demo");
  if (!demo) return;
  var el = {
    instruction: document.getElementById("ime-demo-instruction"),
    summary: document.getElementById("ime-demo-summary"),
    msgs: { broken: document.getElementById("ime-msgs-broken"), fixed: document.getElementById("ime-msgs-fixed") },
    inputs: { broken: document.getElementById("ime-input-broken"), fixed: document.getElementById("ime-input-fixed") },
    keyType: document.getElementById("ime-key-type"),
    keySpace: document.getElementById("ime-key-space"),
    keyEnter: document.getElementById("ime-key-enter"),
    keyAuto: document.getElementById("ime-key-auto"),
    keyReset: document.getElementById("ime-key-reset")
  };
  var state = null;
  var timer = null;

  function instruct(html) {
    el.instruction.innerHTML = html;
    el.instruction.parentNode.classList.remove("ime-hint-flash");
  }
  function hint(html) {
    var box = el.instruction.parentNode;
    el.instruction.innerHTML = html;
    box.classList.remove("ime-hint-flash");
    void box.offsetWidth;
    box.classList.add("ime-hint-flash");
  }

  function reset() {
    stopAuto();
    state = {
      chunk: 0, pos: 0, phase: "typing", composing: "", converted: false,
      panes: { broken: { committed: "", msgs: [] }, fixed: { committed: "", msgs: [] } }
    };
    el.summary.innerHTML = "";
    instruct("Type any letters (or tap the keys below) -- the simulated IME turns them into Japanese.");
    render();
  }

  function press(kind) {
    if (!state || state.phase === "done") return;
    var c = CHUNKS[state.chunk];
    if (state.phase === "typing") {
      if (kind === "char") {
        state.pos = Math.min(state.pos + 1, c.kana.length);
        state.composing = c.kana[state.pos - 1];
        if (state.pos === c.kana.length) {
          state.phase = "convert";
          instruct("Reading typed: <strong>" + state.composing + "</strong>. Now press <kbd>Space</kbd> to convert to kanji.");
        } else {
          instruct("Keep typing… the IME is composing (" + (c.kana.length - state.pos) + " more keys).");
        }
      } else {
        hint("Just type some letters first -- any letters work.");
      }
    } else if (state.phase === "convert") {
      if (kind === "space") {
        state.converted = true;
        state.composing = c.converted;
        state.phase = "confirm";
        instruct("The IME suggests <strong>" + c.converted + "</strong>. Press <kbd>Enter</kbd> to confirm the conversion -- <em>not</em> to send.");
      } else {
        hint("Press <kbd>Space</kbd> to convert the reading to kanji.");
      }
    } else if (state.phase === "confirm") {
      if (kind === "enter") {
        state.panes.broken.msgs.push({ text: state.panes.broken.committed + state.composing, premature: true });
        state.panes.broken.committed = "";
        state.panes.fixed.committed += state.composing;
        state.composing = "";
        state.converted = false;
        if (state.chunk + 1 < CHUNKS.length) {
          state.chunk++;
          state.pos = 0;
          state.phase = "typing";
          instruct("💥 The naive form just <strong>sent a fragment</strong>! The fixed form only confirmed the text. Keep typing the rest of the sentence.");
        } else {
          state.phase = "send";
          instruct("💥 Another fragment fired! The fixed form now holds the whole sentence. Press <kbd>Enter</kbd> once more -- this time it really means “send”.");
        }
      } else {
        hint("Press <kbd>Enter</kbd> to confirm the kanji -- that is what an IME user must do here.");
      }
    } else if (state.phase === "send") {
      if (kind === "enter") {
        state.panes.broken.msgs.push({ system: true, text: "(nothing left to send — the message already left in pieces)" });
        state.panes.fixed.msgs.push({ text: state.panes.fixed.committed, premature: false });
        state.panes.fixed.committed = "";
        state.phase = "done";
        stopAuto();
        instruct("Done. Same keystrokes, very different results. Now <a href=\"#the-quick-fix-check-iscomposing\">grab the fix</a>.");
        el.summary.innerHTML = "Naive form: <strong>2 broken fragments</strong>, the full sentence was never sent. Fixed form: <strong>1 complete message</strong> — 「明日の会議は10時からです」 (“Tomorrow’s meeting starts at 10.”)";
      } else {
        hint("Press <kbd>Enter</kbd> to send the finished message.");
      }
    }
    render();
  }

  function renderPane(name) {
    var p = state.panes[name];
    var m = el.msgs[name];
    m.innerHTML = "";
    if (!p.msgs.length) {
      var e = document.createElement("div");
      e.className = "ime-empty";
      e.textContent = "No messages yet";
      m.appendChild(e);
    }
    p.msgs.forEach(function (msg) {
      var d = document.createElement("div");
      if (msg.system) {
        d.className = "ime-sysline";
        d.textContent = msg.text;
      } else {
        d.className = "ime-bubble " + (msg.premature ? "ime-bubble-premature" : "ime-bubble-ok");
        var t = document.createElement("div");
        t.textContent = msg.text;
        d.appendChild(t);
        var b = document.createElement("div");
        b.className = "ime-badge";
        b.textContent = msg.premature ? "✗ sent mid-sentence" : "✓ complete message";
        d.appendChild(b);
      }
      m.appendChild(d);
    });
    m.scrollTop = m.scrollHeight;
    var inp = el.inputs[name];
    inp.innerHTML = "";
    if (p.committed) inp.appendChild(document.createTextNode(p.committed));
    if (state.composing) {
      var s = document.createElement("span");
      s.className = state.converted ? "ime-converted" : "ime-composing";
      s.textContent = state.composing;
      inp.appendChild(s);
    }
    if (!p.committed && !state.composing) {
      var ph = document.createElement("span");
      ph.className = "ime-placeholder";
      ph.textContent = "Type a message…";
      inp.appendChild(ph);
    }
  }

  function render() {
    renderPane("broken");
    renderPane("fixed");
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    el.keyAuto.textContent = "▶ Watch it happen";
  }

  function autoPlay() {
    if (timer) { stopAuto(); return; }
    reset();
    el.keyAuto.textContent = "⏸ Stop";
    var queue = [];
    CHUNKS.forEach(function (c) {
      c.kana.forEach(function () { queue.push("char"); });
      queue.push("pause", "space", "pause", "pause", "enter", "pause", "pause");
    });
    queue.push("enter");
    var i = 0;
    timer = setInterval(function () {
      if (i >= queue.length) { stopAuto(); return; }
      var k = queue[i++];
      if (k !== "pause") press(k);
    }, 280);
  }

  function manual(kind) {
    if (timer) stopAuto();
    if (state && state.phase === "done") {
      if (kind === "char") reset(); else return;
    }
    press(kind);
  }

  demo.addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") { e.preventDefault(); manual("enter"); }
    else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); manual("space"); }
    else if (/^[a-z0-9]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); manual("char"); }
  });
  demo.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("button")) return;
    demo.focus();
  });
  el.keyType.addEventListener("click", function () { manual("char"); demo.focus(); });
  el.keySpace.addEventListener("click", function () { manual("space"); demo.focus(); });
  el.keyEnter.addEventListener("click", function () { manual("enter"); demo.focus(); });
  el.keyAuto.addEventListener("click", function () { autoPlay(); });
  el.keyReset.addEventListener("click", function () { reset(); demo.focus(); });

  reset();
})();

(function () {
  "use strict";
  var ta = document.getElementById("ime-inspector-input");
  var log = document.getElementById("ime-inspector-log");
  var clearBtn = document.getElementById("ime-inspector-clear");
  if (!ta || !log) return;
  function pad(s, n) {
    s = String(s);
    while (s.length < n) s += " ";
    return s;
  }
  function row(txt, cls) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = txt;
    log.appendChild(d);
    while (log.children.length > 80) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }
  ta.addEventListener("keydown", function (e) {
    var line = pad("keydown", 19) + pad("key=" + JSON.stringify(e.key), 16) + pad("isComposing=" + e.isComposing, 20) + "keyCode=" + e.keyCode;
    if (e.key === "Enter") {
      var blocked = e.isComposing || e.keyCode === 229;
      row(line, blocked ? "ime-log-blocked" : "ime-log-submit");
      row(blocked ? "  → the fix says: IGNORE (IME is composing)" : "  → the fix says: SUBMIT", blocked ? "ime-log-blocked" : "ime-log-submit");
    } else {
      row(line);
    }
  });
  ["compositionstart", "compositionupdate", "compositionend"].forEach(function (type) {
    ta.addEventListener(type, function (e) {
      row(pad(type, 19) + "data=" + JSON.stringify(e.data), "ime-log-comp");
    });
  });
  clearBtn.addEventListener("click", function () { log.innerHTML = ""; });
})();
</script>
