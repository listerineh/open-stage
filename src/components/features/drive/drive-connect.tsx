'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HardDrive,
  FolderOpen,
  Check,
  Loader2,
  Unlink,
  Plus,
  ChevronRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Band } from '@/types/database';

interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

interface DriveConnectProps {
  band: Band;
  onUpdate: (band: Band) => void;
}

export function DriveConnect({ band, onUpdate }: DriveConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Mi Drive' },
  ]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [savingFolder, setSavingFolder] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Check URL params on initial render to determine if we should show folder picker
  const shouldShowPickerFromUrl =
    typeof window !== 'undefined' &&
    (() => {
      const params = new URLSearchParams(window.location.search);
      return params.get('drive') === 'connected' && params.get('step') === 'select_folder';
    })();

  // Initialize showFolderPicker based on URL
  const [showFolderPickerInitialized] = useState(() => {
    if (shouldShowPickerFromUrl) {
      // Clean URL
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
        }, 100);
      }
      return true;
    }
    return false;
  });

  // Use the initialized value or the state
  const actualShowFolderPicker = showFolderPickerInitialized || showFolderPicker;

  const isConnected = !!band.drive_folder_id;
  const hasLoadedRef = useRef(false);

  const loadFolders = useCallback(async (parentId: string) => {
    setLoadingFolders(true);
    try {
      const response = await fetch(`/api/drive/folders?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.files || []);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
    setLoadingFolders(false);
  }, []);

  // Load folders on mount if showing picker
  useEffect(() => {
    if (actualShowFolderPicker && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // Use requestAnimationFrame to defer the state update
      requestAnimationFrame(() => {
        loadFolders('root');
      });
    }
  }, [actualShowFolderPicker, loadFolders]);

  const handleConnect = () => {
    setIsConnecting(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/callback/google-drive`;
    const scope = 'https://www.googleapis.com/auth/drive.file';
    const state = band.slug; // Pass band slug to identify on callback

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  };

  const handleDisconnect = async () => {
    if (
      !confirm('¿Estás seguro de desconectar Google Drive? Los clips guardados seguirán en Drive.')
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/drive/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId: band.id }),
      });

      if (response.ok) {
        onUpdate({
          ...band,
          drive_folder_id: null,
          drive_folder_name: null,
          drive_connected_at: null,
          drive_connected_by: null,
        });
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    setIsDisconnecting(false);
  };

  const navigateToFolder = (folder: DriveFolder) => {
    setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
    loadFolders(folder.id);
    setSelectedFolder(null);
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      loadFolders(newPath[newPath.length - 1].id);
      setSelectedFolder(null);
    }
  };

  const handleSelectFolder = (folder: DriveFolder) => {
    setSelectedFolder(folder);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const parentId = currentPath[currentPath.length - 1].id;
      const response = await fetch('/api/drive/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: parentId === 'root' ? null : parentId,
        }),
      });

      if (response.ok) {
        const folder = await response.json();
        setFolders([...folders, folder]);
        setNewFolderName('');
        setSelectedFolder(folder);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
    setCreatingFolder(false);
  };

  const handleSaveFolder = async () => {
    if (!selectedFolder) return;

    setSavingFolder(true);
    try {
      const response = await fetch('/api/drive/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandId: band.id,
          folderId: selectedFolder.id,
          folderName: selectedFolder.name,
        }),
      });

      if (response.ok) {
        onUpdate({
          ...band,
          drive_folder_id: selectedFolder.id,
          drive_folder_name: selectedFolder.name,
          drive_connected_at: new Date().toISOString(),
          drive_connected_by: band.created_by,
        });
        setShowFolderPicker(false);
      }
    } catch (error) {
      console.error('Error saving folder:', error);
    }
    setSavingFolder(false);
  };

  if (showFolderPicker) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Seleccionar carpeta de Drive</h3>
          <button
            onClick={() => setShowFolderPicker(false)}
            className="text-sm text-zinc-500 hover:text-white"
          >
            Cancelar
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1 text-sm">
          {currentPath.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-zinc-600" />}
              <button
                onClick={() => {
                  const newPath = currentPath.slice(0, index + 1);
                  setCurrentPath(newPath);
                  loadFolders(item.id);
                  setSelectedFolder(null);
                }}
                className={`hover:text-white ${
                  index === currentPath.length - 1 ? 'text-white' : 'text-zinc-500'
                }`}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>

        {/* Back button */}
        {currentPath.length > 1 && (
          <button
            onClick={navigateBack}
            className="mb-3 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </button>
        )}

        {/* Folder list */}
        <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950">
          {loadingFolders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          ) : folders.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">No hay carpetas aquí</div>
          ) : (
            folders.map(folder => (
              <div
                key={folder.id}
                className={`flex cursor-pointer items-center justify-between border-b border-zinc-800 px-4 py-3 last:border-0 hover:bg-zinc-800/50 ${
                  selectedFolder?.id === folder.id ? 'bg-violet-500/10' : ''
                }`}
                onClick={() => handleSelectFolder(folder)}
                onDoubleClick={() => navigateToFolder(folder)}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen
                    className={`h-5 w-5 ${
                      selectedFolder?.id === folder.id ? 'text-violet-400' : 'text-amber-400'
                    }`}
                  />
                  <span className="text-sm text-white">{folder.name}</span>
                </div>
                {selectedFolder?.id === folder.id && <Check className="h-4 w-4 text-violet-400" />}
              </div>
            ))
          )}
        </div>

        {/* Info about folder visibility */}
        <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-300">
              Solo se muestran carpetas creadas por OpenStage. Te recomendamos crear una carpeta
              nueva para organizar tus clips.
            </p>
          </div>
        </div>

        {/* Create new folder */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            placeholder="Nueva carpeta..."
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-violet-500/50 focus:outline-none"
          />
          <Button
            size="sm"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || creatingFolder}
            className="bg-zinc-800 hover:bg-zinc-700"
          >
            {creatingFolder ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSaveFolder}
          disabled={!selectedFolder || savingFolder}
          className="w-full bg-violet-600 hover:bg-violet-500"
        >
          {savingFolder ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Usar &quot;{selectedFolder?.name || '...'}&quot; para clips
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isConnected ? 'bg-green-500/10' : 'bg-zinc-800'
          }`}
        >
          <HardDrive className={`h-6 w-6 ${isConnected ? 'text-green-400' : 'text-zinc-500'}`} />
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-white">Google Drive</h3>
          {isConnected ? (
            <>
              <p className="mt-1 text-sm text-zinc-400">
                Conectado a la carpeta{' '}
                <span className="font-medium text-white">{band.drive_folder_name}</span>
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">
                Los clips se guardarán automáticamente en esta carpeta
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-zinc-400">
              Conecta Google Drive para guardar clips automáticamente
            </p>
          )}
        </div>

        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            {isDisconnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="mr-2 h-4 w-4" />
            )}
            Desconectar
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-violet-600 hover:bg-violet-500"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <HardDrive className="mr-2 h-4 w-4" />
            )}
            Conectar Drive
          </Button>
        )}
      </div>
    </div>
  );
}
