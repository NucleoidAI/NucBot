const GithubService = require("./githubService");
const discordContributors = require("./discord.json");

const githubService = new GithubService();

const contributors = [
  {
    id: 110643717,
    login: "NucBot",
  },
];

const generateTable = (contributors) => {
  let i = 1;
  let html = "<table><tr>";

  for (const { id, login } of contributors.values()) {
    if (i % 8 === 0) {
      html += "</tr><tr>";
    }

    html += '<td align="center">';
    html += `<a href="https://github.com/${login}">`;
    html += `<img src="https://avatars.githubusercontent.com/u/${id}?v=4&s=100" width="100px;" alt="User ${login}"/>`;
    html += "<br/>";
    html += `<sub>${login}</sub>`;
    html += "</a>";
    html += "</td>";

    i++;
  }

  return html + "</tr></table>";
};

async function generate() {
  const repos = await githubService.getRepos();
  
  for (const repo of repos) {
    const repoContributors = await githubService.getContributors(repo);
    const issueContributors = await githubService.getIssues(repo);

    contributors.push(...repoContributors, ...issueContributors);
  }

  contributors.push(...discordContributors);

  const map = new Map();
  contributors.forEach((contributor) => {
    map.set(contributor.id, contributor);
  });

  return generateTable(map);
}

generate().then((table) => console.log(table));

