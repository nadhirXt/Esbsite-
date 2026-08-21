'use client'

import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, AlertCircle, GraduationCap, FileText, Sparkles } from 'lucide-react'

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

const EVENT_TYPES = {
  exam:     { label: 'Examen',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',     icon: AlertCircle, dot: 'bg-red-500' },
  tp:       { label: 'TP',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: BookOpen,    dot: 'bg-blue-500' },
  rendu:    { label: 'Rendu',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: FileText, dot: 'bg-orange-500' },
  holiday:  { label: 'Congé',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: Sparkles, dot: 'bg-green-500' },
  autre:    { label: 'Événement', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: GraduationCap, dot: 'bg-purple-500' },
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

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
    const map: Record<string, Event[]> = {}
    events.forEach(e => {
      if (!map[e.event_date]) map[e.event_date] = []
      map[e.event_date].push(e)
    })
    return map
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
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendrier des Examens</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Examens, TP, rendus et événements ESB</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
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
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/10">
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
                  className={`min-h-14 p-1.5 border-b border-r border-slate-50 dark:border-white/5 cursor-pointer transition-colors
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
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${EVENT_TYPES[ev.type as keyof typeof EVENT_TYPES]?.dot || 'bg-slate-400'}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-slate-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
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
                            <span className="text-xs">{ev.event_time.slice(0, 5)}</span>
                          </div>
                        )}
                        {ev.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{ev.location}</span>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
