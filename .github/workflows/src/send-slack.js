const { convertMarkdownToSlackFormat } = require('./helpers');

/**
 * Function to send Slack message
 * @param {string} pr_event - JSON string containing pull request details
 * @param {string} slack_webhook_url - Slack webhook URL
 * @returns {Promise} - Promise representing the result of the Slack message sending process
 */
const sendReleaseNotes = async (pr_event, slack_webhook_url) => {
  pr_event = JSON.parse(pr_event);
  const { number, html_url, title, body } = pr_event;

  console.log({
    number,
    html_url,
    title,
    body,
  });

  // Format message text for Slack
  const text = `\n
:rocket: *Production Release*\n\n
*TITLE:* ${title} | <${html_url}|#${number}>\n
*PR DESCRIPTION:*\n ${convertMarkdownToSlackFormat(body)}
`;

  console.log('slack text', text);

  // Send message to Slack webhook
  const result = await fetch(slack_webhook_url, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }).catch(console.error);

  return result;
};

module.exports = { sendReleaseNotes };
