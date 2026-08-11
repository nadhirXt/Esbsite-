import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GraduationCap, Upload, Link2, LayoutDashboard, Shield, LogOut } from 'lucide-react'
import { ensureProfile } from '@/lib/ensure-profile'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await ensureProfile(supabase, user)

  if (profile?.role !== 'admin') redirect('/dashboard')

  const NAV = [
    { href: '/admin',        label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { href: '/admin/upload', label: 'Upload documents', icon: Upload },
    { href: '/admin/liens',  label: 'Liens utiles',    icon: Link2 },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Admin sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#0F172A] text-white shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <GraduationCap className="w-5 h-5 text-[#A16207]" />
            ESB <span className="text-blue-300 font-light">Admin</span>
          </Link>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{profile?.full_name || 'antigravité'}</p>
              <p className="text-xs text-yellow-400">Administrateur</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Portail étudiant
          </Link>
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
