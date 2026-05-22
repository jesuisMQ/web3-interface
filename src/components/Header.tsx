import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ethers } from "ethers";
import Marquee from "./marquee.tsx";
import { handleExcelUpload } from "../utils/excelUpload";

const CONTRACT_ADDRESS = import.meta.env.VITE_ADDRESS;

const CONTRACT_ABI = [
  "function addCandidates(string[] metadataCIDs)",
  "function owner() view returns (address)",
  "function updateCandidateMetadata(uint8 id, string newCID)",
  "function setEndTime(uint256 _time)",
];

export default function Header() {
  const [timeLeft, setTimeLeft] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [endDate, setEndDate] = useState<string>("");
  const [settingEnd, setSettingEnd] = useState(false);
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


    useEffect(() => {
  const target = new Date("2026-05-23T18:30:00+07:00").getTime();

  const interval = setInterval(() => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      setTimeLeft("Voting closed");
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  }, 1000);

  return () => clearInterval(interval);
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
            <div className="text-white text-lg font-bold tracking-wide bg-white/10 px-4 py-2 rounded-xl shadow-md backdrop-blur-md">
  ⏳ {timeLeft || "Loading..."}
</div>

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
          {/* ================= END TIME ================= */}
          <div className="mt-6 border-t border-white/20 pt-4">
            <h3 className="text-lg font-bold mb-3">Voting Deadline</h3>

            <div className="flex items-center gap-3">

              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded text-black"
              />

              <button
                disabled={settingEnd}
                onClick={async () => {
                  if (!contract || !endDate) return;

                  try {
                    setSettingEnd(true);

                    // convert datetime-local -> timestamp (seconds)
                    const endTime =
                      Math.floor(new Date(endDate).getTime() / 1000);

                    const tx = await contract.setEndTime(endTime);
                    await tx.wait();

                    alert("Set end time success");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to set end time");
                  } finally {
                    setSettingEnd(false);
                  }
                }}
                className="bg-red-500 px-4 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                {settingEnd ? "Setting..." : "Set End Time"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}