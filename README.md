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


# Important note on DOM in editor.html

The "preview"-div is not a node transformed/created/known by elm. This
is because we set its content using morphdom and elm should not
interfere. General page styling/layout of preview etc.  thus needs to
be made outside of elm.

# Todo

General:
- How do we get the author's name?

Casper:

- media list displays as "no objects" when there are no objects, also when media list tab has not been selected, i.e. id is wrong or something like that
- what about "insert"?
  @Luc, I wanted this to insert on codemirror current position, probably we need a port for this?
  @Casper: It's possible, but does it make sense to insert if the user cannot see where he/she is? Shouldn't the media list appear on the right (instead of the preview)?
- Buttons
- Styling (editor sizes, double scrollbars, percentage when uploading)
- "markdown plain" should be somewhere else, not a main tab
- media file types in select dialog
- display title of exposition somewhere
- warnings when closing/reloading

Luc:

- auto save
- why is css not used in preview?
- Check rendered html
- Transcoding status type
- Export (Pandoc calls) (works in principle, but needs longer uri allowed by server and pull down for file type selection)
- TOC

## Postponed

- Drag and drop of media (postpone)
- Real-time collaborative editing
- autofocus on right hand side


## DONE
- display Problems (as warnings etc)
- Why can the user not change the object name/copyright/ ?
- Validation display
- Migrate Insert and Remove actions to the table
- close button at bottom of dialog (loose the x).
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
- Load corrected (new) version of json of additional media metadata list and expo metadata
- Ports for switching editors (style, plain, markdown)
- Media list tab
- Tabs ? Switch Textarea/Codemirror/CSS Edit
- Mediadelete
- Mediaupdate
- make media upload numbering safe (uuid?)
- .rcimage .rcvideo .rcaudio classes are missing from rendered HTML, means editor is not compatible with old text-editor css sheets.
- reload media list after deletion
- Pandoc import working in principle
- Generate preview html (final static html)
- multiple doc imports create duplicate media names
