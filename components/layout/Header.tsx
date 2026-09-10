import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { AuthButton } from "@/components/layout/AuthButton";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/vunep-logo.png" alt="" width={24} height={24} className="size-6" priority />
        <span className="text-sm font-medium tracking-tight">{APP_NAME}</span>
      </Link>

      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <AuthButton />
      </div>
    </header>
  );
}
