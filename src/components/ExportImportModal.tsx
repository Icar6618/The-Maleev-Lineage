import React, { useState } from 'react';
import type { FamilyData } from '../types/family';
import { X, Download, Upload, Copy, Check, FileJson } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FamilyData;
  onImportData: (data: FamilyData) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportData,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maleev-lineage-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.persons)) {
          onImportData(parsed);
          onClose();
        } else {
          setErrorMsg('Файл не відповідає формату даних родоводу.');
        }
      } catch (err) {
        setErrorMsg('Помилка читання JSON файлу.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImportText = () => {
    try {
      setErrorMsg('');
      const parsed = JSON.parse(importText);
      if (parsed && Array.isArray(parsed.persons)) {
        onImportData(parsed);
        onClose();
      } else {
        setErrorMsg('Невірний формат: відсутній масив persons.');
      }
    } catch (e) {
      setErrorMsg('Некоректний JSON синтаксис.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-100">
              Дані родоводу (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl active:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Export Box */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Експорт поточного родоводу
            </h3>
            <p className="text-xs text-slate-400">
              Збережіть файл собі на телефон або комп'ютер як резервну копію:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Завантажити .json
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопійовано!' : 'Скопіювати текст'}
              </button>
            </div>
          </div>

          {/* Import Box */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Імпорт / Завантаження даних
            </h3>
            <p className="text-xs text-slate-400">
              Виберіть збережений файл або вставте JSON код:
            </p>

            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-slate-300 file:mr-2.5 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer w-full"
            />

            <div className="pt-1">
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Або вставте сюди текст JSON..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-base sm:text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">⚠️ {errorMsg}</p>
            )}

            {importText && (
              <button
                onClick={handleApplyImportText}
                className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Застосувати імпортовані дані
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
