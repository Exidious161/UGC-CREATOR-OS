// One-time (or re-run-on-update) upload of the paid PDF into private Vercel
// Blob storage. Not part of the app's request path — run manually:
//
//   node --env-file=.env.local scripts/upload-pdf.mjs "C:\path\to\UGC_Creator_OS1.pdf"
//
// Requires BLOB_READ_WRITE_TOKEN in the environment (from `vercel env pull`
// or pasted from Vercel -> Storage -> your Blob store -> .env.local tab).
import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const PDF_BLOB_PATHNAME = "products/ugc-creator-os.pdf";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/upload-pdf.mjs <path-to-pdf>");
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local (see .env.example) before running this script."
  );
  process.exit(1);
}

const file = await readFile(filePath);

const blob = await put(PDF_BLOB_PATHNAME, file, {
  access: "private",
  contentType: "application/pdf",
  allowOverwrite: true,
});

console.log("Uploaded to private Blob storage:");
console.log(`  pathname: ${blob.pathname}`);
console.log(`  size: ${file.byteLength} bytes`);
console.log(
  "\nThis blob is private — there is no public URL to visit. The site serves it only through /api/payment/download after a verified purchase."
);
