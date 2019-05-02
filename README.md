# Markdown Editor

RC Team (luc.doebereiner@researchcatalogue.net), 2019

New implementation of the text based editor using elm.

The editor is codemirror. A built of version 5.45.0 is included in `lib`.

# Build

```
sh build.sh
```


# Use

Open `editor.html`.


# Todo

Casper:
- How does the edit media view in main.elm line 317, get the old and (changed) media object ?
- Why can the user not change the object fields ?

- media editor dialog view function gets from main
  - a validations status containing strings and validation status
  - a record with callback message functions which create messages for updating the rcmediaobject/model
    (containing curried rcmediaobject)
    - insert, delete and edit (copyright, name, description, class)

- Adjust cm mode to include RC media syntax
- Evan's markdown lib does not seem to support HTML. We may need to
  switch to https://github.com/pablohirafuji/elm-markdown
- HTML style tag as in `<span style="font-size:14px"><span>`
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
