"use client"
import axios from "axios";
import { useEffect, useRef, useState } from "react";// Import required scales
import * as d3 from 'd3';

export default function Home() {
  const [username, setUsername] = useState("");
  const [chartData, setChartData] = useState(null);
  const svgRef = useRef();

  // find streak by giving all year data
  const getLongestStreak = (contributionData) => {
    const allContributions = [];
  
    // Collect all the days with contributions (where contributionCount > 0)
    contributionData.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > 0) {
          allContributions.push(new Date(day.date));  // Store the date of contribution
        }
      });
    });
  
    // Sort the contributions by date
    allContributions.sort((a, b) => a - b);
  
    let longestStreak = 0;
    let currentStreak = 1;  // Start the streak count at 1 (since the first day is a contribution)
    let lastDate = allContributions[0];
  
    // Iterate through the sorted dates and check for consecutive days
    for (let i = 1; i < allContributions.length; i++) {
      const currentDate = allContributions[i];
  
      // Check if the current date is the day after the last date (consecutive day)
      if ((currentDate - lastDate) === 86400000) {  // 86400000ms = 1 day
        currentStreak++;  // Increment streak
      } else {
        // Reset streak if days are not consecutive
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;  // Reset the streak count
      }
  
      lastDate = currentDate;  // Update lastDate to current date
    }
  
    // Check the last streak after the loop
    longestStreak = Math.max(longestStreak, currentStreak);
  
    return longestStreak;
  };

  const fetchContributionsAndCalculateStreak = async (username) => {
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection(from: "2024-01-01T00:00:00Z", to: "2024-12-31T23:59:59Z") {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;
  
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
  
    // Extract contribution data

    console.log(data); // Debugging: Check the structure of the data
  
    const weeksData = data.data.user.contributionsCollection.contributionCalendar.weeks;

      // Format the data to match the structure expected for D3.js
  const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Days of the week
  const yLabels = weeksData.map((_, index) => `${index + 1}`); // Weeks

  // Initialize the 2D array with zeros
  const heatmapData = yLabels.map(() => xLabels.map(() => 0));

  // Populate the heatmap data
  weeksData.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day, dayIndex) => {
      const contributionCount = day.contributionCount;
      heatmapData[weekIndex][dayIndex] = contributionCount; // Set the value of commits for that day
    });
  });

  // Now that we have the data in the format for D3, let's create the heatmap
  createD3Heatmap(heatmapData, xLabels, yLabels);
  
    // Calculate the longest streak
    const longestStreak = getLongestStreak(weeksData);
    console.log(`Longest streak for ${username}: ${longestStreak} days`);
    return {contributionData:weeksData, longestStreak};
  };

  const getColor = (contributionCount) => {
    // Map the contribution count to color intensity (adjust as needed)
    if (contributionCount === 0) return '#ebedf0'; // light grey for no contributions
    if (contributionCount <= 5) return '#c6e48b'; // lighter green for lower contributions
    if (contributionCount <= 10) return '#7bc96f'; // medium green for medium contributions
    return '#196127'; // dark green for high contributions
  };


  const createD3Heatmap = (heatmapData, xLabels, yLabels) => {
    const svgWidth = 1000; // Width of the SVG container
    const svgHeight = 300; // Height of the SVG container
    const cellSize = 15; // Size of each cell (day)
    const margin = { top: 40, right: 20, bottom: 40, left: 40 }; // Adjusted margins
  
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
  
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(heatmapData.flat())]);
  
    // Create SVG container
    const svg = d3.select('#heatmap')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Flatten the data for easier processing in D3
    const flattenedData = heatmapData.flatMap((week, weekIndex) =>
      week.map((count, dayIndex) => ({
        x: weekIndex, // Week index (X-axis)
        y: dayIndex,  // Day of the week (Y-axis)
        count,        // Contribution count for that day
      }))
    );

    const cellMargin = 2;
    const colorScale2 = d3.scaleThreshold()
    .domain([0, 1, 5, 10, 20]) // Define contribution thresholds
    .range(['#3d444d', '#9be9a8', '#40c463', '#30a14e', '#216e39']); // GitHub colors

    // Append squares (cells) for the heatmap
    svg.selectAll('rect')
      .data(flattenedData)
      .enter()
      .append('rect')
      .attr('x', d => d.x * cellSize + cellMargin) // X position (week index)
      .attr('y', d => d.y * cellSize + cellMargin) // Y position (day index)
      .attr('width', cellSize - 2  * cellMargin) // Cell width
      .attr('height', cellSize - 2 * cellMargin) // Cell height
      .style('fill', d => colorScale2(d.count)) 
      .style('stroke', '#ccc'); // Border for visibility
  
    // Add labels for X-axis (Weeks)
    // const xLabelsWithPos = yLabels.map((label, i) => ({
    //   label,
    //   x: i * cellSize + cellSize / 2, // Positioning along X-axis (Weeks)
    // }));
  
    // Add X axis labels (weeks)
    // svg.selectAll('.x-label')
    //   .data(xLabelsWithPos)
    //   .enter()
    //   .append('text')
    //   .attr('x', d => d.x)
    //   .attr('y', height + 10) // Positioning below the heatmap
    //   .attr('text-anchor', 'middle')
    //   .attr('font-size', 12)
    //   .text(d => d.label);
  
    // Add Y axis labels (Days of the week)
    const yLabelsWithPos = xLabels.map((label, i) => ({
      label,
      y: i * cellSize + cellSize / 2, // Positioning along Y-axis (Days)
    }));
  
    // Add Y axis labels (days)
    svg.selectAll('.y-label')
      .data(yLabelsWithPos)
      .enter()
      .append('text')
      .attr('x', -30) // Positioning to the left of the heatmap
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .style('fill', 'white')
      .text(d => d.label);
  };
  
  
  
  

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

  const getRateLimitStatus = async () => {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`, // Replace with your token if needed
      },
    });
  
    const data = await response.json();
  
    // The remaining requests can be found in the 'resources.core.remaining' field
    const remainingRequests = data.resources.graphql.remaining;
    console.log('Remaining requests:', remainingRequests);
    return remainingRequests;
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
        // calculateTopLanguages();
        fetchContributionsAndCalculateStreak(username);
      }} className="btn btn-secondary rounded-none">Submit</button>
    </div>
    <button onClick={getRateLimitStatus} className="btn btn-primary">Get Rate Limit</button>
    <a href="#" className="block mt-4 text-blue-300 hover:underline text-center">Click here for more</a>
  </div>
</div>

<div className="flex justify-center items-center w-full">
<svg id="heatmap"></svg>
  </div>

    </div>
  )
}
