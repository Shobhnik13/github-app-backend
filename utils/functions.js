function analyzePatterns(repos) {
    const yearly = {}, monthly = {};

    repos.forEach(repo => {
        const date = new Date(repo.created_at);
        const y = date.getFullYear();
        const m = `${y}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        yearly[y] = (yearly[y] || 0) + 1;
        monthly[m] = (monthly[m] || 0) + 1;
    });

    return { yearly, monthly };
}

function generateInsights(repos, langs, patterns) {
    const insights = [];

    insights.push(`Total Repos: ${repos.length}`);
    insights.push(`Languages Used: ${Object.keys(langs).length}`);

    const topLangEntry = Object.entries(langs).sort((a, b) => b[1] - a[1])[0];
    if (topLangEntry) {
        const [topLang, bytes] = topLangEntry;
        const linesApprox = Math.floor(bytes / 50); // crude approx lines from bytes
        insights.push(`Top Language: ${topLang} (~${linesApprox.toLocaleString()} lines of code!)`);
    }

    const topYear = Object.entries(patterns.yearly).sort((a, b) => b[1] - a[1])[0];
    if (topYear) insights.push(`Busiest Year: ${topYear[0]} (${topYear[1]} repos)`);

    const forked = repos.filter(r => r.fork).length;
    if (forked) insights.push(`Forked Repos: ${forked}`);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const avgStars = (totalStars / repos.length) || 0;
    if (avgStars > 10) {
        insights.push('Star Power! Average stars per repo above 10 — impressive popularity!');
    }

    const languageCount = Object.keys(langs).length;
    if (languageCount > 5) {
        insights.push('Polyglot Developer! You code in over 5 languages — versatile and adaptive.');
    }

    if (repos.length > 1) {
        const firstDate = new Date(repos[0].created_at);
        const lastDate = new Date(repos[repos.length - 1].created_at);
        const activeDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));
        if (activeDays > 1000) {
            insights.push('Veteran Coder! You have been active for over 1000 days — dedication is key.');
        }
    }

    const largestRepo = repos.reduce((max, r) => (r.size > max.size ? r : max), repos[0]);
    if (largestRepo && largestRepo.size > 1024 * 50) {
        insights.push(`Big Project Alert! Your largest repo (${largestRepo.name}) is over 50 MB — substantial work!`);
    }

    if (totalStars === 0) {
        insights.push('Quiet Achiever — stars don’t tell the whole story, keep rocking!');
    }

    return insights;
}

module.exports = {
    analyzePatterns,
    generateInsights
};
