'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import Modal from '@/components/ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-navy/50 text-xs mb-1.5 font-medium">{children}</label>
)

export default function NewProjectModal({ open, onClose }: Props) {
  const { projectTypes, createProject } = useApp()
  const [clientName, setClientName] = useState('')
  const [projectTypeId, setProjectTypeId] = useState('')
  const [dealPrice, setDealPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setClientName(''); setProjectTypeId(''); setDealPrice(''); setDeadline('') }

  const handleCreate = async () => {
    if (!clientName.trim()) return
    setSaving(true)
    await createProject({
      client_name: clientName.trim(),
      project_type_id: projectTypeId || null,
      deal_price: dealPrice ? parseFloat(dealPrice) : 0,
      deadline: deadline || null,
      stage: 'incoming',
    })
    setSaving(false)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="New Project" size="sm">
      <div className="space-y-4">
        <div>
          <Label>Client Name *</Label>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
        </div>

        <div>
          <Label>Project Type</Label>
          <select value={projectTypeId} onChange={(e) => setProjectTypeId(e.target.value)}>
            <option value="">Select type…</option>
            {projectTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <Label>Deal Price (DA)</Label>
          <input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="0" min="0" />
        </div>

        <div>
          <Label>Deadline</Label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { reset(); onClose() }}
            className="flex-1 py-2 rounded-xl border border-silver text-navy/50 hover:text-navy hover:bg-white/50 text-sm transition-colors"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleCreate}
            disabled={!clientName.trim() || saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 rounded-xl bg-brand hover:bg-ocean text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-brand/25"
          >
            {saving ? 'Creating…' : 'Create Project'}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}
