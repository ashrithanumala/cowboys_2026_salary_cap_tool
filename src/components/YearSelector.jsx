export default function YearSelector({ selectedYear, onYearChange, availableYears }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="text-gray-400 text-sm font-medium">View Year:</span>
      <div className="flex gap-1 p-1 bg-black/40 rounded-xl">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedYear === year
                ? 'bg-gradient-to-r from-cowboys-royal to-cowboys-navy text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}


