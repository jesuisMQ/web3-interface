export async function uploadMultipleImages(files?: FileList | null) {
  if (!files) return {};

  const uploadedMap: Record<string, string> = {};

  await Promise.all(
    Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
            },
            body: formData,
          }
        );

        if (!res.ok) {
          console.error("Pinata upload failed:", file.name);
          return;
        }

        const data = await res.json();

        if (!data?.IpfsHash) {
          console.error("No IpfsHash returned:", file.name);
          return;
        }

        // ✅ FIX: KHÔNG dùng cloudflare nữa
        uploadedMap[file.name] =
          `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      } catch (err) {
        console.error("Upload error:", file.name, err);
      }
    })
  );

  return uploadedMap;
}