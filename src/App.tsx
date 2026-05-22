import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import CandidateDetail from "./pages/CandidateDetail";

// AppKit
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "viem/chains";
import Ranking from "./pages/Ranking.tsx";

const projectId = import.meta.env.VITE_PROJECT_ID;

const metadata = {
  name: "Miss Cosmo",
  description: "Miss Cosmo Voting DApp",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  metadata,
  networks: [sepolia],
  features: { analytics: true },
});

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/admin"
        element={
          <Layout>
            <Admin />
          </Layout>
        }
      />

      <Route
        path="/candidate/:id"
        element={
          <Layout>
            <CandidateDetail />
          </Layout>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <Layout>
            <Ranking />
          </Layout>
        }
      />
    </Routes>
  );
}