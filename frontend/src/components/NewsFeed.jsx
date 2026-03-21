import { Link } from 'react-router-dom'
import { Trophy, Star, Zap, Target, TrendingUp, Globe, Award, AlertCircle, Newspaper } from 'lucide-react'
import newsData from '../data/football_news.json'

const ICON_MAP = { Trophy, Star, Zap, Target, TrendingUp, Globe, Award, AlertCircle }

// Show only the first 5 in the sidebar feed
const PREVIEW = newsData.slice(0, 5)

function NewsFeed() {
  return (
    <div className="bg-[#111] rounded-xl border border-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900">
        <h3 className="text-sm font-bold text-white">Latest News</h3>
        <Link
          to="/news"
          className="text-xs font-medium text-white hover:text-neutral-300 transition-colors"
        >
          See all
        </Link>
      </div>

      <div className="divide-y divide-neutral-900">
        {PREVIEW.map(({ id, title, source, time, category, iconType, iconColor }) => {
          const Icon = ICON_MAP[iconType] || Newspaper
          const iconBg = `${iconColor}22`
          return (
            <article
              key={id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-900 cursor-pointer transition-colors"
            >
              {/* Icon badge */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: iconBg, border: `1px solid ${iconColor}33` }}
              >
                <Icon size={16} style={{ color: iconColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: iconColor }}
                >
                  {category}
                </span>
                <p className="text-xs font-medium text-white line-clamp-2 leading-relaxed">
                  {title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-neutral-500 font-medium">{source}</span>
                  <span className="text-neutral-700">·</span>
                  <span className="text-[10px] text-neutral-500">{time}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default NewsFeed
