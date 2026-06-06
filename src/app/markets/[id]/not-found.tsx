import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Market not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This market does not exist or may have been removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/markets">Back to markets</Link>
      </Button>
    </div>
  );
}
