import { MapPin } from 'lucide-react'
import { img } from '../data/eventData'

export default function VenueBanner() {
  return (
    <section className="relative h-72 sm:h-80 overflow-hidden my-12 flex items-center justify-center">
      <img
        src={img.venue}
        alt="F Lounge by FTV venue"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.45] saturate-[1.3]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-neon-bg/80 via-transparent to-neon-bg/80" />

      <div className="relative z-10 text-center px-6">
        <h2 className="font-bold font-space text-3xl sm:text-5xl tracking-tight text-white mb-3">
          F Lounge <span className="text-neon-pink">by FTV</span>
        </h2>
        <p className="flex items-center justify-center gap-2 text-sm text-neon-muted">
          <MapPin size={16} className="text-neon-pink" /> Premium nightlife destination
        </p>
      </div>
    </section>
  )
}
