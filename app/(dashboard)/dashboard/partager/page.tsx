'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Share2, Copy, Globe, MessageCircle, Mail, Check } from 'lucide-react'
import { useState } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esbhub.study'

export default function PartagerPage() {
  const [copied, setCopied] = useState(false)
  const shareText = "Découvre ESBHub, la plateforme collaborative pour les étudiants de l'ESB. Cours, mémoires, ressources et plus encore !"

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4 hover:scale-110 transition-transform duration-300">
          <Share2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-2">
          Partagez ESBHub
        </h1>
        <p className="text-[#64748B] dark:text-slate-400">
          Scannez le code QR ou partagez le lien
        </p>
      </div>

      {/* QR Code Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] rounded-2xl hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300">
            <div className="p-4 bg-white rounded-xl">
              <QRCodeSVG
                value={SITE_URL}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.ico',
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mb-6 font-medium">
          Scannez pour accéder au site
        </p>

        {/* URL Copy */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          <code className="text-sm font-mono text-[#1E3A8A] dark:text-blue-400 flex-1 truncate">
            {SITE_URL}
          </code>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + SITE_URL)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200 border border-green-100 dark:border-green-800 hover:scale-105 hover:shadow-lg hover:shadow-green-900/10"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold">WhatsApp</span>
        </a>

        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all duration-200 border border-sky-100 dark:border-sky-800 hover:scale-105 hover:shadow-lg hover:shadow-sky-900/10"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold">Telegram</span>
        </a>

        <a
          href={`mailto:?subject=${encodeURIComponent('Découvre ESBHub')}&body=${encodeURIComponent(shareText + '\n\n' + SITE_URL)}`}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:scale-105 hover:shadow-lg hover:shadow-slate-900/10"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold">Email</span>
        </a>
      </div>
    </div>
  )
}
