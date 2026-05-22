import SearchBar from "../components/SearchBar";
import Candidates from "../components/Candidates";
import { useState } from "react";
export default function Home() {
  const [search, setSearch] = useState("");
  return (
    <>
      <img
        src="/1764304610841-BANNER COSMO3.jpg"
        className="w-full aspect-[1366/683]"
      />

      <SearchBar search={search} setSearch={setSearch} />

      <div className="mt-10" />

      <Candidates search={search} />
    </>
  );
}