const FRANCHISE_TAG_VALUES = {
  'QB': 40500000,
  'WR': 23500000,
  'RB': 14200000,
  'TE': 12400000,
  'DE': 22300000,
  'DT': 19100000,
  'LB': 21100000,
  'CB': 20100000,
  'S': 16500000,
  'LT': 20200000,
  'RT': 17500000,
  'LG': 17500000,
  'RG': 17500000,
  'C': 17500000,
  'G': 17500000,
  'OL': 17500000,
  'K': 5300000,
  'P': 5300000,
  'LS': 1300000,
  'FB': 4000000,
}

export default function PlayerRow({ player, playerAction, onClick, onRemove, selectedYear, salaryCap, index }) {
  const yearSalary = player.salary[selectedYear]
  
  // Show UFA players even without salary if showFreeAgents is on
  if (!yearSalary && player.contractStatus !== 'UFA' && player.contractStatus !== 'ERFA' && !playerAction && !player.isAddedFreeAgent) return null

  const formatMoney = (value) => {
    if (value === 0 || value === undefined) return '-'
    const absValue = Math.abs(value)
    const prefix = value < 0 ? '-' : ''
    if (absValue >= 1000000) {
      return `${prefix}$${(absValue / 1000000).toFixed(2)}M`
    }
    return `${prefix}$${(absValue / 1000).toFixed(0)}K`
  }

  const getPFFColor = (grade) => {
    if (grade === null) return 'bg-gray-700 text-gray-400'
    if (grade >= 80) return 'bg-pff-elite text-white'
    if (grade >= 72) return 'bg-pff-high text-white'
    if (grade >= 65) return 'bg-pff-above text-white'
    if (grade >= 57) return 'bg-pff-average text-black'
    if (grade >= 50) return 'bg-pff-below text-white'
    return 'bg-pff-poor text-white'
  }

  // Action states
  const isCutPreJune1 = playerAction?.type === 'cut_pre_june1'
  const isCutPostJune1 = playerAction?.type === 'cut_post_june1'
  const isCut = isCutPreJune1 || isCutPostJune1
  const isTraded = playerAction?.type === 'trade'
  const isTagged = playerAction?.type === 'franchise_tag'
  const isTendered = playerAction?.type?.startsWith('rfa_tender_')
  const isRestructured = playerAction?.type === 'restructure'
  const isResigned = playerAction?.type === 'resign'
  const isAddedFA = player.isAddedFreeAgent
  const hasAction = !!playerAction || isAddedFA

  const getStatusBadge = () => {
    if (isCutPreJune1) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          CUT
        </span>
      )
    }
    if (isCutPostJune1) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          CUT 6/1
        </span>
      )
    }
    if (isTraded) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
          TRADED
        </span>
      )
    }
    if (isTagged) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          TAGGED
        </span>
      )
    }
    if (isTendered) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          TENDERED
        </span>
      )
    }
    if (isRestructured) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          RESTRUCT
        </span>
      )
    }
    if (isResigned) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
          RE-SIGNED
        </span>
      )
    }
    if (isAddedFA) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
          SIGNED
        </span>
      )
    }
    
    switch (player.contractStatus) {
      case 'UFA':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            UFA
          </span>
        )
      case 'ERFA':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ERFA
          </span>
        )
      case 'RFA':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
            RFA
          </span>
        )
      case 'Dead Cap':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            DEAD
          </span>
        )
      case 'VOID':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
            VOID
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            ✓
          </span>
        )
    }
  }

  // Calculate displayed cap hit based on action
  let displayedCapHit = yearSalary?.capHit || 0
  let displayedDeadMoney = yearSalary?.dead || 0
  let displayedSavings = yearSalary?.savings || 0
  const capPercent = salaryCap && displayedCapHit > 0
    ? ((displayedCapHit / salaryCap) * 100)
    : null

  if (isCutPreJune1 || isTraded) {
    displayedCapHit = 0
    displayedDeadMoney = yearSalary?.dead || 0
  } else if (isCutPostJune1) {
    displayedCapHit = 0
    displayedDeadMoney = playerAction.year1Dead || 0
  } else if (isTagged) {
    displayedCapHit = playerAction.value || FRANCHISE_TAG_VALUES[player.position] || 15000000
    displayedDeadMoney = 0
  } else if (isTendered) {
    displayedCapHit = playerAction.value || 0
    displayedDeadMoney = 0
  } else if (isRestructured) {
    const savings = playerAction.savings || 0
    displayedCapHit = (yearSalary?.capHit || 0) - savings
  } else if (isResigned) {
    displayedCapHit = playerAction.aav || 0
    displayedDeadMoney = 0
  }

  const isDeadOrVoid = player.contractStatus === 'Dead Cap' || player.contractStatus === 'VOID'
  const rowIsInactive = isCut || isTraded

  return (
    <tr 
      onClick={onClick}
      className={`transition-all duration-200 cursor-pointer ${
        rowIsInactive 
          ? 'bg-red-900/10 opacity-60' 
          : isAddedFA
            ? 'bg-green-900/10'
            : hasAction
              ? 'bg-cowboys-royal/10'
              : index % 2 === 0 
                ? 'bg-transparent hover:bg-cowboys-navy/20' 
                : 'bg-black/10 hover:bg-cowboys-navy/20'
      }`}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Status */}
      <td className="px-4 py-3">
        {getStatusBadge()}
      </td>

      {/* Player Name */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className={`font-semibold ${rowIsInactive ? 'text-gray-500 line-through' : 'text-white'}`}>
            {player.name}
          </span>
          {player.note && (
            <span className="text-xs text-gray-500 italic">{player.note}</span>
          )}
          {isResigned && playerAction && (
            <span className="text-xs text-green-500">{playerAction.years}yr / {formatMoney(playerAction.aav)}</span>
          )}
          {isAddedFA && player.contractDetails && (
            <span className="text-xs text-green-500">{player.contractDetails.years}yr / {formatMoney(player.contractDetails.aav)}</span>
          )}
        </div>
      </td>

      {/* Position */}
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded bg-cowboys-navy/50 text-cowboys-silver text-xs font-bold">
          {player.position}
        </span>
      </td>

      {/* Age */}
      <td className="px-4 py-3 text-gray-400">
        {player.age}
      </td>

      {/* PFF Grade */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-bold ${getPFFColor(player.pffGrade)}`}>
          {player.pffGrade !== null ? player.pffGrade.toFixed(1) : 'N/A'}
        </span>
      </td>

      {/* Cap Hit */}
      <td className="px-4 py-3 text-right">
        <span className={`money font-semibold ${
          rowIsInactive ? 'text-gray-500 line-through' : 
          hasAction ? 'text-cowboys-silver' : 'text-white'
        }`}>
          {formatMoney(displayedCapHit)}
        </span>
        {(hasAction && !rowIsInactive && !isAddedFA && yearSalary?.capHit !== displayedCapHit) && (
          <span className="block text-xs text-gray-500 line-through">{formatMoney(yearSalary?.capHit)}</span>
        )}
      </td>

      {/* Cap % */}
      <td className="px-4 py-3 text-right">
        <span className="text-gray-400 text-sm">
          {capPercent !== null ? `${capPercent.toFixed(2)}%` : '-'}
        </span>
      </td>

      {/* Dead Money */}
      <td className="px-4 py-3 text-right">
        <span className={`money ${
          (isCut || isTraded) ? 'text-red-400 font-bold' :
          displayedDeadMoney > 0 ? 'text-orange-400' : 'text-gray-600'
        }`}>
          {formatMoney(displayedDeadMoney)}
        </span>
        {isCutPostJune1 && playerAction.year2Dead > 0 && (
          <span className="block text-xs text-orange-300">+{formatMoney(playerAction.year2Dead)} next yr</span>
        )}
        {isDeadOrVoid && displayedDeadMoney > 0 && (
          <span className="block text-xs text-gray-500">Existing dead money</span>
        )}
      </td>

      {/* Savings */}
      <td className="px-4 py-3 text-right">
        <span className={`money font-semibold ${
          displayedSavings > 0 ? 'text-green-400' : displayedSavings < 0 ? 'text-red-400' : 'text-gray-600'
        }`}>
          {isAddedFA ? '-' : formatMoney(displayedSavings)}
        </span>
      </td>

      {/* Action Button */}
      <td className="px-4 py-3 text-center">
        {isAddedFA ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(player.id)
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
          >
            Remove
          </button>
        ) : !isDeadOrVoid ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-cowboys-royal/20 text-cowboys-silver hover:bg-cowboys-royal/40 border border-cowboys-royal/30"
          >
            Details
          </button>
        ) : (
          <span className="text-gray-600 text-xs">-</span>
        )}
      </td>
    </tr>
  )
}
