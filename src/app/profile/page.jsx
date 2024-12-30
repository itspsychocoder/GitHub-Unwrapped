import Image from "next/image";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";

const ProfilePage = async () => {
  const session = await getServerSession(options);

  return (
    <div className="min-h-screen bg-[#1a103d] flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
        {session?.user?.image ? (
          <div className="flex justify-center mb-4">
            <Image
              src={session.user.image}
              width={100}
              height={100}
              className="rounded-full"
              alt={`Profile Picture for ${session.user.name}`}
              priority={true}
            />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-2xl">
              ?
            </div>
          </div>
        )}

        <div className="text-center">
          {session?.user?.name ? (
            <h1 className="text-xl font-semibold text-gray-800">
              Hello, {session.user.name}!
            </h1>
          ) : (
            <h1 className="text-xl font-semibold text-gray-800">
              Hello, Guest!
            </h1>
          )}

          {session?.user?.email && (
            <p className="text-gray-600 mt-2">{session.user.email}</p>
          )}
        </div>

        {session?.accessToken ? (
          <div className="mt-4 p-3 bg-green-100 text-green-600 rounded-lg text-sm">
            <p>
              <span className="font-semibold">Access Token:</span> {session.accessToken}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            <p>No Access Token Available</p>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default ProfilePage;
