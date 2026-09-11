import { get } from "@vercel/blob";

/** Fixed pathname inside the private Blob store — shared by the upload script and the download route. */
export const PDF_BLOB_PATHNAME = "products/ugc-creator-os.pdf";
export const PDF_DOWNLOAD_FILENAME = "UGC-Creator-OS.pdf";

/**
 * Fetches the PDF straight from private Blob storage, server-side only.
 * `access: "private"` means Blob never issues a browsable URL for this file —
 * there is nothing to leak even if a client somehow saw the pathname.
 */
export async function getPdfBlob() {
  const blob = await get(PDF_BLOB_PATHNAME, { access: "private" });
  if (!blob) {
    throw new Error(
      `PDF not found at "${PDF_BLOB_PATHNAME}" in Blob storage. Run scripts/upload-pdf.mjs first.`
    );
  }
  return blob;
}
