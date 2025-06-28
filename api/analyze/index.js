const { analyzePatterns, generateInsights } = require('../../utils/functions');
const {
    resetApiCallCount,
    getApiCallCount,
    fetchUserInfo,
    fetchRepos,
    fetchLanguages,
    fetchCommitCount
} = require('../../lib/github');


module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const username = req.query.username || (req.body && req.body.username);
    if (!username) {
        return res.status(400).json({ error: 'Username is required as query param or in POST body' });
    }

    resetApiCallCount();
    const startTime = Date.now();

    console.log(`Starting analysis for: ${username}`);

    try {
        const [userInfo, repos] = await Promise.all([
            fetchUserInfo(username),
            fetchRepos(username)
        ]);

        if (!userInfo) {
            console.log('User not found or failed to fetch user info');
            return res.status(404).json({ error: 'User not found or failed to fetch user info.' });
        }

        if (!repos.length) {
            console.log('No repos found');
            return res.status(404).json({ error: 'No repositories found for this user.' });
        }

        const originals = repos.filter(r => !r.fork);
        const top20 = originals.slice(0, 20);

        console.log(`Analyzing top ${top20.length} original repos`);

        const detailed = await Promise.all(top20.map(async repo => {
            const langs = await fetchLanguages(username, repo.name);
            const commits = await fetchCommitCount(username, repo.name);
            return {
                name: repo.name,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                commits,
                primaryLanguage: repo.language,
                sizeMB: (repo.size / 1024).toFixed(2),
                created: repo.created_at,
                updated: repo.updated_at,
                url: repo.html_url,
                languages: langs
            };
        }));

        const allLangs = {};
        detailed.forEach(repo => {
            for (const [lang, bytes] of Object.entries(repo.languages)) {
                allLangs[lang] = (allLangs[lang] || 0) + bytes;
            }
        });

        const patterns = analyzePatterns(repos);
        const insights = generateInsights(repos, allLangs, patterns);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Analysis complete in ${duration}s`);
        console.log(`Total GitHub API calls: ${getApiCallCount()}`);

        return res.status(200).json({
            userInfo,
            user: username,
            summary: {
                totalRepos: repos.length,
                publicRepos: originals.length,
                totalLanguages: Object.keys(allLangs).length
            },
            topRepos: detailed,
            languageStats: allLangs,
            activity: patterns,
            insights,
            generatedAt: new Date().toISOString(),
            stats: {
                githubApiCalls: getApiCallCount(),
                analysisTimeSeconds: duration
            }
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to analyze user.', message: err.message });
    }
};
