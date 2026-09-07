"use client"

export default function VideoTour({property}){
       const extractVideoId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // 1. Regular watch link (e.g., https://www.youtube.com/watch?v=xxxx)
    if (parsedUrl.searchParams.has("v")) {
      return parsedUrl.searchParams.get("v");
    }

    // 2. Shortened link (e.g., https://youtu.be/xxxx)
    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/")[1];
    }

    // 3. Shorts or embed links (e.g., /shorts/xxxx or /embed/xxxx)
    const parts = parsedUrl.pathname.split("/");
    if (parts.includes("shorts") || parts.includes("embed")) {
      return parts.pop() || parts[parts.length - 1];
    }

    throw new Error("Invalid YouTube URL format");
  } catch (err) {
    throw new Error("Invalid URL");
  }
};

    const videoId = extractVideoId(property.virtual_tour_url);
    return (
                <div className="aspect-video">
                    <iframe width="100%" height="435" src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen>
                    </iframe>
                </div>
    )
}