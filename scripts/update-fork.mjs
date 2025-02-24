import 'zx/globals';
import { diff, patch } from 'semver';

/**
 * @param { { core: import('@actions/core') } }
 */
export default async ({ core }) => {
    const upstreamPackageJson = await fetch('https://registry.npmjs.com/rand-user-agent');
    const upstreamVersion = (await upstreamPackageJson.json())['dist-tags'].latest;
    const localPackageJson = await fs.readJson('package.json');
    const { version: forkVersion } = localPackageJson;

    echo(`Current local version: ${forkVersion}`);
    echo(`Upstream version: ${upstreamVersion}`);

    if (patch(forkVersion) >= patch(upstreamVersion) && diff(forkVersion, upstreamVersion) !== 'patch') {
        return;
    }

    echo('Upstream version is greater than current version');
    const updatedUa = await fetch(`https://cdn.jsdelivr.net/npm/rand-user-agent@${upstreamVersion}/data/user-agents.json`);
    const updatedUaText = await updatedUa.text();

    try {
        const parsed = JSON.parse(updatedUaText);
        if (!parsed || Object.keys(parsed).length === 0) {
            throw new Error('Upstream ua data is empty');
        }
    } catch (e) {
        echo('Failed to validate upstream user agents data');
        throw e;
    }

    await fs.remove('data/user-agents.json');
    await fs.writeFile('data/user-agents.json', updatedUaText);

    localPackageJson.version = `1.1.${patch(upstreamVersion)}`;
    await fs.writeJson('package.json', localPackageJson, { spaces: 2 });

    return {
        continue: true,
        version: `v${localPackageJson.version}`,
    };
};
