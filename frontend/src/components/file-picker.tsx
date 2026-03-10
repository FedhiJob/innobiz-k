"use client";

import { useRef } from "react";

const supportedTypes = ".pdf,.doc,.docx,.ppt,.pptx";

export const FilePicker = ({
  file,
  onPick,
  onClear,
  disabled,
}: {
  file: File | null;
  onPick: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-brand-blue/40 bg-brand-blue/5 p-4">
      <input
        accept={supportedTypes}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) {
            onPick(picked);
          }
        }}
        ref={inputRef}
        type="file"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Pitch Deck Upload</p>
          <p className="text-xs text-slate-500">PDF / DOC / DOCX / PPT / PPTX, max 10MB</p>
        </div>
        <button
          className="btn-secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Choose File
        </button>
      </div>

      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button className="text-sm font-semibold text-brand-red" disabled={disabled} onClick={onClear} type="button">
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
};
