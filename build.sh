#!/bin/bash
set -e

BUILD=build

echo "Creating build directory structure..."
mkdir -p "$BUILD/lib/icons"

echo "Compiling Elm..."
elm make --optimize --output="$BUILD/elm.js" src/Main.elm

echo "Copying assets..."
cp editor.html         "$BUILD/editor.html"
cp editor.js           "$BUILD/editor.js"
cp rc-media-widget.js  "$BUILD/rc-media-widget.js"
cp style.css           "$BUILD/style.css"

cp lib/codemirror.js                    "$BUILD/lib/"
cp lib/codemirror.css                   "$BUILD/lib/"
cp lib/markdown.js                      "$BUILD/lib/"
cp lib/markdown-it.min.js               "$BUILD/lib/"
cp lib/markdown-it-center-text.min.js   "$BUILD/lib/"
cp lib/markdown-it-footnote.min.js      "$BUILD/lib/"
cp lib/markdownit-headers-browser.js    "$BUILD/lib/"
cp lib/css.js                           "$BUILD/lib/"
cp lib/morphdom-umd.min.js              "$BUILD/lib/"

cp lib/icons/*.svg "$BUILD/lib/icons/"

echo "Done. Build output in ./$BUILD/"
