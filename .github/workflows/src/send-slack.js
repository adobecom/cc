const { parseTextToSlackBlocks } = require('./helpers.js');

// Those env variables are set by an github action automatically
const [owner, repo] = process.env.GITHUB_REPOSITORY?.split('/') || '';
const auth = process.env.GITHUB_TOKEN;

/**
 * Function to send Slack message
 * @param {string} prNumber - PR number
 * @param {string} slackWebHookURL - Slack webhook URL
 * @returns {Promise} - Promise representing the result of the Slack message sending process
 */
const sendReleaseNotes = async (prNumber, slackWebHookURL) => {
  console.log({ owner, repo, prNumber });

  try {
    const number = parseInt(prNumber, 10);
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth });
    const { status, data } = await octokit.pulls.get({
      pull_number: number,
      owner,
      repo,
    });
    if (status !== 200) throw new Error('Cannot fetch the PR details');

    const { html_url: prLink, title, body } = data;
    const formattedBodyBlocks = await parseTextToSlackBlocks(body, octokit);
    const titleBlocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':rocket: Production Release',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${prLink}| *#${number}: ${title}*>`,
        },
      },
    ];

    const slackBodyBlocks = JSON.stringify({ blocks: [...titleBlocks, ...formattedBodyBlocks] });

    console.log('Message', slackBodyBlocks);

    // Send message to Slack webhook
    const result = await fetch(slackWebHookURL, {
      method: 'POST',
      body: slackBodyBlocks,
      headers: { 'Content-type': 'application/json' },
    }).catch(console.error);

    if (result.status === 200) console.log('Slack Message sent');
    else {
      console.log(
        `Slack Message not sent ${result.status}:${result.statusText}`
      );
      console.log(result);
    }

    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = { sendReleaseNotes };
