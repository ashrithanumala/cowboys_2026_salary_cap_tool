const POSITION_GROUPS = [
  { value: 'ALL', label: 'All Positions' },
  { value: 'OFF', label: 'Offense' },
  { value: 'DEF', label: 'Defense' },
  { value: 'ST', label: 'Special Teams' },
]

const SPECIFIC_POSITIONS = [
  { value: 'QB', label: 'QB' },
  { value: 'RB', label: 'RB' },
  { value: 'WR', label: 'WR' },
  { value: 'TE', label: 'TE' },
  { value: 'OL', label: 'O-Line' },
  { value: 'DT', label: 'DT' },
  { value: 'DE', label: 'DE/EDGE' },
  { value: 'LB', label: 'LB' },
  { value: 'CB', label: 'CB' },
  { value: 'S', label: 'S' },
]

export default function FilterBar({ filter, onFilterChange }) {
  const handlePositionChange = (value) => {
    onFilterChange({ ...filter, position: value })
  }

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search players..."
          value={filter.search}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
          className="w-full pl-10 pr-4 py-3 bg-black/40 border border-cowboys-silver/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cowboys-royal focus:border-transparent transition-all"
        />
      </div>

      {/* Position Filter - Quick Buttons */}
      <div className="flex flex-wrap gap-2">
        {POSITION_GROUPS.map(group => (
          <button
            key={group.value}
            onClick={() => handlePositionChange(group.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter.position === group.value
                ? 'bg-cowboys-royal text-white shadow-lg shadow-cowboys-royal/30'
                : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white border border-cowboys-silver/10'
            }`}
          >
            {group.label}
          </button>
        ))}
        
        {/* Dropdown for specific positions */}
        <select
          value={SPECIFIC_POSITIONS.some(p => p.value === filter.position) ? filter.position : ''}
          onChange={(e) => handlePositionChange(e.target.value || 'ALL')}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-black/40 text-gray-400 border border-cowboys-silver/10 focus:outline-none focus:ring-2 focus:ring-cowboys-royal cursor-pointer"
        >
          <option value="">Position...</option>
          {SPECIFIC_POSITIONS.map(pos => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.showFreeAgents}
            onChange={(e) => onFilterChange({ ...filter, showFreeAgents: e.target.checked })}
            className="w-4 h-4 rounded bg-black/40 border-cowboys-silver/30 text-cowboys-royal focus:ring-cowboys-royal focus:ring-offset-0"
          />
          <span className="text-sm text-gray-400">Show Free Agents</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.showDeadCap}
            onChange={(e) => onFilterChange({ ...filter, showDeadCap: e.target.checked })}
            className="w-4 h-4 rounded bg-black/40 border-cowboys-silver/30 text-cowboys-royal focus:ring-cowboys-royal focus:ring-offset-0"
          />
          <span className="text-sm text-gray-400">Show Dead Cap</span>
        </label>
      </div>
    </div>
  )
}
