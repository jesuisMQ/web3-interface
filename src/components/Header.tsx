import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { ethers } from "ethers";
import Marquee from "./marquee.tsx";
import { handleExcelUpload } from "../utils/excelUpload";
const CONTRACT_ADDRESS = import.meta.env.VITE_ADDRESS;

const CONTRACT_ABI = [
  "function addCandidates(string[] metadataCIDs)",
  "function owner() view returns (address)",
  "function updateCandidateMetadata(uint8 id, string newCID)"
];

export default function Header() {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [excelFile, setExcelFile] =useState<File | null>(null);
  async function login() {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as any
      );

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAccount(addr);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contractInstance);

      const owner = await contractInstance.owner();

      const isOwnerAddr =
        owner.toLowerCase() === addr.toLowerCase();

      setIsOwner(isOwnerAddr);

      console.log("ADDR:", addr);
      console.log("OWNER:", owner);
      console.log("IS OWNER:", isOwnerAddr);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111] shadow-xl">
      <Marquee />

      <div className="border-b border-white/10">
        <div className="mx-auto flex h-[64px] max-w-[1366px] items-center justify-between px-4">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition">
              <Menu className="h-6 w-6 text-[#79BCC2]" />
            </button>

            <div className="flex items-center gap-3">
              <img src="https://placehold.co/140x40?text=EVENTISTA" className="h-8" />
              <img src="https://placehold.co/100x40?text=COSMO" className="h-9" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">

            <button
              onClick={login}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/10 transition"
            >
              <img src="https://placehold.co/40" className="h-9 w-9 rounded-full" />

              <span className="text-white text-sm">
                {account ? account.slice(0, 6) + "..." : "Login"}
              </span>

              <ChevronDown className="h-4 w-4 text-white" />
            </button>

          </div>
        </div>
      </div>

      {/* ADMIN PANEL */}
      {isOwner && contract && (
        <div className="bg-black p-4 text-white">
          <h2 className="text-lg font-bold mb-3">
            Admin Panel
          </h2>
          <label>Exel</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {

              const file =
                e.target.files?.[0];

              if (file) {
                setExcelFile(file);
              }

            }}
          />
          <label>Image</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setImages(e.target.files);
              }
            }}
          />
          <button
            onClick={async () => {

              if (
                !excelFile ||
                !images ||
                !contract
              ) {
                alert("Missing files");
                return;
              }

              await handleExcelUpload(
                excelFile,
                contract,
                images
              );

            }}
            className="
              mt-4
              bg-[#79BCC2]
              text-black
              px-4
              py-2
              rounded-xl
              font-bold
            "
          >
            Upload Candidates
          </button>

        </div>
        
        
      )}
    </header>
  );
}