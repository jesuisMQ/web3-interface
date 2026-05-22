import { useState } from "react";

export default function EditCandidateModal({
  candidate,
  contract,
  onClose,
}: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: candidate.name || "",
    country: candidate.country || "",
    age: candidate.age || "",
    height: candidate.height || "",
    occupation: candidate.occupation || "",
    introduction: candidate.introduction || "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  // ===============================
  // UPLOAD IMAGE
  // ===============================
  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.IpfsHash) {
      throw new Error("Upload image failed");
    }

    return `ipfs://${data.IpfsHash}`;
  }

  // ===============================
  // UPDATE
  // ===============================
  async function updateCandidate() {
    try {
      setLoading(true);

      if (!contract) {
  alert("Contract not ready");
  return;
}

      let imageCID = candidate.image || "";

      if (newImage) {
        imageCID = await uploadImage(newImage);
      }

      const metadata = {
        name: form.name,
        country: form.country,
        age: Number(form.age || 0),
        height: form.height,
        occupation: form.occupation,
        introduction: form.introduction,
        image: imageCID,
      };

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: JSON.stringify(metadata),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.IpfsHash) {
        throw new Error("Upload metadata failed");
      }

      const newCID = `ipfs://${data.IpfsHash}`;

      const tx = await contract.updateCandidateMetadata(
        candidate.id,
        newCID
      );

      await tx.wait();

      alert("Updated 🚀");
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-xl p-6 space-y-4 text-black">

        <h2 className="text-2xl font-bold">Edit Candidate</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Height"
          value={form.height}
          onChange={(e) => setForm({ ...form, height: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Occupation"
          value={form.occupation}
          onChange={(e) => setForm({ ...form, occupation: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded h-32"
          placeholder="Introduction"
          value={form.introduction}
          onChange={(e) => setForm({ ...form, introduction: e.target.value })}
        />

        <input type="file" onChange={(e) =>
          setNewImage(e.target.files?.[0] || null)
        } />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={updateCandidate}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}