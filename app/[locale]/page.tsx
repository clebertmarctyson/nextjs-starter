import { getTranslations } from "next-intl/server";
import { APP_NAME } from "@/lib/constants";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main className="flex w-screen h-[calc(100vh-4rem)] items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title", { appName: APP_NAME })}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm sm:text-base">
          {t("subtitle")}
        </p>
      </div>
    </main>
  );
}
