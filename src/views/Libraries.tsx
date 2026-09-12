import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Package, Trash2, Search, FileArchive, Info, Check, Globe, RefreshCw } from "lucide-react";
import { LibraryService, OnlineLibraryEntry } from "../application/library-service";
import { LibraryCatalogEntry } from "../infrastructure/tauri/library-api";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export const LibrariesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"installed" | "available">("installed");
  const [installedLibs, setInstalledLibs] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<LibraryCatalogEntry[]>([]);
  const [onlineCatalog, setOnlineCatalog] = useState<OnlineLibraryEntry[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      const [installed, fullCatalog] = await Promise.all([
        LibraryService.getInstalledLibraries(),
        LibraryService.getLibraryCatalog(),
      ]);
      setInstalledLibs(installed);
      setCatalog(fullCatalog);
    } catch (err) {
      console.error("Failed to fetch local libraries:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineIndex = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await LibraryService.fetchOnlineIndex();
      setOnlineCatalog(data);
      setIsOnline(true);
    } catch (err) {
      console.error("Online index fetch failed:", err);
      setIsOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLibraries();
    fetchOnlineIndex();
  }, [fetchOnlineIndex]);

  const showMessage = (text: string, isError: boolean = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemove = async (name: string) => {
    try {
      await LibraryService.removeLibrary(name);
      showMessage(`Library "${name}" removed.`);
      fetchLibraries();
    } catch (err) {
      showMessage(`Failed to remove library: ${err}`, true);
    }
  };

  const handleInstallBundled = async (name: string) => {
    try {
      await LibraryService.installBundledLibrary(name);
      showMessage(`Library "${name}" installed.`);
      fetchLibraries();
    } catch (err) {
      showMessage(`Failed to install library: ${err}`, true);
    }
  };

  const handleImportZip = async () => {
    try {
      const libName = await LibraryService.importLibraryFromZip();
      if (libName) {
        showMessage(`Library "${libName}" imported successfully.`);
        fetchLibraries();
        setActiveTab("installed");
      }
    } catch (err) {
      showMessage(`Failed to import library: ${err}`, true);
    }
  };

  const handleInstallOnline = async (entry: OnlineLibraryEntry) => {
    try {
      showMessage(`Downloading ${entry.name}...`);
      const libName = await LibraryService.downloadAndInstallLibrary(entry);
      showMessage(`Library "${libName}" installed successfully.`);
      fetchLibraries();
    } catch (err) {
      showMessage(`Failed to install online library: ${err}`, true);
    }
  };

  const mergedAvailable = useMemo(() => {
    const results: Array<OnlineLibraryEntry & { source: 'bundled' | 'online' }> = [];

    // 1. Add entries from local catalog
    catalog.forEach(c => {
      if (c.bundled) {
        // Genuinely bundled: no URL needed, use 'bundled' source
        results.push({
          ...c,
          url: "",
          source: 'bundled'
        });
      } else {
        // Suggested but not bundled: try to match with online catalog to get URL
        const onlineMatch = onlineCatalog.find(o => o.name.toLowerCase() === c.name.toLowerCase());
        results.push({
          ...(onlineMatch || c),
          url: onlineMatch?.url || "",
          source: 'online'
        });
      }
    });

    // 2. Add remaining online entries
    onlineCatalog.forEach(o => {
      if (!results.find(r => r.name.toLowerCase() === o.name.toLowerCase())) {
        results.push({
          ...o,
          source: 'online'
        });
      }
    });

    return results;
  }, [catalog, onlineCatalog]);

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // Default view: show bundled libraries AND "featured" suggested libraries from local catalog
    if (!query && activeTab === "available") {
      const catalogNames = new Set(catalog.map(c => c.name.toLowerCase()));
      return mergedAvailable.filter(l =>
        l.source === 'bundled' || catalogNames.has(l.name.toLowerCase())
      );
    }

    return mergedAvailable.filter(lib =>
      lib.name.toLowerCase().includes(query) ||
      lib.author.toLowerCase().includes(query) ||
      lib.description.toLowerCase().includes(query)
    );
  }, [mergedAvailable, searchQuery, activeTab, catalog]);

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
                  onClick={fetchOnlineIndex}
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
          {activeTab === "installed" ? (
            installedLibs.length === 0 ? (
              <div style={{
                backgroundColor: COLORS.GRAPHITE_700,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "12px",
                padding: "60px 40px",
                textAlign: "center",
                color: COLORS.FOG
              }}>
                <Package size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
                <div>No libraries installed.</div>
              </div>
            ) : (
              installedLibs.map(lib => (
                <div key={lib} style={{
                  backgroundColor: COLORS.GRAPHITE_700,
                  border: `1px solid ${COLORS.GRAPHITE_500}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ color: COLORS.SOLDER_COPPER }}><Package size={24} /></div>
                    <div style={{ fontWeight: 600 }}>{lib}</div>
                  </div>
                  <button
                    onClick={() => handleRemove(lib)}
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
                </div>
              ))
            )
          ) : (
            filteredCatalog.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.FOG, padding: "40px" }}>No results found.</div>
            ) : (
              filteredCatalog.map(lib => {
                const isInstalled = installedLibs.includes(lib.name);
                return (
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
                            color: lib.source === 'bundled' ? COLORS.SOLDER_COPPER : COLORS.FOG,
                            border: `1px solid ${COLORS.GRAPHITE_500}`,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}>
                            {lib.source}
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", color: COLORS.FOG }}>by {lib.author} | v{lib.version}</div>
                      </div>
                      {isInstalled ? (
                        <div style={{ color: COLORS.FOG, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Check size={16} color={COLORS.TRACE_GREEN} />
                          Installed
                        </div>
                      ) : lib.source === 'bundled' ? (
                        <button
                          onClick={() => handleInstallBundled(lib.name)}
                          style={{
                            backgroundColor: COLORS.GRAPHITE_900,
                            color: COLORS.SOLDER_COPPER,
                            border: `1px solid ${COLORS.SOLDER_COPPER}`,
                            padding: "6px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600
                          }}
                        >
                          Install
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstallOnline(lib)}
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
                          {lib.source === 'online' && !lib.url ? "Offline" : "Download & Install"}
                        </button>
                      )}
                    </div>
                    <div style={{ color: COLORS.FOG, fontSize: "14px", lineHeight: "1.4" }}>
                      {lib.description}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      )}
    </div>
  );
};
