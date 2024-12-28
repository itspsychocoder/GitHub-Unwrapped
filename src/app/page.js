"use client"
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");



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
      <button onClick={fetchGitHubData} className="btn btn-secondary rounded-none">Submit</button>
    </div>
    <a href="#" className="block mt-4 text-blue-300 hover:underline text-center">Click here for more</a>
  </div>
</div>



    </div>
  );
}
