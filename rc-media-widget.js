'use strict'

let createSelect = function ( options ) {
    let selectMenu = document.createElement("select");
    
    for (let i = 0 ;i < options.length;i++) {
	let option = document.createElement("option");
	option.value = options[i];
	option.textContent = options[i];
	selectMenu.appendChild(option);
    }
    
    return selectMenu;
}

let mediaWidgetMain = function ( ) {
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    editor.getDoc().setValue('Some text is textier than others. There is some more text and some more \n then text continues \n and we have more words. Words are a great way to make text bla bla.');
    
    let htmlNode = document.createElement("div");

    let title = document.createElement("h1");
    title.textContent = "edit media";
    htmlNode.appendChild(title);

    let form = document.createElement("form");
    htmlNode.appendChild(form);

    let input = document.createElement("input");
    input.type = 'text';
    form.appendChild(input);

    let submit = document.createElement("button");
    submit.textContent = 'submit';
    form.appendChild(submit);

    let dropDown = createSelect( [ "big" , "medium" , "small" , "left", "right" ]);
    form.appendChild(dropDown);

    htmlNode.appendChild(form);
    
    htmlNode.style = "border: 1px red solid";

    editor.addWidget({ch:0 , line: 3},htmlNode, true);

    
    // call this after you initialized the editor.
    // the position must be like this {ch: YourCharecterNumber, line: YourLineNumber}
}

document.addEventListener("DOMContentLoaded", function(event) { 
    mediaWidgetMain();
});

