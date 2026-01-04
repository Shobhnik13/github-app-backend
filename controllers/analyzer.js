const { analyzePatterns, generateInsights } = require('../utils/functions');
const {
    resetApiCallCount,
    getApiCallCount,
    fetchUserInfo,
    fetchRepos,
    fetchLanguages,
    fetchCommitCount
} = require('../lib/github');
const { redis } = require('../lib/redis');

module.exports = async function githubAnalysisController(req, res) {
    try {
        const username = req.params.username || req.body.username;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        resetApiCallCount();
        const startTime = Date.now();
        const cacheKey = `github:analysis:${username}`;

        console.log(`Starting analysis for: ${username}`);

        // ---------- CACHE ----------
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.status(200).json(JSON.parse(cached));
        }

        // ---------- USER ----------
        const userInfo = await fetchUserInfo(username);
        if (!userInfo) {
            return res.status(404).json({
                error: 'GitHub user not found',
                user: username
            });
        }

        // ---------- REPOS ----------
        const repos = await fetchRepos(username);
        if (!repos.length) {
            return res.status(404).json({
                error: 'No public repositories found'
            });
        }

        const originals = repos.filter(r => !r.fork);

        const top20 = originals
            .sort((a, b) => {
                if (b.stargazers_count === a.stargazers_count) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.stargazers_count - a.stargazers_count;
            })
            .slice(0, 20);

        // ---------- REPO DETAILS ----------
        const detailed = await Promise.all(
            top20.map(async repo => {
                const languages = await fetchLanguages(username, repo.name);
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
                    languages
                };
            })
        );

        // ---------- LANGUAGE STATS ----------
        const allLangs = {};
        detailed.forEach(repo => {
            for (const [lang, bytes] of Object.entries(repo.languages)) {
                allLangs[lang] = (allLangs[lang] || 0) + bytes;
            }
        });

        // ---------- ANALYSIS ----------
        const patterns = analyzePatterns(repos);
        const insights = generateInsights(repos, allLangs, patterns);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        const result = {
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
        };

        // ---------- CACHE SET ----------
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60);

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Failed to analyze user',
            message: err.message
        });
    }
};
