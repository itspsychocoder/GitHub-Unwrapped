import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";

import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

const SignOutPage = async () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a103d]">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800">Sign Out</h1>
        <p className="mt-4 text-gray-600">
          Are you sure you want to sign out?
        </p>

        <div className="mt-6">
          <SignOutButton />
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Changed your mind?{" "}
            <Link
              href="/"
              className="text-indigo-500 hover:underline font-medium"
            >
              Go back to Homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignOutPage;
