import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
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
  const [address, setAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState<any>(null);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

  const [uploaded, setUploaded] = useState(false);

  // ===============================
  // RESET WALLET
  // ===============================
  const resetWallet = () => {
    setAddress(null);
    setIsOwner(false);
    setContract(null);
    setUploaded(false);
  };

  // ===============================
  // WALLET LISTENER (CONNECT / SWITCH / DISCONNECT)
  // ===============================
  useEffect(() => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum as any);

    const handleWalletChange = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        resetWallet(); // 🔥 DISCONNECT
        return;
      }

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAddress(addr);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contractInstance);

      const owner = await contractInstance.owner();

      setIsOwner(owner.toLowerCase() === addr.toLowerCase());
    };

    // listen change
    (window.ethereum as any).on("accountsChanged", handleWalletChange);

    // initial check (only after user already connected before)
    provider.listAccounts().then((accs) => {
      handleWalletChange(accs.map((a) => a.address));
    });

    return () => {
      (window.ethereum as any).removeListener("accountsChanged", handleWalletChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111] shadow-xl">
      <Marquee />

      {/* ================= HEADER ================= */}
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
          <div className="flex items-center gap-4">

            {/* APPKIT CONNECT BUTTON */}
            <appkit-button />

          </div>
        </div>
      </div>

      {/* ================= ADMIN PANEL ================= */}
      {address && isOwner && contract && !uploaded && (
        <div className="bg-black p-4 text-white">
          <h2 className="text-lg font-bold mb-3">
            Admin Panel
          </h2>

          {/* Excel */}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setExcelFile(file);
            }}
          />

          {/* Images */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) setImages(e.target.files);
            }}
          />

          {/* Upload */}
          <button
            onClick={async () => {
              if (!excelFile || !images || !contract) {
                alert("Missing files");
                return;
              }

              try {
                await handleExcelUpload(excelFile, contract, images);
                setUploaded(true); // 🔥 hide admin panel
              } catch (err) {
                console.error(err);
                alert("Upload failed");
              }
            }}
            className="mt-4 bg-[#79BCC2] text-black px-4 py-2 rounded-xl font-bold"
          >
            Upload Candidates
          </button>
        </div>
      )}
    </header>
  );
}