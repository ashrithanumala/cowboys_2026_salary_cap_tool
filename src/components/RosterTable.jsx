import PlayerRow from './PlayerRow'

export default function RosterTable({ 
  players, 
  playerActions, 
  onPlayerClick, 
  onRemovePlayer,
  sortConfig, 
  onSort,
  selectedYear,
  salaryCap
}) {
  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey
    return (
      <span className={`ml-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {isActive && sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div className="bg-black/30 rounded-2xl border border-cowboys-silver/10 overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-cowboys-navy/50 text-left">
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver">
                Status
              </th>
              <th 
                className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver cursor-pointer hover:text-white group"
                onClick={() => onSort('name')}
              >
                Player <SortIcon columnKey="name" />
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver">
                Pos
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver">
                Age
              </th>
              <th 
                className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver cursor-pointer hover:text-white group"
                onClick={() => onSort('pffGrade')}
              >
                PFF <SortIcon columnKey="pffGrade" />
              </th>
              <th 
                className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver cursor-pointer hover:text-white group text-right"
                onClick={() => onSort('capHit')}
              >
                {selectedYear} Cap Hit <SortIcon columnKey="capHit" />
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver text-right">
                Cap %
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver text-right">
                Dead $
              </th>
              <th 
                className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver cursor-pointer hover:text-white group text-right"
                onClick={() => onSort('savings')}
              >
                Savings <SortIcon columnKey="savings" />
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-cowboys-silver text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <PlayerRow 
                key={player.id} 
                player={player} 
                playerAction={playerActions[player.id]}
                onClick={() => onPlayerClick(player)}
                onRemove={onRemovePlayer}
                selectedYear={selectedYear}
                salaryCap={salaryCap}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {players.length === 0 && (
        <div className="py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No players match your filters</p>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 bg-black/20 border-t border-cowboys-silver/10 flex flex-wrap gap-4 items-center text-xs">
        <span className="text-gray-500">PFF Grade Legend:</span>
        <span className="px-2 py-1 rounded bg-pff-elite text-white">Elite (80+)</span>
        <span className="px-2 py-1 rounded bg-pff-high text-white">High (72-80)</span>
        <span className="px-2 py-1 rounded bg-pff-above text-white">Above Avg (65-72)</span>
        <span className="px-2 py-1 rounded bg-pff-average text-black">Average (57-65)</span>
        <span className="px-2 py-1 rounded bg-pff-below text-white">Below Avg (50-57)</span>
        <span className="px-2 py-1 rounded bg-pff-poor text-white">Poor (&lt;50)</span>
      </div>
    </div>
  )
}
