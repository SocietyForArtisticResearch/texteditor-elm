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
- Medialist display
- Layout issues
- Validation display
- Why can the user not change the object name/copyright/ ?

Luc:
- Backend update of changes (RC API)
- Rendered HTML
- Transcoding status type
- Saving

Other:

- Buttons
- RC Media Import
- Media browser
- Import/Export
- Drag and drop of media
- Switch Textarea/Codemirror
- Styling


## DONE
- Get userclass and metadata
- RC Media Upload
- upload to server
- Adjust cm mode to include RC media syntax
- Evan's markdown lib does not seem to support HTML. We may need to
  switch to https://github.com/pablohirafuji/elm-markdown
- HTML style tag as in `<span style="font-size:14px"><span>`
- RC media module
- media editor dialog view function gets from main
  - a validations status containing strings and validation status
  - a record with callback message functions which create messages for updating the rcmediaobject/model
    (containing curried rcmediaobject)
    - insert, delete and edit (copyright, name, description, class)
- Loading, markdown display in codemirror