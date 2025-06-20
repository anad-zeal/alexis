// .eleventy.js
module.exports = function(eleventyConfig) {
    // Copy any 'assets' folder and 'images' folder to the output directory
    // These paths are relative to your project's root (where .eleventy.js is)
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("images");

    return {
        // Look for templates and content in the current directory (`.`)
        // Output the built site to a folder named `_site`
        dir: {
            input: ".",
            output: "_site"
        }
    };
};