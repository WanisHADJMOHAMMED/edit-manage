'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EditorSpecialty } from '@/lib/types'
import { SPECIALTY_LABELS } from '@/lib/types'
import { useApp } from '@/context/AppContext'

interface EditorFormState {
  full_name: string
  specialty: EditorSpecialty
  contact_info: string
  notes: string
}

const defaultForm: EditorFormState = { full_name: '', specialty: 'both', contact_info: '', notes: '' }

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-navy/50 text-xs mb-1 font-medium">{children}</label>
)

function EditorForm({ initial, onSave, onCancel }: {
  initial: EditorFormState
  onSave: (data: EditorFormState) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof EditorFormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.full_name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
      className="glass rounded-2xl p-4 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Full Name *</Label>
          <input type="text" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Editor name" />
        </div>
        <div>
          <Label>Specialty</Label>
          <select value={form.specialty} onChange={(e) => set('specialty', e.target.value as EditorSpecialty)}>
            {Object.entries(SPECIALTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <Label>Contact Info</Label>
          <input type="text" value={form.contact_info} onChange={(e) => set('contact_info', e.target.value)} placeholder="Phone or email" />
        </div>
        <div>
          <Label>Notes</Label>
          <input type="text" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. part-time, senior" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-silver text-navy/50 hover:text-navy text-xs transition-colors"
        >
          <X size={12} /> Cancel
        </button>
        <motion.button
          onClick={handleSave}
          disabled={!form.full_name.trim() || saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-ocean text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-brand/25"
        >
          <Check size={12} /> {saving ? 'Saving…' : 'Save'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function EditorRoster() {
  const { editors, createEditor, updateEditor, deleteEditor } = useApp()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleCreate = async (data: EditorFormState) => {
    await createEditor(data)
    setShowNew(false)
  }

  const handleUpdate = async (id: string, data: EditorFormState) => {
    await updateEditor(id, data)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    await deleteEditor(id)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-navy font-bold">Editors ({editors.length})</h2>
        <motion.button
          onClick={() => setShowNew(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-ocean text-white text-xs font-semibold transition-colors shadow-sm shadow-brand/25"
        >
          <Plus size={13} /> Add Editor
        </motion.button>
      </div>

      <AnimatePresence>
        {showNew && (
          <div className="mb-3">
            <EditorForm initial={defaultForm} onSave={handleCreate} onCancel={() => setShowNew(false)} />
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {editors.length === 0 && !showNew && (
          <p className="text-navy/35 text-sm text-center py-8">
            No editors yet. Click "Add Editor" to start.
          </p>
        )}

        <AnimatePresence>
          {editors.map((editor, i) => (
            <motion.div
              key={editor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 400, damping: 28 }}
            >
              {editingId === editor.id ? (
                <EditorForm
                  initial={{ full_name: editor.full_name, specialty: editor.specialty, contact_info: editor.contact_info, notes: editor.notes }}
                  onSave={(data) => handleUpdate(editor.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="glass-sm rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-navy font-semibold text-sm">{editor.full_name}</p>
                      <span
                        className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: 'rgba(42,164,231,0.1)', color: '#0A60AD', border: '1px solid rgba(42,164,231,0.2)' }}
                      >
                        {SPECIALTY_LABELS[editor.specialty]}
                      </span>
                    </div>
                    {(editor.contact_info || editor.notes) && (
                      <p className="text-navy/45 text-xs mt-0.5 truncate">
                        {[editor.contact_info, editor.notes].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      onClick={() => setEditingId(editor.id)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-xl text-navy/35 hover:text-navy hover:bg-white/50 transition-colors"
                    >
                      <Pencil size={13} />
                    </motion.button>
                    {confirmDelete === editor.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(editor.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-lg border border-silver text-navy/50 text-xs">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => setConfirmDelete(editor.id)}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-xl text-navy/35 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
