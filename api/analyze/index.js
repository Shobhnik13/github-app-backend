const { analyzePatterns, generateInsights } = require('../../utils/functions');
const {
    resetApiCallCount,
    getApiCallCount,
    fetchUserInfo,
    fetchRepos,
    fetchLanguages,
    fetchCommitCount
} = require('../../lib/github');
const { redis } = require('../../lib/redis');


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
    const cachekey = `github:analysis:${username}`
    try {
        const cachedData = await redis.get(cachekey)
        if (cachedData) {
            console.log(`cache hit for ${cachekey}`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        const userInfo = await fetchUserInfo(username);
        if (!userInfo) {
            console.log(`User not found: ${username}`);
            return res.status(404).json({
                error: 'GitHub user not found.',
                user: username,
                status: 'user_not_found'
            });
        }

        const repos = await fetchRepos(username);

        if (!repos.length) {
            console.log('No repos found');
            return res.status(404).json({ error: 'No public repositories found for this user.' });
        }

        const originals = repos.filter(r => !r.fork);
        const top20 = originals
            .sort((a, b) => {
                // If stars are the same like out of 50 total repos 3 have stars so they will get at top acc to stars but rest 47 2 have same stars so future or recent cretaed will be at top rest 45 are arranged basis of recent creation date, sort by creation date (newest first)
                if (b.stargazers_count === a.stargazers_count) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.stargazers_count - a.stargazers_count;
            })
            .slice(0, 20);
            
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
        // caache
        const setData = await redis.set(cachekey, JSON.stringify(result), 'EX', 2 * 60 * 60)
        if (setData) {
            console.log(`cache set for ${cachekey}`);
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        return res.status(500).json({ error: 'Failed to analyze user.', message: err.message });
    }
};