import React from 'react'
import "@/css/card.css"
function Card({followers, following,children, username, name, avatar_url, rank, streak, projects, languages}) {
const badge = {
  "Platinum": "🌟",
  "Gold": "🥇",
  "Silver": "🥈",
  "Bronze": "🥉"
}
  return (
    <div className="glass-card">
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
  <div className="stat">
    <h2>Repos</h2>
    <p className='repoText'>(in 2024)</p>
    <p className='statNumber' id="repos-count">{projects.length}</p>
  </div>
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
   
   </div>

   {children}
  </div>

  <p className='text-center my-5 font-bold text-white'>GitHub Unwrapped - Made by Psycho Coder</p>
</div>

  )
}

export default Card