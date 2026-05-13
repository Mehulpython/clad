// ─── POST /api/wardrobe/upload ─────────────────────────────
// Upload clothing photo → AI analyze → save to database.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { analyzeClothingPhoto } from "@/lib/vision";
import { uploadImage, deleteImage } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { categorizeItem } from "@/lib/categories";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 30 requests per minute per user
    const rateLimit = checkRateLimit(`${userId}:wardrobe-upload`, 30);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return NextResponse.json({ error: "Image must be JPEG, PNG, WebP, or GIF" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    }

    // Convert to buffer for both AI analysis and file storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Analyze with AI (still uses base64 for the vision API call)
    const analyzed = await analyzeClothingPhoto("", base64);

    // Store image via the storage abstraction layer
    let imageUrl: string;
    let thumbnailUrl: string;
    try {
      imageUrl = await uploadImage(file, "wardrobe");
      thumbnailUrl = imageUrl; // TODO: generate resized thumbnail in storage layer
    } catch (storageErr) {
      console.error("Image storage failed:", storageErr);
      return NextResponse.json(
        { error: "Failed to save image file" },
        { status: 500 }
      );
    }

    // Save to database
    const supabase = await getSupabase();
    const { data: item, error } = await supabase
      .from("wardrobe_items")
      .insert({
        user_id: userId,
        item_type: analyzed.itemType,
        category: categorizeItem(analyzed.itemType),
        subtype: analyzed.subtype || null,
        primary_color: analyzed.primaryColor,
        secondary_color: analyzed.secondaryColor,
        pattern: analyzed.pattern,
        material: analyzed.material,
        occasions: analyzed.occasions,
        seasons: analyzed.seasons,
        formality_level: analyzed.formalityLevel,
        tags: analyzed.tags,
        ai_confidence: analyzed.confidence,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        ai_raw_output: analyzed as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      // Best-effort: clean up the stored image since DB insert failed
      await deleteImage(imageUrl);
      return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      item,
      aiAnalysis: analyzed,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// categorizeItem is now imported from @/lib/categories
