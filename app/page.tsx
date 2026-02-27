import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Dashboard from "@/components/dashboard/Dashboard";

const Home = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <Dashboard user={session.user} />;
};

export default Home;
