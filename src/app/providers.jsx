"use client"

import { SessionProvider } from "next-auth/react"

// THIS WILL WORK

export default function Providers({ session, children }) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    )
}