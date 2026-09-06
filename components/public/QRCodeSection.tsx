'use client'

import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Share2, Copy, ExternalLink, Smartphone, Check } from 'lucide-react'
import { useState } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'

export default function QRCodeSection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white dark:from-[#030712] dark:to-[#070D19] py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-4 shadow-sm backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portail Numérique Mobile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Accédez à l&apos;ESB Hub partout, en un instant
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Scannez le code officiel pour consulter vos cours et ressources depuis votre smartphone, ou partagez le lien avec vos camarades.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14">
          {/* QR Code Card */}
          <div className="bg-white/90 dark:bg-[#070D19]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-cyan-500/20 flex flex-col items-center group hover:border-cyan-400/40 hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="p-4 bg-gradient-to-br from-[#1E3A8A] via-[#0F172A] to-[#070D19] rounded-2xl shadow-inner border border-white/20">
              <div className="p-4 bg-white rounded-xl shadow-md">
                <QRCodeSVG
                  value={SITE_URL}
                  size={180}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '/favicon.ico',
                    x: undefined,
                    y: undefined,
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
              </div>
            </div>
            <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-4 tracking-wider uppercase">
              Scannez pour ouvrir le portail
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4 w-full max-w-md">
            {/* URL Box */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-sm">
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              <code className="text-xs sm:text-sm font-mono text-[#1E3A8A] dark:text-blue-400 flex-1 truncate font-semibold">
                {SITE_URL}
              </code>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
              Partager au réseau :
            </p>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent("Découvre ESB Hub, le portail collaboratif de l'École Supérieure de Banque (ESB) :\n" + SITE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent("Portail officiel ESB Hub - École Supérieure de Banque d'Algérie")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 hover:bg-sky-100 transition-colors text-xs font-semibold border border-sky-200 dark:border-sky-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0077B5] dark:text-blue-300 hover:bg-blue-100 transition-colors text-xs font-semibold border border-blue-200 dark:border-blue-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

