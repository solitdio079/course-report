const TEXT = new Map<string, string>(
  Object.entries({
    "Toggle navigation": "Ouvrir la navigation",
    "Loading": "Chargement",
    "Loading...": "Chargement...",
    "Loading report...": "Chargement du rapport...",
    "Loading profile...": "Chargement du profil...",
    "Loading dashboard...": "Chargement du tableau de bord...",
    "Loading sessions...": "Chargement des séances...",
    "Loading evaluations...": "Chargement des évaluations...",
    "Loading parent feedback...": "Chargement des retours parents...",
    "Loading child profile...": "Chargement du profil enfant...",
    "Loading student...": "Chargement de l'élève...",
    "Loading admin...": "Chargement de l'administration...",
    "Loading course...": "Chargement du cours...",
    "Loading inbox...": "Chargement de la messagerie...",
    "Loading messages...": "Chargement des messages...",
    "Loading social relations...": "Chargement des relations sociales...",

    "Back to home": "Retour à l'accueil",
    "Back to sign in": "Retour à la connexion",
    "Back to dashboard": "Retour au tableau de bord",
    "Back to teacher dashboard": "Retour au tableau professeur",
    "Back to student": "Retour à l'élève",
    "Back to social": "Retour au social",
    "Back to admin": "Retour à l'admin",

    "Parent feedback": "Retours parents",
    "Parent feedback history": "Historique des retours parents",
    "Add feedback": "Ajouter un retour",
    "Recent feedback": "Retours récents",
    "No parent feedback yet.": "Aucun retour parent pour le moment.",
    "No parent feedback logged yet.": "Aucun retour parent enregistré.",
    "No parent feedback recorded yet.": "Aucun retour parent enregistré.",
    "Track parent satisfaction, perceived progress, difficulties, and comments.":
      "Suivez la satisfaction des parents, les progrès perçus, les difficultés et les commentaires.",
    "Log what parents share about satisfaction, progress, and difficulties at home.":
      "Consignez ce que les parents partagent sur la satisfaction, les progrès et les difficultés à la maison.",
    "Feedback shared with the school about progress, satisfaction, and difficulties.":
      "Retours partagés avec l'école sur les progrès, la satisfaction et les difficultés.",
    "Save feedback": "Enregistrer le retour",
    "Add parent feedback": "Ajouter un retour parent",
    "Parent name": "Nom du parent",
    "Author": "Auteur",
    "Satisfaction": "Satisfaction",
    "High": "Élevée",
    "Medium": "Moyenne",
    "Low": "Faible",
    "Perceived progress": "Progrès perçus",
    "Difficulties observed": "Difficultés observées",
    "Progress": "Progrès",
    "Difficulties": "Difficultés",
    "Comment": "Commentaire",
    "Logged by": "Enregistré par",

    "Sessions": "Séances",
    "Session": "Séance",
    "Session document": "Fiche de séance",
    "Sessions by student": "Séances par élève",
    "Plan a session": "Planifier une séance",
    "Plan session": "Planifier la séance",
    "Plan": "Planifier",
    "Planning...": "Planification...",
    "Planned": "Planifiées",
    "Completed": "Terminées",
    "Average": "Moyenne",
    "Calendar": "Calendrier",
    "Previous": "Précédent",
    "Today": "Aujourd'hui",
    "Next": "Suivant",
    "Add": "Ajouter",
    "Duplicate": "Dupliquer",
    "No session yet.": "Aucune séance pour le moment.",
    "No sessions planned yet.": "Aucune séance planifiée.",
    "No sessions planned for this student yet.": "Aucune séance planifiée pour cet élève.",
    "No objectives added yet.": "Aucun objectif ajouté pour le moment.",
    "Select a session from the calendar or student list.":
      "Sélectionnez une séance depuis le calendrier ou la liste des élèves.",
    "Plan the class first, then complete the same session with skills, MoodCheck, notes, homework, and an attached evaluation.":
      "Planifiez d'abord le cours, puis complétez la même séance avec les compétences, MoodCheck, notes, devoirs et évaluation attachée.",
    "Weekly planning view inspired by the prototype.":
      "Vue de planification hebdomadaire inspirée du prototype.",
    "Student": "Élève",
    "Students": "Élèves",
    "Course": "Cours",
    "Courses": "Cours",
    "Title": "Titre",
    "Date": "Date",
    "Start": "Début",
    "End": "Fin",
    "Objectives": "Objectifs",
    "Objectives parents can see": "Objectifs visibles par les parents",
    "Daily routines": "Routines quotidiennes",
    "Select student": "Sélectionner un élève",
    "Select student...": "Sélectionner un élève...",
    "Select course": "Sélectionner un cours",
    "Select course...": "Sélectionner un cours...",
    "Objectives for the next session": "Objectifs pour la prochaine séance",
    "Pedagogical summary": "Résumé pédagogique",
    "Automatic session score": "Note automatique de la séance",
    "Skills worked": "Compétences travaillées",
    "Add skill...": "Ajouter une compétence...",
    "Add and rate at least one skill.": "Ajoutez et notez au moins une compétence.",
    "How was the student during this session?": "Comment l'élève était-il pendant cette séance ?",
    "What was difficult?": "Qu'est-ce qui était difficile ?",
    "Recurring mistakes or blocks": "Erreurs ou blocages récurrents",
    "Homework / follow-up": "Devoirs / suivi",
    "Homework": "Devoirs",
    "Recording link": "Lien d'enregistrement",
    "Open recording": "Ouvrir l'enregistrement",
    "Save session and attach evaluation": "Enregistrer la séance et joindre l'évaluation",
    "Evaluation attached": "Évaluation attachée",
    "Add evaluation": "Ajouter une évaluation",
    "No planned session": "Aucune séance planifiée",
    "Session summary": "Résumé de séance",
    "Mistakes noticed": "Erreurs observées",
    "Planned session objectives appear here before class. Evaluations appear after the teacher completes the session.":
      "Les objectifs des séances planifiées apparaissent ici avant le cours. Les évaluations apparaissent après que le professeur a terminé la séance.",

    "Report builder": "Créateur de rapport",
    "Edit the monthly summary blocks that appear in the PDF.":
      "Modifiez les blocs de résumé mensuel qui apparaissent dans le PDF.",
    "Export text": "Exporter le texte",
    "Save draft": "Enregistrer le brouillon",
    "Preparing PDF...": "Préparation du PDF...",
    "Download PDF": "Télécharger le PDF",
    "Monthly summary": "Résumé mensuel",
    "Strengths": "Points forts",
    "Areas to improve": "Axes d'amélioration",
    "Recommendations": "Recommandations",
    "Month": "Mois",
    "Status": "Statut",
    "Draft": "Brouillon",
    "Ready": "Prêt",
    "Sent": "Envoyé",
    "Generate report": "Générer un rapport",
    "Include charts": "Inclure les graphiques",
    "Add at least one evaluation first.": "Ajoutez d'abord au moins une évaluation.",
    "Generated teacher reports are available here for download.":
      "Les rapports générés par les professeurs sont disponibles ici en téléchargement.",
    "Download": "Télécharger",
    "Report": "Rapport",
    "Reports": "Rapports",
    "No reports.": "Aucun rapport.",
    "No reports yet.": "Aucun rapport pour le moment.",
    "No content.": "Aucun contenu.",

    "Teacher perspective": "Perspective professeur",
    "Teacher dashboard": "Tableau professeur",
    "Teacher": "Professeur",
    "Teachers": "Professeurs",
    "Admin teacher view": "Vue admin du professeur",
    "Manage courses": "Gérer les cours",
    "Manage account": "Gérer le compte",
    "Manage every account by role, and jump into the relevant workspace.":
      "Gérez chaque compte par rôle et ouvrez l'espace correspondant.",
    "All roles": "Tous les rôles",
    "Managed": "Géré",
    "Active students": "Élèves actifs",
    "Evaluations this month": "Évaluations ce mois-ci",
    "Sessions planned": "Séances planifiées",
    "Reports generated": "Rapports générés",
    "Recent evaluations": "Évaluations récentes",
    "Attention": "Attention",
    "Students with low ratings or priority criteria.":
      "Élèves avec notes faibles ou critères prioritaires.",
    "No priority items right now.": "Aucun élément prioritaire pour le moment.",
    "Search students...": "Rechercher des élèves...",
    "Search messages...": "Rechercher des messages...",
    "Search student...": "Rechercher un élève...",
    "Search": "Rechercher",

    "Parents": "Parents",
    "Parent": "Parent",
    "Student profile": "Profil élève",
    "No parent contact is linked to this student yet.":
      "Aucun contact parent n'est lié à cet élève.",
    "Message parent": "Écrire au parent",
    "First name": "Prénom",
    "Last name": "Nom",
    "Date of birth": "Date de naissance",
    "Course email": "E-mail de cours",
    "Address": "Adresse",
    "Save": "Enregistrer",
    "Saving...": "Enregistrement...",
    "Linked courses": "Cours liés",
    "Linked teachers": "Professeurs liés",
    "No parents linked.": "Aucun parent lié.",
    "No courses yet.": "Aucun cours pour le moment.",
    "No teachers yet.": "Aucun professeur pour le moment.",
    "Upcoming sessions": "Prochaines séances",
    "Your children": "Vos enfants",
    "DOB not set": "Date de naissance non renseignée",
    "Evaluation base": "Base d'évaluation",

    "Inbox": "Messagerie",
    "Cancel": "Annuler",
    "New message": "Nouveau message",
    "New shared message": "Nouveau message partagé",
    "New individual message": "Nouveau message individuel",
    "Recipient": "Destinataire",
    "Select user...": "Sélectionner un utilisateur...",
    "Subject": "Sujet",
    "Message": "Message",
    "Attach a report": "Joindre un rapport",
    "No attachment": "Aucune pièce jointe",
    "No messages.": "Aucun message.",
    "Download attached report": "Télécharger le rapport joint",

    "Profile": "Profil",
    "Full name": "Nom complet",
    "Change password": "Changer le mot de passe",
    "Current password": "Mot de passe actuel",
    "New password": "Nouveau mot de passe",
    "Min 8 chars": "8 caractères minimum",
    "Save changes": "Enregistrer les modifications",
    "Reset password": "Réinitialiser le mot de passe",
    "Set a new password": "Définir un nouveau mot de passe",
    "Reset token": "Jeton de réinitialisation",
    "Email": "E-mail",

    "New course": "Nouveau cours",
    "Name": "Nom",
    "Description": "Description",
    "Create": "Créer",
    "Create failed": "Échec de la création",
    "Delete": "Supprimer",
    "Enrolled students": "Élèves inscrits",
    "Add teacher...": "Ajouter un professeur...",
    "Enroll student...": "Inscrire un élève...",

    "Daily ledger": "Journal quotidien",
    "Download CSV": "Télécharger CSV",
    "No payments or expenses recorded": "Aucun paiement ni dépense enregistré",
    "Payments in": "Paiements entrants",
    "Expenses out": "Dépenses sortantes",
    "Net": "Net",
    "Total": "Total",
    "Payment": "Paiement",
    "Payments": "Paiements",
    "Expenses": "Dépenses",

    "Social relations": "Relations sociales",
    "My social reports": "Mes rapports sociaux",
    "No social reports yet.": "Aucun rapport social pour le moment.",
    "Create social report": "Créer un rapport social",
    "Open student": "Ouvrir l'élève",
  })
);

const originalText = new WeakMap<Text, string>();
const originalAttr = new WeakMap<Element, Map<string, string>>();

const ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);

function translateValue(value: string, language: string) {
  if (!value.trim()) return value;
  if (!language.toLowerCase().startsWith("fr")) return value;
  const trimmed = value.trim();
  const translated = TEXT.get(trimmed);
  if (!translated) return value;
  return value.replace(trimmed, translated);
}

function restoreOrTranslateText(node: Text, language: string) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName)) return;

  const original = originalText.get(node) || node.nodeValue || "";
  if (!originalText.has(node)) originalText.set(node, original);

  if (language.toLowerCase().startsWith("fr")) {
    const translated = translateValue(original, language);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  } else {
    if (node.nodeValue !== original) node.nodeValue = original;
  }
}

function restoreOrTranslateAttributes(element: Element, language: string) {
  ATTRIBUTES.forEach((attr) => {
    if (!element.hasAttribute(attr)) return;
    let originals = originalAttr.get(element);
    if (!originals) {
      originals = new Map();
      originalAttr.set(element, originals);
    }
    if (!originals.has(attr)) originals.set(attr, element.getAttribute(attr) || "");
    const original = originals.get(attr) || "";
    const next = language.toLowerCase().startsWith("fr")
      ? translateValue(original, language)
      : original;
    if (element.getAttribute(attr) !== next) element.setAttribute(attr, next);
  });
}

export function applyFrenchDomTranslations(language: string) {
  if (typeof document === "undefined") return;
  const root = document.body;
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    restoreOrTranslateText(node as Text, language);
    node = walker.nextNode();
  }

  root.querySelectorAll("*").forEach((element) => restoreOrTranslateAttributes(element, language));
}

export function observeFrenchDomTranslations(getLanguage: () => string) {
  if (typeof document === "undefined") return () => {};
  let frame = 0;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => applyFrenchDomTranslations(getLanguage()));
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES,
  });
  schedule();
  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
  };
}
