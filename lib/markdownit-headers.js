'use strict';

module.exports = function(md) {

    md.renderer.rules.heading_open = function(tokens, index) {
        var level = tokens[index].tag;
        var label = tokens[index + 1];
        if (label.type === 'inline') {
            var anchor = label.map[0];
            return '<' + level + '><a id="' + "header-" + anchor + '"></a>';
        } else {
            return '</h1>';
        }
    };


};
