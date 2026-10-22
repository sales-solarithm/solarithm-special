'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { TopCommandBar } from '../src/components/TopCommandBar';
import { DeliverablesCanvas } from '../src/components/DeliverablesCanvas';
import { InspectorPanel } from '../src/components/InspectorPanel';
import { ProjectManagerModal } from '../src/components/ProjectManagerModal';
import { PdfPreviewModal } from '../src/components/PdfPreviewModal';
import { LightboxModal } from '../src/components/LightboxModal';
import type { ProjectState, SavedProject, CategoryDef, StoredImageItem } from '../src/lib/types';
import { CATEGORIES } from '../src/lib/types';
import { NOTES_LIBRARY } from '../src/lib/notesData';
import { generateReportPDF } from '../src/lib/reportPdf';
import {
  getAllProjects,
  saveProjectToIndexedDB,
  saveProject,
  deleteProject,
  storeImage,
  deleteImage,
  clearAllImages,
  getImage,
  exportProjectJson,
  importProjectJson,
} from '../src/lib/storage';

export const createInitialStudioState = (): ProjectState => ({
  fileName: '',
  logoDataUrl: null,
  solarithmLogoDataUrl: null,
  showLogo: true,
  showSolarithmBranding: false,

  showIntroPage: false,
  introClientName: '',
  introDate: new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  introNumPanels: '',
  introPanelBrand: '',
  introPanelWp: '',
  introInverter: '',
  introInverterBrand: '',
  introPlantCapacity: '',
  introTiltAngle: '',
  introEPCCompany: 'SOLARITHM Design & Engineering Consultancy',
  showClientName: true,
  showDate: true,
  showNumPanels: true,
  showPanelBrand: true,
  showPanelWp: true,
  showInverter: true,
  showInverterBrand: true,
  showPlantCapacity: true,
  showTiltAngle: true,
  showEPCCompany: true,

  shadowType: null,
  shadowPct: '',
  shadowTimes: [
    '21st JUN 9:30 AM',
    '21st JUN 3:30 PM',
    '21st DEC 9:30 AM',
    '21st DEC 3:30 PM',
  ],

  waterfall: 'no',

  nOn: false, nMM: '',
  eOn: false, eMM: '',
  wOn: false, wMM: '',
  sOn: false, sMM: '',

  tentative: false,
  ge: false,
  video: false,

  shiftOn: false,
  shiftItem: 'TANKS AND PIPES',
  shiftFrom: 'NORTH',
  shiftTo: 'SOUTH',

  trimOn: false,
  trimDir: 'NORTH',

  cleaning: false,

  noteOn: false,
  poValue: '',
  poCustom: '',
  rawNotes: '',
  convertedNotes: '',
  customNote: '',

  libraryNoteState: {},
  categoryOrder: CATEGORIES.map((c) => c.id),
  catAssignData: {},
  catOrderData: Object.fromEntries(CATEGORIES.map((c) => [c.id, []])),
  imgNameMap: {},
});

function extractClientName(filename: string): string {
  let name = filename.replace(/\.[^.]+$/, '');
  name = name.replace(/\d+$/, '').trim();
  return name.toUpperCase();
}

export default function StudioPage() {
  const [projectState, setProjectState] = useState<ProjectState>(createInitialStudioState);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('Untitled Submission');
  const [currentProjectCreatedAt, setCurrentProjectCreatedAt] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'drafting' | 'cloud' | 'saved_now'>('drafting');

  // Active Category Assign Mode
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  // Loaded Images Pool in memory & IndexedDB
  const [images, setImages] = useState<StoredImageItem[]>([]);

  // Categories list
  const [categories, setCategories] = useState<CategoryDef[]>(CATEGORIES);

  // Modals
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // PDF Preview State
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);
  const [pdfPreviewFilename, setPdfPreviewFilename] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Sync category order when state changes
  useEffect(() => {
    if (projectState.categoryOrder && projectState.categoryOrder.length > 0) {
      const ordered: CategoryDef[] = [];
      projectState.categoryOrder.forEach((id) => {
        const found = CATEGORIES.find((c) => c.id === id);
        if (found) ordered.push(found);
      });
      CATEGORIES.forEach((c) => {
        if (!ordered.some((o) => o.id === c.id)) ordered.push(c);
      });
      setCategories(ordered);
    }
  }, [projectState.categoryOrder]);

  // Load saved projects list on mount
  useEffect(() => {
    getAllProjects()
      .then((projs) => setSavedProjects(projs))
      .catch((err) => console.error('Failed to load projects from storage:', err));
  }, []);

  const updateProjectState = useCallback((patch: Partial<ProjectState>) => {
    setProjectState((prev) => ({ ...prev, ...patch }));
    setSyncStatus('drafting');
  }, []);

  // Upload renders
  const handleUploadFiles = async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!fileArray.length) return;

    fileArray.sort((a, b) => a.name.localeCompare(b.name));
    const newItems: StoredImageItem[] = [];
    let firstAdded = false;

    for (const f of fileArray) {
      try {
        const stored = await storeImage(f);
        newItems.push({
          id: stored.id,
          name: stored.name,
          dataUrl: stored.dataUrl,
          size: stored.size,
          mimeType: f.type,
        });

        if (!projectState.fileName && !firstAdded) {
          firstAdded = true;
          const extracted = extractClientName(f.name);
          updateProjectState({
            fileName: extracted,
            introClientName: projectState.introClientName || extracted,
          });
          if (currentProjectName === 'Untitled Submission') {
            setCurrentProjectName(extracted);
          }
        }
      } catch (err) {
        console.error('Failed to store render in IndexedDB:', err);
      }
    }

    setImages((prev) => [...prev, ...newItems]);
    showToast(`Loaded ${newItems.length} layout render${newItems.length !== 1 ? 's' : ''}`);
  };

  const handleClearAllImages = async () => {
    await clearAllImages();
    setImages([]);
    updateProjectState({
      catAssignData: {},
      catOrderData: Object.fromEntries(CATEGORIES.map((c) => [c.id, []])),
    });
    setActiveCatId(null);
    showToast('Image pool cleared');
  };

  const handleRemoveImage = async (id: string) => {
    await deleteImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));

    const prevCat = projectState.catAssignData[id];
    const newCatAssign = { ...projectState.catAssignData };
    delete newCatAssign[id];

    const newCatOrder = { ...projectState.catOrderData };
    if (prevCat && newCatOrder[prevCat]) {
      newCatOrder[prevCat] = newCatOrder[prevCat].filter((item) => item !== id);
    }

    updateProjectState({
      catAssignData: newCatAssign,
      catOrderData: newCatOrder,
    });
  };

  const handleAssignImage = (id: string) => {
    if (!activeCatId) return;

    const prevCat = projectState.catAssignData[id];
    if (prevCat === activeCatId) {
      handleUnassignImage(id);
      return;
    }

    const newCatAssign = { ...projectState.catAssignData, [id]: activeCatId };
    const newCatOrder = { ...projectState.catOrderData };

    if (prevCat && newCatOrder[prevCat]) {
      newCatOrder[prevCat] = newCatOrder[prevCat].filter((item) => item !== id);
    }

    if (!newCatOrder[activeCatId]) {
      newCatOrder[activeCatId] = [];
    }
    if (!newCatOrder[activeCatId].includes(id)) {
      newCatOrder[activeCatId] = [...newCatOrder[activeCatId], id];
    }

    updateProjectState({
      catAssignData: newCatAssign,
      catOrderData: newCatOrder,
    });
  };

  const handleUnassignImage = (id: string) => {
    const prevCat = projectState.catAssignData[id];
    const newCatAssign = { ...projectState.catAssignData };
    delete newCatAssign[id];

    const newCatOrder = { ...projectState.catOrderData };
    if (prevCat && newCatOrder[prevCat]) {
      newCatOrder[prevCat] = newCatOrder[prevCat].filter((item) => item !== id);
    }

    updateProjectState({
      catAssignData: newCatAssign,
      catOrderData: newCatOrder,
    });
  };

  const handleReorderCategories = (newCats: CategoryDef[]) => {
    setCategories(newCats);
    updateProjectState({ categoryOrder: newCats.map((c) => c.id) });
  };

  const handleUploadClientLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateProjectState({
        logoDataUrl: e.target?.result as string,
        showLogo: true,
      });
      showToast('Client drawing logo attached');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSolarithmLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateProjectState({
        solarithmLogoDataUrl: e.target?.result as string,
        showSolarithmBranding: true,
      });
      showToast('Closing page logo attached');
    };
    reader.readAsDataURL(file);
  };

  const catCounts: Record<string, number> = {};
  categories.forEach((c) => (catCounts[c.id] = 0));
  Object.values(projectState.catAssignData).forEach((cid) => {
    if (cid && catCounts[cid] !== undefined) {
      catCounts[cid] += 1;
    }
  });

  const imageResolver = async (idOrSrc: string): Promise<string | null> => {
    if (!idOrSrc) return null;
    if (idOrSrc.startsWith('data:') || idOrSrc.startsWith('blob:')) return idOrSrc;
    const found = images.find((i) => i.id === idOrSrc);
    if (found?.dataUrl) return found.dataUrl;
    try {
      const dbImg = await getImage(idOrSrc);
      if (dbImg?.dataUrl) return dbImg.dataUrl;
    } catch (e) {
      console.warn('Image lookup failed:', idOrSrc, e);
    }
    return null;
  };

  const handleGeneratePdf = async () => {
    const assignedCount = Object.keys(projectState.catAssignData).length;
    if (assignedCount === 0 && !projectState.showIntroPage && !projectState.noteOn) {
      showToast('Please map drawings to deliverables or enable Introduction / Notes slide.', true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      if (pdfPreviewBlobUrl) {
        URL.revokeObjectURL(pdfPreviewBlobUrl);
      }
      const result = await generateReportPDF(projectState, imageResolver, { returnOnly: true });
      setPdfPreviewBlobUrl(result.blobUrl);
      setPdfPreviewFilename(result.filename);
      setPdfPageCount(result.pageCount);
      setIsPdfPreviewOpen(true);
      showToast(`✓ Compiled ${result.pageCount}-page engineering submission report!`);
    } catch (err: unknown) {
      console.error('PDF Generation Error:', err);
      showToast(err instanceof Error ? err.message : 'Error compiling PDF report', true);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleClosePdfPreview = () => {
    setIsPdfPreviewOpen(false);
    if (pdfPreviewBlobUrl) {
      URL.revokeObjectURL(pdfPreviewBlobUrl);
      setPdfPreviewBlobUrl(null);
    }
  };

  const handleSaveCurrent = async () => {
    try {
      const id = currentProjectId || `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      
      // Compute preview thumbnail from first assigned image, first render, or client logo
      const firstAssignedId = Object.keys(projectState.catAssignData || {})[0];
      const thumbImg = (firstAssignedId ? images.find((img) => img.id === firstAssignedId) : null) || images[0];
      const thumbnail = thumbImg?.dataUrl || projectState.logoDataUrl || undefined;

      const proj: SavedProject = {
        id,
        name: currentProjectName || 'Untitled Submission',
        title: currentProjectName || 'Untitled Submission',
        createdAt: currentProjectCreatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail,
        images: images.map((img) => ({
          id: img.id,
          name: img.name,
          dataUrl: img.dataUrl,
          size: img.size,
          mimeType: img.mimeType,
        })),
        state: {
          ...projectState,
          fileName: currentProjectName,
        },
      };

      await saveProjectToIndexedDB(proj);

      setCurrentProjectId(id);
      setCurrentProjectCreatedAt(proj.createdAt);
      setSavedProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        return [proj, ...filtered];
      });

      setSyncStatus('saved_now');
      showToast('Project saved successfully');
    } catch (err: unknown) {
      console.error('Save Project Error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown storage error occurred';
      showToast(`Failed to save project: ${msg}`, true);
    }
  };

  const handleSaveAs = async (name: string) => {
    try {
      const id = `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const firstAssignedId = Object.keys(projectState.catAssignData || {})[0];
      const thumbImg = (firstAssignedId ? images.find((img) => img.id === firstAssignedId) : null) || images[0];
      const thumbnail = thumbImg?.dataUrl || projectState.logoDataUrl || undefined;

      const newProj: SavedProject = {
        id,
        name,
        title: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail,
        images: images.map((img) => ({
          id: img.id,
          name: img.name,
          dataUrl: img.dataUrl,
          size: img.size,
          mimeType: img.mimeType,
        })),
        state: {
          ...projectState,
          fileName: name,
        },
      };

      await saveProjectToIndexedDB(newProj);

      setCurrentProjectId(id);
      setCurrentProjectName(name);
      setCurrentProjectCreatedAt(newProj.createdAt);
      setSavedProjects((prev) => [newProj, ...prev.filter((p) => p.id !== id)]);
      setSyncStatus('saved_now');
      showToast('Project saved successfully');
    } catch (err: unknown) {
      console.error('Save As Error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown storage error occurred';
      showToast(`Failed to save project: ${msg}`, true);
    }
  };

  const handleLoadProject = (proj: SavedProject) => {
    try {
      setProjectState(proj.state);
      setCurrentProjectId(proj.id);
      setCurrentProjectName(proj.name);
      setCurrentProjectCreatedAt(proj.createdAt);
      if (proj.images && proj.images.length > 0) {
        setImages(proj.images);
      }
      setSyncStatus('synced');
      showToast(`Loaded: ${proj.name}`);
    } catch (err: unknown) {
      console.error('Load Project Error:', err);
      const msg = err instanceof Error ? err.message : 'Error restoring project';
      showToast(`Failed to load project: ${msg}`, true);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setCurrentProjectName('Untitled Submission');
      setSyncStatus('drafting');
    }
    showToast('Project deleted');
  };

  const handleRenameProject = async (id: string, newName: string) => {
    const proj = savedProjects.find((p) => p.id === id);
    if (!proj) return;
    const updated: SavedProject = {
      ...proj,
      name: newName,
      updatedAt: new Date().toISOString(),
    };
    await saveProject(updated);
    setSavedProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (currentProjectId === id) {
      setCurrentProjectName(newName);
    }
    showToast(`Renamed to: ${newName}`);
  };

  const handleExportProject = (proj?: SavedProject) => {
    const target = proj || {
      id: currentProjectId || 'temp',
      name: currentProjectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: projectState,
    };
    exportProjectJson(target);
    showToast(`Exported: ${target.name}`);
  };

  const handleImportProject = async (file: File) => {
    try {
      const imported = await importProjectJson(file);
      setSavedProjects((prev) => [imported, ...prev]);
      handleLoadProject(imported);
      showToast(`Imported: ${imported.name}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Import failed', true);
    }
  };

  const handleNewProject = () => {
    setProjectState(createInitialStudioState());
    setCurrentProjectId(null);
    setCurrentProjectName('Untitled Submission');
    setSyncStatus('drafting');
    showToast('Initialized new studio workspace');
  };

  return (
    <ThemeProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-[#0E0E10] text-zinc-900 dark:text-zinc-100 font-sans select-none antialiased">
        {/* 1. TOP COMMAND BAR */}
        <TopCommandBar
          projectName={currentProjectName}
          onProjectNameChange={(name) => {
            setCurrentProjectName(name);
            updateProjectState({ fileName: name });
          }}
          syncStatus={syncStatus}
          onSaveProject={handleSaveCurrent}
          onOpenProjects={() => setIsProjectsOpen(true)}
          onExportJson={() => handleExportProject()}
          onImportJson={handleImportProject}
          onGeneratePdf={handleGeneratePdf}
          isGeneratingPdf={isGeneratingPdf}
          assignedCount={Object.keys(projectState.catAssignData).length}
        />

        {/* 2 & 3. SPLIT-STAGE CAD WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left / Primary Stage (Deliverables Canvas & Image Pool) */}
          <DeliverablesCanvas
            images={images}
            catAssign={projectState.catAssignData}
            catOrder={projectState.catOrderData}
            categories={categories}
            activeCatId={activeCatId}
            onUploadFiles={handleUploadFiles}
            onClearAll={handleClearAllImages}
            onAssignImage={handleAssignImage}
            onUnassignImage={handleUnassignImage}
            onRemoveImage={handleRemoveImage}
            onPreviewImage={(url) => setLightboxUrl(url)}
            onStopAssign={() => setActiveCatId(null)}
          />

          {/* Right Inspector Panel (Specifications & Settings Drawer) */}
          <InspectorPanel
            state={projectState}
            onChange={updateProjectState}
            categories={categories}
            activeCatId={activeCatId}
            onSelectCategory={(id) => setActiveCatId(id)}
            onReorderCategories={handleReorderCategories}
            catCounts={catCounts}
            images={images}
            onUploadClientLogo={handleUploadClientLogo}
            onClearClientLogo={() => updateProjectState({ logoDataUrl: null })}
            onUploadSolarithmLogo={handleUploadSolarithmLogo}
            onClearSolarithmLogo={() => updateProjectState({ solarithmLogoDataUrl: null })}
          />
        </div>

        {/* Project Management Modal */}
        <ProjectManagerModal
          isOpen={isProjectsOpen}
          onClose={() => setIsProjectsOpen(false)}
          projects={savedProjects}
          currentProjectId={currentProjectId}
          onNewProject={handleNewProject}
          onSaveCurrent={handleSaveCurrent}
          onSaveAs={handleSaveAs}
          onLoadProject={handleLoadProject}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onExportProject={handleExportProject}
          onImportProject={handleImportProject}
        />

        {/* PDF Preview Modal */}
        <PdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={handleClosePdfPreview}
          blobUrl={pdfPreviewBlobUrl}
          filename={pdfPreviewFilename || `${currentProjectName}.pdf`}
          pageCount={pdfPageCount}
        />

        {/* Image Zoom Lightbox */}
        <LightboxModal
          isOpen={!!lightboxUrl}
          onClose={() => setLightboxUrl(null)}
          imageUrl={lightboxUrl}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all animate-in slide-in-from-bottom-2 flex items-center gap-2 ${
              toast.isError
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-[#D4AF37] text-zinc-950 shadow-lg shadow-[#D4AF37]/30 border border-[#B89328]/40'
            }`}
          >
            {!toast.isError && (
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-[#D4AF37] flex items-center justify-center text-[10px] font-black shrink-0">
                ✓
              </span>
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
