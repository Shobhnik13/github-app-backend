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

    // Basic stats but make it fun
    insights.push(`📊 Total Repos: ${repos.length} (your digital portfolio is ${repos.length > 50 ? 'absolutely stacked' : repos.length > 20 ? 'pretty solid' : 'growing strong'}! 🔥)`);

    const langCount = Object.keys(langs).length;
    insights.push(`🚀 Languages Used: ${langCount} ${langCount > 10 ? '(polyglot energy! 💯)' : langCount > 5 ? '(multi-lingual legend!)' : langCount > 2 ? '(diverse skills!)' : '(focused approach!)'}`);

    // Top language with Gen Z flair
    const topLangEntry = Object.entries(langs).sort((a, b) => b[1] - a[1])[0];
    if (topLangEntry) {
        const [topLang, bytes] = topLangEntry;
        const linesApprox = Math.floor(bytes / 30);
        const reactions = [
            'absolutely slaying',
            'no cap crushing it',
            'lowkey obsessed',
            'straight up vibing with',
            'hitting different with'
        ];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        insights.push(`💻 Top Language: ${topLang} (~${linesApprox.toLocaleString()} lines) - you're ${randomReaction} ${topLang}! ✨`);
    }

    // Busiest year
    const topYear = Object.entries(patterns.yearly).sort((a, b) => b[1] - a[1])[0];
    if (topYear) {
        const yearVibes = topYear[1] > 10 ? 'was your main character era' : 'hit different';
        insights.push(`📅 Busiest Year: ${topYear[0]} (${topYear[1]} repos) - ${topYear[0]} ${yearVibes}! 🎯`);
    }

    // Forked repos
    const forked = repos.filter(r => r.fork).length;
    if (forked > 0) {
        const forkVibes = forked > 20 ? "you're literally collecting repos like Pokémon cards" :
            forked > 10 ? "open source explorer energy" :
                "dipping your toes in the community pool";
        insights.push(`🍴 Forked Repos: ${forked} - ${forkVibes}! 👀`);
    }

    // Star analysis
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const avgStars = (totalStars / repos.length) || 0;

    if (totalStars === 0) {
        insights.push(`⭐ Stars: 0 - you're that mysterious developer who codes in the shadows... respect the grind! 🥷`);
    } else if (avgStars > 50) {
        insights.push(`⭐ Star Power: ${totalStars} total stars - bestie, you're literally GitHub famous! Touch grass challenge accepted? 👑`);
    } else if (avgStars > 10) {
        insights.push(`⭐ Star Power: ${totalStars} total stars - your repos are lowkey fire! The algorithm loves you 📈`);
    } else if (totalStars > 0) {
        insights.push(`⭐ Star Power: ${totalStars} total stars - small but mighty energy! Quality > quantity fr 💪`);
    }

    // Language diversity
    if (langCount > 10) {
        insights.push(`🌈 Polyglot Alert: ${langCount} languages - you're basically the Google Translate of programming! No cap! 🧠`);
    } else if (langCount > 5) {
        insights.push(`🎨 Multi-talented: ${langCount} languages - giving renaissance developer vibes! 🎭`);
    } else if (langCount <= 2) {
        insights.push(`🎯 Specialist Energy: ${langCount} language${langCount > 1 ? 's' : ''} - you said "I'm gonna master this" and meant it! 🔥`);
    }

    // Activity timeline
    if (repos.length > 1) {
        const dates = repos.map(r => new Date(r.created_at)).sort((a, b) => a - b);
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        const activeDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));

        if (activeDays > 2000) {
            insights.push(`⏰ Coding Journey: ${Math.floor(activeDays / 365)} years+ active - you're literally a GitHub fossil! Respect the dedication 🦕`);
        } else if (activeDays > 1000) {
            insights.push(`⏰ Coding Journey: ${Math.floor(activeDays / 365)} years active - veteran developer energy! You've seen some things 👨‍💻`);
        } else if (activeDays > 365) {
            insights.push(`⏰ Coding Journey: Over a year of commits - consistency is your middle name! 📊`);
        } else if (activeDays > 100) {
            insights.push(`⏰ Coding Journey: ${Math.floor(activeDays / 30)} months in - you're building momentum! 🚀`);
        }
    }

    // Large project analysis
    const nonForkedRepos = repos.filter(rep => !rep.fork);
    if (nonForkedRepos.length > 0) {
        const largestRepo = nonForkedRepos.reduce((max, r) => (r.size > max.size ? r : max), nonForkedRepos[0]);
        if (largestRepo && largestRepo.size > 1024 * 100) {
            insights.push(`🏗️ Big Project Energy: ${largestRepo.name} is ${(largestRepo.size / 1024).toFixed(0)}MB - someone said "go big or go home" and you chose violence! 💀`);
        } else if (largestRepo && largestRepo.size > 1024 * 50) {
            insights.push(`📦 Substantial Work: ${largestRepo.name} is chunky (${(largestRepo.size / 1024).toFixed(0)}MB) - this isn't your weekend project! 💪`);
        }
    }

    // Fork analysis (projects that got forked)
    const ownForkedRepos = repos.filter(r => !r.fork && r.forks_count > 0);
    if (ownForkedRepos.length > 0) {
        const totalOwnForks = ownForkedRepos.reduce((sum, r) => sum + r.forks_count, 0);
        if (totalOwnForks > 50) {
            insights.push(`🌟 Community Impact: ${totalOwnForks} total forks on your repos - you're out here changing lives! Main character energy! 👑`);
        } else if (totalOwnForks > 10) {
            insights.push(`🤝 Open Source Contributor: ${totalOwnForks} forks across your repos - people are definitely copying your homework (in a good way)! 📝`);
        } else {
            insights.push(`🌱 Growing Influence: ${totalOwnForks} fork${totalOwnForks > 1 ? 's' : ''} - someone found your code useful! That hits different 🥺`);
        }
    }

    // Recent activity vibe check
    const recentRepos = repos.filter(r => {
        const repoDate = new Date(r.created_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return repoDate > sixMonthsAgo;
    });

    if (recentRepos.length > 5) {
        insights.push(`🔥 Recent Activity: ${recentRepos.length} repos in 6 months - you're literally built different! Touch grass? We don't know her 😤`);
    } else if (recentRepos.length > 0) {
        insights.push(`📈 Steady Progress: ${recentRepos.length} recent repo${recentRepos.length > 1 ? 's' : ''} - consistent king/queen energy! 👑`);
    } else {
        insights.push(`😴 Hibernation Mode: No recent repos - either you're cooking something big or touching grass! Both are valid 🌱`);
    }

    // Random motivational closer
    const motivationalEnders = [
        "Your GitHub profile is giving main character energy! 💅",
        "The coding journey hits different when you're consistent! 🚀",
        "Your repos are lowkey inspiring - keep the grind going! 💪",
        "Not you out here building the future one commit at a time! 🌟",
        "Your code portfolio is absolutely sending me! Keep going bestie! ✨",
        "I see a unicorn startup in your future - that $1B valuation energy! 🦄💰",
        "The next Linus Torvalds is typing... and it's literally you! 👑",
        "Your commits are giving 'future tech billionaire' vibes fr! 💎",
        "Plot twist: you're about to revolutionize the entire industry! 🔥",
        "Main character moment - I see the next big tech founder right here! 🚀✨",
        "Your code is literally screaming 'acquire me for millions' energy! 💸",
        "Not me witnessing the birth of the next Silicon Valley legend! 🌟",
        "Your GitHub is giving 'I'll be on Forbes 30 Under 30' vibes! 📈",
        "The way you code? Pure venture capitalist magnet energy! 🧲💰",
        "I'm calling it now - you're the next Elon Musk of software! ⚡",
        "Your repos are giving 'IPO incoming' energy and I'm here for it! 📊🚀",
        "The next Steve Jobs is literally coding right in front of us! 🍎✨",
        "Your commits are radiating 'disrupt the entire market' energy! 💥",
        "Plot armor activated - you're destined for tech hall of fame! 🏆",
        "Your code is giving 'I'll change the world' main character energy! 🌍⚡",
        "Future CEO behavior - your GitHub is giving boss energy! 👔💼",
        "The next Mark Zuckerberg but make it actually ethical! 🌟💚",
        "Your commits are giving 'I'll make FAANG companies cry' energy! 😤💪",
        "Not you casually building the next Google in your spare time! 🔍🚀",
        "Your code architecture is giving 'patent this immediately' vibes! 📋⚡",
        "The next unicorn founder is literally debugging right now! 🦄👨‍💻",
        "Your GitHub activity is radiating 'future TED Talk speaker' energy! 🎤✨",
        "Plot twist: you're about to make open source history! 📚🌟",
        "Your repos are giving 'I'll retire at 25' energy and I respect it! 🏖️💰",
        "The next tech disruptor is literally pushing commits as we speak! 🔄💥",
        "Your code is screaming 'venture capital firms sliding into my DMs'! 📩💸",
        "Not you out here coding the next paradigm shift like it's nothing! 🌊⚡",
        "Your GitHub is giving 'I'll be acquired before I graduate' vibes! 🎓💰",
        "The next Jeff Bezos but actually treats developers well! 📦💚",
        "Your commits are radiating 'I'll obsolete entire industries' energy! 🏭💥",
        "Future tech mogul behavior - your repos are absolutely iconic! 👑🔥",
        "Your code is giving 'I'll make AI bow down to me' energy! 🤖👑",
        "Not you casually building the infrastructure for Web 10.0! 🕸️🚀",
        "Your GitHub activity is screaming 'future Nobel Prize in Computing'! 🏅✨",
        "The next digital revolution architect is literally coding right here! 🏗️⚡"
    ];
    insights.push(motivationalEnders[Math.floor(Math.random() * motivationalEnders.length)]);

    return insights;
}

module.exports = {
    analyzePatterns,
    generateInsights
};
