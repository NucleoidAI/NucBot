const { get } = require("axios").default;

class GithubService {
  

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

