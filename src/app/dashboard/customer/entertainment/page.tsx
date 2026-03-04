'use client'

export default function EntertainmentPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Entertainment Zone</h1>

        {/* YouTube Shorts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">YouTube Shorts</h2>
          <div className="aspect-w-9 aspect-h-16 rounded overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/SnZcdx77xNc"
              title="YouTube Shorts"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* TikTok Embed */}
        <div>
          <h2 className="text-xl font-semibold mb-2">TikTok</h2>
          <blockquote
            className="tiktok-embed"
            cite="https://www.tiktok.com/@scout2015/video/6718335390845095173"
            data-video-id="6718335390845095173"
            style={{ maxWidth: "100%", minWidth: "325px" }}
          >
            <section>Loading...</section>
          </blockquote>
        </div>
      </div>

      {/* TikTok embed script */}
      <script async src="https://www.tiktok.com/embed.js"></script>
    </>
  )
}
