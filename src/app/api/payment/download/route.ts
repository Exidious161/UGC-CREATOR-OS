import { NextResponse } from "next/server";
import { verifyPurchaseToken } from "@/lib/purchaseToken";
import { getPdfBlob, PDF_DOWNLOAD_FILENAME } from "@/lib/pdf";
import { incrementDownload } from "@/lib/purchases";

export const runtime = "nodejs";

/**
 * The only route that ever touches the PDF's bytes. It never redirects to a
 * Blob URL (public or otherwise) — it streams the private blob through this
 * server response, so the client never learns any URL for the file at all.
 * A missing/invalid/expired token gets a plain 401, not a download.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 401 });
  }

  const payload = verifyPurchaseToken(token);
  if (!payload) {
    return NextResponse.json({ error: "This download link is invalid or has expired." }, { status: 401 });
  }

  try {
    const blob = await getPdfBlob();

    // Authorization already succeeded (token verified above) — the download
    // counter is best-effort bookkeeping from here on. A DB hiccup must
    // never stop a paying customer from getting the file they already paid for.
    incrementDownload(payload.paymentId).catch((err) => {
      console.error("download: incrementDownload failed:", err);
    });

    return new Response(blob.stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${PDF_DOWNLOAD_FILENAME}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("download failed:", err);
    return NextResponse.json({ error: "The PDF is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
