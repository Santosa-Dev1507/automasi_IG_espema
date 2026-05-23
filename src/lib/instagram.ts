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
