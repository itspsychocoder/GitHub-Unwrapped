"use client"
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");

  // fetch commits of specific repo
  async function fetchCommits(owner, repoName) {
    const query = `
    query {
      repository(owner: "${username}", name: "${repoName}") {
        mainBranch: object(expression: "main") {
          ... on Commit {
            history(first: 100) {
              totalCount
            }
          }
        }
        masterBranch: object(expression: "master") {
          ... on Commit {
            history(first: 100) {
              totalCount
            }
          }
        }
      }
    }
    
    `
  
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
    console.log(data.data);
    const totalCommits = (data.data.repository?.mainBranch?.history?.totalCount || 0) +
    (data.data.repository?.masterBranch?.history?.totalCount || 0);

    return totalCommits;
  }
  

  async function getTopProjects(repos) {

    let repoCommitCounts = [];

  
    for (let repo of repos) {
      const { name, owner } = repo;
      
      const commitCount = await fetchCommits(username, name);

      console.log(`Repo ${name} has ${commitCount} commits`);

      repoCommitCounts.push({ repoName: name, commitCount });
    }
  
    // Sort by commit count (descending order)
    repoCommitCounts.sort((a, b) => b.commitCount - a.commitCount);
  
    return repoCommitCounts;
  }
  async function calculateTopLanguages() {
    const repos = await fetchRepositories();

    console.log(`Repos: `, repos)
  
    // Count occurrences of each language
    const languageCount = repos.reduce((acc, repo) => {
      const language = repo.primaryLanguage?.name || 'Unknown';  // Use 'Unknown' if no primary language
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {});
  
    // Sort languages by the number of occurrences
    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);  // Get top 5 languages
  
 
  
    console.log("Top Languages:", topLanguages);

    const topProjects = await getTopProjects(repos);
    console.log("Top Projects:", topProjects);
  }
  

  async function fetchRepositories() {
    let allRepos = [];
    let hasNextPage = true;
    let endCursor = null;
  
    while (hasNextPage) {
      const query = `
        query {
          user(login: "${username}") {
            repositories(first: 100, after: ${endCursor ? `"${endCursor}"` : null}) {
              nodes {
                name
                createdAt
                primaryLanguage {
                  name
                }
                stargazerCount
                forkCount
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;
  
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
  
      const data = await response.json();
      const repos = data.data.user.repositories.nodes;
  
      // Filter repositories created in 2024
      const filteredRepos = repos.filter(repo => {
        const createdAt = new Date(repo.createdAt);
        return createdAt.getFullYear() === 2024; // Filter for repositories created in 2024
      });
  
      allRepos = [...allRepos, ...filteredRepos];
  
      hasNextPage = data.data.user.repositories.pageInfo.hasNextPage;
      endCursor = data.data.user.repositories.pageInfo.endCursor;
    }
  
    return allRepos;
  }

  const fetchGitHubData = async () => {
    console.log(process.env.NEXT_PUBLIC_GITHUB_TOKEN)
    const query = `
    query {
      user(login: "${username}") {
        name
        contributionsCollection {
          totalCommitContributions
        }
      }
    }
  `;
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
  };
  
  return (
    <div className="">
   <div className="flex items-center justify-center min-h-screen ">
  <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-lg p-6 w-96 
              ring-5 ring-pink-500/40 hover:ring-pink-500/70 transition duration-300">
    <h2 className="text-xl font-bold text-white mb-4">Top Heading</h2>
    <p className="text-white/80 mb-6">This is a little description that provides more information about the card content.</p>
    <div className="flex items-center border border-white/40 rounded-md overflow-hidden">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="flex-grow px-4 py-2 bg-transparent text-white placeholder-white/60 outline-none"
      />
      <button onClick={()=> {
        fetchGitHubData();
        calculateTopLanguages();
      }} className="btn btn-secondary rounded-none">Submit</button>
    </div>
    <a href="#" className="block mt-4 text-blue-300 hover:underline text-center">Click here for more</a>
  </div>
</div>



    </div>
  );
}
