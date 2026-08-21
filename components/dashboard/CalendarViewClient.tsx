'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle, GraduationCap, Sparkles, Timer, Download, Printer, FileDown } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  event_time?: string
  type: string
  cycle?: string
  year?: number
  location?: string
}

interface EventWithTimes extends Event {
  end_time?: string
}

const EVENT_TYPES = {
  exam:          { label: 'Examen',         color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',     icon: AlertCircle, dot: 'bg-red-500' },
  ds:            { label: 'Devoir Surveillé', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
  examen_final:  { label: 'Examen Final',   color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',  icon: AlertCircle, dot: 'bg-rose-500' },
  rattrapage:    { label: 'Rattrapage',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  holiday:       { label: 'Congé',          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: Sparkles, dot: 'bg-green-500' },
  autre:         { label: 'Événement',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: GraduationCap, dot: 'bg-purple-500' },
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function formatICSDate(dateStr: string, timeStr?: string): string {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM
  if (timeStr) {
    const [h, m] = timeStr.split(':')
    const d = new Date(`${dateStr}T${timeStr}:00`)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const min = String(d.getUTCMinutes()).padStart(2, '0')
    const ss = '00'
    return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`
  } else {
    const d = new Date(`${dateStr}T00:00:00`)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    return `${yyyy}${mm}${dd}`
  }
}

function generateICS(events: EventWithTimes[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ESB Hub//Calendrier Examens//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  events.forEach(ev => {
    const typeInfo = EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.autre
    const startDate = formatICSDate(ev.event_date, ev.event_time)
    let endDate: string
    if ((ev as EventWithTimes).end_time) {
      endDate = formatICSDate(ev.event_date, (ev as EventWithTimes).end_time)
    } else if (ev.event_time) {
      // Default 2 hours if no end time
      const d = new Date(`${ev.event_date}T${ev.event_time}:00`)
      d.setHours(d.getHours() + 2)
      endDate = formatICSDate(
        d.toISOString().split('T')[0],
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      )
    } else {
      // All day event
      const d = new Date(ev.event_date + 'T00:00:00')
      d.setDate(d.getDate() + 1)
      endDate = formatICSDate(d.toISOString().split('T')[0])
    }

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@esb-hub`)
    lines.push(`DTSTAMP:${formatICSDate(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[1].slice(0, 5))}`)
    lines.push(`DTSTART:${startDate}`)
    lines.push(`DTEND:${endDate}`)
    lines.push(`SUMMARY:${ev.title.replace(/,/g, '\\,')}`)
    if (ev.description) lines.push(`DESCRIPTION:${ev.description.replace(/,/g, '\\,').replace(/\n/g, '\\n')}`)
    if (ev.location) lines.push(`LOCATION:${ev.location.replace(/,/g, '\\,')}`)
    lines.push(`CATEGORIES:${typeInfo.label}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadICS(events: EventWithTimes[]) {
  const ics = generateICS(events)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `calendrier-examens-esb-${new Date().toISOString().split('T')[0]}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function CountdownTimer({ targetDate, targetTime }: { targetDate: string, targetTime?: string }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const target = new Date(`${targetDate}T${targetTime || '00:00'}:00`)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return (
      <span className="text-sm font-bold text-red-600 dark:text-red-400">C'est maintenant !</span>
    )
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
      {days > 0 ? `J-${days} · ` : ''}{String(hours).padStart(2, '0')}h {String(minutes).padStart(2, '0')}m
    </span>
  )
}

export default function CalendarViewClient({ events }: { events: Event[] }) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Build calendar grid
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0=Sun
  const startOffset  = (firstDayOfMonth + 6) % 7 // adjust so Mon=0

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventWithTimes[]> = {}
    events.forEach(e => {
      if (!map[e.event_date]) map[e.event_date] = []
      map[e.event_date].push(e as EventWithTimes)
    })
    return map
  }, [events])

  // Next upcoming exam/DS for countdown
  const nextEvent = useMemo(() => {
    const upcoming = events
      .filter(e => (e.type === 'exam' || e.type === 'ds' || e.type === 'examen_final' || e.type === 'rattrapage'))
      .filter(e => new Date(`${e.event_date}T${e.event_time || '23:59'}:00`) >= new Date())
      .sort((a, b) => new Date(`${a.event_date}T${a.event_time || '00:00'}:00`).getTime() - new Date(`${b.event_date}T${b.event_time || '00:00'}:00`).getTime())
    return upcoming[0] || null
  }, [events])

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : []

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" id="calendar-view">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendrier des Examens</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Examens et événements ESB</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => downloadICS(events as EventWithTimes[])}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50"
            title="Exporter vers Google/Apple Calendar (.ics)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">iCal</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg transition-colors border border-slate-200 dark:border-white/10"
            title="Imprimer / Exporter PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 no-print">
        {Object.entries(EVENT_TYPES).map(([key, val]) => (
          <div key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${val.color}`}>
            <span className={`w-2 h-2 rounded-full ${val.dot}`} />
            {val.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 no-print">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {MONTHS_FR[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/10 no-print">
            {DAYS_FR.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 border-b border-r border-slate-50 dark:border-white/5 last:border-r-0" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = eventsByDate[dateStr] || []
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const colIndex = (startOffset + i) % 7

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`min-h-14 p-1.5 border-b border-r border-slate-50 dark:border-white/5 cursor-pointer transition-colors no-print
                    ${colIndex === 6 ? 'border-r-0' : ''}
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                  `}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                    ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}
                  `}>
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES]?.dot || 'bg-slate-400'}`}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-slate-400">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          {/* Countdown Timer */}
          {nextEvent && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-sm p-4 text-white no-print">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5" />
                <h3 className="text-sm font-bold">Prochain examen/DS</h3>
              </div>
              <p className="text-lg font-bold mb-1 truncate">{nextEvent.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-90">
                  {new Date(nextEvent.event_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  {nextEvent.event_time ? ` · ${nextEvent.event_time.slice(0, 5)}` : ''}
                </span>
                <CountdownTimer targetDate={nextEvent.event_date} targetTime={nextEvent.event_time} />
              </div>
              {nextEvent.location && (
                <div className="flex items-center gap-1 mt-2 text-xs opacity-90">
                  <MapPin className="w-3 h-3" />
                  {nextEvent.location}
                </div>
              )}
            </div>
          )}

          {/* Selected date events */}
          {selectedDate && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800/50 shadow-sm p-4">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-3 capitalize">
                {formatDate(selectedDate)}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Aucun événement ce jour</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(ev => {
                    const typeInfo = EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.autre
                    return (
                      <div key={ev.id} className={`p-3 rounded-xl ${typeInfo.color}`}>
                        <p className="text-sm font-semibold">{ev.title}</p>
                        {ev.event_time && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {ev.event_time.slice(0, 5)}
                              {(ev as EventWithTimes).end_time ? ` - ${(ev as EventWithTimes).end_time!.slice(0, 5)}` : ''}
                            </span>
                          </div>
                        )}
                        {ev.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs px-1.5 py-0.5 bg-white/60 dark:bg-black/20 rounded font-medium">
                              {ev.location}
                            </span>
                          </div>
                        )}
                        {ev.description && (
                          <p className="text-xs mt-1 opacity-80">{ev.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming events list */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Prochains événements</h3>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucun événement à venir</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 8).map(ev => {
                  const typeInfo = EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.autre
                  const evDate = new Date(ev.event_date + 'T00:00:00')
                  const daysLeft = Math.ceil((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div
                      key={ev.id}
                      onClick={() => { setSelectedDate(ev.event_date); setCurrentDate(new Date(evDate.getFullYear(), evDate.getMonth(), 1)) }}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${typeInfo.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {ev.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {evDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {daysLeft === 0 ? ' · Aujourd\'hui !' : daysLeft === 1 ? ' · Demain !' : ` · Dans ${daysLeft} jours`}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {ev.event_time && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              {ev.event_time.slice(0, 5)}
                            </span>
                          )}
                          {ev.location && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              <MapPin className="w-3 h-3" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* iCal Export CTA */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 p-4 no-print">
            <button
              onClick={() => downloadICS(events as EventWithTimes[])}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-800/50"
            >
              <FileDown className="w-4 h-4" />
              Télécharger mon emploi du temps (.ics)
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
              Importez dans Google Calendar, Apple Calendar, Outlook...
            </p>
          </div>
        </div>
      </div>

      {/* Print-only schedule */}
      <div className="hidden print:block mt-8">
        <h2 className="text-xl font-bold mb-4">Emploi du temps des examens</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="text-left py-2 px-3">Date</th>
              <th className="text-left py-2 px-3">Horaire</th>
              <th className="text-left py-2 px-3">Épreuve</th>
              <th className="text-left py-2 px-3">Type</th>
              <th className="text-left py-2 px-3">Salle</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => {
              const typeInfo = EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.autre
              const evDate = new Date(ev.event_date + 'T00:00:00')
              return (
                <tr key={ev.id} className="border-b border-slate-300">
                  <td className="py-2 px-3">{evDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="py-2 px-3">{ev.event_time ? ev.event_time.slice(0, 5) : '-'}</td>
                  <td className="py-2 px-3 font-medium">{ev.title}</td>
                  <td className="py-2 px-3">{typeInfo.label}</td>
                  <td className="py-2 px-3">{ev.location || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
