import staticy = require("staticy");
import sass = require("node-sass");

export const sassCompiler: staticy.TextTransform = {
    changeFileName(fileName) {
        return fileName.replace(/\.scss$/, ".css");
    },
    transform(context): staticy.TextTransformResult {
        return {
            content: sass.renderSync({ data: context.content }).css.toString("utf-8")            
        };
    }
};
