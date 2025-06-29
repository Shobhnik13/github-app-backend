const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not found in environment variables');

const github = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Analyzer-App'
    }
});

let apiCallCount = 0;

function resetApiCallCount() {
    apiCallCount = 0;
}

function getApiCallCount() {
    return apiCallCount;
}

function countAPICall() {
    apiCallCount++;
}

async function fetchUserInfo(username) {
    const endpoint = `/users/${username}`;
    countAPICall();

    try {
        const { data } = await github.get(endpoint);
        return {
            login: data.login,
            name: data.name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            location: data.location,
            company: data.company,
            blog: data.blog,
            followers: data.followers,
            following: data.following,
            public_repos: data.public_repos,
            created_at: data.created_at,
            html_url: data.html_url
        };
    } catch (err) {
       return null
    }
}

async function fetchRepos(username) {
    let repos = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const endpoint = `/users/${username}/repos?page=${page}&per_page=${perPage}`;
        countAPICall();
        const { data } = await github.get(endpoint);

        repos.push(...data);
        if (data.length < perPage) break;
        page++;
    }

    return repos;
}

async function fetchLanguages(username, repo) {
    const endpoint = `/repos/${username}/${repo}/languages`;
    countAPICall(endpoint);

    try {
        const { data } = await github.get(endpoint);
        return data;
    } catch {
        return {};
    }
}

async function fetchCommitCount(username, repo) {
    const endpoint = `/repos/${username}/${repo}/commits?per_page=1`;
    countAPICall(endpoint);

    try {
        const { headers, data } = await github.get(endpoint);

        const link = headers.link;
        if (link && link.includes('rel="last"')) {
            const match = link.match(/page=(\d+)>; rel="last"/);
            return match ? parseInt(match[1]) : 1;
        }

        return data.length;
    } catch {
        return 0;
    }
}

module.exports = {
    resetApiCallCount,
    getApiCallCount,
    fetchUserInfo,
    fetchRepos,
    fetchLanguages,
    fetchCommitCount
};
