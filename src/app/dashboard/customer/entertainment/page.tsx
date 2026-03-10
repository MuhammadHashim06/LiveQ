'use client'

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

// Curated video playlist — easy to extend
const videos = [
  {
    id: 'SnZcdx77xNc',
    title: 'How to Save Time with Smart Booking',
    channel: 'LiveQ Shorts',
    category: 'Productivity',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Quick Tips While You Wait',
    channel: 'LiveQ Tips',
    category: 'Lifestyle',
  },
  {
    id: 'LXb3EKWsInQ',
    title: 'Relaxing Lo-Fi Beats',
    channel: 'ChilledCow',
    category: 'Music',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio',
    channel: 'Lofi Girl',
    category: 'Music',
  },
  {
    id: 'in_vfqOq1OU',
    title: 'Mindfulness in 5 Minutes',
    channel: 'Wellness Hub',
    category: 'Wellness',
  },
]

const categories = ['All', 'Productivity', 'Lifestyle', 'Music', 'Wellness']

export default function EntertainmentPage() {
  const [activeVideo, setActiveVideo] = useState(videos[0])
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All' ? videos : videos.filter(v => v.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Entertainment Zone</h1>
        <p className="text-gray-500 mt-1">Sit back and enjoy while you wait for your turn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
            <iframe
              key={activeVideo.id}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeVideo.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{activeVideo.channel}</p>
              </div>
              <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                {activeVideo.category}
              </span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mt-3 transition"
            >
              <ExternalLink className="w-4 h-4" /> Open on YouTube
            </a>
          </div>
        </div>

        {/* Playlist / Sidebar */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeCategory === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video List */}
          <div className="space-y-3">
            {filtered.map((video) => (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 group ${activeVideo.id === video.id
                    ? 'bg-red-50 border-red-200 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-sm'
                  }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activeVideo.id === video.id ? 'bg-red-600' : 'bg-gray-100 group-hover:bg-red-50'
                  }`}>
                  <Play className={`w-4 h-4 ${activeVideo.id === video.id ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${activeVideo.id === video.id ? 'text-red-700' : 'text-gray-800'}`}>
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{video.channel} · {video.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
