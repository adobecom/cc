// Function to form GitHub API URLs for the PRs
const extractPRData = (prBody) => {
  const lines = prBody.trim().split('\n');
  /**
   * ^-\s*                 : Match a dash followed by optional whitespace at the start of the line
   * (https:\/\/github\.com\/ : Match the GitHub URL prefix and capture the whole URL
   * ([^\/]+)\/            : Capture the repository owner (one or more non-slash characters)
   * ([^\/]+)\/            : Capture the repository name (one or more non-slash characters)
   * pull\/(\d+))          : Capture the pull request number (one or more digits)
   * (?:\s*:\s*(.*))?      : Optionally match whitespace and capture if any description after the pr
   */
  const prLinkMatchExp = /^-\s*(https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+))(?:\s*:\s*(.*))?$/;

  return lines
    .filter((line) => prLinkMatchExp.test(line.trim().replace(/(^'|'$)/g, '')))
    .map((line) => {
      const [, , owner, repo, prNumber] = line.trim().replace(/(^'|'$)/g, '').match(prLinkMatchExp);
      return { owner, repo, prNumber };
    });
};

// Function to fetch PR details using Octokit
const fetchPRDetails = async (prData, octokit) => {
  const promises = prData.map(
    ({ owner, repo, prNumber }) => octokit.pulls.get({ owner, repo, pull_number: prNumber }),
  );

  const result = await Promise.allSettled(promises);
  return result
    .filter((e) => e.status === 'fulfilled')
    .map((e) => e.value.data);
};

// Function to prepare a map of PR numbers to titles
const preparePRTitleMap = async (prBody, octokit) => {
  const prData = extractPRData(prBody);
  const prDetails = await fetchPRDetails(prData, octokit);

  return prDetails.reduce((pv, { number, title }) => {
    pv[number] = title;
    return pv;
  }, {});
};

// Function to parse text and convert it into Slack blocks
const parseTextToSlackBlocks = async (inputText, octokit) => {
  const prNumberTitleMap = await preparePRTitleMap(inputText, octokit);
  const prLinkRegex = /^-\s*(https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+))(?:\s*:\s*(.*))?$/;
  const mdLinkRegex = /^(.+)\[([\w+]+)\]\((.+)\)/gi;
  const unorderedListRegex = /^\s*[-+*]\s+(.*$)/gim;
  const orderedListRegex = /^\s*(\d+)\.\s+(.*$)/gim;

  const slackBlocks = [];

  // Process each line of input text
  inputText
    .trim()
    .split('\n')
    .forEach((line) => {
      let formattedLine = line.trim().replace(/(^'|'$)/g, ''); // Remove leading and trailing quotes

      const prLinkMatch = formattedLine.match(prLinkRegex);
      const mdLinkMatch = formattedLine.match(mdLinkRegex);

      /**
       * Replace the MD Link format to Slack link format
       * Ex:
       *  MD format: - [Link](https://www.adobe.com/)
       *  Slack format: - <https://www.adobe.com/|Link>
       * */
      if (mdLinkMatch) formattedLine = formattedLine.replace(mdLinkRegex, '$1 <$3|$2>');
      // Convert unordered lists
      formattedLine = formattedLine.replace(unorderedListRegex, '\t• $1');
      // Convert ordered lists
      formattedLine = formattedLine.replace(orderedListRegex, '\t$1. $2');
      // Convert the Bold block
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/gim, '*$1*');

      if (formattedLine === '') {
        slackBlocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: '\n' },
        });
        return;
      }

      if (prLinkMatch) {
        // const [_, prLink, owner, repo, prNumber, lineDescription] = prLinkMatch;
        const [, prLink, , , prNumber, lineDescription] = prLinkMatch;
        const prTitle = prNumberTitleMap[prNumber];
        slackBlocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\t• :merged: <${prLink}|*${prTitle}* #${prNumber}>${
              lineDescription ? ` - ${lineDescription}` : ''
            }`,
          },
        });
        return;
      }

      if (formattedLine.startsWith('### ')) {
        slackBlocks.push({
          type: 'header',
          text: {
            type: 'plain_text',
            text: line.replace('### ', ''),
            emoji: true,
          },
        });
        slackBlocks.push({ type: 'divider' });
        return;
      }

      slackBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: formattedLine },
      });
    });

  return slackBlocks;
};

module.exports = { parseTextToSlackBlocks };
