'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Calculator,
  ArrowLeft,
  GraduationCap,
  Target,
  RefreshCw,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Info,
  Sliders,
  Save,
  Check,
  XCircle,
  Edit3,
  X,
  BookOpen,
} from 'lucide-react'
import {
  ESB_CURRICULA,
  POLE_LABELS,
  AcademicModule,
  getAcademicStatus,
} from '@/lib/grade-calculator-data'

interface GradeEntry {
  cc: number | ''
  exam: number | ''
}

interface ImpactModule {
  name: string
  impact: number
  finalGrade: number
}

interface SemesterStats {
  moyenne: number
  status: {
    label: string
    color: string
    status: 'admis' | 'rattrapage' | 'ajourne' | 'pending'
    description: string
  }
  totalModules: number
  modulesPassed: number
  modulesBelowTen: number
  totalCoefficients: number
  totalCompletedCoeffs: number
  isFullSemesterFilled: boolean
  highestImpactMod: ImpactModule | null
  lowestImpactMod: ImpactModule | null
}

export default function GradeCalculatorClient({ userCycle }: { userCycle?: string }) {
  // 1. Initial Cycle & Semester
  const defaultCycle = (userCycle && ESB_CURRICULA[userCycle]) ? userCycle : 'licence'
  const [selectedCycle, setSelectedCycle] = useState<string>(defaultCycle)
  const currentCurriculum = ESB_CURRICULA[selectedCycle] || ESB_CURRICULA.licence
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    currentCurriculum.semesters[0]?.id || ''
  )

  // Current semester object
  const currentSemester = useMemo(() => {
    return (
      currentCurriculum.semesters.find((s) => s.id === selectedSemesterId) ||
      currentCurriculum.semesters[0]
    )
  }, [currentCurriculum, selectedSemesterId])

  // Modules and grades state
  const [modules, setModules] = useState<AcademicModule[]>([])
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({})
  const [targetGradePerModule, setTargetGradePerModule] = useState<number>(10)
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // Modal State for adding/editing module
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [formModuleName, setFormModuleName] = useState<string>('')
  const [formModuleCode, setFormModuleCode] = useState<string>('')
  const [formModuleCoef, setFormModuleCoef] = useState<number>(2)
  const [formModulePole, setFormModulePole] = useState<AcademicModule['pole']>('fondamental')
  const [formModuleHasCC, setFormModuleHasCC] = useState<boolean>(true)

  // Load modules whenever the selected semester or cycle changes
  useEffect(() => {
    if (currentSemester) {
      // Clés de stockage dédiées garantissant une section vierge par défaut
      const modulesKey = `esb_student_modules_v2_${selectedCycle}_${currentSemester.id}`
      const gradesKey = `esb_student_grades_v2_${selectedCycle}_${currentSemester.id}`

      // 1. Charger les matières personnalisées de l'étudiant s'il en a créées
      const savedModules = localStorage.getItem(modulesKey)
      if (savedModules) {
        try {
          const parsed = JSON.parse(savedModules)
          setModules(Array.isArray(parsed) ? parsed : [])
        } catch {
          setModules([])
        }
      } else {
        // Section vierge par défaut : aucun module préchargé
        setModules([])
      }

      // 2. Charger les notes saisies par l'étudiant
      const savedGrades = localStorage.getItem(gradesKey)
      if (savedGrades) {
        try {
          setGrades(JSON.parse(savedGrades))
        } catch {
          setGrades({})
        }
      } else {
        setGrades({})
      }
    }
  }, [selectedCycle, currentSemester])

  // Persist modules to localStorage
  const saveModulesToStorage = (newModules: AcademicModule[]) => {
    setModules(newModules)
    if (currentSemester) {
      const modulesKey = `esb_student_modules_v2_${selectedCycle}_${currentSemester.id}`
      localStorage.setItem(modulesKey, JSON.stringify(newModules))
    }
  }

  // Sync to localStorage on grade change
  const handleGradeChange = (
    moduleId: string,
    field: 'cc' | 'exam',
    value: string
  ) => {
    let numVal: number | '' = ''
    if (value !== '') {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        numVal = Math.min(20, Math.max(0, parsed))
      }
    }

    const newGrades = {
      ...grades,
      [moduleId]: {
        ...(grades[moduleId] || { cc: '', exam: '' }),
        [field]: numVal,
      },
    }
    setGrades(newGrades)

    if (currentSemester) {
      const gradesKey = `esb_student_grades_v2_${selectedCycle}_${currentSemester.id}`
      localStorage.setItem(gradesKey, JSON.stringify(newGrades))
    }
  }

  // Quick change coefficient directly inline
  const handleCoefChange = (moduleId: string, newCoefStr: string) => {
    const coef = Math.max(1, Math.min(20, parseFloat(newCoefStr) || 1))
    const updated = modules.map((m) =>
      m.id === moduleId ? { ...m, coefficient: coef } : m
    )
    saveModulesToStorage(updated)
  }

  // Calculate final grade for a module : (CC * 0.3) + (Exam * 0.7)
  const calculateModuleFinal = (mod: AcademicModule, entry?: GradeEntry): { final: number | null; isComplete: boolean } => {
    if (!entry) return { final: null, isComplete: false }

    if (!mod.hasCC) {
      if (entry.exam === '') return { final: null, isComplete: false }
      return { final: Number(entry.exam), isComplete: true }
    }

    const hasCC = entry.cc !== ''
    const hasExam = entry.exam !== ''

    if (hasCC && hasExam) {
      const final = (Number(entry.cc) * mod.ccWeight) + (Number(entry.exam) * mod.examWeight)
      return { final: Math.round(final * 100) / 100, isComplete: true }
    } else if (hasExam && !hasCC) {
      return { final: Number(entry.exam), isComplete: false }
    } else if (hasCC && !hasExam) {
      return { final: null, isComplete: false }
    }

    return { final: null, isComplete: false }
  }

  // Target Exam Grade required to achieve targetGrade (e.g. 10)
  const getRequiredExamGrade = (mod: AcademicModule, entry?: GradeEntry, targetGrade: number = 10): number | null => {
    if (!mod.hasCC) return targetGrade
    const cc = entry?.cc !== undefined && entry.cc !== '' ? Number(entry.cc) : null
    if (cc === null) return null

    // Target = (CC * 0.30) + (Exam * 0.70)
    // Exam = (Target - CC * 0.30) / 0.70
    const required = (targetGrade - cc * mod.ccWeight) / mod.examWeight
    return Math.round(required * 100) / 100
  }

  // Global Semester Computations
  const stats: SemesterStats = useMemo(() => {
    let totalWeightedPoints = 0
    let totalCoefficients = 0
    let totalCompletedCoeffs = 0
    let modulesPassed = 0
    let modulesBelowTen = 0

    let highestImpactMod: ImpactModule | null = null
    let lowestImpactMod: ImpactModule | null = null

    modules.forEach((mod) => {
      const entry = grades[mod.id]
      const { final } = calculateModuleFinal(mod, entry)
      totalCoefficients += mod.coefficient

      if (final !== null) {
        totalWeightedPoints += final * mod.coefficient
        totalCompletedCoeffs += mod.coefficient

        if (final >= 10) {
          modulesPassed++
        } else {
          modulesBelowTen++
        }

        const impact = (final - 10) * mod.coefficient
        if (!highestImpactMod || impact > highestImpactMod.impact) {
          highestImpactMod = { name: mod.name, impact, finalGrade: final }
        }
        if (!lowestImpactMod || impact < lowestImpactMod.impact) {
          lowestImpactMod = { name: mod.name, impact, finalGrade: final }
        }
      }
    })

    const moyenne = totalCompletedCoeffs > 0 ? totalWeightedPoints / totalCompletedCoeffs : 0
    const roundedMoyenne = Math.round(moyenne * 100) / 100

    let status: {
      label: string
      color: string
      status: 'admis' | 'rattrapage' | 'ajourne' | 'pending'
      description: string
    }

    if (modules.length === 0) {
      status = {
        label: 'En attente de matières',
        color: 'text-slate-400 dark:text-slate-500',
        status: 'pending',
        description: 'Ajoutez vos matières pour ce semestre afin de calculer votre décision académique.',
      }
    } else if (totalCompletedCoeffs === 0) {
      status = {
        label: 'En attente de notes',
        color: 'text-slate-400 dark:text-slate-500',
        status: 'pending',
        description: 'Saisissez vos notes de Contrôle Continu (30%) et Examen (70%).',
      }
    } else {
      status = getAcademicStatus(roundedMoyenne, modulesBelowTen)
    }

    const isFullSemesterFilled = totalCompletedCoeffs === totalCoefficients && totalCoefficients > 0

    return {
      moyenne: roundedMoyenne,
      status,
      totalModules: modules.length,
      modulesPassed,
      modulesBelowTen,
      totalCoefficients,
      totalCompletedCoeffs,
      isFullSemesterFilled,
      highestImpactMod,
      lowestImpactMod,
    }
  }, [modules, grades])

  // Open Modal to Add a new module
  const openAddModal = () => {
    setEditingModuleId(null)
    setFormModuleName('')
    setFormModuleCode(`MOD${modules.length + 1}`)
    setFormModuleCoef(2)
    setFormModulePole('fondamental')
    setFormModuleHasCC(true)
    setIsModalOpen(true)
  }

  // Open Modal to Edit existing module
  const openEditModal = (mod: AcademicModule) => {
    setEditingModuleId(mod.id)
    setFormModuleName(mod.name)
    setFormModuleCode(mod.code)
    setFormModuleCoef(mod.coefficient)
    setFormModulePole(mod.pole)
    setFormModuleHasCC(mod.hasCC)
    setIsModalOpen(true)
  }

  // Save module from Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formModuleName.trim()) return

    if (editingModuleId) {
      // Edit existing
      const updated = modules.map((m) =>
        m.id === editingModuleId
          ? {
              ...m,
              name: formModuleName.trim(),
              code: formModuleCode.trim() || m.code,
              coefficient: formModuleCoef,
              pole: formModulePole,
              hasCC: formModuleHasCC,
              ccWeight: formModuleHasCC ? 0.3 : 0.0,
              examWeight: formModuleHasCC ? 0.7 : 1.0,
            }
          : m
      )
      saveModulesToStorage(updated)
      showToast('Module modifié avec succès !')
    } else {
      // Add new
      const newModule: AcademicModule = {
        id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: formModuleName.trim(),
        code: formModuleCode.trim() || `MOD${modules.length + 1}`,
        coefficient: formModuleCoef,
        pole: formModulePole,
        hasCC: formModuleHasCC,
        ccWeight: formModuleHasCC ? 0.3 : 0.0,
        examWeight: formModuleHasCC ? 0.7 : 1.0,
      }
      saveModulesToStorage([...modules, newModule])
      showToast('Nouveau module ajouté !')
    }

    setIsModalOpen(false)
  }

  // Delete module
  const removeModule = (id: string) => {
    const target = modules.find((m) => m.id === id)
    if (confirm(`Voulez-vous vraiment supprimer la matière "${target?.name || 'Sélectionnée'}" ?`)) {
      const updated = modules.filter((m) => m.id !== id)
      saveModulesToStorage(updated)
      const nextGrades = { ...grades }
      delete nextGrades[id]
      setGrades(nextGrades)
      if (currentSemester) {
        localStorage.setItem(`esb_student_grades_v2_${selectedCycle}_${currentSemester.id}`, JSON.stringify(nextGrades))
      }
      showToast('Matière supprimée.')
    }
  }

  // Clear all modules (empty list - section vierge)
  const clearAllModules = () => {
    if (confirm('Voulez-vous vider toutes les matières de ce semestre pour repartir d\'une section vierge ?')) {
      saveModulesToStorage([])
      setGrades({})
      if (currentSemester) {
        localStorage.removeItem(`esb_student_grades_v2_${selectedCycle}_${currentSemester.id}`)
      }
      showToast('Section réinitialisée (tableau vierge).')
    }
  }

  // Reset grades only
  const resetGrades = () => {
    if (confirm('Voulez-vous effacer toutes les notes saisies pour ce semestre ?')) {
      setGrades({})
      if (currentSemester) {
        localStorage.removeItem(`esb_student_grades_v2_${selectedCycle}_${currentSemester.id}`)
      }
      showToast('Notes effacées.')
    }
  }

  const showToast = (msg: string) => {
    setSaveToast(msg)
    setTimeout(() => setSaveToast(null), 2500)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Navigation retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer relevé
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#070D19]/90 backdrop-blur-2xl text-white p-6 sm:p-8 shadow-[0_0_40px_rgba(56,189,248,0.12)] border border-cyan-500/30"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-amber-500" />
        <div className="absolute inset-0 cyber-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulateur Académique ESB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Calculateur de Moyenne &amp; Gestion des Matières
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Section vierge par défaut : chaque étudiant ajoute ses propres matières, coefficients et notes pour calculer sa moyenne exacte avec la règle officielle <strong>CC 30% / Examen 70%</strong>.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20">
            <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">Année / Cycle</span>
            <span className="text-lg font-mono font-black text-white uppercase tracking-wide">
              {currentCurriculum.name}
            </span>
            <button
              onClick={openAddModal}
              className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une matière
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sélecteurs de Cycle & Semestre */}
      <div className="space-y-4">
        {/* Choix du Cycle */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(ESB_CURRICULA).map(([key, curr]) => {
            const isActive = selectedCycle === key
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedCycle(key)
                  setSelectedSemesterId(curr.semesters[0].id)
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-[1.02] border border-cyan-400/40'
                    : 'bg-white dark:bg-[#070D19]/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {curr.name}
              </button>
            )
          })}
        </div>

        {/* Choix du Semestre */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-[#070D19]/80 rounded-2xl border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
          {currentCurriculum.semesters.map((sem) => {
            const isActive = selectedSemesterId === sem.id
            return (
              <button
                key={sem.id}
                onClick={() => setSelectedSemesterId(sem.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sem.shortName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Résumé de Performance (Stats Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moyenne Générale */}
        <motion.div
          layout
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#070D19]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-cyan-400/40 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Moyenne Générale
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-cyan-300 tracking-tight">
              {stats.totalCompletedCoeffs > 0 ? stats.moyenne.toFixed(2) : '--'}
            </span>
            <span className="text-slate-400 text-sm font-bold">/ 20</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
            {stats.totalCompletedCoeffs === 0 ? (
              <span className="text-slate-400 dark:text-slate-500">Aucune note saisie</span>
            ) : stats.moyenne >= 10 ? (
              <span className="text-emerald-500 dark:text-emerald-400">≥ 10.00 (Moyenne d&apos;Admission)</span>
            ) : stats.moyenne >= 9 ? (
              <span className="text-amber-500 dark:text-amber-400">≥ 9.00 (Moyenne de Rattrapage)</span>
            ) : (
              <span className="text-red-500">&lt; 9.00 (Moyenne Insuffisante)</span>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        </motion.div>

        {/* Modules Validés (≥ 10) */}
        <motion.div
          layout
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#070D19]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-blue-400/40 shadow-sm flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Matières Validées (≥ 10)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.modulesPassed}
            </span>
            <span className="text-slate-400 text-xs font-bold">/ {stats.totalModules} matières</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.modulesPassed === stats.totalModules && stats.totalModules > 0
                  ? 'bg-emerald-400'
                  : 'bg-cyan-500'
              }`}
              style={{
                width: `${stats.totalModules > 0 ? (stats.modulesPassed / stats.totalModules) * 100 : 0}%`,
              }}
            />
          </div>
        </motion.div>

        {/* Décision Académique ESB */}
        <motion.div
          layout
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#070D19]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-amber-400/40 shadow-sm flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Décision Académique
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              stats.status.status === 'admis'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : stats.status.status === 'rattrapage'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : stats.status.status === 'pending'
                ? 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                : 'bg-red-500/15 text-red-400 border border-red-500/20'
            }`}>
              {stats.status.status === 'admis' ? (
                <Check className="w-4 h-4" />
              ) : stats.status.status === 'rattrapage' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : stats.status.status === 'pending' ? (
                <Info className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="my-2">
            <span className={`text-sm font-mono font-black block ${stats.status.color}`}>
              {stats.status.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.status.description}
          </p>
        </motion.div>

        {/* Mode Simulateur d'Examen */}
        <motion.div
          layout
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#070D19]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-indigo-400/40 shadow-sm flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Simulateur Examen
            </span>
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                isSimulationMode
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-white/10 text-slate-300 border border-white/15 hover:bg-white/20'
              }`}
            >
              {isSimulationMode ? 'ACTIF' : 'ACTIVER'}
            </button>
          </div>
          <div className="my-2 flex items-center gap-2">
            {[9, 10, 12, 14].map((score) => (
              <button
                key={score}
                onClick={() => {
                  setTargetGradePerModule(score)
                  setIsSimulationMode(true)
                }}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
                  targetGradePerModule === score && isSimulationMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'
                }`}
              >
                {score}/20
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isSimulationMode
              ? targetGradePerModule === 10
                ? 'Calcul pour admission directe (≥ 10.00/20 par matière)'
                : targetGradePerModule === 9
                ? 'Calcul pour seuil d\'accès au rattrapage (≥ 9.00/20)'
                : `Calcul de la note d'examen pour viser ${targetGradePerModule}/20`
              : 'Calculez la note d\'examen nécessaire pour chaque matière'}
          </p>
        </motion.div>
      </div>

      {/* Bannière de conseils pédagogiques */}
      {(() => {
        const { highestImpactMod, lowestImpactMod } = stats
        if (!highestImpactMod || !lowestImpactMod) return null
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold">Analyse des performances : </span>
                Meilleure note en <span className="font-semibold underline">{highestImpactMod.name}</span> ({highestImpactMod.finalGrade.toFixed(2)}/20).
                {lowestImpactMod.finalGrade < 10 && (
                  <> Matière prioritaire à réviser : <span className="font-semibold underline text-red-600 dark:text-red-400">{lowestImpactMod.name}</span> ({lowestImpactMod.finalGrade.toFixed(2)}/20).</>
                )}
              </div>
            </div>
          </motion.div>
        )
      })()}

      {/* Tableau interactif des Modules & Saisie des Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Matières & Notes — {currentSemester?.label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Vous pouvez ajouter, modifier ou supprimer vos matières et leurs coefficients librement.
            </p>
          </div>

          {/* Boutons d'action pour la gestion des matières */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ajouter une matière
            </button>

            {modules.length > 0 && (
              <>
                <button
                  onClick={resetGrades}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  title="Effacer toutes les notes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Effacer notes
                </button>
                <button
                  onClick={clearAllModules}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  title="Vider toutes les matières de ce semestre"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vider matières
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table responsive */}
        {modules.length === 0 ? (
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Section vierge de matières
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Aucune matière préenregistrée. Ajoutez vos matières et leurs coefficients pour composer votre cursus et calculer votre moyenne selon les règles officielles ESB (Contrôle Continu 30% / Examen 70%).
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter ma première matière
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Matière & Code</th>
                  <th className="py-3 px-3 text-center">Coefficient</th>
                  <th className="py-3 px-3 text-center">Contrôle Continu (30%)</th>
                  <th className="py-3 px-3 text-center">Examen Final (70%)</th>
                  {isSimulationMode && (
                    <th className="py-3 px-3 text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                      Exam Cible ({targetGradePerModule}/20)
                    </th>
                  )}
                  <th className="py-3 px-4 text-center">Note Finale</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {modules.map((mod) => {
                  const entry = grades[mod.id] || { cc: '', exam: '' }
                  const { final } = calculateModuleFinal(mod, entry)
                  const requiredExam = isSimulationMode ? getRequiredExamGrade(mod, entry, targetGradePerModule) : null
                  const pole = POLE_LABELS[mod.pole] || POLE_LABELS.fondamental

                  return (
                    <tr
                      key={mod.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Module Title & Code with Edit capability */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {mod.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {mod.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${pole.badgeColor}`}
                            >
                              {pole.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {mod.hasCC ? 'CC 30% / Exam 70%' : '100% Examen/Soutenance'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Coef (Direct editable inline input) */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          step="0.5"
                          value={mod.coefficient}
                          onChange={(e) => handleCoefChange(mod.id, e.target.value)}
                          className="w-16 text-center py-1.5 px-1 text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                          title="Modifier le coefficient"
                        />
                      </td>

                      {/* Input CC */}
                      <td className="py-3.5 px-3 text-center">
                        {mod.hasCC ? (
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            placeholder="CC /20"
                            value={entry.cc}
                            onChange={(e) =>
                              handleGradeChange(mod.id, 'cc', e.target.value)
                            }
                            className="w-20 text-center py-1.5 px-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pas de CC</span>
                        )}
                      </td>

                      {/* Input Exam */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          placeholder="Exam /20"
                          value={entry.exam}
                          onChange={(e) =>
                            handleGradeChange(mod.id, 'exam', e.target.value)
                          }
                          className="w-20 text-center py-1.5 px-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                        />
                      </td>

                      {/* Target Exam Calculation (Mode Simulation) */}
                      {isSimulationMode && (
                        <td className="py-3.5 px-3 text-center bg-indigo-50/30 dark:bg-indigo-950/10">
                          {requiredExam !== null ? (
                            requiredExam <= 20 ? (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                  requiredExam <= 10
                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                ≥ {Math.max(0, requiredExam).toFixed(2)} /20
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                                &gt; 20 (Rattrapage)
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">Entrez le CC</span>
                          )}
                        </td>
                      )}

                      {/* Final Grade for this module */}
                      <td className="py-3.5 px-4 text-center">
                        {final !== null ? (
                          <span
                            className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                              final >= 10
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {final.toFixed(2)} / 20
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">En attente</span>
                        )}
                      </td>

                      {/* Module Status (Validé >= 10 vs À Rattraper < 10) */}
                      <td className="py-3.5 px-3 text-center">
                        {final !== null ? (
                          final >= 10 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                              <Check className="w-3.5 h-3.5" /> Validé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-1 rounded-lg" title="Note < 10.00 : Module à repasser en session de rattrapage si moyenne générale < 10">
                              <XCircle className="w-3.5 h-3.5" /> &lt; 10
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(mod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            title="Modifier cette matière"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeModule(mod.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Supprimer cette matière"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info in table */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Vos matières et coefficients personnalisés sont enregistrés automatiquement.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAllModules}
              className="text-slate-400 hover:text-red-500 transition-colors font-medium"
            >
              Vider le tableau
            </button>
            <button
              onClick={() => showToast('Toutes les modifications sont bien enregistrées localement !')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              Vérifier sauvegarde
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'Ajout / Modification de Matière */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingModuleId ? 'Modifier la matière' : 'Ajouter une nouvelle matière'}
                    </h3>
                    <p className="text-xs text-slate-500">{currentSemester?.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-4">
                {/* Nom du module */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nom de la matière *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comptabilité Bancaire Approfondie"
                    value={formModuleName}
                    onChange={(e) => setFormModuleName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-semibold outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Code matière */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Code Matière (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: BNQ201"
                      value={formModuleCode}
                      onChange={(e) => setFormModuleCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Coefficient */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Coefficient *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="0.5"
                      required
                      value={formModuleCoef}
                      onChange={(e) => setFormModuleCoef(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Unité / Pôle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Unité d&apos;enseignement
                  </label>
                  <select
                    value={formModulePole}
                    onChange={(e) => setFormModulePole(e.target.value as AcademicModule['pole'])}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-semibold outline-none transition-all"
                  >
                    <option value="fondamental">Unité Fondamentale (Matière principale)</option>
                    <option value="methodologique">Unité Méthodologique (Maths, Stats, PFE)</option>
                    <option value="transversal">Unité Transversale (Langues, Communication)</option>
                    <option value="decouverte">Unité Découverte</option>
                  </select>
                </div>

                {/* Mode de notation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">
                      {formModuleHasCC ? 'Pondération Standard ESB (30% CC + 70% Examen)' : '100% Examen / Soutenance'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formModuleHasCC ? 'Comprend une note de contrôle continu et un examen' : 'Une seule note finale d\'examen'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formModuleHasCC}
                    onChange={(e) => setFormModuleHasCC(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                  >
                    {editingModuleId ? 'Enregistrer les modifications' : 'Ajouter la matière'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {saveToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide & Règles Officielles de l'ESB */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-500" />
          Règles Officielles d&apos;Admission & Rattrapage à l&apos;ESB
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="font-bold text-emerald-600 block mb-1">Moyenne Générale ≥ 10.00</span>
            <p className="text-slate-500"><strong>Admis d&apos;office</strong>. Le semestre est validé avec succès.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="font-bold text-amber-600 block mb-1">9.00 ≤ Moyenne &lt; 10.00</span>
            <p className="text-slate-500"><strong>Session de Rattrapage</strong> autorisée pour repasser les modules &lt; 10 et atteindre 10.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="font-bold text-red-600 dark:text-red-400 block mb-1">Moyenne &lt; 9.00 / 20</span>
            <p className="text-slate-500"><strong>Ajourné / Non Admis</strong>. La moyenne est en dessous du seuil de rattrapage.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="font-bold text-blue-600 block mb-1">Pondération ESB</span>
            <p className="text-slate-500">Note = (CC × 0.30) + (Examen × 0.70).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
