import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";


// ===============================
// ENV
// ===============================
const CONTRACT_ADDRESS = import.meta.env.VITE_ADDRESS as string;
const RPC_URL = import.meta.env.VITE_ETH_SEPOLIA_RPC_URL as string;

// ===============================
// ABI
// ===============================
const CONTRACT_ABI = [
  "function getCandidate(uint8 id) view returns(tuple(uint8 id,address owner,string metadataCID,uint256 totalVotes))",
  "function vote(uint8 candidateId,uint8 packageId) payable",
  "function packages(uint8) view returns(uint256 usdPrice,uint256 votes)",
  "function getRequiredEth(uint256 usdAmount) view returns(uint256)",

  // EVENT
  "event VotePurchased(address indexed voter,uint8 indexed candidateId,uint8 indexed packageId,uint256 votes,uint256 ethPaid)"
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
  age?: string;
  height?: string;
  occupation?: string;
  introduction?: string;
  image?: string;

  [key: string]: any;
};
type TransactionItem = {
  hash: string;
  time: number;
  voter: string;
  votes: number;
  blockNumber: number;
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

      const res =
        await fetch(gateway + cleanCid);

      if (!res.ok) continue;

      return await res.json();

    } catch { }
  }

  throw new Error("IPFS fetch failed");
}

function getImageUrl(image?: string) {

  if (!image) {
    return "https://placehold.co/600x800";
  }

  if (image.startsWith("ipfs://")) {

    return image.replace(
      "ipfs://",
      "https://gateway.pinata.cloud/ipfs/"
    );
  }

  return image;
}

// ===============================
// COMPONENT
// ===============================
export default function CandidateDetail() {

  const { id } = useParams();

  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [transactions, setTransactions] =
    useState<TransactionItem[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedPackage, setSelectedPackage] =
    useState<number | null>(null);

  const [ethEstimate, setEthEstimate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showAllTransactions, setShowAllTransactions] =
    useState(false);

useEffect(() => {
  if (id === undefined || id === null) return;

  const candidateId = Number(id);

  if (Number.isNaN(candidateId)) return;

  let mounted = true;

  async function load() {
    try {
      setLoading(true);

      // =========================
      // CONTRACT
      // =========================
      const provider = new ethers.JsonRpcProvider(RPC_URL);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // =========================
      // LOAD CANDIDATE
      // =========================
      const data = await contract.getCandidate(candidateId);

      const meta = await fetchIPFSJson(data.metadataCID);

      if (!mounted) return;

      setCandidate({
        id: Number(data.id),
        owner: data.owner,
        metadataCID: data.metadataCID,
        totalVotes: Number(data.totalVotes),
        ...meta,
      });

      // =========================
      // LOAD TRANSACTIONS
      // =========================
      const res = await fetch(
        "https://api.studio.thegraph.com/query/1753759/my-vote-app/v0.0.1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query ($candidateId: Int!) {
                votePurchaseds(
                  where: {
                    candidateId: $candidateId
                  }
                  orderBy: blockTimestamp
                  orderDirection: desc
                ) {
                  voter
                  candidateId
                  packageId
                  votes
                  ethPaid
                  blockTimestamp
                  transactionHash
                }
              }
            `,
            variables: {
              candidateId: candidateId,
            },
          }),
        }
      );

      const json = await res.json();

      console.log("GRAPH DATA:", json);

      const txs = json.data.votePurchaseds.map((tx: any) => ({
        hash: String(tx.transactionHash),
        voter: String(tx.voter),
        votes: Number(tx.votes),

        time: Number(tx.blockTimestamp),

        blockNumber: 0,
      }));

      if (!mounted) return;

      setTransactions(txs);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  load();

  return () => {
    mounted = false;
  };
}, [id]);

  // ===============================
  // SELECT PACKAGE
  // ===============================
  async function selectPackage(pkgId: number) {

    setSelectedPackage(pkgId);

    const provider =
      new ethers.JsonRpcProvider(RPC_URL);

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

    const pkg =
      await contract.packages(pkgId);

    const eth =
      await contract.getRequiredEth(
        pkg.usdPrice
      );

    setEthEstimate(
      ethers.formatEther(eth)
    );
  }

  // ===============================
  // VOTE
  // ===============================
  async function vote() {

    if (
      selectedPackage === null
    ) return;

    if (!window.ethereum) {

      alert("Install MetaMask");
      return;
    }

    try {

      const provider =
        new ethers.BrowserProvider(
          window.ethereum as any
        );

      const signer =
        await provider.getSigner();

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

      const pkg =
        await contract.packages(
          selectedPackage
        );

      const ethRequired =
        await contract.getRequiredEth(
          pkg.usdPrice
        );

      const tx =
        await contract.vote(
          Number(id),
          selectedPackage,
          {
            value: ethRequired,
          }
        );

      await tx.wait();

      alert("Vote success");

      window.location.reload();

    } catch (err) {

      console.error(err);
      alert("Vote failed");
    }
  }

  // ===============================
  // FILTERED TX
  // ===============================
  const filteredTransactions =
    transactions.filter((tx) =>

      tx.hash
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // ===============================
  // LOADING
  // ===============================
  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >
        Loading...
      </div>
    );
  }

  // ===============================
  // NOT FOUND
  // ===============================
  if (!candidate) {

    return (

      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >
        Candidate not found
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  return (

    <section
      className="
        min-h-screen
        bg-black
        text-white
        px-6
        py-12
      "
    >

      <div
        className="
          max-w-[1400px]
          mx-auto
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-12
          items-start
        "
      >

        {/* LEFT */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[32px]
            bg-white/5
          "
        >

          <img
            src={getImageUrl(candidate.image)}
            alt={candidate.name}
            className="
              w-full
              h-[850px]
              object-cover
              object-top
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/80
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              w-full
              p-8
            "
          >

            <p
              className="
                text-sm
                uppercase
                tracking-[4px]
                text-gray-300
              "
            >
              {candidate.country}
            </p>

            <h1
              className="
                text-5xl
                font-black
                uppercase
                mt-2
              "
            >
              {candidate.name}
            </h1>

          </div>

        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            flex-col
            gap-8
          "
        >

          {/* HEADER */}
          <div>

            <p
              className="
                text-pink-400
                uppercase
                tracking-[4px]
                text-sm
                mb-3
              "
            >
              Candidate Detail
            </p>

            <h2
              className="
                text-6xl
                font-black
                leading-none
                uppercase
              "
            >
              {candidate.name}
            </h2>

          </div>

          {/* VOTE BAR */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-3xl
              bg-pink-500
              px-6
              py-5
            "
          >

            <div>

              <p className="text-sm text-white/80">
                Voting points
              </p>

              <h3
                className="
                  text-4xl
                  font-black
                "
              >
                {candidate.totalVotes.toLocaleString()}
              </h3>

            </div>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="
                bg-white
                text-black
                px-8
                py-4
                rounded-2xl
                font-bold
                hover:scale-105
                transition
              "
            >
              VOTE
            </button>

          </div>

          {/* DETAIL BOX */}
          <div
            className="
              rounded-3xl
              bg-white/5
              border
              border-white/10
              p-8
              space-y-5
            "
          >

            <div className="flex">
              <div className="w-[140px] text-gray-400">
                No
              </div>

              <div className="mr-4">:</div>

              <div className="font-semibold">
                {String(candidate.id).padStart(3, "0")}
              </div>
            </div>

            <div className="flex">
              <div className="w-[140px] text-gray-400">
                Country
              </div>

              <div className="mr-4">:</div>

              <div className="font-semibold">
                {candidate.country}
              </div>
            </div>

            <div className="flex">
              <div className="w-[140px] text-gray-400">
                Age
              </div>

              <div className="mr-4">:</div>

              <div className="font-semibold">
                {candidate.age}
              </div>
            </div>

            <div className="flex">
              <div className="w-[140px] text-gray-400">
                Height
              </div>

              <div className="mr-4">:</div>

              <div className="font-semibold">
                {candidate.height}
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-[140px] text-gray-400 shrink-0">
                Occupation
              </div>

              <div className="mr-4">:</div>

              <div className="font-semibold break-words">
                {candidate.occupation}
              </div>
            </div>

          </div>

          {/* INTRODUCTION */}
          <div
            className="
              rounded-3xl
              bg-white/5
              border
              border-white/10
              p-8
            "
          >

            <h3
              className="
                text-2xl
                font-bold
                mb-5
              "
            >
              Introduction
            </h3>

            <p
              className="
                text-gray-300
                leading-8
                text-[16px]
              "
            >
              {candidate.introduction}
            </p>

          </div>

          {/* TRANSACTIONS */}
          <div
            className="
              rounded-3xl
              bg-white/5
              border
              border-white/10
              overflow-hidden
            "
          >

            {/* HEADER */}
            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-white/10
              "
            >

              <h3
                className="
                  text-2xl
                  font-bold
                "
              >
                Transaction Details
              </h3>

              <input
                type="text"
                placeholder="Search tx hash..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  bg-white/5
                  border
                  border-white/10
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  outline-none
                  w-[260px]
                "
              />

            </div>

            {/* LIST */}
            <div>

              {(showAllTransactions
                ? filteredTransactions
                : filteredTransactions.slice(0, 3)
              ).map((tx) => (

                <div
                  key={tx.hash}
                  className="
                    px-6
                    py-4
                    border-b
                    border-white/5
                    last:border-b-0
                  "
                >

                  <div className="flex justify-between">

                    <p className="text-sm text-gray-400">
                      Transaction Code
                    </p>

                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      className="
                        text-sm
                        font-bold
                        hover:text-pink-400
                        transition
                      "
                    >
                      {tx.hash.slice(0, 4)}***
                      {tx.hash.slice(-2)}
                    </a>

                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      mt-2
                    "
                  >

                    <p className="text-sm text-gray-400">
                      Time
                    </p>

                    <p className="text-sm font-semibold">
                      {new Date(
                        tx.time * 1000
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>
              ))}

            </div>

            {/* SEE MORE */}
            {filteredTransactions.length > 3 && (

              <div
                className="
                  flex
                  justify-center
                  py-5
                  border-t
                  border-white/5
                "
              >

                <button
                  onClick={() =>
                    setShowAllTransactions(
                      !showAllTransactions
                    )
                  }
                  className="
                    px-5
                    py-2
                    rounded-xl
                    bg-white/10
                    hover:bg-white/20
                    transition
                    font-semibold
                  "
                >
                  {showAllTransactions
                    ? "Show Less"
                    : "See More"}
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ===============================
          VOTE MODAL
      =============================== */}
      {showModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/70
            flex
            items-center
            justify-center
            z-50
          "
        >

          <div
            className="
              bg-[#111]
              border
              border-white/10
              rounded-3xl
              p-8
              w-[800px]
            "
          >

            <h2
              className="
                text-3xl
                font-bold
                mb-6
              "
            >
              Vote Package
            </h2>

            <div
              className="
                grid
                grid-cols-3
                gap-4
              "
            >

              {packages.map((pkg) => (

                <div
                  key={pkg.id}
                  onClick={() =>
                    selectPackage(pkg.id)
                  }
                  className={`
                    p-6
                    rounded-2xl
                    cursor-pointer
                    border
                    transition
                    ${
                      selectedPackage === pkg.id
                        ? "border-pink-500 bg-pink-500/20"
                        : "border-white/10 bg-white/5"
                    }
                  `}
                >

                  <p
                    className="
                      text-3xl
                      font-black
                    "
                  >
                    {pkg.votes}
                  </p>

                  <p className="text-gray-400">
                    votes
                  </p>

                </div>
              ))}

            </div>

            {selectedPackage !== null && (

              <div
                className="
                  mt-6
                  rounded-2xl
                  bg-green-500/10
                  border
                  border-green-500/20
                  p-5
                "
              >

                <p className="text-green-400">
                  Required ETH
                </p>

                <h3
                  className="
                    text-3xl
                    font-bold
                    mt-1
                  "
                >
                  {ethEstimate || "Loading..."} ETH
                </h3>

              </div>
            )}

            <div
              className="
                flex
                justify-end
                gap-4
                mt-8
              "
            >

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-white/10
                "
              >
                Cancel
              </button>

              <button
                onClick={vote}
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-pink-500
                  font-bold
                "
              >
                Confirm Vote
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}