export default function CapSummary({ 
  salaryCap, 
  totalCapHit, 
  totalDeadMoney,
  baseDeadMoney = 0,
  availableCap, 
  actionsCount,
  actionsSummary,
  onShareMoves,
  shareStatus,
  shareError,
  onResetAll,
  selectedYear 
}) {
  const formatMoney = (value) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  const capPercentUsed = ((totalCapHit + totalDeadMoney) / salaryCap * 100).toFixed(1)
  const isOverCap = availableCap < 0

  const getActionsSummaryText = () => {
    const parts = []
    if (actionsSummary.cuts > 0) parts.push(`${actionsSummary.cuts} cut${actionsSummary.cuts > 1 ? 's' : ''}`)
    if (actionsSummary.trades > 0) parts.push(`${actionsSummary.trades} trade${actionsSummary.trades > 1 ? 's' : ''}`)
    if (actionsSummary.tags > 0) parts.push(`${actionsSummary.tags} tag${actionsSummary.tags > 1 ? 's' : ''}`)
    if (actionsSummary.restructures > 0) parts.push(`${actionsSummary.restructures} restructure${actionsSummary.restructures > 1 ? 's' : ''}`)
    if (actionsSummary.resigns > 0) parts.push(`${actionsSummary.resigns} re-sign${actionsSummary.resigns > 1 ? 's' : ''}`)
    if (actionsSummary.signings > 0) parts.push(`${actionsSummary.signings} signing${actionsSummary.signings > 1 ? 's' : ''}`)
    return parts.join(', ')
  }

  const actionsSummaryText = getActionsSummaryText()

  return (
    <div className="mb-6 bg-gradient-to-br from-cowboys-navy/80 to-cowboys-navy/40 rounded-2xl p-6 border border-cowboys-silver/20 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cowboys-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {selectedYear} Cap Summary
        </h2>
        
        {actionsCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={onShareMoves}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cowboys-royal/20 text-cowboys-silver hover:bg-cowboys-royal/40 transition-all border border-cowboys-royal/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-8 4h5m-5-8h8M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              Share Cap Moves
            </button>
            <button 
              onClick={onResetAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All ({actionsSummaryText})
            </button>
            {shareStatus && (
              <span className="text-xs text-green-400 ml-2">{shareStatus}</span>
            )}
            {shareError && (
              <span className="text-xs text-red-400 ml-2">{shareError}</span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Cap Usage</span>
          <span className={`font-medium ${isOverCap ? 'text-red-400' : 'text-gray-400'}`}>
            {capPercentUsed}% used
          </span>
        </div>
        <div className="h-3 bg-black/40 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isOverCap 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : parseFloat(capPercentUsed) > 90 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-cowboys-royal to-cowboys-navy'
            }`}
            style={{ width: `${Math.min(parseFloat(capPercentUsed), 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Salary Cap</p>
          <p className="text-2xl font-bold text-white mt-1">{formatMoney(salaryCap)}</p>
          <p className="text-xs text-gray-600">{selectedYear}</p>
        </div>
        
        <div className="bg-black/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Contracts</p>
          <p className="text-2xl font-bold text-white mt-1">{formatMoney(totalCapHit)}</p>
          <p className="text-xs text-gray-600">Current roster</p>
        </div>
        
        <div className="bg-black/30 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Dead Money</p>
          <p className={`text-2xl font-bold mt-1 ${totalDeadMoney > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
            {formatMoney(totalDeadMoney)}
          </p>
          <p className="text-xs text-gray-600">
            {baseDeadMoney > 0 && `${formatMoney(baseDeadMoney)} existing`}
            {baseDeadMoney > 0 && (totalDeadMoney - baseDeadMoney) > 0 && ' + '}
            {(totalDeadMoney - baseDeadMoney) > 0 && `${formatMoney(totalDeadMoney - baseDeadMoney)} from cuts`}
            {totalDeadMoney === 0 && 'None'}
          </p>
        </div>
        
        <div className={`rounded-xl p-4 ${isOverCap ? 'bg-red-500/20 border border-red-500/30' : 'bg-black/30'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available Space</p>
          <p className={`text-2xl font-bold mt-1 ${
            isOverCap ? 'text-red-400' : availableCap > 20000000 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {formatMoney(availableCap)}
          </p>
          <p className="text-xs text-gray-600">{isOverCap ? 'OVER CAP!' : 'Remaining'}</p>
        </div>
      </div>

      {/* Actions Summary */}
      {actionsCount > 0 && (
        <div className="mt-4 pt-4 border-t border-cowboys-silver/10 flex flex-wrap gap-3">
          {actionsSummary.cuts > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              ✂️ {actionsSummary.cuts} Cut{actionsSummary.cuts > 1 ? 's' : ''}
            </span>
          )}
          {actionsSummary.trades > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              🔄 {actionsSummary.trades} Trade{actionsSummary.trades > 1 ? 's' : ''}
            </span>
          )}
          {actionsSummary.tags > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              🏷️ {actionsSummary.tags} Tag{actionsSummary.tags > 1 ? 's' : ''}
            </span>
          )}
          {actionsSummary.restructures > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              📝 {actionsSummary.restructures} Restructure{actionsSummary.restructures > 1 ? 's' : ''}
            </span>
          )}
          {actionsSummary.resigns > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              ✅ {actionsSummary.resigns} Re-sign{actionsSummary.resigns > 1 ? 's' : ''}
            </span>
          )}
          {actionsSummary.signings > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              ➕ {actionsSummary.signings} FA Signing{actionsSummary.signings > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
