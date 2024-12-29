import React from 'react'

function Footer() {
  return (

<footer className="mt-10 footer footer-center bg-base-300 text-base-content p-4">
  <aside>
    <p>Copyright © {new Date().getFullYear()} - Developed by <a href='https://github.com/itspsychocoder' target='_blank'>Psycho Coder</a></p>
  </aside>
</footer>
  )
}

export default Footer