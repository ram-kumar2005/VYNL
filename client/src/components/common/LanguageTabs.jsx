const LANGUAGES = [
  { key: 'all', label: 'All' },
  { key: 'tamil', label: 'Tamil' },
  { key: 'telugu', label: 'Telugu' },
  { key: 'hindi', label: 'Hindi' },
  { key: 'english', label: 'English' },
  { key: 'kannada', label: 'Kannada' },
  { key: 'malayalam', label: 'Malayalam' },
]

export default function LanguageTabs({ selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LANGUAGES.map(lang => (
        <button
          key={lang.key}
          onClick={() => onChange(lang.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected === lang.key
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'bg-surface2 text-white/60 hover:text-white hover:bg-surface3'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
