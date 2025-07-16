const STAGE = 'stage';
const PROD = 'main';
const PR_TITLE = `[Release] Stage to Main ${new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}`;
let github, owner, repo;
let body = `
**Creative cloud:**
- Before: https://${PROD}--cc--adobecom.aem.live/?martech=off
- After: https://${STAGE}--cc--adobecom.aem.live/?martech=off
`;
const REQUIRED_APPROVALS = process.env.REQUIRED_APPROVALS || 1;
const BASE_MAX_MERGES = process.env.MAX_PRS_PER_BATCH ? Number(process.env.MAX_PRS_PER_BATCH) : 9;
const MAX_MERGES = BASE_MAX_MERGES + (isWithinPrePostRCP() ? 3 : 0);
const MIN_APPROVAL_TO_STOP_MERGE = 1;
let existingPRCount = 0;
const LABELS = {
  highPriority: 'high priority',
  readyForStage: 'ready for stage',
  SOTPrefix: 'SOT',
  zeroImpact: 'zero-impact',
  verified: 'verified',
};
const TEAM_MENTIONS = [
  '@adobecom/creative-cloud-sot',
];

const getChecks = ({ pr, github, owner, repo }) =>
  github.rest.checks
    .listForRef({ owner, repo, ref: pr.head.sha })
    .then(({ data }) => {
      const checksByName = data.check_runs.reduce((map, check) => {
        if (
          !map.has(check.name) ||
          new Date(map.get(check.name).completed_at) <
          new Date(check.completed_at)
        ) {
          map.set(check.name, check);
        }
        return map;
      }, new Map());
      pr.checks = Array.from(checksByName.values());
      return pr;
    });

const getReviews = ({ pr, github, owner, repo }) =>
  github.rest.pulls
    .listReviews({
      owner,
      repo,
      pull_number: pr.number,
    })
    .then(({ data }) => {
      pr.reviews = data;
      return pr;
    });

const commentOnPR = async (comment, prNumber) => {
  console.log(comment); // Logs for debugging the action.
  const { data: comments } = await github.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const dayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const hasRecentComment = comments
    .filter(({ created_at }) => new Date(created_at) > dayAgo)
    .some(({ body }) => body === comment);
  if (hasRecentComment) return console.log('Comment exists for', prNumber);

  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: comment,
  });
};

const hasFailingChecks = (checks) =>
  checks.some(
    ({ conclusion, name }) =>
      name !== 'merge-to-stage' && conclusion === 'failure'
  );

const addFiles = ({ pr, github, owner, repo }) =>
  github.rest.pulls
    .listFiles({ owner, repo, pull_number: pr.number })
    .then(({ data }) => {
      pr.files = data.map(({ filename }) => filename);
      return pr;
    });

const addLabels = ({ pr, github, owner, repo }) =>
  github.rest.issues
    .listLabelsOnIssue({ owner, repo, issue_number: pr.number })
    .then(({ data }) => {
      pr.labels = data.map(({ name }) => name);
      return pr;
    });

const merge = async ({ prs, type }) => {
  console.log(`Merging ${prs.length || 0} ${type} PRs that are ready... `);

  for await (const { number, files, html_url, title } of prs) {
    try {
      if (mergeLimitExceeded()) return;
      if (!process.env.LOCAL_RUN) {
        await github.rest.pulls.merge({
          owner,
          repo,
          pull_number: number,
          merge_method: 'squash',
        });
      }
      if (type !== LABELS.zeroImpact) {
        existingPRCount++;
      }
      console.log(`Current number of PRs merged: ${existingPRCount} (exluding Zero Impact)`);
      const prefix = type === LABELS.zeroImpact ? ' [ZERO IMPACT]' : '';
      body = `-${prefix} ${html_url}\n${body}`;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      commentOnPR(`Error merging ${number}: ${title} ` + error.message, number);
    }
  }
};

const openStageToMainPR = async () => {
  const { data: comparisonData } = await github.rest.repos.compareCommits({
    owner,
    repo,
    base: PROD,
    head: STAGE,
  });

  for (const commit of comparisonData.commits) {
    const { data: pullRequestData } =
      await github.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: commit.sha,
      });
    for (const pr of pullRequestData) {
      if (!body.includes(pr.html_url)) body = `- ${pr.html_url}\n${body}`;
    }
  }

  try {
    const {
      data: { html_url, number },
    } = await github.rest.pulls.create({
      owner,
      repo,
      title: PR_TITLE,
      head: STAGE,
      base: PROD,
      body,
    });

    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: `Testing can start ${TEAM_MENTIONS.join(' ')}`,
    });
  } catch (error) {
    if (error.message.includes('No commits between main and stage'))
      return console.log('No new commits, no stage->main PR opened');
    throw error;
  }
};

const getPRs = async (stageToMainPR) => {
  let prs = await github.rest.pulls
    .list({ owner, repo, state: 'open', per_page: 100, base: STAGE })
    .then(({ data }) => data);
  await Promise.all(prs.map((pr) => addLabels({ pr, github, owner, repo })));
  await Promise.all([
    ...prs.map((pr) => addFiles({ pr, github, owner, repo })),
    ...prs.map((pr) => getChecks({ pr, github, owner, repo })),
    ...prs.map((pr) => getReviews({ pr, github, owner, repo })),
  ]);
  const StagePrApprovals = stageToMainPR?.reviews.filter(({ state }) => state === 'APPROVED');
  prs = prs.filter(({ checks, reviews, number, title, labels }) => {
    if (hasFailingChecks(checks)) {
      commentOnPR(
        `Skipped merging ${number}: ${title} due to failing checks`,
        number
      );
      return false;
    }
    if (!labels.includes(LABELS.verified)) {
      commentOnPR(
        `Skipped merging ${number}: ${title} due to missing verified label. kindly make sure that the PR has been verified`,
        number
      );
      return false;
    }
    if (!labels.includes(LABELS.readyForStage)) {
      commentOnPR(
        `Skipped merging ${number}: ${title} due to missing ${LABELS.readyForStage} label. kindly make sure that the PR is ${LABELS.readyForStage}`,
        number
      );
      return false;
    }

    const approvals = reviews.filter(({ state }) => state === 'APPROVED');
    if (approvals.length < REQUIRED_APPROVALS) {
      commentOnPR(
        `Skipped merging ${number}: ${title} due to insufficient approvals. Required: ${REQUIRED_APPROVALS} approvals`,
        number
      );
      return false;
    }
    if (StagePrApprovals?.length >= MIN_APPROVAL_TO_STOP_MERGE) {
      commentOnPR(
        `Skipped merging as stage to main PR already exists with one or more approvals, Merging will be attempted in the next batch.`,
        number
      );
      return false;
    }
    return true;
  });
  return prs.reverse().reduce(
    (categorizedPRs, pr) => {
      console.log("PR", pr.labels)
      if (pr.labels.includes(LABELS.zeroImpact)) {
        categorizedPRs.zeroImpactPRs.push(pr);
      } else if (pr.labels.includes(LABELS.highPriority)) {
        categorizedPRs.highImpactPRs.push(pr);
      } else {
        categorizedPRs.normalPRs.push(pr);
      }
      return categorizedPRs;
    },
    { zeroImpactPRs: [], highImpactPRs: [], normalPRs: [] }
  );
}

const getStageToMainPR = () =>
  github.rest.pulls
    .list({ owner, repo, state: 'open', base: PROD })
    .then(({ data } = {}) => data.find(({ title } = {}) => title.includes('[Release] Stage to Main')))
    .then((pr) => pr && addLabels({ pr, github, owner, repo }))
    .then((pr) => pr && addFiles({ pr, github, owner, repo }))
    .then((pr) => pr && getReviews({ pr, github, owner, repo }))

const mergeLimitExceeded = () => MAX_MERGES - existingPRCount < 0;

const main = async (params) => {
  github = params.github;
  owner = params.context.repo.owner;
  repo = params.context.repo.repo;
  try {
    const stageToMainPR = await getStageToMainPR();
    console.log("Stage to main PR exits", !!stageToMainPR);
    if (stageToMainPR) body = stageToMainPR.body;
    const { zeroImpactPRs, highImpactPRs, normalPRs } = await getPRs(stageToMainPR);
    await merge({ prs: zeroImpactPRs, type: LABELS.zeroImpact });
    if (stageToMainPR?.labels.some((label) => label.includes(LABELS.SOTPrefix)))
      return console.log('PR exists & testing started. Stopping execution.');
    await merge({ prs: highImpactPRs, type: LABELS.highPriority });
    await merge({ prs: normalPRs, type: 'normal' });
    //create or merge to existing PR.
    if (zeroImpactPRs.length > 0 || highImpactPRs.length > 0 || normalPRs.length > 0) {
      if (!stageToMainPR) await openStageToMainPR();
      if (stageToMainPR && body !== stageToMainPR.body) {
        console.log("Updating PR's body...");
        await github.rest.pulls.update({
          owner,
          repo,
          pull_number: stageToMainPR.number,
          body: body,
        });
      }
      console.log('*** Process successfully executed.***');
    }
  } catch (err) {
    console.error(err);
  }
};

if (process.env.LOCAL_RUN) {
  const { github, context } = getLocalConfigs();
  main({
    github,
    context,
  });
}

module.exports = main;
