// fetch-github-repos.js
// script to fetch github repositories for isyuricunha using github api
// stores data in data/repos.json for hugo to use during build

const fs = require("fs");
const path = require("path");

const GITHUB_USERNAME = "isyuricunha";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const OUTPUT_FILE = path.join(__dirname, "..", "data", "repos.json");

async function fetchAllRepos() {
    console.log(`fetching repositories for ${GITHUB_USERNAME}...`);

    if (!GITHUB_TOKEN) {
        console.warn(
            "warning: GITHUB_TOKEN not found. using unauthenticated requests (lower rate limit)."
        );
    }

    const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "hugo-website-builder",
    };

    if (GITHUB_TOKEN) {
        headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    let allRepos = [];
    let page = 1;
    let hasMore = true;

    // fetch all pages of repositories
    while (hasMore) {
        const url = `${API_URL}?per_page=100&page=${page}`;

        try {
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(
                    `github api error: ${response.status} ${response.statusText}`
                );
            }

            const repos = await response.json();

            if (repos.length === 0) {
                hasMore = false;
            } else {
                allRepos = allRepos.concat(repos);
                console.log(`fetched page ${page} (${repos.length} repos)`);
                page++;
            }
        } catch (error) {
            console.error("error fetching repositories:", error.message);
            process.exit(1);
        }
    }

    console.log(`total repositories fetched: ${allRepos.length}`);
    return allRepos;
}

function processRepos(repos) {
    // extract relevant data and sort by stars
    const processedRepos = repos.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || "no description provided",
        url: repo.html_url,
        homepage: repo.homepage || null,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        language: repo.language || "unknown",
        topics: repo.topics || [],
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        is_fork: repo.fork,
        is_archived: repo.archived,
        is_private: repo.private,
        default_branch: repo.default_branch,
        license: repo.license ? repo.license.spdx_id : null,
        open_issues: repo.open_issues_count,
    }));

    // sort by stars (highest first)
    processedRepos.sort((a, b) => b.stars - a.stars);

    return processedRepos;
}

function saveToFile(data) {
    // ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`created directory: ${dataDir}`);
    }

    // write json file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log(`saved ${data.length} repositories to ${OUTPUT_FILE}`);
}

async function main() {
    console.log("==================================================");
    console.log("github repository fetch script");
    console.log("==================================================\n");

    try {
        const repos = await fetchAllRepos();
        const processedRepos = processRepos(repos);
        saveToFile(processedRepos);

        console.log("\n==================================================");
        console.log("success! repositories data saved.");
        console.log("==================================================");
        console.log(`\ntop 5 repos by stars:`);
        processedRepos.slice(0, 5).forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.name} (⭐ ${repo.stars})`);
        });
    } catch (error) {
        console.error("\n==================================================");
        console.error("error:", error.message);
        console.error("==================================================");
        process.exit(1);
    }
}

main();
