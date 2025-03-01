"use client"
import axios from "axios";
import { useEffect, useRef, useState } from "react";// Import required scales
import * as d3 from 'd3';
import Card from "@/components/Card"
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import HeatmapLegend from "@/components/HeatmapLegend";

export default function Home() {
  const [session, setSession] = useState(null);

  const [username, setUsername] = useState("");
  const [chartData, setChartData] = useState(null);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [projects, setProjects] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [userData, setUserData] = useState({});
  const [languages, setLanguages] = useState([]);
  const [rank, setRank] = useState('');

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnalysis, setIsAnalysis] = useState(false);

 
  const svgRef = useRef();

  // find streak by giving all year data
  const getLongestStreak = (contributionData) => {
    setMessage('Calculating longest streak...');
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
    setLongestStreak(longestStreak)
    return longestStreak;
  };

  const fetchContributionsAndCalculateStreak = async (username) => {
    setMessage('Fetching contribution data...');
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
        'Authorization': `Bearer ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
  
    // Extract contribution data

    //console.log(data); // Debugging: Check the structure of the data
  
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
  setIsAnalysis(false);
  // Now that we have the data in the format for D3, let's create the heatmap
  createD3Heatmap(heatmapData, xLabels, yLabels);
  
    // Calculate the longest streak
    const longestStreak = getLongestStreak(weeksData);
    //console.log(`Longest streak for ${username}: ${longestStreak} days`);


    const rank = assignBadge(data.data.user.contributionsCollection.totalCommitContributions, longestStreak, topProjects);
    setRank(rank);
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
    const svgHeight = 200; // Height of the SVG container
    const cellSize = 13; // Size of each cell (day)
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
  //   const colorScale2 = d3.scaleThreshold()
  // .domain([0, 1, 5, 10, 20]) // Define contribution thresholds
  // .range(['#1a103d', '#3b275e', '#5c3e8b', '#8b6bc3', '#b8a3eb']);

  //   const colorScale2 = d3.scaleThreshold()
  // .domain([0, 1, 5, 10, 20]) // Define contribution thresholds
  // .range(['#0000ffff', '#0000ffaa', '#0000ff88', '#0000ff55', '#0000ff22']);

  const colorScale2 = d3.scaleThreshold()
  .domain([0, 1, 5, 10, 20]) // Define contribution thresholds
  .range(['#fff5e6', '#ffcc80', '#ff7f50', '#ff5722', '#e64a19']);

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
  
    // // Add Y axis labels (days)
    svg.selectAll('.y-label')
      .data(yLabelsWithPos)
      .enter()
      .append('text')
      .attr('x', -20) // Positioning to the left of the heatmap
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .style('fill', 'white')
      .text(d => d.label);
  };
  
  
  
  function assignBadge(totalContributions, longestStreak, topProjects) {
    if (totalContributions >= 2000 || longestStreak >= 365) {
        return 'Platinum';
    } else if (totalContributions >= 1000 || longestStreak >= 100) {
        return 'Gold';
    } else if (totalContributions >= 500 || longestStreak >= 30) {
        return 'Silver';
    } else {
        return 'Bronze';
    }
}


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
        'Authorization': `Bearer ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
  
    const data = await response.json();
    //console.log(data.data);
    const totalCommits = (data.data.repository?.mainBranch?.history?.totalCount || 0) +
    (data.data.repository?.masterBranch?.history?.totalCount || 0);
   

    return totalCommits;
  }
  

  async function getTopProjects(repos) {
    setMessage('Calculating top projects...');

    let repoCommitCounts = [];

  
    for (let repo of repos) {
      const { name, owner } = repo;
      
      const commitCount = await fetchCommits(username, name);

     // console.log(`Repo ${name} has ${commitCount} commits`);

      repoCommitCounts.push({ repoName: name, commitCount });
    }
  
    // Sort by commit count (descending order)
    repoCommitCounts.sort((a, b) => b.commitCount - a.commitCount);
  
    return repoCommitCounts;
  }
  async function calculateTopLanguages() {
    const repos = await fetchRepositories();

    //console.log(`Repos: `, repos)
  
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
  
 
  
   // console.log("Top Languages:", topLanguages);
    setLanguages(topLanguages);

    if (session?.accessToken === undefined) {
      setTopProjects([]);
    }
    else {
      let TopProjects = await getTopProjects(repos);
      setTopProjects(TopProjects);

    }
   // console.log("Top Projects:", topProjects);
  }
  

  async function fetchRepositories() {
    setMessage('Fetching repositories...');
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
          Authorization: `Bearer ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`,
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
    setProjects(allRepos);
    return allRepos;
  }

  const fetchGitHubData = async () => {
    setMessage(`Fetching GitHub data for ${username}...`);
    // console.log(session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken)
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
          Authorization: `Bearer ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

   // console.log(response.data);
    setTotalContributions(response.data.data.user.contributionsCollection.totalCommitContributions);
  };

  const getRateLimitStatus = async () => {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`, // Replace with your token if needed
      },
    });
  
    const data = await response.json();
  
    // The remaining requests can be found in the 'resources.core.remaining' field
    const remainingRequests = data.resources.graphql.remaining;
    //console.log('Remaining requests:', remainingRequests);
    return remainingRequests;
  };

  const fetchUserInfo = async () => {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${session?.accessToken===undefined?process.env.NEXT_PUBLIC_GITHUB_TOKEN:session.accessToken}`,
      },
    });
    const data = await response.json();
    setUserData(data);
    return data;
  };
  const fetchSession = async () => {
 
    const response = await fetch("/api/auth/session");
    const sessionData = await response.json();

    if (Object.keys(sessionData).length === 0) {
      //console.log("Session is empty.");
      setSession(null);

    } else {
      setSession(sessionData);
      setUsername(sessionData.user.username);
      //console.log("Session exists:", session);
    }
   
  };
  useEffect(() => {
    

    fetchSession();
  }, []);


  const runAnalysis = async () => {
    setLoading(true);
    setIsAnalysis(true);
    await fetchUserInfo();
    await fetchGitHubData();
    await calculateTopLanguages();
    await fetchContributionsAndCalculateStreak(username);
    setMessage('');
    setIsAnalysis(false);
  }

  
  
 
  return (
    <div className="">
   <div className="flex items-center justify-center min-h-screen ">
  <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-lg p-6 w-96 
              ring-5 ring-pink-500/40 hover:ring-pink-500/70 transition duration-300">
    <h2 className="text-xl font-bold text-white mb-4">Your GitHub Year in Review</h2>
    <p className="text-white/80 mb-6">Enter your GitHub username and unlock a personalized summary of your coding journey. Explore your total contributions, longest streaks, top projects, favorite languages, and much more, all wrapped up just for you.</p>
    <div className="flex items-center border border-white/40 rounded-md overflow-hidden">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={"Enter username"}
        className="flex-grow px-4 py-2 bg-transparent text-white placeholder-white/60 outline-none"
      />
      <button onClick={runAnalysis} className="btn btn-secondary rounded-none">Submit</button>
    </div>
    {/* <button onClick={getRateLimitStatus} className="btn btn-primary">Get Rate Limit</button> */}
  
    {session ? (
        <div>
          <p>Welcome, {session?.user?.name || session?.user?.email}!</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <>
        <p className="my-5">Sign in with Github to get repos of 2024 along with your top projects</p>
        <button className="bg-slate-600 px-4 py-2 text-white" onClick={() => signIn("github", { callbackUrl: "/profile" })}>Sign In with GitHub</button>
        </>
      )}


  </div>
</div>


{
    isAnalysis?(
      <p className="text-center my-5 text-3xl font-bold">
        {message}
      </p>
    ):null

  }

 <div className="flex justify-center items-center">

<div className={!loading? "hidden" : "block"}>
 
      <Card accessToken={session?.accessToken} totalContributions={totalContributions} username={username} rank={rank} name={userData?.name} avatar_url={userData?.avatar_url} streak={longestStreak} projects={topProjects}
      languages={languages} followers={userData?.followers} following={userData?.following}>
    
        
    <div className="w-full">
    <svg id="heatmap"></svg>
      </div>
<div className="flex justify-center items-center">
      <HeatmapLegend/>
</div>
    
      </Card>
     
</div>
 
      {isAnalysis && (
        <div
          style={{
            position: "fixed", // Makes the overlay stay on top of the viewport
            top: 0,
            left: 0,
            width: "100vw", // Covers the full width of the viewport
            height: "100vh", // Covers the full height of the viewport
            backgroundColor: "rgba(0, 0, 0)", // Black with transparency
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999, // Ensure it is above all other elements
          }}
        >
          <div>
            <p className="text-white">{message}</p>
            <div
              style={{
                width: "100px",
                height: "5px",
                backgroundColor: "white",
                marginTop: "10px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: "#1a103d",
                  animation: "loading-bar 1s infinite",
                  position: "absolute",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation for loading bar */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            left: 0;
          }
          50% {
            left: 50%;
          }
          100% {
            left: 0;
          }
        }
      `}</style>

 </div>
    </div>

  )
}
