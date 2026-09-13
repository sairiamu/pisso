import React, { useEffect, useState, useMemo } from "react";
import { Package, Trash2, Search, FileArchive, Info, Check, Globe, RefreshCw } from "lucide-react";
import { LibraryManager, LibraryInfo } from "../application/LibraryManager";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { BoardInfo } from "../domain/models";
import { getBoardByFqbn } from "../domain/boards";
import { listen } from "@tauri-apps/api/event";

interface LibrariesViewProps {
  projectPath?: string | null;
  boards?: BoardInfo[];
  selectedBoardId?: string | null;
  autoInstallDependencies?: boolean;
  onAutoInstallChange?: (auto: boolean) => void;
}

interface DownloadProgress {
  status: string;
  progress: number;
  message: string;
}

export const LibrariesView: React.FC<LibrariesViewProps> = ({
  projectPath,
  boards,
  selectedBoardId,
  autoInstallDependencies = false,
  onAutoInstallChange,
}) => {
  const [activeTab, setActiveTab] = useState<"installed" | "available">("installed");
  const [allLibraries, setAllLibraries] = useState<LibraryInfo[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: React.ReactNode; isError: boolean } | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  const fetchLibraries = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const all = await LibraryManager.search("", projectPath);
      setAllLibraries(all);
      setIsOnline(all.some(l => l.source === 'online'));
    } catch (err) {
      console.error("Failed to fetch libraries:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, [projectPath]);

  useEffect(() => {
    const unlisten = listen<DownloadProgress>("library-download-progress", (event) => {
      setDownloadProgress(event.payload);
      if (event.payload.status === "completed") {
        setTimeout(() => setDownloadProgress(null), 2000);
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const showMessage = (text: string, isError: boolean = false) => {
    let content: React.ReactNode = text;
    if (isError) {
      try {
        const diagnostic = JSON.parse(text);
        if (diagnostic && diagnostic.type) {
          content = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 700 }}>{diagnostic.type.replace('_', ' ')}</div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ opacity: 0.7 }}>File:</span> {diagnostic.file}
              </div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ opacity: 0.7 }}>Error:</span> {diagnostic.message}
              </div>
            </div>
          );
        }
      } catch (e) {}
    }
    setMessage({ text: content as any, isError });
    setTimeout(() => setMessage(null), 5000); // Errors might need more time to read
  };

  const handleRemove = async (name: string) => {
    try {
      await LibraryManager.remove(name, projectPath);
      showMessage(`Library "${name}" removed.`);
      fetchLibraries();
    } catch (err) {
      showMessage(`Failed to remove library: ${err}`, true);
    }
  };

  const handleInstall = async (lib: LibraryInfo) => {
    try {
      showMessage(lib.source === 'online' ? `Downloading ${lib.name}...` : `Installing ${lib.name}...`);

      let targetArch: string | undefined;
      if (selectedBoardId && boards) {
        const boardInfo = boards.find(b => b.id === selectedBoardId);
        if (boardInfo) {
          const def = getBoardByFqbn(boardInfo.fqbn);
          targetArch = def?.architecture;
        }
      }

      const libName = await LibraryManager.install(lib, projectPath, targetArch);
      showMessage(`Library "${libName}" and its dependencies installed successfully.`);
      fetchLibraries();
    } catch (err) {
      showMessage(`Failed to install library: ${err}`, true);
    }
  };

  const handleImportZip = async () => {
    try {
      const libName = await LibraryManager.importFromZip(projectPath);
      if (libName) {
        showMessage(`Library "${libName}" imported successfully.`);
        fetchLibraries();
        setActiveTab("installed");
      }
    } catch (err) {
      showMessage(`Failed to import library: ${err}`, true);
    }
  };

  const filteredLibraries = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (activeTab === "installed") {
      return allLibraries.filter(l => l.installed && (
        l.name.toLowerCase().includes(query) ||
        l.author.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
      ));
    }

    // Available tab
    if (!query) {
      // Default view: show bundled libraries AND "featured" suggested libraries
      return allLibraries.filter(l => l.source === 'bundled' || (l.source === 'online' && !l.installed));
    }

    return allLibraries.filter(lib =>
      lib.name.toLowerCase().includes(query) ||
      lib.author.toLowerCase().includes(query) ||
      lib.description.toLowerCase().includes(query)
    );
  }, [allLibraries, searchQuery, activeTab]);


  return (
    <div style={{
      padding: "40px",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI,
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      height: "100%",
      overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ color: COLORS.SOLDER_COPPER, margin: 0 }}>Library Manager</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <p style={{ color: COLORS.FOG, margin: 0 }}>Manage Arduino libraries for your projects.</p>
            {!loading && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: isOnline ? COLORS.TRACE_GREEN : COLORS.FOG,
                backgroundColor: COLORS.GRAPHITE_900,
                padding: "2px 8px",
                borderRadius: "10px",
                border: `1px solid ${COLORS.GRAPHITE_500}`
              }}>
                {isOnline ? <Globe size={12} /> : <Info size={12} />}
                {isOnline ? "Online" : "Offline — showing local only"}
                <button
                  onClick={fetchLibraries}
                  disabled={isRefreshing}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 2px"
                  }}
                  title="Refresh Online Index"
                >
                  <RefreshCw size={12} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleImportZip}
          style={{
            backgroundColor: COLORS.SOLDER_COPPER,
            color: COLORS.WARM_WHITE,
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600
          }}
        >
          <FileArchive size={18} />
          Import from .zip
        </button>
      </div>

      {projectPath && (
        <div style={{
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "8px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>Automatic Dependency Installation</div>
            <div style={{ fontSize: "12px", color: COLORS.FOG }}>Automatically scan and install missing libraries when compiling.</div>
          </div>
          <label style={{
            position: "relative",
            display: "inline-block",
            width: "44px",
            height: "22px"
          }}>
            <input
              type="checkbox"
              checked={autoInstallDependencies}
              onChange={(e) => onAutoInstallChange?.(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: "absolute",
              cursor: "pointer",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: autoInstallDependencies ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_500,
              transition: ".4s",
              borderRadius: "22px"
            }}>
              <span style={{
                position: "absolute",
                content: "",
                height: "16px",
                width: "16px",
                left: "3px",
                bottom: "3px",
                backgroundColor: "white",
                transition: ".4s",
                borderRadius: "50%",
                transform: autoInstallDependencies ? "translateX(22px)" : "none"
              }} />
            </span>
          </label>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "6px",
          backgroundColor: message.isError ? "#ff444422" : "#44ff4422",
          border: `1px solid ${message.isError ? "#ff4444" : "#44ff44"}`,
          color: message.isError ? "#ff4444" : "#44ff44",
          fontSize: "14px"
        }}>
          {message.text}
        </div>
      )}

      {downloadProgress && (
        <div style={{
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.SOLDER_COPPER}`,
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: COLORS.WARM_WHITE, fontWeight: 600 }}>{downloadProgress.message}</span>
            <span style={{ color: COLORS.FOG }}>{Math.round(downloadProgress.progress * 100)}%</span>
          </div>
          <div style={{
            height: "8px",
            backgroundColor: COLORS.GRAPHITE_900,
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${downloadProgress.progress * 100}%`,
              backgroundColor: COLORS.SOLDER_COPPER,
              transition: "width 0.2s ease-out"
            }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, gap: "24px" }}>
        <button
          onClick={() => setActiveTab("installed")}
          style={{
            padding: "12px 8px",
            backgroundColor: "transparent",
            border: "none",
            color: activeTab === "installed" ? COLORS.SOLDER_COPPER : COLORS.FOG,
            borderBottom: activeTab === "installed" ? `2px solid ${COLORS.SOLDER_COPPER}` : "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          Installed
        </button>
        <button
          onClick={() => setActiveTab("available")}
          style={{
            padding: "12px 8px",
            backgroundColor: "transparent",
            border: "none",
            color: activeTab === "available" ? COLORS.SOLDER_COPPER : COLORS.FOG,
            borderBottom: activeTab === "available" ? `2px solid ${COLORS.SOLDER_COPPER}` : "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          Available
        </button>
      </div>

      {activeTab === "available" && (
        <div style={{ position: "relative" }}>
          <Search size={18} color={COLORS.FOG} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search libraries..."
            style={{
              width: "100%",
              backgroundColor: COLORS.GRAPHITE_900,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              borderRadius: "8px",
              padding: "12px 12px 12px 40px",
              color: COLORS.WARM_WHITE,
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ color: COLORS.FOG }}>Loading libraries...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredLibraries.length === 0 ? (
            <div style={{
              backgroundColor: COLORS.GRAPHITE_700,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              borderRadius: "12px",
              padding: "60px 40px",
              textAlign: "center",
              color: COLORS.FOG
            }}>
              <Package size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
              <div>{activeTab === "installed" ? "No libraries installed." : "No results found."}</div>
            </div>
          ) : (
            filteredLibraries.map(lib => (
              <div key={lib.name} style={{
                backgroundColor: COLORS.GRAPHITE_700,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "10px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "16px", color: COLORS.WARM_WHITE }}>{lib.name}</div>
                      <div style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: COLORS.GRAPHITE_900,
                        color: lib.source === 'bundled' ? COLORS.SOLDER_COPPER : (lib.source === 'project' ? COLORS.TRACE_GREEN : COLORS.FOG),
                        border: `1px solid ${COLORS.GRAPHITE_500}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {lib.source}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: COLORS.FOG }}>by {lib.author} | v{lib.version}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {lib.installed ? (
                      <>
                        <div style={{ color: COLORS.FOG, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Check size={16} color={COLORS.TRACE_GREEN} />
                          Installed
                        </div>
                        <button
                          onClick={() => handleRemove(lib.name)}
                          style={{
                            backgroundColor: "transparent",
                            color: COLORS.FOG,
                            border: "none",
                            cursor: "pointer",
                            padding: "8px"
                          }}
                          title="Remove Library"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleInstall(lib)}
                        disabled={lib.source === 'online' && !lib.url}
                        style={{
                          backgroundColor: (lib.source === 'online' && !lib.url) ? COLORS.GRAPHITE_500 : COLORS.SOLDER_COPPER,
                          color: (lib.source === 'online' && !lib.url) ? COLORS.FOG : COLORS.WARM_WHITE,
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          cursor: (lib.source === 'online' && !lib.url) ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          opacity: (lib.source === 'online' && !lib.url) ? 0.7 : 1
                        }}
                      >
                        {lib.source === 'bundled' ? "Install" : (lib.source === 'online' && !lib.url ? "Offline" : "Download & Install")}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ color: COLORS.FOG, fontSize: "14px", lineHeight: "1.4" }}>
                  {lib.description}
                  {lib.paragraph && (
                    <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.8 }}>
                      {lib.paragraph}
                    </div>
                  )}
                </div>

                {(lib.maintainer || lib.category || lib.architectures) && (
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "4px" }}>
                    {lib.maintainer && (
                       <div style={{ fontSize: "11px", color: COLORS.FOG }}>
                         <span style={{ opacity: 0.6 }}>Maintainer:</span> {lib.maintainer}
                       </div>
                    )}
                    {lib.category && (
                       <div style={{ fontSize: "11px", color: COLORS.FOG }}>
                         <span style={{ opacity: 0.6 }}>Category:</span> {lib.category}
                       </div>
                    )}
                    {lib.architectures && (
                       <div style={{ fontSize: "11px", color: COLORS.FOG }}>
                         <span style={{ opacity: 0.6 }}>Archs:</span> {lib.architectures}
                       </div>
                    )}
                  </div>
                )}

                {lib.dependencies && lib.dependencies.length > 0 && (
                  <div style={{ marginTop: "4px", fontSize: "11px", color: COLORS.SOLDER_COPPER }}>
                    <span style={{ opacity: 0.8 }}>Depends on:</span> {lib.dependencies.join(", ")}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
