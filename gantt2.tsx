import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Calendar, Download, Upload, Trash2, 
  ChevronRight, ChevronLeft, Globe, Search, 
  MoreHorizontal, X, Save, Edit2, ZoomIn, ZoomOut,
  Link as LinkIcon, Flag, Target, ArrowRight,
  Users, UserPlus, User, AlertTriangle, FilePlus, PenLine,
  Maximize, Minimize, Info
} from 'lucide-react';

/**
 * UTILITIES
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getDaysArray = (start, end) => {
  const arr = [];
  for(let dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
      arr.push(new Date(dt));
  }
  return arr;
};

const diffInDays = (d1, d2) => {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
};

const getInitials = (name) => {
  return name ? name.substring(0, 2).toUpperCase() : '??';
};

/**
 * TRANSLATIONS
 */
const translations = {
  fr: {
    title: "ProGantt Studio 2026",
    newProject: "Nouveau Projet",
    newProjectConfirmTitle: "Nouveau Projet ?",
    newProjectConfirmText: "Attention : Tout le projet actuel sera effacé. Voulez-vous continuer ?",
    addTask: "Nouvelle Tâche",
    import: "Importer",
    export: "Exporter",
    search: "Rechercher...",
    days: "Jours",
    zoom: "Zoom",
    taskName: "Nom de la tâche",
    start: "Début",
    end: "Fin",
    progress: "Progression",
    actions: "Actions",
    editTask: "Modifier la tâche",
    createTask: "Créer une tâche",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    color: "Couleur",
    deleteConfirmTitle: "Confirmer la suppression",
    deleteConfirmText: "Voulez-vous vraiment supprimer cette tâche ? Cette action est irréversible.",
    emptyState: "Projet vide. Cliquez sur '+' pour démarrer.",
    uploadLabel: "Charger JSON",
    errorFile: "Erreur fichier",
    untitled: "Nouvelle tâche",
    isMilestone: "Jalon",
    dependency: "Prédécesseur",
    none: "Aucun",
    today: "Aujourd'hui",
    scrollToToday: "Aller à aujourd'hui",
    team: "Équipe",
    manageTeam: "Gérer l'équipe",
    addMember: "Ajouter membre",
    assignee: "Assigné à",
    noAssignee: "Non assigné",
    namePlaceholder: "Nom du membre",
    remove: "Retirer",
    confirm: "Confirmer",
    projectNamePlaceholder: "Nom du projet...",
    fullScreen: "Plein écran",
    exitFullScreen: "Quitter plein écran",
    fullScreenError: "Le mode plein écran n'est pas autorisé dans cet environnement.",
    tutorial: "Aide / Tuto",
    tutoNext: "Suivant",
    tutoPrev: "Précédent",
    tutoClose: "Fermer le guide",
    tutoSteps: [
      { title: "Bienvenue sur ProGantt", content: "Découvrez comment gérer vos projets efficacement avec cet outil complet. Suivez ce guide rapide pour maîtriser l'interface." },
      { title: "Créer et Éditer", content: "Utilisez le bouton '+' pour ajouter une tâche ou un jalon. Cliquez sur n'importe quelle ligne dans la liste ou sur le graphique pour modifier les détails." },
      { title: "Dépendances Intelligentes", content: "Liez les tâches entre elles (Prédécesseurs). Si une tâche parente bouge, les tâches suivantes se décalent automatiquement pour garder votre planning cohérent." },
      { title: "Gestion d'Équipe", content: "Cliquez sur le bouton 'Équipe' pour ajouter des membres. Assignez-les ensuite aux tâches pour voir leurs avatars sur le diagramme." },
      { title: "Sauvegarde & Export", content: "Vos données sont locales. Utilisez les boutons Import/Export (flèches) pour sauvegarder votre projet en fichier JSON et le partager." },
      { title: "Navigation", content: "Utilisez le zoom pour ajuster la vue (Jours/Semaines) et le bouton 'Aujourd'hui' pour revenir rapidement à la date actuelle." }
    ]
  },
  en: {
    title: "ProGantt Studio 2026",
    newProject: "New Project",
    newProjectConfirmTitle: "Start New Project?",
    newProjectConfirmText: "Warning: Current project will be cleared. Continue?",
    addTask: "New Task",
    import: "Import",
    export: "Export",
    search: "Search...",
    days: "Days",
    zoom: "Zoom",
    taskName: "Task Name",
    start: "Start",
    end: "End",
    progress: "Progress",
    actions: "Actions",
    editTask: "Edit Task",
    createTask: "Create Task",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    color: "Color",
    deleteConfirmTitle: "Confirm Deletion",
    deleteConfirmText: "Are you sure you want to delete this task? This action cannot be undone.",
    emptyState: "Empty project. Click '+' to start.",
    uploadLabel: "Upload JSON",
    errorFile: "File Error",
    untitled: "Untitled Task",
    isMilestone: "Milestone",
    dependency: "Predecessor",
    none: "None",
    today: "Today",
    scrollToToday: "Go to Today",
    team: "Team",
    manageTeam: "Manage Team",
    addMember: "Add Member",
    assignee: "Assignee",
    noAssignee: "Unassigned",
    namePlaceholder: "Member Name",
    remove: "Remove",
    confirm: "Confirm",
    projectNamePlaceholder: "Project Name...",
    fullScreen: "Full Screen",
    exitFullScreen: "Exit Full Screen",
    fullScreenError: "Full screen mode is not allowed in this environment.",
    tutorial: "Help / Tutorial",
    tutoNext: "Next",
    tutoPrev: "Previous",
    tutoClose: "Close Guide",
    tutoSteps: [
      { title: "Welcome to ProGantt", content: "Discover how to manage your projects efficiently. Follow this quick guide to master the interface." },
      { title: "Create & Edit", content: "Use the '+' button to add a task or milestone. Click on any row in the list or chart to edit details." },
      { title: "Smart Dependencies", content: "Link tasks together (Predecessors). If a parent task moves, dependent tasks automatically shift to keep your schedule consistent." },
      { title: "Team Management", content: "Click the 'Team' button to add members. Assign them to tasks to see their avatars on the chart." },
      { title: "Save & Export", content: "Your data is local. Use the Import/Export buttons (arrows) to save your project as a JSON file and share it." },
      { title: "Navigation", content: "Use the zoom slider to adjust the view and the 'Today' button to quickly jump to the current date." }
    ]
  }
};

/**
 * MAIN COMPONENT
 */
const App = () => {
  // --- STATE ---
  const [lang, setLang] = useState('fr');
  const t = translations[lang];
  const [columnWidth, setColumnWidth] = useState(45); 
  const [rowHeight] = useState(50); 
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Project Name State
  const [projectName, setProjectName] = useState("Projet Erasmus+ KA2 2026");

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Initial Data - Complete Lifecycle of a Project
  const [tasks, setTasks] = useState([
    // PHASE 1: MONTAGE (Jan - Fév)
    { id: '1_needs', name: 'Analyse besoins & Idéation', start: '2026-01-05', end: '2026-01-12', progress: 100, color: '#94a3b8', type: 'task', dependency: null, assignee: 'm1' },
    { id: '2_partners', name: 'Recherche & Constitution Consortium', start: '2026-01-13', end: '2026-01-25', progress: 100, color: '#64748b', type: 'task', dependency: '1_needs', assignee: 'm1' },
    { id: '3_writing', name: 'Co-rédaction du Dossier KA2', start: '2026-01-26', end: '2026-02-20', progress: 80, color: '#3b82f6', type: 'task', dependency: '2_partners', assignee: 'm2' },
    { id: '4_submit', name: 'Jalon : Soumission Agence Nationale', start: '2026-02-20', end: '2026-02-20', progress: 0, color: '#ef4444', type: 'milestone', dependency: '3_writing', assignee: 'm1' },
    
    // PHASE 2: ATTENTE & CONTRACTUALISATION (Mars - Mai)
    { id: '5_waiting', name: 'Instruction / Attente Réponse', start: '2026-02-21', end: '2026-05-20', progress: 15, color: '#cbd5e1', type: 'task', dependency: '4_submit', assignee: null },
    { id: '6_results', name: 'Jalon : Notification Résultats', start: '2026-05-21', end: '2026-05-21', progress: 0, color: '#f59e0b', type: 'milestone', dependency: '5_waiting', assignee: 'm1' },
    { id: '7_contract', name: 'Signature Convention Financière', start: '2026-05-22', end: '2026-06-05', progress: 0, color: '#10b981', type: 'task', dependency: '6_results', assignee: 'm1' },

    // PHASE 3: LANCEMENT (Juin - Juillet)
    { id: '8_select', name: 'Appel & Sélection Participants', start: '2026-06-06', end: '2026-06-25', progress: 0, color: '#8b5cf6', type: 'task', dependency: '7_contract', assignee: 'm2' },
    { id: '9_prep', name: 'Préparation Pédago. & Logistique', start: '2026-06-26', end: '2026-07-10', progress: 0, color: '#6366f1', type: 'task', dependency: '8_select', assignee: 'm3' },
    { id: '10_kickoff', name: 'TPM 1 : Kick-off (Lancement)', start: '2026-07-15', end: '2026-07-15', progress: 0, color: '#ef4444', type: 'milestone', dependency: '9_prep', assignee: 'm1' },
    
    // PHASE 4: IMPLEMENTATION
    { id: '11_wp2', name: 'WP2: Production Intellectuelle', start: '2026-07-16', end: '2026-09-30', progress: 0, color: '#ec4899', type: 'task', dependency: '10_kickoff', assignee: 'm4' },
  ]);

  const [members, setMembers] = useState([
    { id: 'm1', name: 'Coord. (FR)', color: '#ef4444' },
    { id: 'm2', name: 'Partenaire 1 (IT)', color: '#3b82f6' },
    { id: 'm3', name: 'Partenaire 2 (DE)', color: '#8b5cf6' },
    { id: 'm4', name: 'Partenaire 3 (ES)', color: '#10b981' }
  ]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  
  // Generic Confirmation State { type: 'deleteTask' | 'newProject', payload: any }
  const [confirmation, setConfirmation] = useState(null);

  const [editingTask, setEditingTask] = useState(null);
  
  // Controlled Form State for Modal
  const [taskForm, setTaskForm] = useState({
    name: '', start: '', end: '', progress: 0, color: '#3b82f6', type: 'task', dependency: 'none', assignee: 'none'
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for sync scrolling
  const headerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const appContainerRef = useRef(null);

  // --- DERIVED STATE ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, searchQuery]);

  const { minDate, maxDate, daysArray, totalWidth } = useMemo(() => {
    let dates = tasks.flatMap(t => [new Date(t.start), new Date(t.end)]);
    if (dates.length === 0) dates = [new Date('2026-01-01')];
    else dates.push(new Date()); 
    
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    
    // Add buffer for better visualization
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 30);
    
    const arr = getDaysArray(min, max);
    const width = arr.length * columnWidth;
    return { minDate: min, maxDate: max, daysArray: arr, totalWidth: width };
  }, [tasks, columnWidth]);

  // --- INITIALIZE FORM ON OPEN ---
  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        setTaskForm({
          ...editingTask,
          dependency: editingTask.dependency || 'none',
          assignee: editingTask.assignee || 'none'
        });
      } else {
        setTaskForm({
          name: '', 
          start: formatDate(new Date('2026-01-05')), 
          end: formatDate(new Date('2026-01-05')), 
          progress: 0, 
          color: '#3b82f6', 
          type: 'task', 
          dependency: 'none', 
          assignee: 'none'
        });
      }
    }
  }, [isModalOpen, editingTask]);

  // --- HANDLERS ---

  const toggleFullScreen = async () => {
    try {
        if (!document.fullscreenElement) {
            if (appContainerRef.current.requestFullscreen) {
                await appContainerRef.current.requestFullscreen();
            } else if (appContainerRef.current.webkitRequestFullscreen) { /* Safari */
                await appContainerRef.current.webkitRequestFullscreen();
            } else if (appContainerRef.current.msRequestFullscreen) { /* IE11 */
                await appContainerRef.current.msRequestFullscreen();
            }
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                await document.msExitFullscreen();
            }
            setIsFullScreen(false);
        }
    } catch (err) {
        console.error("Erreur plein écran:", err);
        // Using a gentle alert or toast would be better, but alert is robust
        alert(t.fullScreenError);
    }
  };

  // Listen for fullscreen change event (e.g. user presses Esc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleScroll = (e) => {
    if (headerRef.current) {
      headerRef.current.style.transform = `translateX(-${e.target.scrollLeft}px)`;
    }
  };

  // Form Field Update with Intelligent Logic
  const updateForm = (field, value) => {
    setTaskForm(prev => {
      const next = { ...prev, [field]: value };
      
      // LOGIC: Dependency changed -> Start date = Parent End Date
      if (field === 'dependency') {
        if (value !== 'none') {
            const parent = tasks.find(t => t.id === value);
            if (parent) {
                next.start = parent.end;
                // Auto-push end date if it becomes invalid
                if (next.end < next.start) next.end = next.start;
            }
        }
      }
      
      // LOGIC: Start date changed -> Ensure End >= Start
      if (field === 'start') {
         if (next.end < value) {
             next.end = value;
         }
      }

      // Logic: Milestone force end=start
      if (field === 'type' && value === 'milestone') {
          next.end = next.start;
      }

      return next;
    });
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    
    // Final Validation
    let finalStart = taskForm.start;
    let finalEnd = taskForm.end;
    if (taskForm.type === 'milestone') finalEnd = finalStart;
    else if (finalEnd < finalStart) finalEnd = finalStart;

    const newTask = {
      id: editingTask ? editingTask.id : generateId(),
      name: taskForm.name || t.untitled,
      start: finalStart,
      end: finalEnd,
      progress: Math.min(100, Math.max(0, Number(taskForm.progress))),
      color: taskForm.color,
      type: taskForm.type,
      dependency: taskForm.dependency === 'none' ? null : taskForm.dependency,
      assignee: taskForm.assignee === 'none' ? null : taskForm.assignee
    };

    setTasks(prevTasks => {
      // 1. Create a map for easy access
      const taskMap = new Map(prevTasks.map(t => [t.id, t]));
      
      // 2. Update/Add the saved task
      taskMap.set(newTask.id, newTask);

      // 3. Recursive Cascade Function
      const propagateDates = (parentId) => {
        const parent = taskMap.get(parentId);
        if (!parent) return;

        // Find tasks that depend on this parent
        const dependents = Array.from(taskMap.values()).filter(t => t.dependency === parentId);
        
        dependents.forEach(child => {
           // Check for overlap constraint: Child Start must be >= Parent End
           if (child.start < parent.end) {
              // Calculate current duration to preserve it
              const duration = diffInDays(child.start, child.end);
              
              const newStart = parent.end;
              
              // Calculate new end
              const d = new Date(newStart);
              d.setDate(d.getDate() + duration);
              const newEnd = formatDate(d);

              const updatedChild = {
                 ...child,
                 start: newStart,
                 end: child.type === 'milestone' ? newStart : newEnd
              };
              
              // Update map and recurse
              taskMap.set(updatedChild.id, updatedChild);
              propagateDates(updatedChild.id);
           }
        });
      };

      // 4. Trigger cascade from the modified task
      propagateDates(newTask.id);

      return Array.from(taskMap.values());
    });
    
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleNewProjectRequest = () => {
     setConfirmation({ type: 'newProject' });
  };

  const requestDelete = (task, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setConfirmation({ type: 'deleteTask', payload: task });
  };

  const confirmAction = () => {
    if (!confirmation) return;

    if (confirmation.type === 'deleteTask') {
        const taskToDelete = confirmation.payload;
        setTasks(prevTasks => {
          const filtered = prevTasks.filter(t => t.id !== taskToDelete.id);
          return filtered.map(t => t.dependency === taskToDelete.id ? { ...t, dependency: null } : t);
        });
        if (editingTask && editingTask.id === taskToDelete.id) {
          setIsModalOpen(false);
          setEditingTask(null);
        }
    } else if (confirmation.type === 'newProject') {
        setTasks([]);
        setMembers([]);
        setProjectName("Nouveau Projet");
    }

    setConfirmation(null);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const name = e.target.memberName.value;
    if (name) {
      setMembers([...members, { id: generateId(), name, color: '#64748b' }]);
      e.target.reset();
    }
  };

  const handleRemoveMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    setTasks(prev => prev.map(t => t.assignee === id ? { ...t, assignee: null } : t));
  };

  const handleExport = () => {
    const exportData = { tasks, members, projectName };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.tasks) {
          setTasks(parsed.tasks);
          if (parsed.members) setMembers(parsed.members);
          if (parsed.projectName) setProjectName(parsed.projectName);
        } else if (Array.isArray(parsed)) setTasks(parsed);
      } catch (err) { alert(t.errorFile); }
    };
  };

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const todayDiff = diffInDays(minDate, new Date());
      const scrollPos = (todayDiff * columnWidth) - (scrollContainerRef.current.clientWidth / 2);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Tutorial Handlers
  const openTutorial = () => {
    setTutorialStep(0);
    setIsTutorialOpen(true);
  };

  const nextStep = () => {
    if (tutorialStep < t.tutoSteps.length - 1) setTutorialStep(s => s + 1);
    else setIsTutorialOpen(false);
  };

  const prevStep = () => {
    if (tutorialStep > 0) setTutorialStep(s => s - 1);
  };

  // Helper to get min start date based on dependency
  const getMinStartDate = () => {
      if (taskForm.dependency && taskForm.dependency !== 'none') {
          const parent = tasks.find(t => t.id === taskForm.dependency);
          return parent ? parent.end : null;
      }
      return null;
  };

  const renderConnections = () => {
    return filteredTasks.map(task => {
      if (!task.dependency) return null;
      const parent = filteredTasks.find(t => t.id === task.dependency);
      if (!parent) return null;

      const parentEndIndex = diffInDays(minDate, parent.end) + 1;
      const childStartIndex = diffInDays(minDate, task.start);
      const startX = (parentEndIndex * columnWidth) - (parent.type === 'milestone' ? columnWidth / 2 : 0);
      const endX = childStartIndex * columnWidth + (task.type === 'milestone' ? columnWidth / 2 : 0);
      
      const parentRowIndex = filteredTasks.indexOf(parent);
      const childRowIndex = filteredTasks.indexOf(task);
      const startY = (parentRowIndex * rowHeight) + (rowHeight / 2);
      const endY = (childRowIndex * rowHeight) + (rowHeight / 2);

      const finalEndX = task.type === 'milestone' ? endX - 12 : endX;
      const finalStartX = parent.type === 'milestone' ? startX + 12 : startX;
      
      let pathData = "";
      if (startX < endX) {
         pathData = `M ${finalStartX} ${startY} C ${finalStartX + 30} ${startY}, ${finalEndX - 30} ${endY}, ${finalEndX} ${endY}`;
      } else {
         pathData = `M ${finalStartX} ${startY} 
                     C ${finalStartX + 20} ${startY}, ${finalStartX + 20} ${startY + (endY > startY ? 20 : -20)}, ${finalStartX} ${startY + (endY > startY ? 20 : -20)}
                     L ${finalEndX - 20} ${endY}
                     C ${finalEndX - 20} ${endY}, ${finalEndX - 10} ${endY}, ${finalEndX} ${endY}`;
      }

      return (
        <g key={`${parent.id}-${task.id}`}>
          <path d={pathData} stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <polygon points={`${finalEndX},${endY} ${finalEndX-6},${endY-3} ${finalEndX-6},${endY+3}`} fill="#94a3b8" />
        </g>
      );
    });
  };

  const getAssigneeInfo = (id) => members.find(m => m.id === id);

  return (
    <div ref={appContainerRef} className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm z-30 relative">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Target size={20} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">{t.title}</h1>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="btn-icon text-slate-600 hover:bg-slate-100 p-2 rounded-full">
            <Globe size={18} />
          </button>
          
          <button 
             onClick={toggleFullScreen} 
             className="btn-icon text-slate-600 hover:bg-slate-100 p-2 rounded-full"
             title={isFullScreen ? t.exitFullScreen : t.fullScreen}
          >
             {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <button 
             onClick={openTutorial} 
             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
             title={t.tutorial}
          >
             <Info size={18} />
             <span className="hidden lg:inline">{t.tutorial}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <button onClick={handleNewProjectRequest} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors" title={t.newProject}>
            <FilePlus size={18} />
            <span className="hidden lg:inline">{t.newProject}</span>
          </button>

          <button onClick={() => setIsTeamModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors border border-slate-200 bg-white">
            <Users size={16} />
            <span className="hidden sm:inline">{t.team}</span>
          </button>

          <label className="cursor-pointer flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Upload size={18} />
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Download size={18} />
          </button>
          
          <button onClick={openNewTaskModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-200 transition-all ml-2">
            <Plus size={18} />
            <span className="hidden sm:inline">{t.addTask}</span>
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex-none bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder={t.search} value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
            />
          </div>
          <button onClick={scrollToToday} className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
            {t.today}
          </button>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="relative group flex items-center">
            <input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t.projectNamePlaceholder}
                className="bg-transparent font-bold text-slate-700 focus:outline-none focus:border-b-2 focus:border-indigo-500 transition-all w-40 sm:w-64 truncate text-sm sm:text-base py-1"
            />
            <PenLine size={14} className="text-slate-300 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setColumnWidth(Math.max(20, columnWidth - 10))} className="p-1 hover:bg-white rounded text-slate-500"><ZoomOut size={16} /></button>
            <input 
              type="range" min="20" max="150" value={columnWidth} 
              onChange={(e) => setColumnWidth(Number(e.target.value))}
              className="w-16 sm:w-24 mx-2 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button onClick={() => setColumnWidth(Math.min(150, columnWidth + 10))} className="p-1 hover:bg-white rounded text-slate-500"><ZoomIn size={16} /></button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LIST VIEW (Left) */}
        <div className="w-64 sm:w-80 flex-none flex flex-col border-r border-slate-200 bg-white z-10 shadow-lg">
          <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
            {t.taskName}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
             {filteredTasks.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">{t.emptyState}</div>
             ) : (
                filteredTasks.map((task) => {
                  const assignee = getAssigneeInfo(task.assignee);
                  return (
                    <div 
                      key={task.id} 
                      className="h-14 border-b border-slate-50 flex items-center justify-between px-3 hover:bg-indigo-50/30 group transition-colors cursor-pointer"
                      onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                      style={{ height: rowHeight }}
                    >
                      <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                        <div className={`w-1.5 h-8 rounded-full flex-none ${task.type === 'milestone' ? 'rotate-45 scale-50' : ''}`} style={{ backgroundColor: task.color }}></div>
                        <div className="flex flex-col truncate flex-1">
                          <span className="text-sm font-medium text-slate-700 truncate">{task.name}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-slate-400 font-mono">{task.start}</span>
                             {assignee && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-full border border-slate-200 truncate max-w-[80px]">
                                   {assignee.name}
                                </span>
                             )}
                          </div>
                        </div>
                      </div>
                      <button 
                         className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-50"
                         onClick={(e) => requestDelete(task, e)}
                         title={t.delete}
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
             )}
          </div>
        </div>

        {/* GANTT CHART (Right) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
          
          {/* Calendar Header - Sync Fixed */}
          <div className="h-10 flex-none bg-white border-b border-slate-200 overflow-hidden relative shadow-sm z-10">
             <div 
               ref={headerRef}
               className="absolute top-0 left-0 h-full flex" 
               style={{ width: totalWidth }}
             >
                {daysArray.map((date, i) => (
                  <div 
                    key={i} 
                    className={`flex-none border-r border-slate-100 flex flex-col items-center justify-center text-xs ${
                      date.getDay() === 0 || date.getDay() === 6 ? 'bg-slate-50 text-slate-400' : 'text-slate-600'
                    }`}
                    style={{ width: columnWidth }}
                  >
                    <span className="font-bold">{date.getDate()}</span>
                    <span className="text-[9px] uppercase opacity-70">{date.toLocaleDateString(lang, { weekday: 'narrow' })}</span>
                  </div>
                ))}
             </div>
          </div>

          <div 
            className="flex-1 overflow-auto relative scrollbar-thin select-none" 
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
             <div className="relative min-h-full" style={{ width: totalWidth, height: Math.max(filteredTasks.length * rowHeight, 300) }}>
                
                {/* Grid */}
                <div className="absolute inset-0 flex pointer-events-none z-0">
                  {daysArray.map((date, i) => (
                    <div 
                      key={i} 
                      className={`flex-none border-r border-slate-100/60 h-full ${
                        date.getDay() === 0 || date.getDay() === 6 ? 'bg-slate-100/30' : ''
                      }`}
                      style={{ width: columnWidth }}
                    ></div>
                  ))}
                  {(() => {
                    const todayDiff = diffInDays(minDate, new Date());
                    if (todayDiff >= 0 && todayDiff * columnWidth < totalWidth) {
                      return (
                        <div className="absolute top-0 bottom-0 border-l border-red-400 border-dashed z-0 pointer-events-none" style={{ left: todayDiff * columnWidth + (columnWidth/2) }}></div>
                      )
                    }
                  })()}
                </div>

                <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
                   {renderConnections()}
                </svg>

                <div className="relative z-10 pt-0">
                  {filteredTasks.map((task) => {
                    const offsetDays = diffInDays(minDate, task.start);
                    const durationDays = diffInDays(task.start, task.end) + 1;
                    const left = offsetDays * columnWidth;
                    const width = durationDays * columnWidth;
                    const assignee = getAssigneeInfo(task.assignee);
                    
                    return (
                      <div 
                        key={task.id} 
                        className="relative w-full border-b border-slate-50/50 hover:bg-slate-100/50 transition-colors"
                        style={{ height: rowHeight }}
                      >
                         {task.type === 'milestone' ? (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rotate-45 border-2 border-white shadow-md group cursor-pointer hover:scale-110 transition-transform z-20"
                              style={{ left: left + (columnWidth/2) - 12, backgroundColor: task.color }}
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                            >
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                  {task.name}
                               </div>
                            </div>
                         ) : (
                           <div 
                              className="absolute h-9 top-1/2 -translate-y-1/2 rounded-lg shadow-sm border border-white/20 group cursor-pointer hover:shadow-lg transition-all flex items-center overflow-visible z-10"
                              style={{ 
                                left: Math.max(0, left), 
                                width: Math.max(columnWidth, width),
                                backgroundColor: task.color
                              }}
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                           >
                              <div className="h-full bg-black/10 absolute left-0 top-0 rounded-l-lg" style={{ width: `${task.progress}%` }}></div>
                              <div className="relative z-10 flex items-center justify-between w-full px-2">
                                <span className="text-white text-xs font-semibold drop-shadow-md">{task.progress}%</span>
                                {assignee && (
                                  <div className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-slate-700 flex items-center justify-center shadow-sm" title={assignee.name}>
                                    {getInitials(assignee.name)}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-9 left-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                                  <span className="font-bold">{task.name}</span> <br/>
                                  <span className="opacity-75">{diffInDays(task.start, task.end)+1} {t.days}</span>
                               </div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* --- TASK MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-none">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {editingTask ? <Edit2 size={18} /> : <Plus size={18} />}
                {editingTask ? t.editTask : t.createTask}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Type Switch */}
              <div className="flex gap-4 p-1 bg-slate-100 rounded-lg w-max">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all">
                    <input 
                        type="radio" 
                        name="type" 
                        value="task" 
                        checked={taskForm.type === 'task'} 
                        onChange={(e) => updateForm('type', e.target.value)}
                        className="hidden" 
                    />
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium text-slate-700">Tâche</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all">
                    <input 
                        type="radio" 
                        name="type" 
                        value="milestone" 
                        checked={taskForm.type === 'milestone'} 
                        onChange={(e) => updateForm('type', e.target.value)}
                        className="hidden" 
                    />
                    <div className="w-2 h-2 rotate-45 bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-700">{t.isMilestone}</span>
                  </label>
              </div>

              <div>
                  <label className="label-text">{t.taskName}</label>
                  <input 
                    name="name" 
                    value={taskForm.name} 
                    onChange={(e) => updateForm('name', e.target.value)}
                    required 
                    autoFocus 
                    className="input-field" 
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-text">{t.start}</label>
                    <input 
                        name="start" 
                        type="date" 
                        value={taskForm.start} 
                        onChange={(e) => updateForm('start', e.target.value)}
                        required 
                        min={getMinStartDate()} // Constrain input based on dependency
                        className="input-field" 
                    />
                </div>
                <div>
                    <label className="label-text">{t.end}</label>
                    <input 
                        name="end" 
                        type="date" 
                        value={taskForm.end} 
                        onChange={(e) => updateForm('end', e.target.value)}
                        disabled={taskForm.type === 'milestone'}
                        className="input-field disabled:opacity-50" 
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="label-text">{t.dependency}</label>
                    <select 
                        name="dependency" 
                        value={taskForm.dependency} 
                        onChange={(e) => updateForm('dependency', e.target.value)}
                        className="input-field appearance-none"
                    >
                        <option value="none">{t.none}</option>
                        {tasks.filter(t => t.id !== editingTask?.id).map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                 </div>
                 <div>
                    <label className="label-text">{t.assignee}</label>
                    <select 
                        name="assignee" 
                        value={taskForm.assignee} 
                        onChange={(e) => updateForm('assignee', e.target.value)}
                        className="input-field appearance-none"
                    >
                        <option value="none">{t.noAssignee}</option>
                        {members.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="label-text">{t.progress} (%)</label>
                    <input 
                        name="progress" 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={taskForm.progress} 
                        onChange={(e) => updateForm('progress', e.target.value)}
                        className="input-field" 
                    />
                </div>
                 <div>
                    <label className="label-text">{t.color}</label>
                    <div className="flex gap-2 mt-1">
                       {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                         <label key={c} className="cursor-pointer">
                            <input 
                                type="radio" 
                                name="color" 
                                value={c} 
                                checked={taskForm.color === c} 
                                onChange={(e) => updateForm('color', e.target.value)}
                                className="hidden peer" 
                            />
                            <div className="w-8 h-8 rounded-full bg-current border-2 border-transparent peer-checked:border-slate-800 peer-checked:scale-110 transition-all shadow-sm" style={{color: c}}></div>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-2">
                 {editingTask && (
                    <button type="button" onClick={(e) => requestDelete(editingTask, e)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Trash2 size={16} /> <span className="hidden sm:inline">{t.delete}</span>
                    </button>
                 )}
                 <div className="flex gap-3 ml-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-4 py-2 rounded-lg">{t.cancel}</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                      <Save size={16} /> {t.save}
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TUTORIAL MODAL --- */}
      {isTutorialOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Header with Progress */}
              <div className="bg-indigo-600 px-6 py-6 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-20"><Info size={100} /></div>
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">{t.tutorial}</h3>
                    <p className="text-indigo-100 text-sm">Étape {tutorialStep + 1} sur {t.tutoSteps.length}</p>
                 </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                 <h4 className="text-xl font-bold text-slate-800 mb-3">{t.tutoSteps[tutorialStep].title}</h4>
                 <p className="text-slate-600 leading-relaxed">{t.tutoSteps[tutorialStep].content}</p>
                 
                 {/* Visual Indicators (Dots) */}
                 <div className="flex gap-2 mt-6 mb-2 justify-center">
                    {t.tutoSteps.map((_, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === tutorialStep ? 'bg-indigo-600 w-6' : 'bg-slate-200'}`}></div>
                    ))}
                 </div>
              </div>

              {/* Footer Buttons */}
              <div className="bg-slate-50 px-6 py-4 flex justify-between border-t border-slate-100">
                 {tutorialStep > 0 ? (
                    <button onClick={prevStep} className="px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                       {t.tutoPrev}
                    </button>
                 ) : (
                    <button onClick={() => setIsTutorialOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm">
                       {t.tutoClose}
                    </button>
                 )}
                 
                 <button onClick={nextStep} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-all flex items-center gap-2">
                    {tutorialStep < t.tutoSteps.length - 1 ? t.tutoNext : t.tutoClose}
                    {tutorialStep < t.tutoSteps.length - 1 && <ArrowRight size={16} />}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL (For both Delete and New Project) --- */}
      {confirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 text-center">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-red-600" size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {confirmation.type === 'deleteTask' ? t.deleteConfirmTitle : t.newProjectConfirmTitle}
                 </h3>
                 <p className="text-sm text-slate-500 mb-6">
                    {confirmation.type === 'deleteTask' ? t.deleteConfirmText : t.newProjectConfirmText}
                 </p>
                 <div className="flex gap-3 justify-center">
                    <button onClick={() => setConfirmation(null)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                       {t.cancel}
                    </button>
                    <button onClick={confirmAction} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-lg shadow-red-200 transition-colors">
                       {t.confirm}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- TEAM MODAL --- */}
      {isTeamModalOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-800">{t.manageTeam}</h3>
                  <button onClick={() => setIsTeamModalOpen(false)}><X size={18} className="text-slate-400" /></button>
               </div>
               <div className="p-5">
                  <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
                     <input name="memberName" placeholder={t.namePlaceholder} className="input-field flex-1" required autoFocus />
                     <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><UserPlus size={18}/></button>
                  </form>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                     {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">{getInitials(m.name)}</div>
                              <span className="text-sm font-medium">{m.name}</span>
                           </div>
                           <button onClick={() => handleRemoveMember(m.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          background-color: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .label-text {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default App;
