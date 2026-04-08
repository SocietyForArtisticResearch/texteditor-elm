#!/bin/bash
set -e

echo "Creating build directory structure..."
mkdir -p "build/lib/icons"

echo "Compiling Elm..."
elm make --optimize --output="build/elm.js" src/Main.elm


js="build/elm.js"
min="build/elm.js"

uglifyjs $js --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters,keep_fargs=false,unsafe_comps,unsafe' | uglifyjs --mangle --output $min

echo "Compiled size:$(cat $js | wc -c) bytes  ($js)"
echo "Minified size:$(cat $min | wc -c) bytes  ($min)"
echo "Gzipped size: $(cat $min | gzip -c | wc -c) bytes"

echo "Copying assets..."
cp editor.html         "build/editor.html"
cp editor.js           "build/editor.js"
cp rc-media-widget.js  "build/rc-media-widget.js"
cp style.css           "build/style.css"

cp lib/codemirror.js                    "build/lib/"
cp lib/codemirror.css                   "build/lib/"
cp lib/markdown.js                      "build/lib/"
cp lib/markdown-it.min.js               "build/lib/"
cp lib/markdown-it-center-text.min.js   "build/lib/"
cp lib/markdown-it-footnote.min.js      "build/lib/"
cp lib/markdownit-headers-browser.js    "build/lib/"
cp lib/css.js                           "build/lib/"
cp lib/morphdom-umd.min.js              "build/lib/"

cp lib/icons/*.svg "build/lib/icons/"

echo "Done. Build output in ./build/"
