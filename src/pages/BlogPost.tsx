import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { PostDetail } from '@/data/types'
import { useContent } from '@/data/content'
import { A } from '@/components/ui/A'

type Votes = { up: number; down: number }

const shareUrl = (kind: 'fb' | 'tw' | 'in') => {
  const url = encodeURIComponent(window.location.href)
  if (kind === 'fb') return `https://www.facebook.com/sharer/sharer.php?u=${url}`
  if (kind === 'tw') return `https://twitter.com/intent/tweet?url=${url}&hashtags=fordCR`
  return `https://www.linkedin.com/shareArticle?mini=true&url=${url}`
}

/** Artículo del blog. El cuerpo viene del CMS ya sanitizado. */
export function BlogPost() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/+$/, '')
  const { posts } = useContent()
  const known = posts.some((p) => p.path === path)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [missing, setMissing] = useState(false)
  const [votes, setVotes] = useState<Votes | null>(null)
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    setPost(null)
    setMissing(false)
    setVoted(false)
    if (!known) return
    const ctrl = new AbortController()
    fetch(`/blog-post.json?path=${encodeURIComponent(path)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<PostDetail>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        setPost(data)
        setVotes({ up: data.up, down: data.down })
        window.scrollTo(0, 0)
      })
      .catch((e) => e.name !== 'AbortError' && setMissing(true))
    return () => ctrl.abort()
  }, [path, known])

  const vote = async (kind: 'up' | 'down') => {
    if (voted || !post) return
    setVoted(true)
    try {
      const res = await fetch('/api/site/blog-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, kind }) })
      if (res.ok) setVotes((await res.json()) as Votes)
    } catch {
      setVoted(false)
    }
  }

  if (!known || missing) return <Navigate to="/404" replace />
  if (!post) return <main id="main-content" style={{ minHeight: '60vh' }} />

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container container--breadcrumb">
          <ol className="breadcrumb">
            <li>
              <i className="icon icon-arrow-left breadcrumb-back" />
            </li>
            <li>
              <A href="/">Inicio</A>
            </li>
            <li>{post.title}</li>
          </ol>
        </div>
        <div className="stats container" />
        <div className="container blog__stats">
          <div className="rating-container">
            <a
              href="#"
              className="poll thumbsUp"
              onClick={(e) => {
                e.preventDefault()
                vote('up')
              }}
            >
              <i className="mdi mdi-thumb-up" /> <span> {votes?.up ?? 0}</span>
            </a>
            <a
              href="#"
              className="poll thumbsDown"
              onClick={(e) => {
                e.preventDefault()
                vote('down')
              }}
            >
              <i className="mdi mdi-thumb-down" /> <span> {votes?.down ?? 0}</span>
            </a>
          </div>
          <span className="view__count">
            <i className="mdi mdi-eye" /> Visualizaciones: {post.views}
          </span>
        </div>
        {post.banner && (
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', maxWidth: '100%', padding: 10 }}>
              <img src={post.banner} alt="banner" style={{ maxWidth: '100%' }} />
            </div>
          </div>
        )}
        <div className="container">
          <h1 className="title title-margin" style={{ color: 'rgb(1, 48, 108)' }}>
            {post.heading}
          </h1>
        </div>
        <div className="container">
          <div className="container">
            <p className="text-medium">Compartir:</p>
            <section className="content_buttons blog-share">
              <div className="btn_social share_fb">
                <a href={shareUrl('fb')} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook">
                  <i className="icon icon-facebook" />
                </a>
              </div>
              <div className="btn_social share_twitter">
                <a className="twitter-share-button" href={shareUrl('tw')} target="_blank" rel="noopener noreferrer" aria-label="Compartir en X">
                  <i className="icon icon-twitter" />
                </a>
              </div>
              <div className="btn_social share_linkedin">
                <a className="linked-in" href={shareUrl('in')} target="_blank" rel="noopener noreferrer" title="Linkedin">
                  <i className="mdi mdi-linkedin" />
                </a>
              </div>
            </section>
          </div>
        </div>
        <div className="container">
          <div className="text" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
        </div>
      </div>
    </main>
  )
}
