// ─── POST /api/wardrobe/upload ─────────────────────────────
// Upload clothing photo → AI analyze → save to database.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { analyzeClothingPhoto } from "@/lib/vision";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return NextResponse.json({ error: "Image must be JPEG, PNG, WebP, or GIF" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Analyze with AI
    const analyzed = await analyzeClothingPhoto("", base64);

    // For now, store as data URI (in production, upload to R2/S3)
    const imageUrl = "data:" + file.type + ";base64," + base64.slice(0, 50) + "...";
    const thumbnailUrl = imageUrl;

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

function categorizeItem(itemType: string): string {
  const tops = ["t-shirt","polo","button-up","hoodie","sweater","cardigan","sweatshirt","tank-top","blouse","bodysuit"];
  const bottoms = ["jeans","trousers","chinos","shorts","leggings","skirt","mini-skirt","midi-skirt","maxi-skirt"];
  const dresses = ["dress","mini-dress","midi-dress","maxi-dress","jumpsuit","romper","suit","suit-separates"];
  const outerwear = ["jacket","blazer","coat","denim-jacket","leather-jacket","bomber","puffer","trench"];
  const footwear = ["sneakers","running-shoes","high-tops","loafers","oxfords","boots","ankle-boots","knee-high-boots","heels","pumps","flats","sandals","flip-flops","slides","crocs","dress-shoes"];
  const accessories = ["belt","hat","cap","beanie","scarf","gloves","watch","bracelet","necklace","earrings","ring","sunglasses","eyeglasses","tie","bow-tie","pocket-square","bag","backpack","tote","crossbody","clutch","wallet","umbrella"];
  const intimate = ["pajamas","robe","undergarment"];
  const swimwear = ["swimwear-top","swimwear-bottom"];

  if (tops.includes(itemType)) return "tops";
  if (bottoms.includes(itemType)) return "bottoms";
  if (dresses.includes(itemType)) return "dresses";
  if (outerwear.includes(itemType)) return "outerwear";
  if (footwear.includes(itemType)) return "footwear";
  if (accessories.includes(itemType)) return "accessories";
  if (intimate.includes(itemType)) return "intimate";
  if (swimwear.includes(itemType)) return "swimwear";
  return "other";
}
