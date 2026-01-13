import { motion } from 'framer-motion';
import { Plus, Search, Download, Save, ChevronDown, Upload, Menu } from 'lucide-react';
import { Button } from '../ui';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leadCount?: number;
  onAddClick?: () => void;
  onExportCSVClick?: () => void;
  onExportJSONClick?: () => void;
  onImportCSVClick?: () => void;
  onImportJSONClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({
  title,
  subtitle,
  leadCount,
  onAddClick,
  onExportCSVClick,
  onExportJSONClick,
  onImportCSVClick,
  onImportJSONClick,
  searchValue = '',
  onSearchChange,
  onToggleSidebar,
  isSidebarCollapsed,
}: HeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node)) {
        setShowImportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-1.5 sm:px-2 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-6 mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative z-30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger menu - always visible */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Toggle sidebar"
              title={isSidebarCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
            >
              <Menu size={24} />
            </button>
          )}

          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-gray-100">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base hidden sm:block">{subtitle}</p>}
          </div>

          {leadCount !== undefined && (
            <div className="hidden sm:flex px-3 py-1 rounded-full bg-dark-700 border border-white/10 text-sm text-gray-300">
              {leadCount} lead{leadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {onSearchChange && (
            <div className="relative hidden sm:block" data-tour="search">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un lead..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="glass rounded-lg pl-10 pr-4 py-2 w-48 lg:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all h-10"
              />
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            {(onImportCSVClick || onImportJSONClick) && (
              <div className="relative" ref={importMenuRef}>
                <Button
                  variant="secondary"
                  onClick={() => setShowImportMenu(!showImportMenu)}
                  className="gap-2"
                  title="Importer"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Importer</span>
                  <ChevronDown size={16} className="hidden sm:inline" />
                </Button>

                {showImportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-lg border border-white/10 shadow-xl overflow-hidden z-50"
                  >
                    {onImportCSVClick && (
                      <button
                        onClick={() => {
                          onImportCSVClick();
                          setShowImportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300"
                      >
                        <Download size={16} />
                        Import CSV
                      </button>
                    )}
                    {onImportJSONClick && (
                      <button
                        onClick={() => {
                          onImportJSONClick();
                          setShowImportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300"
                      >
                        <Save size={16} />
                        Restaurer JSON
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {(onExportCSVClick || onExportJSONClick) && (
              <div className="relative" data-tour="export" ref={exportMenuRef}>
                <Button
                  variant="secondary"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="gap-2"
                  title="Exporter"
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">Exporter</span>
                  <ChevronDown size={16} className="hidden sm:inline" />
                </Button>

                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-lg border border-white/10 shadow-xl overflow-hidden z-50"
                  >
                    {onExportCSVClick && (
                      <button
                        onClick={() => {
                          onExportCSVClick();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300"
                      >
                        <Download size={16} />
                        Export CSV
                      </button>
                    )}
                    {onExportJSONClick && (
                      <button
                        onClick={() => {
                          onExportJSONClick();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300"
                      >
                        <Save size={16} />
                        Backup JSON
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {onAddClick && (
              <Button onClick={onAddClick} className="gap-2" title="Nouveau Lead" data-tour="add-lead">
                <Plus size={18} />
                <span className="hidden sm:inline">Nouveau Lead</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
