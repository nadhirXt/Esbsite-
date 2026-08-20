'use client'

import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Share2, Copy, ExternalLink } from 'lucide-react'
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
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0F172A] py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-sm text-blue-700 dark:text-blue-300 mb-4">
            <QrCode className="w-3.5 h-3.5" />
            <span>Accès rapide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white mb-3">
            Partagez ESBHub
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Scannez ce code QR pour accéder rapidement au site ou partagez-le avec vos camarades
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* QR Code Card */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
            <div className="p-4 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] rounded-2xl inline-block">
              <div className="p-4 bg-white rounded-xl">
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
            <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-4 font-medium">
              Scannez pour accéder
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4 w-full max-w-sm">
            {/* URL Box */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              <code className="text-sm font-mono text-[#1E3A8A] dark:text-blue-400 flex-1 truncate">
                {SITE_URL}
              </code>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent("Découvre ESBHub, la plateforme collaborative pour les étudiants de l'ESB !\n" + SITE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-semibold border border-green-100 dark:border-green-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent("Découvre ESBHub, la plateforme collaborative pour les étudiants de l'ESB !")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors text-sm font-semibold border border-sky-100 dark:border-sky-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-semibold border border-blue-100 dark:border-blue-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>

            {/* Tip */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>💡 Astuce :</strong> Imprimez ce code QR et affichez-le dans les salles de classe ou partagez-le sur vos groupes WhatsApp pour aider vos camarades à découvrir la plateforme.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
