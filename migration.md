Some text editor adjustments from your side (@Casper Schipper) are required for the migration to work:

1. editor.html needs to be adjusted (see attached file)

2. the editor url changed from /editor?research=498390&weave=498391 to /editor/498390/498391 so you need to adjust your param parsing

3. all links you create on which you bind a click event, e.g. markdown, media, style need an event.preventDefault(). the '#' is not enough anymore, because the editor url changed

4. the export call should be adjusted: additional required argument exposition

5. the import does not work for embedded documents (<embed src="".../>), e.g. use the Cox document attached in https://jira.twinit.eu/browse/SAR-979

6. use following structure to add/edit simple media, so i can remove my custom mapping (also camelcase for copyrightHolder)
[
    'form' => [
        'simpleMedia' => [
            'name' => $payload->get('name'),
            'copyrightHolder' => $payload->get('copyrightholder'),
            'description' => $payload->get('description'),
            'license' => $payload->get('license'),
        ],
    ],
],

optional improvements:
7. if easy possible move mediatype on simple-media-add from payload to url e.g. /text-editor/simple-media-add/image or to query param mediaType
8. if possible remove the simple-media-edit calls on editor/media-list open and on media list adjustments (e.g. delete). if the simple media list is long, a lot of calls are done for each action
9. if possible just make on simple-media-edit call on leaving input field, normally onchange event and not oninput to avoid having edit calls for each keyboard stroke in description textarea
10. if possible rename all research arguments to exposition