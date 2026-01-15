import { useState } from 'react'

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS', 'FB']

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
  'K': { low: 4000000, mid: 6000000, high: 8000000 },
  'P': { low: 3000000, mid: 5000000, high: 7000000 },
  'LS': { low: 1200000, mid: 1500000, high: 1800000 },
  'FB': { low: 2000000, mid: 3500000, high: 5000000 },
}


export default function AddFreeAgentModal({ onClose, onAddPlayer, selectedYear }) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('WR')
  const [age, setAge] = useState(27)
  const [pffGrade, setPffGrade] = useState('')
  const [years, setYears] = useState(3)
  const [aav, setAav] = useState('')

  const marketValue = MARKET_VALUES[position] || { low: 5000000, mid: 10000000, high: 15000000 }

  const formatMoney = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    return `$${(value / 1000).toFixed(0)}K`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !aav) return

    const aavValue = parseFloat(aav) * 1000000
    const newPlayer = {
      id: Date.now(), // Unique ID
      name: name.trim(),
      position,
      age: parseInt(age),
      pffGrade: pffGrade ? parseFloat(pffGrade) : null,
      salary: {
        [selectedYear]: {
          capHit: aavValue,
          baseSalary: aavValue * 0.4, // Estimate ~40% base
          dead: aavValue * 0.6 * (years / 5), // Estimate dead money
          savings: aavValue * 0.4 // Estimate savings
        }
      },
      contractStatus: 'Signed',
      freeAgentYear: parseInt(selectedYear) + years,
      note: 'Added as free agent signing',
      isAddedFreeAgent: true,
      contractDetails: { years, aav: aavValue }
    }

    // Add salary entries for future years
    for (let i = 1; i < years; i++) {
      const futureYear = (parseInt(selectedYear) + i).toString()
      newPlayer.salary[futureYear] = {
        capHit: aavValue,
        baseSalary: aavValue * 0.5,
        dead: aavValue * 0.5 * ((years - i) / years),
        savings: aavValue * 0.5
      }
    }

    onAddPlayer(newPlayer)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div 
        className="relative bg-gradient-to-br from-cowboys-navy to-cowboys-dark border border-cowboys-silver/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-cowboys-silver/20 bg-gradient-to-r from-green-500/20 to-transparent">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>➕</span> Sign Free Agent
          </h2>
          <p className="text-sm text-gray-400 mt-1">Add an external free agent to your roster</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Player Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Position & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Position *</label>
                  <select
                    value={position}
                    onChange={(e) => {
                      setPosition(e.target.value)
                      const market = MARKET_VALUES[e.target.value] || { mid: 10000000 }
                      setAav(Math.round(market.mid / 1000000).toString())
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={20}
                    max={45}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* PFF Grade */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">PFF Grade (optional)</label>
                <input
                  type="number"
                  value={pffGrade}
                  onChange={(e) => setPffGrade(e.target.value)}
                  placeholder="e.g. 75.5"
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Contract Details */}
              <div className="pt-4 border-t border-cowboys-silver/20">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Contract Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Years *</label>
                    <select
                      value={years}
                      onChange={(e) => setYears(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(y => (
                        <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">AAV (millions) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={aav}
                        onChange={(e) => setAav(e.target.value)}
                        placeholder={Math.round(marketValue.mid / 1000000).toString()}
                        step={0.5}
                        min={0.5}
                        className="w-full pl-7 pr-8 py-2 rounded-lg bg-black/40 border border-cowboys-silver/20 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">M</span>
                    </div>
                  </div>
                </div>

                {/* Quick AAV buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setAav(Math.round(marketValue.low / 1000000).toString())}
                    className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white border border-cowboys-silver/10"
                  >
                    Budget ({formatMoney(marketValue.low)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAav(Math.round(marketValue.mid / 1000000).toString())}
                    className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white border border-cowboys-silver/10"
                  >
                    Market ({formatMoney(marketValue.mid)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAav(Math.round(marketValue.high / 1000000).toString())}
                    className="flex-1 px-2 py-1 rounded text-xs bg-black/40 text-gray-400 hover:text-white border border-cowboys-silver/10"
                  >
                    Premium ({formatMoney(marketValue.high)})
                  </button>
                </div>
              </div>

              {/* Summary & Submit */}
              <div className="pt-4 border-t border-cowboys-silver/20 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Total: </span>
                  <span className="text-white font-bold">
                    {formatMoney((parseFloat(aav) || 0) * 1000000 * years)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    / {years}yr
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || !aav || parseFloat(aav) <= 0}
                  className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign Player
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  )
}

