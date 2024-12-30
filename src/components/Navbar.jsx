import React from 'react'
import Link from "next/link";
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

const Navbar = async () => {
  const session = await getServerSession(options);


  return (
    <div className="navbar bg-base-100">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">GitHub Unwrapped</a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-1">
      <li><Link href="/">Home</Link></li>
      {/* <li><Link href="/about">About</Link></li> */}
      
      {
        session ? (
          <>
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
          </>
        ) : (
          <li>
            <Link href="/sign-in" className="text-white hover:underline">
              Sign In
            </Link>
          </li>
        )
      }
         

        
    </ul>
  </div>
</div>
  )
}

export default Navbar