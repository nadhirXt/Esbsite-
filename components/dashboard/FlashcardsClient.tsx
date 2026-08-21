'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brain, Plus, ChevronLeft, ChevronRight, RotateCcw, Check, X, Layers, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Card {
  id: string
  question: string
  answer: string
  level: 1 | 2 | 3  // Leitner system: 1=hard, 2=medium, 3=easy
  next_review?: string
}

interface Deck {
  id: string
  title: string
  cards: Card[]
  created_at: string
}

export default function FlashcardsClient({ initialDecks }: { initialDecks: Deck[] }) {
  const [decks, setDecks] = useState<Deck[]>(initialDecks)
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newDeckTitle, setNewDeckTitle] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const currentCard = activeDeck?.cards[cardIndex]
  const dueCards = activeDeck?.cards.filter(c => {
    if (!c.next_review) return true
    return new Date(c.next_review) <= new Date()
  }) || []

  async function createDeck() {
    if (!newDeckTitle.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('flashcard_decks').insert({
      title: newDeckTitle.trim(),
      cards: []
    }).select().single()
    if (!error && data) {
      setDecks(prev => [{ ...data, cards: [] }, ...prev])
      setNewDeckTitle('')
      setShowNewDeck(false)
    }
    setSaving(false)
  }

  async function addCard() {
    if (!activeDeck || !newQuestion.trim() || !newAnswer.trim()) return
    setSaving(true)
    const newCard: Card = {
      id: crypto.randomUUID(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      level: 1,
    }
    const updatedCards = [...activeDeck.cards, newCard]
    const { error } = await supabase.from('flashcard_decks')
      .update({ cards: updatedCards, updated_at: new Date().toISOString() })
      .eq('id', activeDeck.id)
    if (!error) {
      const updatedDeck = { ...activeDeck, cards: updatedCards }
      setActiveDeck(updatedDeck)
      setDecks(prev => prev.map(d => d.id === activeDeck.id ? updatedDeck : d))
      setNewQuestion('')
      setNewAnswer('')
      setShowAddCard(false)
    }
    setSaving(false)
  }

  async function rateCard(level: 1 | 2 | 3) {
    if (!activeDeck || !currentCard) return
    // Leitner: level determines next review interval
    const days = level === 1 ? 1 : level === 2 ? 3 : 7
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + days)

    const updatedCards = activeDeck.cards.map(c =>
      c.id === currentCard.id ? { ...c, level, next_review: nextReview.toISOString() } : c
    )
    const { error } = await supabase.from('flashcard_decks')
      .update({ cards: updatedCards })
      .eq('id', activeDeck.id)
    if (!error) {
      const updatedDeck = { ...activeDeck, cards: updatedCards }
      setActiveDeck(updatedDeck)
      setDecks(prev => prev.map(d => d.id === activeDeck.id ? updatedDeck : d))
      nextCard()
    }
  }

  function nextCard() {
    setFlipped(false)
    if (cardIndex < (activeDeck?.cards.length || 0) - 1) {
      setCardIndex(i => i + 1)
    } else {
      setCardIndex(0)
    }
  }

  function prevCard() {
    setFlipped(false)
    setCardIndex(i => Math.max(0, i - 1))
  }

  if (activeDeck) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => { setActiveDeck(null); setCardIndex(0); setFlipped(false) }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Retour aux paquets
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeDeck.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{activeDeck.cards.length} cartes · {dueCards.length} à réviser</span>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {activeDeck.cards.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Brain className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune carte dans ce paquet</p>
            <button onClick={() => setShowAddCard(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Ajouter une carte
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Carte {cardIndex + 1} / {activeDeck.cards.length}</span>
              <div className="flex gap-1">
                {activeDeck.cards.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i === cardIndex ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>

            {/* Card */}
            <div
              onClick={() => setFlipped(f => !f)}
              className="relative h-64 cursor-pointer perspective-1000"
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center justify-center p-8 backface-hidden">
                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-4">Question</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white text-center leading-relaxed">{currentCard?.question}</p>
                  <p className="text-xs text-slate-400 mt-6">Cliquez pour révéler la réponse</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-4">Réponse</p>
                  <p className="text-xl font-semibold text-white text-center leading-relaxed">{currentCard?.answer}</p>
                </div>
              </div>
            </div>

            {/* Rating & Navigation */}
            {flipped ? (
              <div className="mt-6">
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-4">Comment était cette carte ?</p>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => rateCard(1)} className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
                    <X className="w-5 h-5" />
                    <span className="text-xs font-semibold">Difficile</span>
                    <span className="text-xs text-red-400">Réviser demain</span>
                  </button>
                  <button onClick={() => rateCard(2)} className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-amber-200 dark:border-amber-800">
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-xs font-semibold">Moyen</span>
                    <span className="text-xs text-amber-400">Réviser dans 3j</span>
                  </button>
                  <button onClick={() => rateCard(3)} className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800">
                    <Check className="w-5 h-5" />
                    <span className="text-xs font-semibold">Facile</span>
                    <span className="text-xs text-green-400">Réviser dans 7j</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={prevCard} disabled={cardIndex === 0} className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button onClick={nextCard} className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Add card modal */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nouvelle carte</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Question</label>
                  <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} rows={2} placeholder="Quelle est la définition de..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Réponse</label>
                  <textarea value={newAnswer} onChange={e => setNewAnswer(e.target.value)} rows={3} placeholder="La réponse est..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowAddCard(false); setNewQuestion(''); setNewAnswer('') }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</button>
                <button onClick={addCard} disabled={saving || !newQuestion.trim() || !newAnswer.trim()} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Decks list view
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Flashcards</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Révisez efficacement avec la répétition espacée</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewDeck(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4" /> Nouveau paquet
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Brain className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun paquet de flashcards</p>
          <p className="text-slate-400 text-sm mt-1">Créez votre premier paquet pour commencer à réviser</p>
          <button onClick={() => setShowNewDeck(true)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
            Créer un paquet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decks.map(deck => {
            const dueCount = deck.cards.filter(c => {
              if (!c.next_review) return true
              return new Date(c.next_review) <= new Date()
            }).length
            return (
              <div
                key={deck.id}
                onClick={() => { setActiveDeck(deck); setCardIndex(0); setFlipped(false) }}
                className="group bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {dueCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold">
                      {dueCount} à réviser
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{deck.title}</h3>
                <p className="text-sm text-slate-400">{deck.cards.length} carte{deck.cards.length !== 1 ? 's' : ''}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* New deck modal */}
      {showNewDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nouveau paquet</h3>
            <input
              type="text"
              value={newDeckTitle}
              onChange={e => setNewDeckTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createDeck()}
              placeholder="Ex: Mathématiques — Analyse"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowNewDeck(false); setNewDeckTitle('') }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</button>
              <button onClick={createDeck} disabled={saving || !newDeckTitle.trim()} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
