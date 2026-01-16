import { useState, useMemo } from 'react'
import data from './data/players.json'
import CapSummary from './components/CapSummary'
import RosterTable from './components/RosterTable'
import FilterBar from './components/FilterBar'
import YearSelector from './components/YearSelector'
import PlayerModal from './components/PlayerModal'
import AddFreeAgentModal from './components/AddFreeAgentModal'

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

function App() {
  const [selectedYear, setSelectedYear] = useState('2026')
  const [players, setPlayers] = useState(data.players)
  const [playerActions, setPlayerActions] = useState({}) 
  const [filter, setFilter] = useState({ position: 'ALL', search: '', showFreeAgents: false, showDeadCap: false })
  const [sortConfig, setSortConfig] = useState({ key: 'capHit', direction: 'desc' })
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showAddFreeAgent, setShowAddFreeAgent] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [shareError, setShareError] = useState('')

  const salaryCap = data.salaryCap[selectedYear]

  const formatMoney = (value) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  // Calculate totals including all player actions
  const { totalCapHit, totalDeadMoney, baseDeadMoney, availableCap, actionsSummary } = useMemo(() => {
    let totalCapHit = 0
    let totalDeadMoney = 0
    let baseDeadMoney = 0 // Dead money from players already off roster (Dead Cap, VOID)
    let cuts = 0
    let trades = 0
    let tags = 0
    let restructures = 0
    let resigns = 0
    let signings = 0

    players.forEach(player => {
      const yearSalary = player.salary[selectedYear]
      const action = playerActions[player.id]

      // Skip if no salary data and no action
      if (!yearSalary && !action && !player.isAddedFreeAgent) return

      // Handle Dead Cap and VOID players first - these always count as dead money
      if (player.contractStatus === 'Dead Cap' || player.contractStatus === 'VOID') {
        baseDeadMoney += (yearSalary?.capHit || yearSalary?.dead || 0)
        return // Don't process further
      }

      if (action?.type === 'cut_pre_june1') {
        // Pre-June 1 Cut: All dead money hits this year
        totalDeadMoney += (yearSalary?.dead || 0)
        cuts++
      } else if (action?.type === 'cut_post_june1') {
        // Post-June 1 Cut: Only year 1 dead money hits this year
        totalDeadMoney += (action.year1Dead || 0)
        cuts++
      } else if (action?.type === 'trade') {
        // Trade: Add dead money only
        totalDeadMoney += (yearSalary?.dead || 0)
        trades++
      } else if (action?.type === 'franchise_tag') {
        // Franchise tag: Add tag value as cap hit
        const tagValue = action.value || FRANCHISE_TAG_VALUES[player.position] || 15000000
        totalCapHit += tagValue
        tags++
      } else if (action?.type?.startsWith('rfa_tender_')) {
        // RFA tender: Add tender amount as cap hit
        totalCapHit += (action.value || 0)
        tags++
      } else if (action?.type === 'restructure') {
        // Restructure: Reduce this year's cap hit by savings amount
        const savings = action.savings || 0
        totalCapHit += (yearSalary?.capHit || 0) - savings
        restructures++
      } else if (action?.type === 'resign') {
        // Re-sign: Add the specified AAV
        totalCapHit += (action.aav || 0)
        resigns++
      } else if (player.isAddedFreeAgent) {
        // Added free agent
        totalCapHit += (yearSalary?.capHit || 0)
        signings++
      } else {
        // Normal: Just add cap hit
        totalCapHit += (yearSalary?.capHit || 0)
      }
    })

    // Combine base dead money (from Dead Cap/VOID players) with action dead money
    const combinedDeadMoney = baseDeadMoney + totalDeadMoney

    return {
      totalCapHit,
      totalDeadMoney: combinedDeadMoney,
      baseDeadMoney,
      availableCap: salaryCap - totalCapHit - combinedDeadMoney,
      actionsSummary: { cuts, trades, tags, restructures, resigns, signings }
    }
  }, [players, playerActions, selectedYear, salaryCap])

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let result = [...players]
    
    // Filter by position
    if (filter.position !== 'ALL') {
      result = result.filter(p => {
        const positionGroup = getPositionGroup(p.position)
        return positionGroup === filter.position || p.position === filter.position
      })
    }
    
    // Filter by search
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(searchLower))
    }
    
    // Filter free agents
    if (!filter.showFreeAgents) {
      result = result.filter(p => {
        const yearSalary = p.salary[selectedYear]
        const hasContract = yearSalary && (yearSalary.capHit > 0 || p.contractStatus === 'Dead Cap' || p.contractStatus === 'VOID')
        const isUFA = p.contractStatus === 'UFA'
        const isRFA = p.contractStatus === 'RFA'
        const isERFA = p.contractStatus === 'ERFA'
        const isAddedFA = p.isAddedFreeAgent
        return (hasContract && !isUFA) || isRFA || isERFA || isAddedFA
      })
    }

    if (!filter.showDeadCap) {
      result = result.filter(p => p.contractStatus !== 'Dead Cap' && p.contractStatus !== 'VOID')
    }
    
    // Sort
    result.sort((a, b) => {
      let aValue, bValue
      
      if (sortConfig.key === 'capHit') {
        const aAction = playerActions[a.id]
        const bAction = playerActions[b.id]
        
        if (aAction?.type === 'franchise_tag') {
          aValue = aAction.value || FRANCHISE_TAG_VALUES[a.position] || 15000000
        } else if (aAction?.type?.startsWith('rfa_tender_')) {
          aValue = aAction.value || 0
        } else if (aAction?.type === 'resign') {
          aValue = aAction.aav || 0
        } else if (aAction?.type === 'cut_pre_june1' || aAction?.type === 'cut_post_june1' || aAction?.type === 'trade') {
          aValue = 0
        } else {
          aValue = a.salary[selectedYear]?.capHit || 0
        }
        
        if (bAction?.type === 'franchise_tag') {
          bValue = bAction.value || FRANCHISE_TAG_VALUES[b.position] || 15000000
        } else if (bAction?.type?.startsWith('rfa_tender_')) {
          bValue = bAction.value || 0
        } else if (bAction?.type === 'resign') {
          bValue = bAction.aav || 0
        } else if (bAction?.type === 'cut_pre_june1' || bAction?.type === 'cut_post_june1' || bAction?.type === 'trade') {
          bValue = 0
        } else {
          bValue = b.salary[selectedYear]?.capHit || 0
        }
      } else if (sortConfig.key === 'pffGrade') {
        aValue = a.pffGrade || 0
        bValue = b.pffGrade || 0
      } else if (sortConfig.key === 'name') {
        aValue = a.name
        bValue = b.name
      } else if (sortConfig.key === 'savings') {
        aValue = a.salary[selectedYear]?.savings || 0
        bValue = b.salary[selectedYear]?.savings || 0
      } else {
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
      }
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })

    // Keep dead cap entries at the bottom
    const activePlayers = result.filter(p => p.contractStatus !== 'Dead Cap' && p.contractStatus !== 'VOID')
    const deadCapPlayers = result.filter(p => p.contractStatus === 'Dead Cap' || p.contractStatus === 'VOID')
    return [...activePlayers, ...deadCapPlayers]
  }, [players, filter, sortConfig, selectedYear, playerActions])

  const handlePlayerAction = (playerId, action) => {
    setPlayerActions(prev => {
      if (action === null) {
        const { [playerId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [playerId]: action }
    })
  }

  const handleAddPlayer = (newPlayer) => {
    setPlayers(prev => [...prev, newPlayer])
  }

  const handleRemoveAddedPlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId))
    // Also remove any actions for this player
    setPlayerActions(prev => {
      const { [playerId]: _, ...rest } = prev
      return rest
    })
  }

  const handleResetAll = () => {
    setPlayerActions({})
    // Remove all added free agents
    setPlayers(data.players)
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleShareMoves = async () => {
    if (availableCap < 0) {
      setShareError('Get under the cap to share moves.')
      setTimeout(() => setShareError(''), 2500)
      return
    }

    const postJune1Count = Object.values(playerActions).filter(action => action?.type === 'cut_post_june1').length
    const groupedMoves = {
      'Cuts (Pre-June 1)': [],
      'Cuts (Post-June 1)': [],
      'Trades': [],
      'Franchise Tags': [],
      'RFA Tenders': [],
      'Restructures': [],
      'Re-signs': [],
      'Free Agent Signings': []
    }

    Object.entries(playerActions).forEach(([id, action]) => {
      const player = players.find(p => p.id === Number(id)) || action.player
      const yearSalary = player?.salary?.[selectedYear]

      switch (action.type) {
        case 'cut_pre_june1':
          groupedMoves['Cuts (Pre-June 1)'].push(
            `Cut (Pre-June 1): ${player?.name} — Save ${formatMoney(yearSalary?.savings || 0)}, Dead ${formatMoney(yearSalary?.dead || 0)}`
          )
          break
        case 'cut_post_june1':
          groupedMoves['Cuts (Post-June 1)'].push(
            `Cut (Post-June 1): ${player?.name} — Save ${formatMoney(yearSalary?.savings || 0)}, Dead ${formatMoney(action.year1Dead || 0)} in ${selectedYear}, ${formatMoney(action.year2Dead || 0)} in ${Number(selectedYear) + 1}`
          )
          break
        case 'trade':
          groupedMoves['Trades'].push(`Trade: ${player?.name} — Dead ${formatMoney(yearSalary?.dead || 0)}`)
          break
        case 'franchise_tag':
          groupedMoves['Franchise Tags'].push(
            `Franchise Tag: ${player?.name} — ${formatMoney(action.value || FRANCHISE_TAG_VALUES[player?.position] || 15000000)}`
          )
          break
        case 'rfa_tender_original':
          groupedMoves['RFA Tenders'].push(`RFA Tender (Original): ${player?.name} — ${formatMoney(action.value || 0)}`)
          break
        case 'rfa_tender_second':
          groupedMoves['RFA Tenders'].push(`RFA Tender (Second): ${player?.name} — ${formatMoney(action.value || 0)}`)
          break
        case 'rfa_tender_first':
          groupedMoves['RFA Tenders'].push(`RFA Tender (First): ${player?.name} — ${formatMoney(action.value || 0)}`)
          break
        case 'restructure':
          groupedMoves['Restructures'].push(`Restructure: ${player?.name} — Savings ${formatMoney(action.savings || 0)}`)
          break
        case 'resign': {
          const yearsLabel = action.years === 1 ? 'year' : 'years'
          groupedMoves['Re-signs'].push(`Re-sign: ${player?.name} — ${action.years} ${yearsLabel} @ ${formatMoney(action.aav || 0)}/yr`)
          break
        }
        default:
          break
      }
    })

    players
      .filter(player => player.isAddedFreeAgent)
      .forEach(player => {
        groupedMoves['Free Agent Signings'].push(
          `Sign FA: ${player.name} — ${player.contractDetails?.years || 1} years`
        )
      })

    const moveSections = Object.entries(groupedMoves)
      .filter(([, items]) => items.length > 0)
      .flatMap(([title, items]) => [title + ':', ...items, ''])

    const shareText = [
      `Available Space: ${formatMoney(availableCap)}`,
      'Moves:',
      ...(moveSections.length > 0 ? moveSections : ['No cap moves yet'])
    ].join('\n').trim()

    try {
      await navigator.clipboard.writeText(shareText)
      setShareStatus('Copied to clipboard')
      setShareError('')
      setTimeout(() => setShareStatus(''), 2000)
    } catch (error) {
      setShareError('Unable to copy')
      setTimeout(() => setShareError(''), 2000)
    }
  }

  const totalActions = Object.keys(playerActions).length
  const addedPlayersCount = players.filter(p => p.isAddedFreeAgent).length

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-cowboys-navy border-4 border-cowboys-silver flex items-center justify-center">
            <span className="text-2xl font-bold text-white">★</span>
          </div>
      <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Cowboys Cap Tool
            </h1>
            <p className="text-cowboys-silver text-sm">
              2026 Offseason Salary Cap Manager
            </p>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Data sourced from <a href="https://www.spotrac.com/nfl/dallas-cowboys/yearly" target="_blank" rel="noopener noreferrer" className="text-cowboys-silver hover:text-white underline">Spotrac</a> and <a href="https://www.bloggingtheboys.com/post/U3xiThW_yA8U" target="_blank" rel="noopener noreferrer" className="text-cowboys-silver hover:text-white underline">Blogging The Boys (PFF Grades)</a>
        </p>
      </header>

      {/* Year Selector */}
      <YearSelector 
        selectedYear={selectedYear} 
        onYearChange={setSelectedYear}
        availableYears={Object.keys(data.salaryCap)}
      />

      {/* Cap Summary */}
      <CapSummary 
        salaryCap={salaryCap}
        totalCapHit={totalCapHit}
        totalDeadMoney={totalDeadMoney}
        baseDeadMoney={baseDeadMoney}
        availableCap={availableCap}
        actionsCount={totalActions + addedPlayersCount}
        actionsSummary={actionsSummary}
        onShareMoves={handleShareMoves}
        shareStatus={shareStatus}
        shareError={shareError}
        onResetAll={handleResetAll}
        selectedYear={selectedYear}
      />

      {/* Filter Bar + Add Free Agent Button */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="flex-1">
          <FilterBar 
            filter={filter}
            onFilterChange={setFilter}
          />
      </div>
        <button
          onClick={() => setShowAddFreeAgent(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all border border-green-500/30 font-medium whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Sign Free Agent
        </button>
      </div>

      {/* Roster Table */}
      <RosterTable 
        players={filteredPlayers}
        playerActions={playerActions}
        onPlayerClick={setSelectedPlayer}
        onRemovePlayer={handleRemoveAddedPlayer}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedYear={selectedYear}
        salaryCap={salaryCap}
      />

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          selectedYear={selectedYear}
          onPlayerAction={handlePlayerAction}
          playerActions={playerActions}
        />
      )}

      {/* Add Free Agent Modal */}
      {showAddFreeAgent && (
        <AddFreeAgentModal
          onClose={() => setShowAddFreeAgent(false)}
          onAddPlayer={handleAddPlayer}
          selectedYear={selectedYear}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-xs">
        <p>Built for Dallas Cowboys fans • Not affiliated with the Dallas Cowboys or NFL</p>
        <p className="mt-1">Salary Cap: ${(salaryCap / 1000000).toFixed(0)}M for {selectedYear}</p>
      </footer>
    </div>
  )
}

function getPositionGroup(position) {
  const groups = {
    'QB': 'OFF',
    'RB': 'OFF',
    'FB': 'OFF',
    'WR': 'OFF',
    'TE': 'OFF',
    'LT': 'OL',
    'LG': 'OL',
    'C': 'OL',
    'RG': 'OL',
    'RT': 'OL',
    'G': 'OL',
    'DE': 'DEF',
    'DT': 'DEF',
    'LB': 'DEF',
    'CB': 'DEF',
    'S': 'DEF',
    'ED': 'DEF',
    'DL': 'DEF',
    'P': 'ST',
    'K': 'ST',
    'LS': 'ST'
  }
  return groups[position] || 'OTHER'
}

export default App
