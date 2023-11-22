const fs = require("fs");
const { execSync } = require("child_process");
const GithubService = require('./githubService.js');

const githubService = new GithubService(); 

const homedir = require("os").homedir();
const date = new Date(Date.now() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

if (!fs.existsSync(`${homedir}/backups/${date}`)) {
  fs.mkdirSync(`${homedir}/backups/${date}`, {
    recursive: true,
  });
}

githubService.getRepos().then(repos => {
  repos.forEach((repo) => {
    execSync(`git clone --mirror https://github.com/NucleoidJS/${repo}`);
    execSync(`tar -czvf ${repo}.tar.gz ${repo}/`);
    execSync(`rm -Rf ${repo}`);
    execSync(`mv ${repo}.tar.gz ${homedir}/backups/${date}/`);
  });

execSync(`aws s3 sync ${homedir}/backups/ s3://backups.nucleoid.com/GitHub/`);
})