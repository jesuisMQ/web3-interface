type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({ search, setSearch }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-[40px] px-4 py-[7px] h-[50px] w-full border border-gray-300 bg-[#1a1a1a]">

      {/* icon */}
      <div className="fill-white">
        {/* svg giữ nguyên */}
      </div>

      {/* input */}
      <input
        className="w-full bg-transparent focus:outline-none text-white placeholder:text-gray-400"
        placeholder="Search candidates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}