import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

// ===============================
// ENV
// ===============================
const CONTRACT_ADDRESS = import.meta.env.VITE_ADDRESS as string;
const RPC_URL = import.meta.env.VITE_ETH_SEPOLIA_RPC_URL as string;

// ===============================
// ABI
// ===============================
const CONTRACT_ABI = [
  "function candidateCount() view returns(uint8)",
  "function getCandidate(uint8 id) view returns(tuple(uint8 id,address owner,string metadataCID,uint256 totalVotes))",
  "function vote(uint8 candidateId,uint8 packageId) payable",
  "function packages(uint8) view returns(uint256 usdPrice,uint256 votes)",
  "function getRequiredEth(uint256 usdAmount) view returns(uint256)",
  "function setEndTime(uint256 _time)"
];

// ===============================
// TYPES
// ===============================
type Candidate = {
  id: number;
  owner: string;
  metadataCID: string;
  totalVotes: number;
  name?: string;
  country?: string;
  image?: string;
};

// ===============================
// PACKAGES
// ===============================
const packages = [
  { id: 0, votes: 5 },
  { id: 1, votes: 30 },
  { id: 2, votes: 70 },
  { id: 3, votes: 200 },
  { id: 4, votes: 500 },
  { id: 5, votes: 1200 },
];

// ===============================
// IPFS
// ===============================
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
];

async function fetchIPFSJson(cid: string) {
  const cleanCid = cid.replace("ipfs://", "");

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const res = await fetch(gateway + cleanCid);
      if (!res.ok) continue;
      return await res.json();
    } catch {}
  }

  throw new Error("IPFS failed");
}

function getImageUrl(image?: string) {
  if (!image) return "https://placehold.co/400x500";
  if (image.startsWith("ipfs://")) {
    return image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return image;
}

// ===============================
// COMPONENT
// ===============================
export default function Candidates({ search = "" }: { search?: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [ethEstimate, setEthEstimate] = useState("");

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  // ===============================
  // LOAD DATA
  // ===============================
  async function loadCandidates() {
    try {
      setLoading(true);

      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = Number(await contract.candidateCount());

      const arr: Candidate[] = [];

      for (let i = 0; i < count; i++) {
        const c = await contract.getCandidate(i);
        const meta = await fetchIPFSJson(c.metadataCID);

        arr.push({
          id: Number(c.id),
          owner: c.owner,
          metadataCID: c.metadataCID,
          totalVotes: Number(c.totalVotes),
          ...meta,
        });
      }

      setCandidates(arr);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  // ===============================
  // FILTER
  // ===============================
  const filteredCandidates = candidates.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      String(c.id).includes(q)
    );
  });

  // ===============================
  // PACKAGE
  // ===============================
  async function selectPackage(pkgId: number) {
    setSelectedPackage(pkgId);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const pkg = await contract.packages(pkgId);
    const eth = await contract.getRequiredEth(pkg.usdPrice);

    setEthEstimate(ethers.formatEther(eth));
  }

  // ===============================
  // VOTE
  // ===============================
  async function vote(candidateId: number, packageId: number) {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const pkg = await contract.packages(packageId);
    const ethRequired = await contract.getRequiredEth(pkg.usdPrice);

    const tx = await contract.vote(candidateId, packageId, {
      value: ethRequired,
    });

    await tx.wait();
    alert("Vote success");
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-[1366px] mx-auto p-6 text-white">

      <h1 className="text-4xl font-bold mb-8">Candidates</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-[24px] bg-white/10 p-4"
            >

              <div className="w-full h-[420px] overflow-hidden rounded-lg">
  <img
    src={getImageUrl(candidate.image)}
    className="w-full h-full object-cover object-top"
  />
</div>

              <h2 className="mt-2 text-xl font-bold">
                {candidate.name}
              </h2>

              <p className="text-gray-300">{candidate.country}</p>

              <div className="flex gap-2 mt-3">

                <Link
                  to={`/candidate/${candidate.id}`}
                  className="flex-1 bg-white text-black py-2 rounded-lg text-center"
                >
                  Detail
                </Link>

                <button
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-pink-500 py-2 rounded-lg"
                >
                  Vote
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-[700px]">

            <h2 className="text-xl mb-4">Vote Package</h2>

            <div className="grid grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => selectPackage(pkg.id)}
                  className="p-3 border rounded cursor-pointer"
                >
                  {pkg.votes} votes
                </div>
              ))}
            </div>

            <p className="mt-4 text-green-400">
              ETH: {ethEstimate}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                className="bg-pink-500 px-4 py-2 rounded"
                onClick={async () => {
                  if (selectedCandidateId === null || selectedPackage === null) return;

                  await vote(selectedCandidateId, selectedPackage);
                  setShowModal(false);
                }}
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}