---
title: Your Form Submits Mid-Japanese Input
---

## Why am I here?

If someone gave you a link to this page, they probably think your web form unintentionally submits when Japanese users hit the Enter key to confirm their input. This page will give you a brief description of what this problem is, why it happens, why it's a big deal, and how to fix it.

## What's the problem?

Japanese text input, also known as IME (Input Method Editor), involves typing the pronunciation of a word or phrase, and then hitting the Enter key to confirm the conversion to the actual Japanese characters. For instance, to type "おはよう" (ohayou), the user would type "ohayou" and then hit Enter to confirm the conversion.

If a form's default behavior is to submit on the Enter key, Japanese users will not be able to properly input text because as soon as they hit Enter to confirm their input, the form will submit prematurely.

## Is it a big deal? The form still submits, right?

This problem causes immense frustration for users because unintentional form submissions often interrupt text entry and make it virtually impossible to type more than one sentence. No one wants web forms constantly interrupting the input process like this:

- What [Send]
- is [Send]
- going [Send]
- on [Send]
- here? [Send]

## How can we fix it?

Here are a few things you can do to address this issue:

- Disable form submission by pressing Enter while the IME is converting characters.
- Disable the Enter key input when the Japanese IME is detected as active in the form field.
- As with some messaging services, keyboard shortcuts for form submission are assigned to Shift-Enter. Enter, on the other hand, has no special role or is dedicated to line breaks.

The key point is to prevent users from submitting forms using only the Enter key. This will allow Japanese users to use your service more smoothly.

## Are there similar problems with other languages? Why aren't there steps to fix it in [insert environment here]?

The author is a native Japanese speaker who speaks only English and Japanese, and created this site out of personal frustration. I don't have much insight into other languages, sorry. Also, I'm not a technical person, so I can't give you specific steps to fix the problem. If you encounter issues or find bugs in other languages or environments, please contact me.

## More Resources

- Wikipedia: [Input method](https://en.wikipedia.org/wiki/Input_method), [Japanese input method](https://en.wikipedia.org/wiki/Japanese_input_method)
- W3C: [Designing HTML forms for East Asian languages](https://www.w3.org/International/techniques/authoring-html#forms)

## Author

Kairin - [X](https://twitter.com/ckrunch), [Bluesky](https://bsky.app/profile/kairin.bsky.social)