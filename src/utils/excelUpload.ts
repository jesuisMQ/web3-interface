import * as XLSX from "xlsx";
import { uploadMultipleImages } from "./ipfs";

function readExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);

        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet);

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

export async function handleExcelUpload(
  file: File,
  contract: any,
  images?: FileList | null
) {
  try {
    const rows = await readExcel(file);

    // 🚀 upload images
    let uploadedImages: Record<string, string> = {};

    if (images) {
      uploadedImages = await uploadMultipleImages(images);
    }

    console.log("UPLOADED IMAGES:", uploadedImages);

    const metadataCIDs = await Promise.all(
      rows.map(async (row: any, index: number) => {
        try {
          const imageKey = (row.Image || "").trim();

          const imageUrl =
            uploadedImages[imageKey] ||
            "https://placehold.co/400x500";

          const metadata = {
            no: row.No,
            name: row.Name, 
            country: row.Country,
            age: row.Age,
            height: row.Height,
            occupation: row.Occupation,
            introduction: row.Introduction,
            image: imageUrl,
          };

          console.log(`ROW ${index} METADATA:`, metadata);

          const res = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
              },
              body: JSON.stringify(metadata),
            }
          );

          if (!res.ok) {
            throw new Error(`Pin JSON failed at row ${index}`);
          }

          const data = await res.json();

          if (!data?.IpfsHash) {
            throw new Error(`No IpfsHash at row ${index}`);
          }

          return `ipfs://${data.IpfsHash}`;
        } catch (err) {
          console.error("Row error:", err);
          return null;
        }
      })
    );

    const validCIDs = metadataCIDs.filter(Boolean);

    console.log("METADATA CIDs:", validCIDs);

    if (validCIDs.length === 0) {
      throw new Error("No valid metadata to upload");
    }

    const tx = await contract.addCandidates(validCIDs);

    await tx.wait();

    alert("Upload done 🚀");
  } catch (err) {
    console.error("Excel upload error:", err);
  }
}