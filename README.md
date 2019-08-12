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

The "preview"-div is not a node transformed/created/known by Elm. This
is because we set its content using morphdom and elm should not
interfere. General page styling/layout of preview etc.  thus needs to
be made outside of elm.

# Todo

General:
	
- What to do when people are logged out

Casper:

- display title of exposition somewhere
- upload display media edit and insert if you want
- media edit copyright obligatory

Luc:

- save and inc contentversion 
- display somthing while transcoding 
- elm-bootstrap update
- codemirror undo/redo as buttons
- json decoder/encoder for RCExposition type

## To test
- tables?
- alignment
- load existing text-based expositions
- uploading docs
- performance?

## Postponed

- Drag and drop of media (postpone)
- Real-time collaborative editing
- autofocus on right hand side
- wikipedia-style footnotes

## DONE

- double click to insert media
- added more media types, user can select to filter 
- larger preview thumbnails
- auto close dialog
- there is an insert popover dialog now
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
- media list displays as "no objects" when there are no objects, also when media list tab has not been selected, i.e. id is wrong or something like that
- TOC
- insert media message
- reload media list message
- why is css not used in preview? -> id exposition
- 'stupid' buttons (snippets): insert media, header (pull down h1,h2,h3), italic, bold, quote, link, bullet,numbered list
- Transcoding status type
- auto save
- Export (Pandoc calls) 
? Css userclass (big, small, medium etc), doesn't work in Preview or rendered HTML: solution: save exposition after mediaedit together with updatemedia in rcapi
- licenses field
- Mime types:
  * audio/x-aiff
- If a media is used twice or more, the DOM gets confused.
- Caption text not parsed:  ![caption]{media1}
- Check rendered html
- check captions display etc
- Highlighting caption text and onclick creates problem
