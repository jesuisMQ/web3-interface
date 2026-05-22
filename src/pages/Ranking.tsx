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

  [key: string]: any;
};

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
    } catch { }
  }

  throw new Error("IPFS failed");
}

function getImageUrl(image?: string) {
  if (!image) return "https://placehold.co/400x500";

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
export default function Ranking() {

  const [loading, setLoading] = useState(true);

  const [top3, setTop3] =
    useState<Candidate[]>([]);

  const [others, setOthers] =
    useState<Candidate[]>([]);

  // ===============================
  // LOAD
  // ===============================
  useEffect(() => {

    async function loadRanking() {

      try {

        setLoading(true);

        const provider =
          new ethers.JsonRpcProvider(RPC_URL);

        const contract =
          new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
          );

        const count =
          Number(await contract.candidateCount());

        const arr: Candidate[] = [];

        for (let i = 0; i < count; i++) {

          const c =
            await contract.getCandidate(i);

          const meta =
            await fetchIPFSJson(c.metadataCID);

          arr.push({
            id: Number(c.id),
            owner: c.owner,
            metadataCID: c.metadataCID,
            totalVotes: Number(c.totalVotes),
            ...meta,
          });
        }

        // SORT DESC
        arr.sort(
          (a, b) => b.totalVotes - a.totalVotes
        );

        setTop3(arr.slice(0, 3));
        setOthers(arr.slice(3));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRanking();

  }, []);

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
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

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">

          <p
            className="
              uppercase
              tracking-[6px]
              text-pink-400
              text-sm
              mb-4
            "
          >
            Live Ranking
          </p>

          <h1
            className="
              text-6xl
              font-black
              uppercase
            "
          >
            Top Candidates
          </h1>

        </div>

        {/* TOP 3 */}
        <div
          className="
            hidden
            xl:flex
            items-end
            justify-center
            gap-6
            mb-16
          "
        >

          {/* SECOND */}
          {top3[1] && (
            <TopCard
              candidate={top3[1]}
              rank={2}
              big={false}
            />
          )}

          {/* FIRST */}
          {top3[0] && (
            <TopCard
              candidate={top3[0]}
              rank={1}
              big={true}
            />
          )}

          {/* THIRD */}
          {top3[2] && (
            <TopCard
              candidate={top3[2]}
              rank={3}
              big={false}
            />
          )}

        </div>

        {/* MOBILE TOP 3 */}
        <div
          className="
            xl:hidden
            grid
            grid-cols-1
            gap-6
            mb-14
          "
        >
          {top3.map((candidate, index) => (
            <TopCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              big={index === 0}
            />
          ))}
        </div>

        {/* OTHER CANDIDATES */}
        <div>

          <h2
            className="
              text-3xl
              font-bold
              mb-8
            "
          >
            Other Candidates
          </h2>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-6
            "
          >

            {others.map((candidate, index) => (

              <div
                key={candidate.id}
                className="
                  rounded-[24px]
                  overflow-hidden
                  bg-white/5
                  border
                  border-white/10
                  backdrop-blur-[8px]
                  hover:bg-white/10
                  transition
                "
              >

                {/* IMAGE */}
                <div className="relative aspect-[286/354]">

                  <img
                    src={getImageUrl(candidate.image)}
                    alt={candidate.name}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                      object-top
                    "
                  />

                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-3">

                  {/* TOP BAR */}
                  <div
                    className="
                      rounded-xl
                      bg-white/10
                      px-3
                      py-2
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">
                        No:
                      </span>

                      <p className="font-bold">
                        {String(candidate.id).padStart(3, "0")}
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="font-bold">
                        {candidate.totalVotes.toLocaleString()}
                      </p>

                    </div>

                  </div>

                  {/* COUNTRY */}
                  <p className="text-sm text-gray-400">
                    {candidate.country}
                  </p>

                  {/* NAME */}
                  <h3
                    className="
                      text-xl
                      font-black
                      uppercase
                      line-clamp-2
                    "
                  >
                    {candidate.name}
                  </h3>

                  {/* RANK */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      pt-2
                    "
                  >

                    <span className="text-gray-400">
                      Rank #{index + 4}
                    </span>

                    <Link
                      to={`/candidate/${candidate.id}`}
                      className="
                        bg-pink-500
                        hover:bg-pink-600
                        px-4
                        py-2
                        rounded-lg
                        font-semibold
                      "
                    >
                      Detail
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

// ===============================
// TOP CARD
// ===============================
function TopCard({
  candidate,
  rank,
  big,
}: {
  candidate: Candidate;
  rank: number;
  big: boolean;
}) {

  return (

    <div
      className={`
        group
        w-full
        ${big
          ? "max-w-[360px]"
          : "max-w-[286px]"
        }
      `}
    >

      <div
        className="
          relative
          rounded-[24px]
          overflow-hidden
          bg-[rgba(222,222,222,0.15)]
          backdrop-blur-[8px]
          border
          border-white/10
          hover:bg-[rgba(222,222,222,0.25)]
          transition-all
        "
      >

        {/* IMAGE */}
        <Link
          to={`/candidate/${candidate.id}`}
          className={`
            relative
            block
            w-full
            ${big
              ? "aspect-[360/461]"
              : "aspect-[286/354]"
            }
          `}
        >

          <img
            src={getImageUrl(candidate.image)}
            alt={candidate.name}
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-top
            "
          />

        </Link>

        {/* CONTENT */}
        <div
          className={`
            flex
            flex-col
            ${big ? "px-3" : "px-2"}
            pt-2
            pb-3
            space-y-3
          `}
        >

          {/* BAR */}
          <div
            className="
              rounded-[12px]
              h-[32px]
              flex
              items-center
              justify-between
              px-3
              bg-white/10
            "
          >

            <div className="flex items-center gap-2">

              <span className="text-sm text-gray-400">
                No:
              </span>

              <p className="font-bold">
                {String(candidate.id).padStart(3, "0")}
              </p>

            </div>

            <div className="text-right">

              <p
                className={`
                  font-bold
                  ${big ? "text-lg" : "text-base"}
                `}
              >
                {candidate.totalVotes.toLocaleString()}
              </p>

            </div>

          </div>

          {/* COUNTRY */}
          <p className="text-sm text-gray-400 truncate">
            {candidate.country}
          </p>

          {/* NAME */}
          <h2
            className={`
              font-black
              uppercase
              leading-tight
              ${big
                ? "text-3xl"
                : "text-xl"
              }
            `}
          >
            {candidate.name}
          </h2>

          {/* FOOTER */}
          <div
            className={`
              flex
              items-end
              gap-3
              ${big
                ? "h-[100px]"
                : "h-[72px]"
              }
            `}
          >

            {/* BUTTON */}
            <Link
              to={`/candidate/${candidate.id}`}
              className="
                flex-1
                bg-pink-500
                hover:bg-pink-600
                rounded-lg
                py-[10px]
                text-center
                font-semibold
              "
            >
              DETAIL
            </Link>

            {/* RANK BADGE */}
            <div className="relative flex items-center justify-center">

              {/* LAUREL IMAGE */}
              <img
                src="/laurel-dark-big.760837af.svg"
                alt="rank badge"
                className={`
      ${big ? "w-[100px] h-[100px]" : "w-[72px] h-[72px]"}
      object-contain
    `}
              />

              {/* RANK NUMBER */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`
        font-black text-white
        ${big ? "text-4xl" : "text-2xl"}
      `}
                >
                  {rank}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}