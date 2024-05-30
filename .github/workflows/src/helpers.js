/**
 * Function to convert Markdown text to Slack format
 * @param {string} markdown - Markdown text to be converted
 * @returns {string} - Converted Slack-formatted text
 */
function convertMarkdownToSlackFormat(markdown) {
  // Need to fix Italic regex
  // markdown = markdown.replace(/\*(.*?)\*/gim, "_$1_");

  // Convert bold text to slack format
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "*$1*");

  // Convert inline code to slack format
  markdown = markdown.replace(/`([^`]+)`/g, "```$1```");

  // Convert block quotes to slack format
  markdown = markdown.replace(/^> (.*$)/gim, "_$1_");

  // Convert unordered lists to slack format
  markdown = markdown.replace(/^\s*[-+*]\s+(.*$)/gim, "\t• $1");

  // Convert ordered lists to slack format
  markdown = markdown.replace(/^\s*\d+\.\s+(.*$)/gim, "\t1. $1");

  // Convert headings to slack format
  markdown = markdown.replace(/^(#+) (.*$)/gim, "*$2*");

  // Convert newlines to break lines to slack format
  markdown = markdown.replace(/\n/g, "\n");

  return markdown.trim();
}

module.exports = {
  convertMarkdownToSlackFormat,
};
