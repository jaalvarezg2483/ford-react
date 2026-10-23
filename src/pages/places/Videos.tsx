import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { VideoModal } from '@/components/places/VideoModal'
import { useContent } from '@/data/content'
import type { VideoItem } from '@/data/types'
import { NotFound } from '@/pages/NotFound'

const PREVIEW = 5
const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function youtubeId(url: string): string {
  const m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(url) || /[?&]v=([A-Za-z0-9_-]{11})/.exec(url)
  return m?.[1] ?? ''
}

function thumb(video: VideoItem) {
  if (video.image) return video.image
  const id = youtubeId(video.youtube)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

function VideoCard({ video, onPlay }: { video: VideoItem; onPlay: (id: string, title: string) => void }) {
  const id = youtubeId(video.youtube)
  return (
    <li className="col-sm-6 col-md-4 gallery__item gallery__item--video filtr-item">
      <a
        href={video.youtube || '#'}
        className="js-popup-img js-popup-video img-container"
        title={video.name}
        onClick={(e) => {
          if (!id) return
          e.preventDefault()
          onPlay(id, video.name)
        }}
      >
        {thumb(video) ? <img src={thumb(video)} className="gallery__img" alt={video.name} /> : null}
        <button type="button" className="btn btn--primary">
          <i className="icon icon-play" /> Ver video
        </button>
      </a>
      <p>{video.name}</p>
    </li>
  )
}

/** Galería de videos: índice agrupado por categoría o listado de una categoría, con buscador ?name=. */
export function Videos() {
  const { videos = [] } = useContent()
  const { category: rawCategory } = useParams()
  const [params, setParams] = useSearchParams()
  const category = rawCategory ? decodeURIComponent(rawCategory) : ''
  const name = params.get('name') ?? ''
  const [draft, setDraft] = useState(name)
  const [playing, setPlaying] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => setDraft(name), [name])

  const categories = useMemo(() => {
    const order: string[] = []
    for (const v of videos) if (v.category && !order.includes(v.category)) order.push(v.category)
    return order
  }, [videos])

  const activeCategory = categories.find((c) => norm(c) === norm(category)) || ''
  const unknown = Boolean(category && categories.length && !activeCategory)
  const filtered = useMemo(() => {
    const term = norm(name.trim())
    return videos.filter((v) => (!activeCategory || v.category === activeCategory) && (!term || norm(`${v.name} ${v.description}`).includes(term)))
  }, [videos, activeCategory, name])

  const groups = useMemo(() => {
    if (activeCategory) return []
    return categories
      .map((c) => ({ name: c, items: filtered.filter((v) => v.category === c) }))
      .filter((g) => g.items.length)
  }, [categories, filtered, activeCategory])

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (draft.trim()) next.set('name', draft.trim())
    setParams(next)
  }

  if (unknown) return <NotFound />

  const action = category ? `/videos/${encodeURIComponent(category)}` : '/videos'

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container margin--top">
          <h1 className="title margin--top">Videos</h1>
        </div>
        <div className="container">
          <ul className="tabs">
            <li className={`tab${category ? '' : ' active'}`}>
              <A href="/videos">Todos</A>
            </li>
            {categories.map((c) => (
              <li className={`tab${c === activeCategory ? ' active' : ''}`} key={c}>
                <A href={`/videos/${encodeURIComponent(c)}`}>{c}</A>
              </li>
            ))}
          </ul>
        </div>
        <div className="container">
          <form id="form_search" action={action} onSubmit={onSearch}>
            <div className="find-us__search col-md-4">
              <div className="input-field">
                <input type="text" placeholder="Buscar Video" name="name" className="input" value={draft} onChange={(e) => setDraft(e.target.value)} />
              </div>
            </div>
          </form>
        </div>
        <div className="container">
          {activeCategory ? (
            <>
              <ul className="row gallery-slider margin--bottom">
                {filtered.map((video) => (
                  <VideoCard key={`${video.youtube}-${video.name}`} video={video} onPlay={(id, title) => setPlaying({ id, title })} />
                ))}
              </ul>
              {!filtered.length ? <p className="margin--bottom">No se encontraron videos.</p> : null}
            </>
          ) : (
            groups.map((group) => {
              const preview = group.items.slice(0, PREVIEW)
              return (
                <div key={group.name}>
                  <h2 className="title">{group.name}</h2>
                  <ul className="row gallery-slider margin--bottom">
                    {preview.map((video) => (
                      <VideoCard key={`${video.youtube}-${video.name}`} video={video} onPlay={(id, title) => setPlaying({ id, title })} />
                    ))}
                  </ul>
                  <div className="text-center margin--bottom">
                    <A href={`/videos/${encodeURIComponent(group.name)}`} className="btn btn--wider">
                      Ver todos
                    </A>
                  </div>
                </div>
              )
            })
          )}
          {!activeCategory && !groups.length ? <p className="margin--bottom">No se encontraron videos.</p> : null}
        </div>
      </div>
      {playing ? <VideoModal youtubeId={playing.id} title={playing.title} onClose={() => setPlaying(null)} /> : null}
    </main>
  )
}
