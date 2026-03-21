import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function getDateRange(center, spread = 4) {
  const dates = []
  for (let i = -spread; i <= spread; i++) {
    const d = new Date(center)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function DateNav({ selectedDate, onSelectDate }) {
  const today = new Date()
  const [center, setCenter] = useState(selectedDate)
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Live', 'Finished', 'Upcoming']

  const dates = getDateRange(center)
  const isSame = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const isToday = d => isSame(d, today)

  const shift = dir => {
    const next = new Date(center)
    next.setDate(next.getDate() + dir * 5)
    setCenter(next)
  }

  return (
    <div className="bg-[#111] rounded-xl border border-neutral-900 overflow-hidden">
      {/* Date Scroller */}
      <div className="flex items-center gap-1 px-2 pt-3">
        <button
          onClick={() => shift(-1)}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors flex-shrink-0"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="flex-1 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
          {dates.map((d, i) => {
            const sel = isSame(d, selectedDate)
            const tod = isToday(d)
            return (
              <button
                key={i}
                onClick={() => onSelectDate(d)}
                className={`flex flex-col items-center py-2 px-2.5 rounded-xl min-w-[46px] transition-all relative flex-shrink-0 ${sel ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
              >
                <span className="text-[10px] font-semibold uppercase">{DAYS[d.getDay()]}</span>
                <span className={`text-sm font-bold ${sel ? '' : tod ? 'text-white' : ''}`}>{d.getDate()}</span>
                {tod && !sel && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => shift(1)}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors flex-shrink-0"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {/* Selected date label */}
      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        {isSame(selectedDate, today) ? 'Today' : `${DAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 pb-3 pt-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? f === 'Live' ? 'bg-neutral-800 text-white' : 'bg-white text-black'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            {f === 'Live' && <span className={`w-1.5 h-1.5 rounded-full ${filter === 'Live' ? 'bg-white animate-pulse' : 'bg-white'}`} />}
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DateNav
