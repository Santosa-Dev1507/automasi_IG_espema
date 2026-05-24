/**
 * Instagram Graph API integration.
 * Supports both:
 * - Instagram Login API tokens (IGAA...) → uses graph.instagram.com
 * - Facebook Login tokens (EAA...) → uses graph.facebook.com
 */

const token = () => process.env.INSTAGRAM_ACCESS_TOKEN;
const userId = () => process.env.INSTAGRAM_USER_ID;

function getApiBase(): string {
  const t = token() || "";
  // IGAA tokens use Instagram Graph API directly
  if (t.startsWith("IGAA")) {
    return "https://graph.instagram.com/v21.0";
  }
  // EAA tokens use Facebook Graph API
  return "https://graph.facebook.com/v21.0";
}

function getUserPath(): string {
  const t = token() || "";
  // For IGAA tokens, "me" works to refer to the IG user
  if (t.startsWith("IGAA")) {
    return userId() || "me";
  }
  return userId() || "";
}

interface PostMediaParams {
  imageUrl: string;
  caption: string;
  mediaType?: "IMAGE" | "VIDEO" | "REELS" | "STORIES";
}

export async function createMediaContainer(params: PostMediaParams) {
  const { imageUrl, caption, mediaType = "IMAGE" } = params;
  const t = token();
  if (!t) throw new Error("Instagram access token belum diisi");

  const body: Record<string, string> = {
    access_token: t,
    caption,
  };

  if (mediaType === "VIDEO" || mediaType === "REELS") {
    body.video_url = imageUrl;
    body.media_type = "REELS";
  } else if (mediaType === "STORIES") {
    body.image_url = imageUrl;
    body.media_type = "STORIES";
  } else {
    body.image_url = imageUrl;
  }

  const res = await fetch(`${getApiBase()}/${getUserPath()}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id as string;
}

export async function publishMedia(containerId: string) {
  const t = token();

  const res = await fetch(`${getApiBase()}/${getUserPath()}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: t,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id as string;
}

export async function postToInstagram(params: PostMediaParams) {
  const containerId = await createMediaContainer(params);

  // For video, wait for processing
  if (params.mediaType === "VIDEO" || params.mediaType === "REELS") {
    await waitForMediaReady(containerId);
  }

  const postId = await publishMedia(containerId);
  return postId;
}

async function waitForMediaReady(containerId: string, maxAttempts = 30) {
  const t = token();

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${getApiBase()}/${containerId}?fields=status_code&access_token=${t}`
    );
    const data = await res.json();

    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error("Media processing failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Media processing timeout");
}

export async function getInsights(postId: string) {
  const t = token();

  const res = await fetch(
    `${getApiBase()}/${postId}/insights?metric=impressions,reach,likes,comments&access_token=${t}`
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data;
}

export async function getAccountInfo() {
  const t = token();
  const isIGAA = (t || "").startsWith("IGAA");

  const fields = isIGAA
    ? "id,username,account_type,media_count"
    : "username,name,followers_count,media_count,follows_count,profile_picture_url";

  const path = isIGAA ? "me" : userId();

  const res = await fetch(`${getApiBase()}/${path}?fields=${fields}&access_token=${t}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

/**
 * Post a carousel (multiple images) to Instagram.
 * Steps:
 * 1. Create a media container for each image (with is_carousel_item=true)
 * 2. Create a parent carousel container with all child IDs
 * 3. Publish the parent container
 */
export async function postCarouselToInstagram(params: {
  imageUrls: string[];
  caption: string;
}) {
  const { imageUrls, caption } = params;
  const t = token();
  if (!t) throw new Error("Instagram access token belum diisi");
  if (imageUrls.length < 2) throw new Error("Carousel butuh minimal 2 foto");
  if (imageUrls.length > 10) throw new Error("Carousel maksimal 10 foto");

  // Step 1: Create child containers
  const childIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const res = await fetch(`${getApiBase()}/${getUserPath()}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: t,
        image_url: imageUrl,
        is_carousel_item: true,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(`Gagal upload foto: ${data.error.message}`);
    childIds.push(data.id);
  }

  // Step 2: Create parent carousel container
  const parentRes = await fetch(`${getApiBase()}/${getUserPath()}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: t,
      caption,
      media_type: "CAROUSEL",
      children: childIds.join(","),
    }),
  });
  const parentData = await parentRes.json();
  if (parentData.error) throw new Error(parentData.error.message);

  // Step 3: Publish
  const publishId = await publishMedia(parentData.id);
  return publishId;
}
