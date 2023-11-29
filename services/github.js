const { get } = require("axios").default;

class GithubService {
    async getRepos() {
    const { data } = await get(`https://api.github.com/orgs/NucleoidJS/repos`);
    return data.map((repo) => repo.name);
  }

  async getContributors(repo) {
    const { data } = await get(
      `https://api.github.com/repos/NucleoidJS/${repo}/contributors`
    );
    return data;
  }

  async getIssues(repo) {
    const { data } = await get(
      `https://api.github.com/repos/NucleoidJS/${repo}/issues`
    );
    return data.map((issue) => issue.user);
  }
}

module.exports = GithubService;
