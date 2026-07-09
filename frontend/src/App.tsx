import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from './store'
import { hideToast } from './store/toastSlice'
import LogInteractionScreen from './components/LogInteractionScreen'
import Toast from './components/Toast'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const toast = useSelector((state: RootState) => state.toast)

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <LogInteractionScreen />
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(hideToast())}
        />
      )}
    </div>
  )
}

export default App
