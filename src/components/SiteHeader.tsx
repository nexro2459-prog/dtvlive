import { Link } from "@tanstack/react-router";
import { Search, Tv } from "lucide-react";

interface Props {
  search?: string;
  onSearch?: (v: string) => void;
}

export function SiteHeader({ search, onSearch }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_290)] to-[oklch(0.7_0.18_220)] shadow-[0_0_20px_oklch(0.7_0.2_280/0.5)]">
            <Tv className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-[oklch(0.8_0.18_290)] to-[oklch(0.8_0.15_220)] bg-clip-text text-xl font-black tracking-tight text-transparent">
            Dtv
          </span>
        </Link>

        {onSearch && (
          <div className="relative ml-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search channels..."
              className="w-full rounded-full border border-border bg-card/60 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md outline-none transition focus:border-[oklch(0.7_0.18_290)] focus:ring-2 focus:ring-[oklch(0.65_0.2_290/0.3)]"
            />
          </div>
        )}
      </div>
    </header>
  );
}
