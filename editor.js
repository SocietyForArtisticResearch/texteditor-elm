const version = "v 2.1.1";

console.log(version);

var mdIt = window.markdownit({
    html: true,
    typographer: true
}).use(window.markdownitFootnote).use(window.markdownitCentertext).use(window.markdownitHeaders);

mdIt.headers = [];

var urlParams = new URLSearchParams(window.location.search);

var toRender = false;

var mdToRender = "";

var mdLength = 0;

var renderInterval = 100;

var styleElem = document.createElement('style');
styleElem.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(styleElem);

const editorCmMd = 0;

const editorTxtMd = 1;

const editorCmCss = 2;

const editorMediaList = 3;

var selectedEditor = editorCmMd;

var cmMarkdownPosition = null; // used to save 
var cmStylePosition = null;
var txtMarkdownPosition = null;

var cmMarkdown = CodeMirror.fromTextArea(document.getElementById("js-cm-markdown"), {
    mode: "markdown",
    lineWrapping: true
});

var cmStyle = CodeMirror.fromTextArea(document.getElementById("js-cm-style"), {
    mode: "css",
    lineWrapping: true
});


if (typeof window.innerWidth != 'undefined') {
    viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
}
//cmStyle.setSize(viewportwidth / 2.0, null);


// cmMarkdown.setSize(null, "480px"); // fill available vertical space ?
// cmStyle.setSize(null, "480px");

var textareaMarkdown = document.getElementById("js-textarea-markdown");

var app = Elm.Main.init({
    node: document.getElementById('elm'),
    flags: {
        weave: parseInt(urlParams.get('weave')),
        research: parseInt(urlParams.get('research')),
        buildTarget: "Release",
        version: version
    }
});

function setEditorDisplay(editor) {

    let showMediaList = function(shouldDisplayIfExist) {
        let mediaList = document.getElementById("media-list");
        /* media List may not exist yet, this will only set if it does */
        if (mediaList != null) {
            if (shouldDisplayIfExist) {
                mediaList.style.display = "block";
                console.log("show media");
            } else {
                mediaList.style.display = "none";
                console.log("hide media");
            }
        } else {
            console.log("media list does not exist (yet?)", document.getElementById("media-list"));
        }
    };

    let setNodeVisibility = function(node, show) {
        if (show) {
            node.style.display = "block";
        } else {
            node.style.display = "none";
        }
    };

    if (selectedEditor === editorCmMd && cmMarkdown != null) {
        cmMarkdownPosition = cmMarkdown.getCursor();
        //console.log('cursor is : cmMarkdownPos', cmMarkdownPosition);
    }
    if (selectedEditor === editorCmCss && cmStyle != null) {
        cmStylePosition = cmStyle.getCursor();
    }
    if (selectedEditor === editorTxtMd && textareaMarkdown != null) {
        txtMarkdownPosition = textareaMarkdown.selectionStart;
    }

    switch (editor) {
        case editorCmMd:
            let setAfterShow = (selectedEditor === editorTxtMd);
            setNodeVisibility(textareaMarkdown, false);
            setNodeVisibility(cmStyle.getWrapperElement(), false);
            showMediaList(false);
            setNodeVisibility(cmMarkdown.getWrapperElement(), true);


            selectedEditor = editor;
            if (setAfterShow) {
                cmMarkdown.setValue(textareaMarkdown.value);
                cmMarkdown.refresh();
            } else {
                // recover position
                //console.log(cmMarkdownPosition,' = pos');

                cmMarkdown.focus();
                cmMarkdown.on("focus", () => cmMarkdown.setCursor(cmMarkdownPosition));
            }
            break;

        case editorTxtMd:
            setNodeVisibility(textareaMarkdown, true);
            setNodeVisibility(cmStyle.getWrapperElement(), false);
            showMediaList(false);
            setNodeVisibility(cmMarkdown.getWrapperElement(), false);
            selectedEditor = editor;
            if (txtMarkdownPosition !== null) {
                textareaMarkdown.selectionStart = textareaMarkdown.selectionEnd = txtMarkdownPosition;
            }
            break;

        case editorCmCss:
            setNodeVisibility(textareaMarkdown, false);
            setNodeVisibility(cmStyle.getWrapperElement(), true);
            showMediaList(false);
            setNodeVisibility(cmMarkdown.getWrapperElement(), false);

            if (cmStylePosition !== null) {
                setTimeout(() => {
                    cmStyle.focus();
                    cmStyle.setCursor(cmStylePosition);
                }, 500);
            }

            selectedEditor = editor;
            cmStyle.refresh();
            break;
        case editorMediaList:
            setNodeVisibility(textareaMarkdown, false);
            setNodeVisibility(cmStyle.getWrapperElement(), false);
            showMediaList(true);
            setNodeVisibility(cmMarkdown.getWrapperElement(), false);

            selectedEditor = editor;
            break;
        default:
            console.log("editor selection not known or not implemented");
    }
}

setEditorDisplay(selectedEditor);

// send current edit generation
/* setInterval(function(){
 *     app.ports.currentGeneration.send(cm.changeGeneration());
 * }, 100);
 */

function mkGenerationObj() {
    return ({
        md: cmMarkdown.changeGeneration(),
        style: cmStyle.changeGeneration()
    })
}

cmMarkdown.on("changes", function() {
    app.ports.currentGeneration.send(mkGenerationObj());

    textareaMarkdown.value = cmMarkdown.getValue();
});


cmStyle.on("changes", function() {
    app.ports.currentGeneration.send(mkGenerationObj());

    styleElem.innerHTML = cmStyle.getValue();
});

const touchOrClickMediaTag = function() {
    let pos = cmMarkdown.getCursor();
    let tok = cmMarkdown.getTokenTypeAt(pos);
    if (tok !== null && tok !== undefined) {
        if (tok.includes("rcmedia")) {
            let word = cmMarkdown.findWordAt(pos);
            let content = cmMarkdown.getRange(word.anchor, word.head)
            //		console.log(word);
            if (content !== "}" && content !== "{") {
                app.ports.mediaDialog.send({
                    media: content
                });
            }
        }
    }
};

cmMarkdown.on("mousedown", touchOrClickMediaTag);
//cmMarkdown.on("touchstart", touchOrClickMediaTag);


function sendContent() {
    app.ports.cmContent.send({
        generation: mkGenerationObj(),
        md: cmMarkdown.getValue(),
        style: cmStyle.getValue()
    });
}


app.ports.setEditor.subscribe(function(editor) {
    setEditorDisplay(editor);
});

app.ports.setDocumentTitle.subscribe(function(title) {
    document.title = title;
});

app.ports.setFullscreenMode.subscribe(function(mode) {
    toggleFullscreen(mode);
});

app.ports.getContent.subscribe(function() {
    sendContent();
});


app.ports.cmUndo.subscribe(function() {

    switch (selectedEditor) {
        case editorCmMd:
            cmMarkdown.undo();
            break;
        case editorCmCss:
            cmStyle.undo();
            break;
    }

});

app.ports.cmRedo.subscribe(function() {

    switch (selectedEditor) {
        case editorCmMd:
            cmMarkdown.redo();
            break;
        case editorCmCss:
            cmStyle.redo();
            break;
    }

});

app.ports.setContent.subscribe(function(content) {

    cmMarkdown.setValue(content.md);
    cmStyle.setValue(content.style);

    styleElem.innerHTML = content.style;

    textareaMarkdown.value = content.md;
});


function insertAtCursor(input, textToInsert) {
    // get current text of the input
    const value = input.value;

    // save selection start and end position
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // update the value with our text inserted
    input.value = value.slice(0, start) + textToInsert + value.slice(end);

    // update cursor to be at the end of insertion
    input.selectionStart = input.selectionEnd = start + textToInsert.length;
}

function detectmob() {
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
}

app.ports.insertMdString.subscribe(function(insertTuple) {
    var [str, offset] = insertTuple;

    let phoneReplace = function(syntax, selected) {
        // sigh, codemirror messes up cursor, so we do something local here:
        if (selected === "") {
            return syntax;
        }

        if (syntax.startsWith("**")) {
            return "**" + selected + "**";
        }

        if (syntax.charAt(0) === "_") {
            return "_" + selected + "_";
        }

        if (syntax.startsWith("[]")) {
            return "[" + selected + "](https://)";
        }

        if (syntax.charAt(0) === "#") {
            return "# " + selected;
        }

        return syntax + selected;
    }

    if (selectedEditor == editorCmMd) {
        let cmSelection = cmMarkdown.getSelection();
        let isPhone = detectmob();
	let extraPart = {};

        if (isPhone) {
            cmSelection = phoneReplace(str, cmSelection);

            cmMarkdown.replaceSelection(cmSelection);

        } else {
	    cmMarkdown.replaceSelection(str);
	    cmMarkdown.focus();
	    let cursor = cmMarkdown.getCursor("to");
	    console.log("debug", cursor);
	    cmMarkdown.setCursor({
                line: cursor.line,
                ch: Math.max(0, cursor.ch + offset)
	    });

	    if (str.charAt(0) === "#") {	    
		if(cmSelection.length === 0) {
		    cmMarkdown.replaceSelection("header");
		} else {
		    // do nothing
		}
	    } else {
		cmMarkdown.replaceSelection(cmSelection);
	    }
        }

        textareaMarkdown.value = cmMarkdown.getValue();

    } else if (selectedEditor == editorTxtMd) {
        let txtSelection = getTextareaSelection(textareaMarkdown);

        txtSelection = syntaxHelper(str, txtSelection);

        insertAtCursor(textareaMarkdown, str);

        textareaMarkdown.focus();
        let sel = textareaMarkdown.selectionStart;
        textareaMarkdown.selectionStart = sel + offset;
        textareaMarkdown.selectionEnd = sel + offset;

        insertAtCursor(textareaMarkdown, txtSelection);

        cmMarkdown.setValue(textareaMarkdown.value);
    }
});

function getTextareaSelection(textarea) {
    let start = textarea.selectionStart;
    let finish = textarea.selectionEnd;
    return textarea.value.substring(start, finish);
}

app.ports.insertFootnote.subscribe(function(insertFnTuple) {
    let [fnNumber, fnContent] = insertFnTuple;
    /* fnNumber for example : [^n] 
     fnContent is [^n]: content */

    if (selectedEditor == editorCmMd) {
        let currentSelection = cmMarkdown.getSelection();
        cmMarkdown.replaceSelection(currentSelection + " " + fnNumber);
        cmMarkdown.focus();
        appendToCodemirrorContent(fnContent);
        textareaMarkdown.value = cmMarkdown.getValue();
    } else if (selectedEditor == editorTxtMd) {
        let txtSelection = getTextareaSelection(textareaMarkdown);
        insertAtCursor(textareaMarkdown, txtSelection + " " + fnNumber);
        textareaMarkdown.val(textareaMarkdown.val() + fnContent);
        cmMarkdown.setValue(textareaMarkdown.value);
        textareaMarkdown.focus();
    }
});

function appendToCodemirrorContent(data) {
    var doc = cmMarkdown.getDoc();
    var cursor = doc.getCursor(); // gets the line number in the cursor position
    var line = doc.getLine(cursor.line); // get the line contents
    var pos = { // create a new object to avoid mutation of the original selection
        line: (doc.size + 5),
        ch: line.length - 1 // set the character position to the end of the line
    }
    doc.replaceRange('\n' + data + '\n', pos); // adds a new line
}


app.ports.convertMarkdown.subscribe(function(md) {
    mdToRender = md;
    toRender = true;
});


// scrolling

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type == "characterData")

            // :)
            if (typeof mutation.target.parentNode.scrollIntoView === 'function') {
                mutation.target.parentNode.scrollIntoView();
                /* this used to work,
                 * but I noticed that changes are mostly to the inner-text content of nodes, 
                 * and text content cannot be scrolled to. So I use the parent.
                 * Fortunately (?) asking the type of non-existent things return string "undefined" in js.
                 */

            }
    });
});
var observerConfig = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
}
observer.observe(document.getElementById("preview"), observerConfig);

app.ports.setPreviewContent.subscribe(function(content) {
    var preview = document.getElementById("preview")
    var newTo = document.createElement('div');
    newTo.id = "preview";
    newTo.classList.add("exposition");
    newTo.classList.add("exposition-content");

    //console.log('newto',newTo);

    newTo.innerHTML = content;
    try {
        morphdom(preview, newTo);
    } catch (err) {
        console.log('morphdom: invalid html');
    }


});


textareaMarkdown.addEventListener("input", function() {
    cmMarkdown.setValue(textareaMarkdown.value);
});

function setMdLength() {
    mdLength = mdToRender.length;
    renderInterval = Math.pow(2, mdLength / 2000) * 200;
}

setMdLength();
setInterval(setMdLength, 20000);


setInterval(function() {
    if (toRender) {
        /* app.ports.getHtml.send(marked(mdToRender)); */
        app.ports.getHtml.send({
            html: mdIt.render(mdToRender),
            toc: mdIt.headers
        });
        //	 console.log(mdIt.headers);
        mdIt.headers = [];
        toRender = false;

    }
}, renderInterval);


app.ports.reportIsSaved.subscribe(function(isSaved) {
    /* this function prevents closing tab if unsaved content */
    if (isSaved) {
        window.onbeforeunload = null;
    } else {
        window.onbeforeunload = function() {
            return "unsaved content";
        };
    }
});

function toggleFullscreen(shouldBecomeFull) {
    let mainContainer = document.getElementsByClassName("container-fluid main");
    let editorCol = document.getElementsByClassName("editor-col");

    console.log(editorCol[0]);

    if (!mainContainer[0] || !editorCol[0]) {
        console.log("fullscreen cannot find elements");
    }

    if (shouldBecomeFull === true) {
        mainContainer[0].classList.add("fullscreen");
        editorCol[0].classList.remove("col-sm-6");
        editorCol[0].classList.add("col-sm-12");
    } else {
        mainContainer[0].classList.remove("fullscreen");
        editorCol[0].classList.remove("col-sm-12");
        editorCol[0].classList.add("col-sm-6");
    }
};

/* 
 *  app.ports.reloadPage.subscribe(function () {
 *      location.reload();
 *  }); */
