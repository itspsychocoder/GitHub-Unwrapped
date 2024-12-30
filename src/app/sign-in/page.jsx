
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";

import SignInButton from "@/components/SignInButton";

const SignInPage = async () => {
  

    return (
      <div>
        <h1>SignInPage</h1>

        <SignInButton />
      </div>
    );
  
};

export default SignInPage;