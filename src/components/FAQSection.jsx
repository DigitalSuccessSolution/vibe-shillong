import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs, img } from '../data/eventData'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-24 max-w-6xl mx-auto px-6" id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Heading & Photo */}
        <div className="lg:col-span-5">
          <h2 className="font-bold font-space text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Frequently Asked Questions.
          </h2>
          <p className="text-sm text-neon-muted mt-3">
            Have questions about timings, passes, parking or age restrictions? Here are the most common details.
          </p>

          <div className="mt-8 h-56 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={img.neonSign}
              alt="F Lounge Neon atmosphere"
              className="w-full h-full object-cover brightness-75 saturate-125"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right: Clean Accordion */}
        <div className="lg:col-span-7 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold font-space text-base text-white hover:text-neon-pink transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`text-neon-pink transition-transform duration-300 shrink-0 ml-4 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  size={18}
                />
              </button>

              {openIndex === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-neon-muted border-t border-white/5 pt-3">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
