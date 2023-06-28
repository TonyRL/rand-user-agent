const { diff, gte, patch } = require('semver');

(async () => {
    const upstreamPackageJson = await fetch('https://registry.npmjs.com/rand-user-agent');
    const upstreamVersion = (await upstreamPackageJson.json())['dist-tags'].latest;
    const localPackageJson = await fs.readJson('package.json');
    const { version: forkVersion } = localPackageJson;

    echo(`Current local version: ${forkVersion}`);
    echo(`Upstream version: ${upstreamVersion}`);

    if (patch(forkVersion) >= patch(upstreamVersion) && diff(forkVersion, upstreamVersion) !== 'patch') {
        return;
    }

    echo("Upstream's patch version is higher than local version, updating...");
    await fs.remove('data/user-agents.json');
    const updatedUa = await fetch(`https://cdn.jsdelivr.net/npm/rand-user-agent@${upstreamVersion}/data/user-agents.json`);
    await fs.writeFile('data/user-agents.json', await updatedUa.text());

    localPackageJson.version = `1.1.${patch(upstreamVersion)}`;
    await fs.writeJson('package.json', localPackageJson, { spaces: 2 });

    return {
        continue: true,
        version: `v${localPackageJson.version}`,
    };
})();
