export function SearchForm({
  defaultQuery = "",
  size = "md",
}: {
  defaultQuery?: string;
  size?: "md" | "lg";
}) {
  return (
    <form action="/search" className="flex w-full gap-2">
      <input
        name="q"
        defaultValue={defaultQuery}
        placeholder="Search notes and educational resources…"
        className={`flex-1 rounded-full border border-line bg-paper px-5 text-ink outline-none ring-forest/30 placeholder:text-muted focus:ring-2 ${
          size === "lg" ? "h-14 text-base" : "h-11 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`rounded-full bg-forest px-6 font-medium text-white hover:bg-forest-dark ${
          size === "lg" ? "h-14" : "h-11"
        }`}
      >
        Search
      </button>
    </form>
  );
}
