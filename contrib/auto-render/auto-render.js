(function() {
    function findEndOfMath(delimiter, text) {
        // Adapted from
        // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
        var index = 0;
        var braceLevel = 0;

        var delimLength = delimiter.length;

        while (index < text.length) {
            var character = text[index];

            if (braceLevel <= 0 &&
                text.substr(index, delimLength) === delimiter) {
                return index;
            } else if (character === "\\") {
                index++;
            } else if (character === "{") {
                braceLevel++;
            } else if (character === "}") {
                braceLevel--;
            }

            index++;
        }

        return -1;
    }

    function splitAtDelimiters(startData, leftDelim, rightDelim, display) {
        var finalData = [];

        for (var i = 0; i < startData.length; i++) {
            if (startData[i].type === "text") {
                var text = startData[i].data;

                var lookingForLeft = true;
                var currIndex = 0;
                var nextIndex;

                nextIndex = text.indexOf(leftDelim);
                lookingForLeft = false;
                if (nextIndex !== -1) {
                    currIndex = nextIndex;
                    finalData.push({
                        type: "text",
                        data: text.substr(0, currIndex)
                    });
                }

                while (nextIndex !== -1) {
                    if (lookingForLeft) {
                        nextIndex = text.slice(currIndex).indexOf(leftDelim);
                        if (nextIndex === -1) break;

                        finalData.push({
                            type: "text",
                            data: text.substr(currIndex, nextIndex)
                        });

                        currIndex = currIndex + nextIndex;
                    } else {
                        nextIndex = findEndOfMath(
                            rightDelim,
                            text.slice(currIndex + leftDelim.length));
                        if (nextIndex === -1) break;

                        finalData.push({
                            type: "math",
                            data: text.substr(
                                currIndex + leftDelim.length, nextIndex),
                            display: display
                        });

                        currIndex = currIndex + nextIndex +
                            leftDelim.length + rightDelim.length;
                    }

                    lookingForLeft = !lookingForLeft;
                }

                finalData.push({
                    type: "text",
                    data: text.slice(currIndex)
                });
            } else {
                finalData.push(startData[i]);
            }
        }

        return finalData;
    }

    function splitWithDelimiters(text, delimiters) {
        var data = [{type: "text", data: text}];
        for (var i = 0; i < delimiters.length; i++) {
            var delimiter = delimiters[i];
            data = splitAtDelimiters(
                data, delimiter.left, delimiter.right,
                delimiter.display || false);
        }
        return data;
    }

    function renderMathInText(text, delimiters) {
        var data = splitWithDelimiters(text, delimiters);

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            if (data[i].type === "text") {
                fragment.appendChild(document.createTextNode(data[i].data));
            } else {
                var span = document.createElement("span");
                var math = data[i].data;
                katex.render(math, span, {
                    displayMode: data[i].display
                });
                fragment.appendChild(span);
            }
        }

        return fragment;
    }

    function processElem(elem, delimiters, ignoredTags) {
        for (var i = 0; i < elem.childNodes.length; i++) {
            var childNode = elem.childNodes[i];
            if (childNode.nodeType === 3) {
                // Text node
                var frag = renderMathInText(childNode.textContent, delimiters);
                i += frag.childNodes.length - 1;
                elem.replaceChild(frag, childNode);
            } else if (childNode.nodeType === 1) {
                // Element node
                var shouldProcess = ignoredTags.indexOf(
                    childNode.nodeName.toLowerCase()) === -1;

                if (shouldProcess) {
                    processElem(childNode, delimiters, ignoredTags);
                }
            } else {
                // Something else, ignore
            }
        }
    }

    var defaultOptions = {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "\\[", right: "\\]", display: true},
            {left: "\\(", right: "\\)", display: false}
            // LaTeX uses this, but it ruins the display of normal `$` in text:
            // {left: "$", right: "$", display: false},
        ],

        ignoredTags: [
            "script", "noscript", "style", "textarea", "pre", "code"
        ]
    };

    function extend(obj) {
        // Adapted from underscore.js' `_.extend`. See LICENSE.txt for license.
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (Object.prototype.hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    function processMathInElement(elem, options) {
        if (!elem) {
            throw new Error("No element provided to process");
        }

        options = extend({}, defaultOptions, options);

        processElem(elem, options.delimiters, options.ignoredTags);
    }

    window.processMathInElement = processMathInElement;
})(window);
