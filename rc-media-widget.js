'use strict'

let mediaWidgetMain = function ( ) {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    editor.getDoc().setValue('Fishing is a fishy sport');
    
    let htmlNode = document.createElement("h1");
    htmlNode.textContent = "W I D G E T";

    let form = document.createElement("form");

    let input = document.createElement("input");
    input.type = 'text';
    form.appendChild(input);

    let submit = document.createElement("button");
    submit.textContent = 'submit';
    form.appendChild(submit);

    htmlNode.appendChild(form);
    
    htmlNode.style = "border: 1px red solid";

    editor.addWidget({ch:0 , line: 1},htmlNode, true);

    
    // call this after you initialized the editor.
    // the position must be like this {ch: YourCharecterNumber, line: YourLineNumber}
}

document.addEventListener("DOMContentLoaded", function(event) { 
    mediaWidgetMain();
});

