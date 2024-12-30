import React from 'react'
import Link from "next/link";

const Navbar = async () => {
  return (
    <div className="navbar bg-base-100">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">GitHub Unwrapped</a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-1">
      <li><Link href="/">Home</Link></li>
      {/* <li><Link href="/about">About</Link></li> */}
      
            <li>
              <Link href="/profile" className="text-white hover:underline">
                Profile
              </Link>
            </li>

            <li>
              <Link href="/sign-out" className="text-white hover:underline">
                Sign Out
              </Link>
            </li>
        
    </ul>
  </div>
</div>
  )
}

export default Navbar