// Données académiques officielles et maquettes de cours pour l'ESB (École Supérieure de Banque)
// Cycles & Semestres concernés :
// - Licence : Semestres S1 à S6 (6 semestres)
// - Master  : Semestres S1 à S4 (4 semestres)
// - DSEB    : Semestres S1 à S8 (8 semestres)
//
// Règles académiques ESB :
// 1. Pondération : CC = 30% (0.3) et Examen = 70% (0.7)
// 2. Pas de crédits ECTS
// 3. Règles d'Admission & Rattrapage ESB :
//    - Moyenne Générale >= 10.00 : ADMIS (Semestre validé)
//    - 9.00 <= Moyenne Générale < 10.00 : SESSION DE RATTRAPAGE (pour repasser les modules < 10)
//    - Moyenne Générale < 9.00 : AJOURNÉ / NON ADMIS (Moyenne générale insuffisante)

export interface AcademicModule {
  id: string
  code: string
  name: string
  coefficient: number
  pole: 'fondamental' | 'methodologique' | 'transversal' | 'decouverte'
  ccWeight: number   // 0.30 (30%)
  examWeight: number // 0.70 (70%)
  hasCC: boolean     // Certains modules de fin de cycle sont 100% soutenance/examen
}

export interface AcademicSemester {
  id: string
  label: string
  shortName: string
  modules: AcademicModule[]
}

export interface AcademicCycleConfig {
  id: string
  name: string
  description: string
  semesters: AcademicSemester[]
}

export const ESB_CURRICULA: Record<string, AcademicCycleConfig> = {
  licence: {
    id: 'licence',
    name: 'Licence Banque & Finance',
    description: 'Cursus de 3 ans comprenant les semestres S1 à S6.',
    semesters: [
      {
        id: 'licence-s1',
        label: 'Licence 1 — Semestre 1 (S1)',
        shortName: 'Licence S1',
        modules: [
          { id: 'l1s1-cpt1', code: 'CPT101', name: 'Comptabilité Générale I', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-micro1', code: 'ECO101', name: 'Microéconomie I', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-math1', code: 'MTH101', name: 'Mathématiques Financières I', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-stat1', code: 'STA101', name: 'Statistiques Descriptives', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-droit1', code: 'DRT101', name: 'Introduction au Droit', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-monnaie', code: 'MON101', name: 'Économie Monétaire & Bancaire', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-anglais', code: 'ANG101', name: 'Anglais des Affaires I', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s1-info', code: 'INF101', name: 'Informatique & Bureautique', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'licence-s2',
        label: 'Licence 1 — Semestre 2 (S2)',
        shortName: 'Licence S2',
        modules: [
          { id: 'l1s2-cpt2', code: 'CPT102', name: 'Comptabilité Générale II', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-macro1', code: 'ECO102', name: 'Macroéconomie I', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-math2', code: 'MTH102', name: 'Mathématiques Financières II (Actuariat)', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-prob', code: 'STA102', name: 'Probabilités Appliquées', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-droitcom', code: 'DRT102', name: 'Droit Commercial', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-introbnq', code: 'BNQ102', name: 'Organisation du Système Bancaire', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-anglais', code: 'ANG102', name: 'Anglais des Affaires II', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l1s2-expression', code: 'EXP102', name: 'Techniques de Communication & Rédaction', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'licence-s3',
        label: 'Licence 2 — Semestre 3 (S3)',
        shortName: 'Licence S3',
        modules: [
          { id: 'l2s3-cptanal', code: 'CPT201', name: 'Comptabilité de Gestion & Analytique', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-micro2', code: 'ECO201', name: 'Microéconomie II (Incertitude)', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-opbnq', code: 'BNQ201', name: 'Opérations Bancaires & Moyens de Paiement', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-droitbnq', code: 'DRT201', name: 'Droit Bancaire & Financier I', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-fisc', code: 'FSC201', name: 'Fiscalité de l\'Entreprise', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-statmath', code: 'STA201', name: 'Inférence Statistique', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s3-anglais', code: 'ANG201', name: 'Anglais Bancaire I', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'licence-s4',
        label: 'Licence 2 — Semestre 4 (S4)',
        shortName: 'Licence S4',
        modules: [
          { id: 'l2s4-anfin1', code: 'FIN202', name: 'Analyse Financière I (Bilan & Ratios)', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-cptsoc', code: 'CPT202', name: 'Comptabilité des Sociétés Commerciales', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-marches', code: 'FIN203', name: 'Marchés Financiers & Bourse', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-droitbnq2', code: 'DRT202', name: 'Droit Bancaire & Sûretés Réelles', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-ecomon', code: 'MON202', name: 'Théorie & Politique Monétaire', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-econo', code: 'ECN202', name: 'Initiation à l\'Économétrie', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l2s4-anglais', code: 'ANG202', name: 'Anglais Bancaire II', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'licence-s5',
        label: 'Licence 3 — Semestre 5 (S5)',
        shortName: 'Licence S5',
        modules: [
          { id: 'l3s5-crdpart', code: 'BNQ301', name: 'Techniques de Crédit aux Particuliers', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-treso', code: 'FIN301', name: 'Gestion de Trésorerie Bancaire', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-anfin2', code: 'FIN302', name: 'Analyse Financière Approfondie', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-mktbnq', code: 'MKT301', name: 'Marketing des Services Bancaires', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-rsqcrd', code: 'RSQ301', name: 'Gestion du Risque de Contrepartie', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-econoapp', code: 'ECN301', name: 'Économétrie Financière Appliquée', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s5-anglais', code: 'ANG301', name: 'Financial English Seminar', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'licence-s6',
        label: 'Licence 3 — Semestre 6 (S6)',
        shortName: 'Licence S6',
        modules: [
          { id: 'l3s6-crdbes', code: 'BNQ302', name: 'Crédits aux Entreprises & Investissements', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s6-finint', code: 'FIN303', name: 'Finance Internationale & Trade Finance', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s6-conform', code: 'CNF301', name: 'Conformité, Éthique & Déontologie Bancaire', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s6-audit', code: 'AUD301', name: 'Initiation à l\'Audit & Contrôle Interne', coefficient: 2, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'l3s6-pfe', code: 'PFE301', name: 'Rapport de Stage / Projet Professionnel', coefficient: 4, pole: 'methodologique', ccWeight: 0.0, examWeight: 1.0, hasCC: false },
          { id: 'l3s6-anglais', code: 'ANG302', name: 'Business Banking English', coefficient: 1, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
    ],
  },
  dseb: {
    id: 'dseb',
    name: 'DSEB (Diplôme Supérieur d\'Études Bancaires)',
    description: 'Cursus complet de 4 ans comprenant les semestres S1 à S8.',
    semesters: [
      {
        id: 'dseb-s1',
        label: 'DSEB 1ère Année — Semestre 1 (S1)',
        shortName: 'DSEB S1',
        modules: [
          { id: 'dsebs1-cptbnq', code: 'DSB101', name: 'Comptabilité Bancaire & Normes SCF/IFRS', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs1-anfin', code: 'DSB102', name: 'Analyse & Diagnostic Financier de l\'Entreprise', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs1-opbnq', code: 'DSB103', name: 'Techniques & Opérations Bancaires Approfondies', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs1-droit', code: 'DSB104', name: 'Droit des Opérations Bancaires & Contrats', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs1-mathact', code: 'DSB105', name: 'Mathématiques Financières & Actuariat Avancé', coefficient: 3, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs1-anglais', code: 'DSB106', name: 'Banking & Financial English I', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s2',
        label: 'DSEB 1ère Année — Semestre 2 (S2)',
        shortName: 'DSEB S2',
        modules: [
          { id: 'dsebs2-engag', code: 'DSB201', name: 'Politique de Crédit & Gestion des Engagements', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs2-comext', code: 'DSB202', name: 'Financement du Commerce Extérieur (Credoc, Remdoc)', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs2-marches', code: 'DSB203', name: 'Marchés Monétaires, Financiers & Devises', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs2-fiscbnq', code: 'DSB204', name: 'Fiscalité Bancaire & Contentieux', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs2-ctrlgest', code: 'DSB205', name: 'Contrôle de Gestion & Rentabilité Bancaire', coefficient: 3, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs2-anglais', code: 'DSB206', name: 'Banking & Financial English II', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s3',
        label: 'DSEB 2ème Année — Semestre 3 (S3)',
        shortName: 'DSEB S3',
        modules: [
          { id: 'dsebs3-rsqbale', code: 'DSB301', name: 'Réglementation Prudentielle & Bâle II / III', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs3-alm', code: 'DSB302', name: 'Gestion Actif-Passif (ALM & Risque de Taux)', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs3-audit', code: 'DSB303', name: 'Audit Interne, Contrôle Permanent & Inspection', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs3-deriv', code: 'DSB304', name: 'Instruments Financiers Dérivés & Couverture', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs3-mktstrat', code: 'DSB305', name: 'Stratégie & Marketing Bancaire Avancé', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs3-anglais', code: 'DSB306', name: 'Advanced Banking Communication', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s4',
        label: 'DSEB 2ème Année — Semestre 4 (S4)',
        shortName: 'DSEB S4',
        modules: [
          { id: 'dsebs4-islamic', code: 'DSB401', name: 'Finance Islamique & Ingénierie Participative', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs4-fintech', code: 'DSB402', name: 'Transformation Digitale, FinTech & IA Bancaire', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs4-gouv', code: 'DSB403', name: 'Gouvernance Bancaire & Management des Risques', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs4-proj', code: 'DSB404', name: 'Projet d\'Études & Analyse de Cas Réel', coefficient: 4, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs4-anglais', code: 'DSB405', name: 'Executive Banking English', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s5',
        label: 'DSEB 3ème Année — Semestre 5 (S5)',
        shortName: 'DSEB S5',
        modules: [
          { id: 'dsebs5-alm2', code: 'DSB501', name: 'ALM Avancé & Gestion des Risques de Liquidité', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs5-eval', code: 'DSB502', name: 'Évaluation Financière & Fusions-Acquisitions Bancaires', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs5-credit', code: 'DSB503', name: 'Financements Structurés & Syndications de Crédit', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs5-droitpenal', code: 'DSB504', name: 'Droit Pénal Financier & Contentieux Bancaire', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs5-compliance', code: 'DSB505', name: 'Conformité Internationale & Lutte Anti-Blanchiment', coefficient: 3, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs5-anglais', code: 'DSB506', name: 'Financial Negotiations in English', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s6',
        label: 'DSEB 3ème Année — Semestre 6 (S6)',
        shortName: 'DSEB S6',
        modules: [
          { id: 'dsebs6-rsqop', code: 'DSB601', name: 'Gestion des Risques Opérationnels & Cartographie', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs6-auditper', code: 'DSB602', name: 'Audit Périodique & Contrôle des Salles des Marchés', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs6-esg', code: 'DSB603', name: 'Finance Verte, Climat & Critères ESG Bancaires', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs6-cyber', code: 'DSB604', name: 'Cybersécurité & Résilience Opérationnelle Bancaire', coefficient: 3, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs6-method', code: 'DSB605', name: 'Méthodologie de Recherche Appliquée à la Banque', coefficient: 2, pole: 'methodologique', ccWeight: 0.5, examWeight: 0.5, hasCC: true },
          { id: 'dsebs6-anglais', code: 'DSB606', name: 'International Banking Seminar', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'dseb-s7',
        label: 'DSEB 4ème Année — Semestre 7 (S7)',
        shortName: 'DSEB S7',
        modules: [
          { id: 'dsebs7-strat', code: 'DSB701', name: 'Stratégie Bancaire Globale & Modèles Économiques', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs7-titris', code: 'DSB702', name: 'Ingénierie Financière, Titrisation & Sukuks', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs7-regint', code: 'DSB703', name: 'Réglementations Bancaires Internationales & Bâle IV', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs7-dirgen', code: 'DSB704', name: 'Management Exécutif & Conduite du Changement', coefficient: 3, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'dsebs7-semmem', code: 'DSB705', name: 'Séminaire de Cadrage du Mémoire Professionnel', coefficient: 3, pole: 'methodologique', ccWeight: 0.5, examWeight: 0.5, hasCC: true },
        ],
      },
      {
        id: 'dseb-s8',
        label: 'DSEB 4ème Année — Semestre 8 (S8)',
        shortName: 'DSEB S8',
        modules: [
          { id: 'dsebs8-stage', code: 'DSB801', name: 'Stage Professionnel d\'Immersion Cadre Bancaire', coefficient: 4, pole: 'methodologique', ccWeight: 0.0, examWeight: 1.0, hasCC: false },
          { id: 'dsebs8-memoire', code: 'DSB802', name: 'Mémoire Professionnel DSEB & Soutenance', coefficient: 8, pole: 'methodologique', ccWeight: 0.0, examWeight: 1.0, hasCC: false },
        ],
      },
    ],
  },
  master: {
    id: 'master',
    name: 'Master Banque, Risques & Finance',
    description: 'Cursus supérieur de 2 ans comprenant les semestres S1 à S4.',
    semesters: [
      {
        id: 'master-s1',
        label: 'Master 1 — Semestre 1 (S1)',
        shortName: 'Master S1',
        modules: [
          { id: 'm1s1-modelfin', code: 'MST101', name: 'Modélisation Financière & Économétrie Appliquée', coefficient: 4, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s1-regprud', code: 'MST102', name: 'Réglementation Prudentielle & Bâle III', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s1-gestport', code: 'MST103', name: 'Gestion de Portefeuille & Marchés d\'Actions/Obligations', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s1-droitadv', code: 'MST104', name: 'Droit Pénal Financier & Contentieux Bancaire', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s1-diagav', code: 'MST105', name: 'Diagnostic & Évaluation Financière Avancée', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s1-anglais', code: 'MST106', name: 'Executive Financial English I', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'master-s2',
        label: 'Master 1 — Semestre 2 (S2)',
        shortName: 'Master S2',
        modules: [
          { id: 'm1s2-alm', code: 'MST201', name: 'Gestion Actif-Passif (ALM & Risque de Liquidité)', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s2-scoring', code: 'MST202', name: 'Risque de Crédit, Scoring & Machine Learning', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s2-evalma', code: 'MST203', name: 'Évaluation d\'Entreprise & Fusions-Acquisitions (M&A)', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s2-structfin', code: 'MST204', name: 'Financements Structurés & Syndications Bancaires', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s2-sibnq', code: 'MST205', name: 'Cybersécurité & Systèmes d\'Information Bancaires', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm1s2-anglais', code: 'MST206', name: 'Executive Financial English II', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'master-s3',
        label: 'Master 2 — Semestre 3 (S3)',
        shortName: 'Master S3',
        modules: [
          { id: 'm2s3-audit', code: 'MST301', name: 'Audit des Activités de Marché & Contrôle Périodique', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm2s3-rsqop', code: 'MST302', name: 'Gestion des Risques Opérationnels & Compliance LAB/FT', coefficient: 4, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm2s3-esg', code: 'MST303', name: 'Finance Durable, ESG & Transition Écologique', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm2s3-titris', code: 'MST304', name: 'Ingénierie Financière & Titrisation', coefficient: 3, pole: 'fondamental', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm2s3-method', code: 'MST305', name: 'Méthodologie de Recherche en Finance & Banque', coefficient: 2, pole: 'methodologique', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
          { id: 'm2s3-anglais', code: 'MST306', name: 'International Banking & Research Seminar', coefficient: 2, pole: 'transversal', ccWeight: 0.3, examWeight: 0.7, hasCC: true },
        ],
      },
      {
        id: 'master-s4',
        label: 'Master 2 — Semestre 4 (S4)',
        shortName: 'Master S4',
        modules: [
          { id: 'm2s4-stage', code: 'MST401', name: 'Stage Professionnel d\'Immersion Bancaire', coefficient: 4, pole: 'methodologique', ccWeight: 0.0, examWeight: 1.0, hasCC: false },
          { id: 'm2s4-memoire', code: 'MST402', name: 'Mémoire de Fin d\'Études Master & Soutenance', coefficient: 8, pole: 'methodologique', ccWeight: 0.0, examWeight: 1.0, hasCC: false },
        ],
      },
    ],
  },
}

export const POLE_LABELS: Record<string, { label: string; color: string; badgeColor: string }> = {
  fondamental: {
    label: 'Unité Fondamentale',
    color: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  methodologique: {
    label: 'Unité Méthodologique',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  transversal: {
    label: 'Unité Transversale',
    color: 'text-purple-600 dark:text-purple-400',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  decouverte: {
    label: 'Unité Découverte',
    color: 'text-amber-600 dark:text-amber-400',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
}

export interface StudentModuleGrade {
  moduleId: string
  ccGrade: number | null
  examGrade: number | null
}

export function getAcademicStatus(
  moyenne: number,
  modulesBelowTen: number
): {
  label: string
  color: string
  status: 'admis' | 'rattrapage' | 'ajourne'
  description: string
} {
  // RÈGLE ESB :
  // 1. Moyenne >= 10.00 -> ADMIS (Semestre Validé)
  // 2. 9.00 <= Moyenne < 10.00 -> RATTRAPAGE (Accès à la session de rattrapage)
  // 3. Moyenne < 9.00 -> AJOURNÉ (Non admis au rattrapage)

  if (moyenne >= 10.00) {
    if (moyenne >= 16) {
      return {
        label: 'Admis — Mention Très Bien 🌟',
        color: 'text-emerald-600 dark:text-emerald-400',
        status: 'admis',
        description: 'Semestre validé avec les félicitations du jury (Moyenne ≥ 16/20).',
      }
    }
    if (moyenne >= 14) {
      return {
        label: 'Admis — Mention Bien 👏',
        color: 'text-blue-600 dark:text-blue-400',
        status: 'admis',
        description: 'Semestre validé avec mention Bien (Moyenne ≥ 14/20).',
      }
    }
    if (moyenne >= 12) {
      return {
        label: 'Admis — Mention Assez Bien 👍',
        color: 'text-cyan-600 dark:text-cyan-400',
        status: 'admis',
        description: 'Semestre validé avec mention Assez Bien (Moyenne ≥ 12/20).',
      }
    }
    return {
      label: 'Admis (Moyenne ≥ 10.00) ✅',
      color: 'text-emerald-500',
      status: 'admis',
      description: 'Semestre validé avec succès (Moyenne générale ≥ 10.00/20).',
    }
  }

  if (moyenne >= 9.00) {
    return {
      label: 'Éligible au Rattrapage (9.00 ≤ Moyenne < 10.00) ⚠️',
      color: 'text-amber-600 dark:text-amber-400',
      status: 'rattrapage',
      description: `Moyenne ≥ 9.00 : vous accédez à la session de rattrapage (${modulesBelowTen} module${modulesBelowTen > 1 ? 's' : ''} < 10 à repasser pour viser 10.00).`,
    }
  }

  return {
    label: 'Ajourné — Non Admis (Moyenne < 9.00) ❌',
    color: 'text-red-600 dark:text-red-400',
    status: 'ajourne',
    description: 'Moyenne générale strictement inférieure à 9.00/20 (en dessous du seuil d\'accès au rattrapage).',
  }
}
