var fontMetrics = require("./fontMetrics");

/*
 * This file contains information about the different environments that KaTeX
 * offers. The `environments` object maps from environment names to objects
 * with the following data:
 *
 *  - alignment: A function which takes data about the environment and the
 *               index of the column (0-indexed), and should return the way the
 *               column should be aligned. Valid alignments are:
 *                - "center"
 *                - "right"
 *                - "left"
 *  - spacing: (optional) A function which takes data about the environment and
 *             the index of a column (0-indexed), and should return the amount
 *             of space (in ems) that should be placed before that column. The
 *             default value is a function which always returns `0`.
 *  - verticalSpace: (optional) A function which takes data about the
 *                   environment and returns the amount of vertical space that
 *                   should be added to the environment. It returns an object
 *                   with the following keys:
 *                    - "top": the amount of space added to the top, in ems
 *                    - "bottom": the amount of space added to the bottom, in ems
 *                   The default value is a function which returns
 *                   `{top: 0, bottom: 0}` (i.e., adding no vertical space).
 *  - maxColumns: (optional) An integer listing the maximum number of columns
 *                that an environment can support. The default value is
 *                `Infinity`.
 *  - alignMerge: (optional) In align environments (like "align" or "align*"),
 *                adjacent columns simulate "merging" by adding in an empty ord
 *                at the beginning of the second column. This function takes in
 *                data about the environment and index of a column (0-indexed),
 *                and returns whether a column should produce this fake merging
 *                effect (see the "align*" environment for an example of this).
 *                The default value is a function that always returns false.
 *
 * In these functions, "data about the environment" means all of the data in
 * `group.value` in the group functions in buildHTML/buildMathML.
 */

var environments = {
    "matrix": {
        alignment: function(data, column) {
            return "center";
        },

        spacing: function(data, column) {
            return (column > 0) ? 1.0 : 0.0;
        },

        verticalSpace: function(data) {
            return {
                top: fontMetrics.metrics.baselineSkip - 1.0,
                bottom: fontMetrics.metrics.baselineSkip - 1.0
            };
        }
    },

    "align*": {
        alignment: function(data, column) {
            if (column % 2 === 0) {
                return "right";
            } else {
                return "left";
            }
        },

        alignMerge: function(data, column) {
            if (column % 2 === 0) {
                return false;
            } else {
                return true;
            }
        },

        maxColumns: 2
    }
};

var defaults = {
    alignMerge: function() {
        return false;
    },

    spacing: function() {
        return 0;
    },

    verticalSpace: function() {
        return {
            top: 0,
            bottom: 0
        };
    },

    maxColumns: Infinity
};

for (var e in environments) {
    if (environments.hasOwnProperty(e)) {
        var env = environments[e];

        environments[e] = {
            alignment: env.alignment,
            alignMerge: env.alignMerge || defaults.alignMerge,
            spacing: env.spacing || defaults.spacing,
            verticalSpace: env.verticalSpace || defaults.verticalSpace,
            maxColumns: env.maxColumns == null ?
                defaults.maxColumns : env.maxColumns
        };
    }
}

module.exports = environments;
