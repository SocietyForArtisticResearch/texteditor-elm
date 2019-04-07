
# Markdown Editor

RC Team (luc.doebereiner@researchcatalogue.net), 2019

New implementation of the text based editor using elm.

The editor is codemirror. A built of version 5.45.0 is included in `lib`.

# Build

```
elm make src/Main.elm --output=main.js
```


# Use

Open `editor.html`.


# Todo

- Evan's markdown lib does not seem to support HTML. We may need to
  switch to https://github.com/pablohirafuji/elm-markdown
- RC media module
- Adjust mode to include RC media syntax
- upload to server
- Buttons
- RC Media Import
- RC Media Upload
- Media browser
- Import/Export
- Drag and drop of media
- Switch Textarea/Codemirror
- Styling
