import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const Home = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <div>Home</div>;
};

export default Home;
