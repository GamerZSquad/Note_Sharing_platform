import { DEPARTMENTS, RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTERS } from "@/lib/constants";

export function SearchFilters({
  values,
}: {
  values: Record<string, string | undefined>;
}) {
  return (
    <form action="/search" className="grid gap-3 rounded-2xl border border-line bg-paper p-4 md:grid-cols-6">
      <input type="hidden" name="q" value={values.q ?? ""} />
      <select name="department" defaultValue={values.department ?? ""} className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm">
        <option value="">All departments</option>
        {DEPARTMENTS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select name="semester" defaultValue={values.semester ?? ""} className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm">
        <option value="">All semesters</option>
        {SEMESTERS.map((item) => (
          <option key={item} value={item}>
            Semester {item}
          </option>
        ))}
      </select>
      <input
        name="subject"
        defaultValue={values.subject ?? ""}
        placeholder="Subject"
        className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm"
      />
      <select name="type" defaultValue={values.type ?? ""} className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm">
        <option value="">All types</option>
        {RESOURCE_TYPES.map((type) => (
          <option key={type} value={type}>
            {RESOURCE_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <select name="source" defaultValue={values.source ?? ""} className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm">
        <option value="">All sources</option>
        <option value="community">Community</option>
        <option value="university">University</option>
        <option value="educational">Educational website</option>
        <option value="documentation">Documentation</option>
      </select>
      <select name="sort" defaultValue={values.sort ?? "relevant"} className="rounded-xl border border-line bg-parchment px-3 py-2 text-sm">
        <option value="relevant">Most relevant</option>
        <option value="downloads">Most downloaded</option>
        <option value="rating">Highest rated</option>
        <option value="newest">Newest</option>
      </select>
      <button className="rounded-xl bg-forest px-3 py-2 text-sm text-white md:col-span-6">
        Apply filters
      </button>
    </form>
  );
}
