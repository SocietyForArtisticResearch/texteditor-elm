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
- Medialist display/Media browser
- Layout issues
- Validation display
- Why can the user not change the object name/copyright/ ?
- Drag and drop of media
- Switch Textarea/Codemirror/CSS Edit
- Buttons
- Styling
- media file types in select dialog

Luc:
- Check rendered html
- Transcoding status type
- Load corrected (new) version of json of additional media metadata list and expo metadata
- Import/Export (Pandoc calls)
- TOC


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
- Saving
- Backend update of changes (RC API)
- Switch completely to marked markdown rendering
- Insert media html into markdown before passing it to marked
- Set innerhtml of preview via port
