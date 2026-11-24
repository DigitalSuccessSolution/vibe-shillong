import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'

const reels = [
  {
    id: 'reel-1',
    title: 'Neon Party Highlights',
    category: 'Adult Neon Nights',
    tag: 'Live Reel',
    poster: '/images/tina/Neon Nightclub Dancefloor Spectacle.png',
    src: 'https://drive.google.com/file/d/1spIM4U9t1OaUkpLT02jFjPL98fVzKEd2/preview',
    views: '24.8K',
  },
  {
    id: 'reel-2',
    title: 'UV Dancefloor Rave',
    category: 'Adult Neon Nights',
    tag: 'Club Energy',
    poster: '/images/tina/UV Neon Dance Floor Celebration.png',
    src: '/videos/reel-2.mp4',
    views: '12.9K',
  },
  {
    id: 'reel-3',
    title: 'Glow Stick Dance Battle',
    category: 'Kids Carnival',
    tag: 'Family Fun',
    poster: '/images/tina/Neon Glowstick Dance Party.png',
    src: '/videos/reel-3.mp4',
    views: '9.2K',
  },
  {
    id: 'reel-4',
    title: 'Neon Runway Fashion Show',
    category: 'Adult Neon Nights',
    tag: 'Glow Looks',
    poster: '/images/tina/Neon Runway Fashion Show.png',
    src: '/videos/reel-4.mp4',
    views: '15.1K',
  },
  {
    id: 'reel-5',
    title: 'Kids Face Painting Craze',
    category: 'Kids Carnival',
    tag: 'Glow Art',
    poster: '/images/tina/Neon Cat Face Painting Fun.png',
    src: '/videos/reel-5.mp4',
    views: '11.3K',
  },
  {
    id: 'reel-6',
    title: 'Family Glow Celebration',
    category: 'Kids Carnival',
    tag: 'Carnival Vibe',
    poster: '/images/tina/Neon Family Glow Party.png',
    src: '/videos/reel-6.mp4',
    views: '14.7K',
  },
]

export default function VideoShowcase() {
  const [playingReelId, setPlayingReelId] = useState(null)
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-20 max-w-6xl mx-auto px-6 relative" id="aftermovie">
      {/* Section Header with Left/Right Carousel Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-8">
        <div>
          <h2 className="font-bold font-space text-4xl sm:text-6xl text-white tracking-tight leading-none">
            WATCH THE
            <br />
            <span className="gradient-text">PARTY REELS.</span>
          </h2>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:border-neon-pink hover:text-neon-pink text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:border-neon-pink hover:text-neon-pink text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Vertical 9:16 Reels Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel) => {
          const isPlaying = playingReelId === reel.id

          return (
            <article
              key={reel.id}
              onClick={() => {
                if (!isPlaying) setPlayingReelId(reel.id)
              }}
              className={`snap-start shrink-0 w-[240px] sm:w-[275px] aspect-[9/16] rounded-2xl overflow-hidden border relative bg-[#0e0a1c] shadow-2xl ${
                isPlaying
                  ? 'border-neon-pink shadow-[0_0_25px_rgba(255,53,196,0.35)] ring-1 ring-neon-pink'
                  : 'border-white/15 cursor-pointer'
              }`}
            >
              {isPlaying ? (
                /* Inline Direct Player (No separate popup modal) */
                <div className="relative w-full h-full bg-black">
                  {/* Floating Close Button to stop & return to thumbnail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPlayingReelId(null)
                    }}
                    aria-label="Close video"
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/80 hover:bg-neon-pink hover:text-black border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  >
                    <X size={16} />
                  </button>

                  {reel.src ? (
                    reel.src.includes('drive.google.com') ? (
                      <iframe
                        src={reel.src}
                        className="w-full h-full border-0 absolute inset-0 z-10"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={reel.title}
                      />
                    ) : (
                      <video
                        src={reel.src}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        controls
                        autoPlay
                        playsInline
                      />
                    )
                  ) : null}
                </div>
              ) : (
                /* Clean Full-Bleed Thumbnail with Glowing Center Play Button (No hover zoom/effects) */
                <>
                  <img
                    src={reel.poster}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-neon-pink text-[#080612] flex items-center justify-center pl-1 shadow-[0_0_25px_rgba(255,53,196,0.6)]">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
