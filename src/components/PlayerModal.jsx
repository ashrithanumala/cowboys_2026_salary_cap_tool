import { useState, useEffect } from 'react'

// Estimated franchise tag values for 2026
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

// Market value estimates (AAV) by position - rough estimates
const MARKET_VALUES = {
  'QB': { low: 35000000, mid: 50000000, high: 65000000 },
  'WR': { low: 15000000, mid: 25000000, high: 35000000 },
  'RB': { low: 5000000, mid: 10000000, high: 15000000 },
  'TE': { low: 8000000, mid: 12000000, high: 18000000 },
  'DE': { low: 12000000, mid: 20000000, high: 28000000 },
  'DT': { low: 10000000, mid: 16000000, high: 24000000 },
  'LB': { low: 10000000, mid: 16000000, high: 22000000 },
  'CB': { low: 12000000, mid: 18000000, high: 24000000 },
  'S': { low: 8000000, mid: 14000000, high: 20000000 },
  'LT': { low: 14000000, mid: 22000000, high: 30000000 },
  'RT': { low: 10000000, mid: 18000000, high: 24000000 },
  'LG': { low: 8000000, mid: 14000000, high: 20000000 },
  'RG': { low: 8000000, mid: 14000000, high: 20000000 },
  'C': { low: 8000000, mid: 14000000, high: 20000000 },
  'G': { low: 8000000, mid: 14000000, high: 20000000 },
  'OL': { low: 8000000, mid: 14000000, high: 20000000 },
  'K': { low: 4000000, mid: 6000000, high: 8000000 },
  'P': { low: 3000000, mid: 5000000, high: 7000000 },
  'LS': { low: 1200000, mid: 1500000, high: 1800000 },
  'FB': { low: 2000000, mid: 3500000, high: 5000000 },
}

const RFA_TENDER_VALUES = {
  original: 4500000,
  second: 5600000,
  first: 7000000
}

export default function PlayerModal({ 
  player, 
  onClose, 
  selectedYear, 
  onPlayerAction,
  playerActions 
}) {
  const [activeTab, setActiveTab] = useState('contract')
  const [actionError, setActionError] = useState('')
  
  // Re-sign form state
  const [resignYears, setResignYears] = useState(3)
  const [resignAAV, setResignAAV] = useState('')
  
  // Initialize AAV with projection or market mid-value
  useEffect(() => {
    if (player) {
      if (player.projectedContract?.aav) {
        setResignAAV(Math.round(player.projectedContract.aav / 1000000).toString())
        setResignYears(player.projectedContract.years || 3)
        return
      }
      const marketValue = MARKET_VALUES[player.position] || { mid: 5000000 }
      setResignAAV(Math.round(marketValue.mid / 1000000).toString())
    }
  }, [player])
  
  if (!player) return null

  const yearSalary = player.salary[selectedYear]
  const franchiseTagValue = FRANCHISE_TAG_VALUES[player.position] || 15000000
  const marketValue = MARKET_VALUES[player.position] || { low: 3000000, mid: 8000000, high: 15000000 }

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

  const getPFFLabel = (grade) => {
    if (grade === null) return 'N/A'
    if (grade >= 80) return 'Elite'
    if (grade >= 72) return 'High Quality'
    if (grade >= 65) return 'Above Average'
    if (grade >= 57) return 'Average'
    if (grade >= 50) return 'Below Average'
    return 'Poor'
  }

  const availableYears = Object.keys(player.salary).sort()
  const playerAction = playerActions[player.id]
  const postJune1Count = Object.values(playerActions).filter(action => action?.type === 'cut_post_june1').length
  const postJune1LimitReached = postJune1Count >= 2 && playerAction?.type !== 'cut_post_june1'
  
  // Action states
  const isCutPreJune1 = playerAction?.type === 'cut_pre_june1'
  const isCutPostJune1 = playerAction?.type === 'cut_post_june1'
  const isCut = isCutPreJune1 || isCutPostJune1
  const isTraded = playerAction?.type === 'trade'
  const isTagged = playerAction?.type === 'franchise_tag'
  const isTendered = playerAction?.type?.startsWith('rfa_tender_')
  const isRestructured = playerAction?.type === 'restructure'
  const isResigned = playerAction?.type === 'resign'

  const canBeCut = player.contractStatus === 'Signed' || player.contractStatus === 'RFA'
  const canBeTraded = player.contractStatus === 'Signed'
  const canBeTagged = player.contractStatus === 'UFA'
  const canBeTendered = player.contractStatus === 'RFA'
  const canBeResigned = player.contractStatus === 'UFA' || player.contractStatus === 'RFA'
  
  // Can restructure if signed with base salary > $1M and remaining years
  const remainingYears = availableYears.filter(y => parseInt(y) >= parseInt(selectedYear)).length
  const canBeRestructured = player.contractStatus === 'Signed' && 
    (yearSalary?.baseSalary > 1000000) && 
    remainingYears > 1

  // Calculate restructure savings
  // Convert up to 80% of base salary to signing bonus, spread over remaining years
  const restructureAmount = Math.floor((yearSalary?.baseSalary || 0) * 0.8)
  const restructureSavings = restructureAmount - (restructureAmount / remainingYears)

  // Post-June 1 cut spreads dead money over 2 years (avoid negative values)
  const totalDeadMoney = Math.max(0, yearSalary?.dead || 0)
  const postJune1Year1Dead = Math.floor(totalDeadMoney / 2)
  const postJune1Year2Dead = totalDeadMoney - postJune1Year1Dead

  const handleAction = (actionType, data = {}) => {
    if (playerAction?.type === actionType) {
      // Toggle off
      onPlayerAction(player.id, null)
      setActionError('')
    } else {
      if (actionType === 'cut_post_june1' && postJune1LimitReached) {
        setActionError('Only 2 Post-June 1 designations are allowed per year.')
        return
      }
      onPlayerAction(player.id, { type: actionType, player, ...data })
      setActionError('')
    }
  }

  const handleResign = () => {
    const aav = parseFloat(resignAAV) * 1000000
    if (isNaN(aav) || aav <= 0) return
    
    handleAction('resign', {
      years: resignYears,
      aav: aav,
      totalValue: aav * resignYears
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div 
        className="relative bg-gradient-to-br from-cowboys-navy to-cowboys-dark border border-cowboys-silver/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-cowboys-silver/20 bg-gradient-to-r from-cowboys-royal/20 to-transparent">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-cowboys-navy border-2 border-cowboys-silver/30 flex items-center justify-center">
              <span className="text-2xl font-black text-cowboys-silver">{player.position}</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{player.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-cowboys-silver">Age {player.age}</span>
                <span className="text-gray-600">•</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  player.contractStatus === 'Signed' ? 'bg-green-500/20 text-green-400' :
                  player.contractStatus === 'UFA' ? 'bg-yellow-500/20 text-yellow-400' :
                  player.contractStatus === 'RFA' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {player.contractStatus}
                </span>
                {player.freeAgentYear && (
                  <span className="text-gray-500 text-sm">FA {player.freeAgentYear}</span>
                )}
              </div>
              {player.note && (
                <p className="text-sm text-gray-500 italic mt-1">{player.note}</p>
              )}
            </div>
            
            {/* PFF Grade */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${getPFFColor(player.pffGrade)}`}>
                <span className="text-2xl font-black">{player.pffGrade?.toFixed(1) || 'N/A'}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{getPFFLabel(player.pffGrade)}</span>
            </div>
          </div>

          {/* Action Status Badge */}
          {playerAction && (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
              isCut ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              isTraded ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              isTagged ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              isRestructured ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
              isResigned ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {isCutPreJune1 && '✂️ Released (Pre-June 1)'}
              {isCutPostJune1 && '✂️ Released (Post-June 1)'}
              {isTraded && '🔄 Traded'}
              {isTagged && '🏷️ Franchise Tagged'}
              {isTendered && '📝 RFA Tendered'}
              {isRestructured && `📝 Restructured (${formatMoney(playerAction.savings)} saved)`}
              {isResigned && `✅ Re-signed (${playerAction.years}yr/${formatMoney(playerAction.aav)})`}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cowboys-silver/20">
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'contract' 
                ? 'text-white border-b-2 border-cowboys-royal bg-cowboys-royal/10' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Contract Details
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'actions' 
                ? 'text-white border-b-2 border-cowboys-royal bg-cowboys-royal/10' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Actions
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'contract' && (
            <div className="space-y-6">
              {/* Current Year Summary */}
              {yearSalary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Cap Hit</p>
                    <p className="text-xl font-bold text-white mt-1">{formatMoney(yearSalary.capHit)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Base Salary</p>
                    <p className="text-xl font-bold text-gray-300 mt-1">{formatMoney(yearSalary.baseSalary)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Dead Money</p>
                    <p className="text-xl font-bold text-orange-400 mt-1">{formatMoney(yearSalary.dead)}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Savings if Cut</p>
                    <p className={`text-xl font-bold mt-1 ${yearSalary.savings > 0 ? 'text-green-400' : yearSalary.savings < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                      {formatMoney(yearSalary.savings)}
                    </p>
                  </div>
                </div>
              )}

              {/* Multi-Year Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Contract Breakdown</h3>
                <div className="bg-black/20 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black/30 text-left">
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Cap Hit</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Base</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Dead $</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableYears.map((year, i) => {
                        const salary = player.salary[year]
                        const isCurrentYear = year === selectedYear
                        return (
                          <tr key={year} className={`${isCurrentYear ? 'bg-cowboys-royal/10' : i % 2 ? 'bg-black/10' : ''}`}>
                            <td className={`px-4 py-3 font-medium ${isCurrentYear ? 'text-cowboys-silver' : 'text-gray-400'}`}>
                              {year} {isCurrentYear && '←'}
                            </td>
                            <td className="px-4 py-3 text-white text-right font-medium">{formatMoney(salary.capHit)}</td>
                            <td className="px-4 py-3 text-gray-400 text-right">{formatMoney(salary.baseSalary)}</td>
                            <td className="px-4 py-3 text-orange-400 text-right">{formatMoney(salary.dead)}</td>
                            <td className={`px-4 py-3 text-right font-medium ${salary.savings > 0 ? 'text-green-400' : salary.savings < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                              {formatMoney(salary.savings)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Market Value Reference */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Market Value Reference ({player.position})</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-lg font-bold text-gray-400">{formatMoney(marketValue.low)}/yr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Market</p>
                    <p className="text-lg font-bold text-white">{formatMoney(marketValue.mid)}/yr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Premium</p>
                    <p className="text-lg font-bold text-green-400">{formatMoney(marketValue.high)}/yr</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Franchise Tag: {formatMoney(franchiseTagValue)}</p>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              
              {/* RELEASE OPTIONS */}
              {canBeCut && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>✂️</span> Release Options
                  </h3>
                  {actionError && (
                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                      {actionError}
                    </div>
                  )}
                  
                  {/* Pre-June 1 Cut */}
                  <button
                    onClick={() => handleAction('cut_pre_june1')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCutPreJune1 
                        ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-red-500/50 text-gray-300 hover:text-red-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{isCutPreJune1 ? 'Undo Release' : 'Pre-June 1 Release'}</p>
                      <p className="text-sm text-gray-500">
                        All dead money hits {selectedYear}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-400">Dead: {formatMoney(yearSalary?.dead || 0)}</div>
                      <div className={`text-sm font-bold ${(yearSalary?.savings || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Savings: {formatMoney(yearSalary?.savings || 0)}
                      </div>
                    </div>
                  </button>

                  {/* Post-June 1 Cut */}
                  <button
                    onClick={() => handleAction('cut_post_june1', { 
                      year1Dead: postJune1Year1Dead,
                      year2Dead: postJune1Year2Dead 
                    })}
                    disabled={postJune1LimitReached}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCutPostJune1 
                        ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                        : postJune1LimitReached
                          ? 'bg-black/30 border-cowboys-silver/10 text-gray-600 cursor-not-allowed'
                          : 'bg-black/30 border-cowboys-silver/20 hover:border-red-500/50 text-gray-300 hover:text-red-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{isCutPostJune1 ? 'Undo Release' : 'Post-June 1 Release (2 max)'}</p>
                      <p className="text-sm text-gray-500">
                        Dead money spread over 2 years • {Math.max(0, 2 - postJune1Count + (isCutPostJune1 ? 1 : 0))} remaining
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-orange-400">{selectedYear}: {formatMoney(postJune1Year1Dead)}</div>
                      <div className="text-orange-300">{parseInt(selectedYear) + 1}: {formatMoney(postJune1Year2Dead)}</div>
                    </div>
                  </button>
                </div>
              )}

              {/* FRANCHISE TAG */}
              {canBeTagged && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>🏷️</span> Franchise Tag
                  </h3>
                  <button
                    onClick={() => handleAction('franchise_tag', { value: franchiseTagValue })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isTagged 
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{isTagged ? 'Remove Franchise Tag' : 'Apply Franchise Tag'}</p>
                      <p className="text-sm text-gray-500">
                        1-year guaranteed contract at position avg
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded text-sm font-bold bg-purple-500/20 text-purple-400">
                      {formatMoney(franchiseTagValue)}
                    </div>
                  </button>
                </div>
              )}

              {/* RFA TENDER */}
              {canBeTendered && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>📝</span> RFA Tender
                  </h3>
                  <button
                    onClick={() => handleAction('rfa_tender_original', { value: RFA_TENDER_VALUES.original })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      playerAction?.type === 'rfa_tender_original'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">
                        {playerAction?.type === 'rfa_tender_original' ? 'Remove Original Tender' : 'Original Round Tender'}
                      </p>
                      <p className="text-sm text-gray-500">Estimated tender amount</p>
                    </div>
                    <div className="px-3 py-1 rounded text-sm font-bold bg-purple-500/20 text-purple-400">
                      {formatMoney(RFA_TENDER_VALUES.original)}
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction('rfa_tender_second', { value: RFA_TENDER_VALUES.second })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      playerAction?.type === 'rfa_tender_second'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">
                        {playerAction?.type === 'rfa_tender_second' ? 'Remove Second-Round Tender' : 'Second-Round Tender'}
                      </p>
                      <p className="text-sm text-gray-500">Estimated tender amount</p>
                    </div>
                    <div className="px-3 py-1 rounded text-sm font-bold bg-purple-500/20 text-purple-400">
                      {formatMoney(RFA_TENDER_VALUES.second)}
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction('rfa_tender_first', { value: RFA_TENDER_VALUES.first })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      playerAction?.type === 'rfa_tender_first'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">
                        {playerAction?.type === 'rfa_tender_first' ? 'Remove First-Round Tender' : 'First-Round Tender'}
                      </p>
                      <p className="text-sm text-gray-500">Estimated tender amount</p>
                    </div>
                    <div className="px-3 py-1 rounded text-sm font-bold bg-purple-500/20 text-purple-400">
                      {formatMoney(RFA_TENDER_VALUES.first)}
                    </div>
                  </button>
                </div>
              )}

              {/* RE-SIGN */}
              {canBeResigned && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>✅</span> Re-Sign Player
                  </h3>
                  
                  <div className={`p-4 rounded-xl border transition-all ${
                    isResigned 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-black/30 border-cowboys-silver/20'
                  }`}>
                    {isResigned ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-400">Re-signed!</p>
                          <p className="text-sm text-gray-400">
                            {playerAction.years} years, {formatMoney(playerAction.aav)}/year
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: {formatMoney(playerAction.totalValue)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction('resign')}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Years</label>
                            <select
                              value={resignYears}
                              onChange={(e) => setResignYears(parseInt(e.target.value))}
                              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              {[1, 2, 3, 4, 5, 6].map(y => (
                                <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">AAV (millions)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                              <input
                                type="number"
                                value={resignAAV}
                                onChange={(e) => setResignAAV(e.target.value)}
                                placeholder={Math.round(marketValue.mid / 1000000).toString()}
                                className="w-full pl-7 pr-8 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">M</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick AAV buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setResignAAV(Math.round(marketValue.low / 1000000).toString())}
                            className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white"
                          >
                            Budget ({formatMoney(marketValue.low)})
                          </button>
                          <button
                            onClick={() => setResignAAV(Math.round(marketValue.mid / 1000000).toString())}
                            className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white"
                          >
                            Market ({formatMoney(marketValue.mid)})
                          </button>
                          <button
                            onClick={() => setResignAAV(Math.round(marketValue.high / 1000000).toString())}
                            className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white"
                          >
                            Premium ({formatMoney(marketValue.high)})
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-cowboys-silver/10">
                          <div className="text-sm">
                            <span className="text-gray-500">Total Value: </span>
                            <span className="text-white font-bold">
                              {formatMoney((parseFloat(resignAAV) || 0) * 1000000 * resignYears)}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({selectedYear} Cap: ~{formatMoney((parseFloat(resignAAV) || 0) * 1000000)})
                            </span>
                            {player.projectedContract?.source && (
                              <span className="block text-xs text-gray-500 mt-1">
                                Projection: {player.projectedContract.years} years @ {formatMoney(player.projectedContract.aav)}/yr ({player.projectedContract.source})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleResign}
                            disabled={!resignAAV || parseFloat(resignAAV) <= 0}
                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sign Contract
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TRADE */}
              {canBeTraded && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>🔄</span> Trade
                  </h3>
                  <button
                    onClick={() => handleAction('trade')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isTraded 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-blue-500/50 text-gray-300 hover:text-blue-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{isTraded ? 'Cancel Trade' : 'Trade Player'}</p>
                      <p className="text-sm text-gray-500">
                        Salary goes with player, dead money stays
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-400">Dead: {formatMoney(yearSalary?.dead || 0)}</div>
                      <div className="text-sm font-bold text-green-400">
                        Relief: {formatMoney((yearSalary?.capHit || 0) - (yearSalary?.dead || 0))}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* RESTRUCTURE */}
              {canBeRestructured && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <span>📝</span> Restructure
                  </h3>
                  <button
                    onClick={() => handleAction('restructure', { 
                      savings: restructureSavings,
                      amount: restructureAmount,
                      remainingYears 
                    })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isRestructured 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                        : 'bg-black/30 border-cowboys-silver/20 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{isRestructured ? 'Undo Restructure' : 'Restructure Contract'}</p>
                      <p className="text-sm text-gray-500">
                        Convert {formatMoney(restructureAmount)} base → signing bonus
                      </p>
                      <p className="text-xs text-gray-600">
                        Spread over {remainingYears} years ({formatMoney(restructureAmount / remainingYears)}/yr added)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        {selectedYear} Savings
                      </div>
                      <div className="text-lg font-bold text-green-400">
                        {formatMoney(restructureSavings)}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* No actions available */}
              {!canBeCut && !canBeTagged && !canBeResigned && !canBeTraded && !canBeRestructured && (
                <div className="text-center py-8 text-gray-500">
                  <p>No actions available for this player.</p>
                  <p className="text-sm mt-2">
                    {player.contractStatus === 'Dead Cap' && 'Dead cap cannot be modified.'}
                    {player.contractStatus === 'VOID' && 'Void years cannot be modified.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
