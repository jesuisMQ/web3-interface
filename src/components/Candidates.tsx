import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import EditCandidateModal from "./EditCandidateModal";

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
  "function updateCandidateMetadata(uint8 id, string newCID)",
  "function vote(uint8 candidateId,uint8 packageId) payable",
  "function packages(uint8) view returns(uint256 usdPrice,uint256 votes)",
  "function getRequiredEth(uint256 usdAmount) view returns(uint256)"
];

// ===============================
// TYPES
// ===============================
type Candidate = {
  id: number;
  owner: string;
  metadataCID: string;
  totalVotes: number;
  no?: string;
  country?: string;
  image?: string;
  name?: string;
  [key: string]: any;
};

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
export default function Candidates({
  isAdmin = false,
  search = "",
}: {
  isAdmin?: boolean;
  search?: string;
}) {
  const [contract, setContract] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [ethEstimate, setEthEstimate] = useState("");

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const [editing, setEditing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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

  useEffect(() => {
    const initContract = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contractInstance);
    };

    initContract();
  }, []);

  // ===============================
  // FILTER SEARCH
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
              className="relative rounded-[24px] border border-transparent 
              bg-[rgba(222,222,222,0.15)] backdrop-blur-[8px] 
              hover:bg-[rgba(222,222,222,0.25)] hover:shadow-lg 
              hover:shadow-black/10 transition-all duration-300 cursor-pointer overflow-hidden"
            >

              {/* IMAGE */}
              <div className="relative aspect-[360/461]">
                <img
                  src={getImageUrl(candidate.image)}
                  className="absolute inset-0 w-full h-full object-cover object-top rounded-lg"
                />
              </div>

              {/* INFO */}
              <div className="flex flex-col px-4 pt-3 pb-4 space-y-2">

                <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">No:</span>
                    <p className="font-bold text-white">{candidate.id}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white">
                      {candidate.totalVotes.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 truncate">
                  {candidate.country}
                </p>

                <h2 className="text-xl font-bold text-white uppercase line-clamp-2">
                  {candidate.name}
                </h2>

                {/* BUTTONS */}
                <div className="flex gap-2 pt-2">

                  <Link
                    to={`/candidate/${candidate.id}`}
                    className="flex-1 bg-white text-black py-2 rounded-lg text-center font-semibold"
                  >
                    Detail
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedCandidateId(candidate.id);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-pink-500 text-white py-2 rounded-lg font-semibold"
                  >
                    Vote
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setEditing(true);
                      }}
                      className="px-3 bg-yellow-400 text-black rounded-lg font-semibold"
                    >
                      Edit
                    </button>
                  )}

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-[800px]">

            <h2 className="text-xl mb-4">Vote Package</h2>

            <div className="grid grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => selectPackage(pkg.id)}
                  className={`p-3 border rounded cursor-pointer
                    ${selectedPackage === pkg.id ? "border-pink-500" : "border-gray-600"}
                  `}
                >
                  {pkg.votes} votes
                </div>
              ))}
            </div>

            {selectedPackage !== null && (
              <p className="mt-4 text-green-400">
                ETH: {ethEstimate || "Loading..."}
              </p>
            )}

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

      {/* EDIT */}
      {editing && selectedCandidate && (
        <EditCandidateModal
          candidate={selectedCandidate}
          contract={contract}
          onClose={() => {
            setEditing(false);
            loadCandidates();
          }}
        />
      )}

    </div>
  );
}