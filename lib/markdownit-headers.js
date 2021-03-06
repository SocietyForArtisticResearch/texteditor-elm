'use strict';


module.exports = function(md) {


    function stringToId(str) {
	return str.replace(/[^A-Z0-9]+/ig, "-");
    }
    
    md.renderer.rules.heading_open = function(tokens, index) {
        var level = tokens[index].tag;
        var label = tokens[index + 1];
        if (label.type === 'inline') {
            var anchor = label.map[0];
	    var idLabel = "header-" + stringToId(label.content + "-" + anchor);
	    md.headers.push([level,label.content,idLabel]);
            return '<' + level + '><a id="' + idLabel + '"></a>';
        } else {
            return '</h1>';
        }
    };


};
