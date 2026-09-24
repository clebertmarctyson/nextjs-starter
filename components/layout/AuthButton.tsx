import { getTranslations } from "next-intl/server";
import { auth, signIn, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function AuthButton() {
  const [session, t] = await Promise.all([auth(), getTranslations("Header")]);

  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          {t("logout")}
        </Button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button type="submit" variant="default" size="sm">
        {t("login")}
      </Button>
    </form>
  );
}
