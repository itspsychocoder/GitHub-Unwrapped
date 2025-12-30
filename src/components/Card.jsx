import React, { useRef } from 'react'
import "@/css/card.css"
import html2canvas from 'html2canvas-pro';

function Card({accessToken, totalContributions, followers, following,children, username, name, avatar_url, rank, streak, projects, languages}) {
  const cardRef = useRef();
const badge = {
  "Platinum": "🌟",
  "Gold": "🥇",
  "Silver": "🥈",
  "Bronze": "🥉"
}

const downloadCardAsImage = async () => {
  if (cardRef.current) {
    const canvas = await html2canvas(cardRef.current,  {
      useCORS: true,      // Allow cross-origin images and styles
      allowTaint: false,
      backgroundColor: "#1a103d"
    });
    const link = document.createElement('a');
    link.download = 'card.png'; // File name
    link.href = canvas.toDataURL('image/png'); // Convert canvas to data URL
    link.click(); // Trigger download
  }
};
  return (
   <div className='flex flex-col'>

   <div className='flex justify-between items-center my-5'>
    <h1 className='text-2xl font-bold'>Your Statistics for 2025</h1>
   <button className='btn btn-sm btn-primary' onClick={downloadCardAsImage}>
  Download</button>
   </div>
    <div ref={cardRef} className="glass-card">
  <div className="card-top">
    <div className="user-info">
      <img src={avatar_url} alt="User Avatar" className="avatar" />
      <div>
      <h2 className="username">{name}</h2>
      <p className="username">@{username}</p>
      </div>
    </div>
    <div className="rank-info">
      <span className="rank-badge">{badge[rank]}</span>
      <p className="rank-text">{rank}</p>
    </div>
  </div>

  <div className="card-bottom">
  <div className="streak-container">
  <div className="fire-icon">🔥</div>
  <div className="streak-number">{streak}</div>
</div>

    <div className="stats-container">
      {
        accessToken && (
          <div className="stat">
          <h2>Repos</h2>
          <p className='repoText'>(2025)</p>
          <p className='statNumber' id="repos-count">{projects.length}</p>
        </div>
        )
      }
 
  <div className="stat">
    <h2>Followers</h2>
    <p className='repoText'>(overall)</p>

    <p className='statNumber' id="followers-count">{followers}</p>
  </div>
  <div className="stat">
    <h2>Following</h2>
    <p className='repoText'>(overall)</p>
    
    <p className='statNumber' id="following-count">{following}</p>
  </div>
</div>

<h1 className='text-center font-bold text-3xl'>Total Contributions: {totalContributions}</h1>


   <div className='flex justify-evenly'>
   <div className="languages">
      <h2>Top Languages</h2>
      <ul>
      {
          languages.slice(0,3).map((lang,index)=> {
            return (
              <li key={index}>{lang[0]}</li>
            )
          })
        }
      </ul>
    </div>
  {
    accessToken && (
      <div className="projects">
      <h2>Top Projects</h2>
      <ul>
        {
          projects.slice(0,5).map((project,index)=> {
            return (
              <li key={index}>{project.repoName}</li>
            )
          })
        }
      </ul>
    </div>
    )
  }
   
   </div>



   {children}
  </div>

  <p className='text-center my-5 font-bold text-white'>GitHub Unwrapped - Made by Psycho Coder</p>
</div>

</div>

  )
}

export default Card
