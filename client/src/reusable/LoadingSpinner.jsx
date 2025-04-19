// components/LoadingSpinner.jsx
export default function LoadingSpinner({ fullScreen = false }) {
    return (
      <div className={fullScreen ? "fixed inset-0 flex items-center justify-center" : ""}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600" />
      </div>
    );
  }