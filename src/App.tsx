import { Toaster } from 'react-hot-toast'
import { useTrackers } from './hooks/useTrackers'
import SpreadsheetTable from './components/SpreadsheetTable'

export default function App() {
  const {
    trackers,
    isLiveSync,
    addTracker,
    updateTracker,
    deleteTracker,
    refreshTrackers,
  } = useTrackers()

  return (
    <>
      <SpreadsheetTable
        trackers={trackers}
        isLiveSync={isLiveSync}
        onAdd={addTracker}
        onUpdate={updateTracker}
        onDelete={deleteTracker}
        onRefresh={refreshTrackers}
      />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '0.85rem',
          },
        }}
      />
    </>
  )
}
