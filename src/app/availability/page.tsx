'use client'

import AppLayout from '@/components/layout/AppLayout'
import GanttTimeline from '@/components/availability/GanttTimeline'
import EditorListMobile from '@/components/availability/EditorListMobile'
import { useApp } from '@/context/AppContext'

export default function AvailabilityPage() {
  const { loading, error } = useApp()

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="px-6 py-5 border-b border-white/50 bg-white/20 backdrop-blur-sm">
          <h1 className="text-navy font-bold text-lg">Availability</h1>
          <p className="text-navy/45 text-xs mt-0.5">Editor workload at a glance</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-navy/35 text-sm">Loading…</div>
        ) : (
          <div className="p-6">
            <div className="hidden lg:block">
              <GanttTimeline />
            </div>
            <div className="lg:hidden">
              <EditorListMobile />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
