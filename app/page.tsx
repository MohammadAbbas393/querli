'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion'

const MotionLink = motion(Link)
import {
  Database,
  Zap,
  Shield,
  Lock,
  ArrowRight,
  Check,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  Code2,
  MessageSquare,
  Key,
  Sparkles,
  BarChart2,
  Table,
  LineChart,
  Eye,
  ExternalLink,
  RefreshCw,
  Globe,
  Clock,
  GitBranch,
  Activity,
  Send,
  Cpu,
  Layers,
} from 'lucide-react'

// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1]

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
}

const stagger = (d = 0.1) => ({
  initial: {},
  animate: { transition: { staggerChildren: d } },
})

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────
// DATA PARTICLES CANVAS
// ─────────────────────────────────────────────
function DataParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    type P = { x: number; y: number; vx: number; vy: number; r: number; pulse: number }
    const count = Math.floor((window.innerWidth * window.innerHeight) / 14000)
    const particles: P[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      pulse: Math.random() * Math.PI * 2,
    }))

    const LINK_DIST = 160
    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        a.pulse += 0.015
        const alpha = 0.3 + Math.sin(a.pulse) * 0.12

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DIST) {
            const op = ((1 - dist / LINK_DIST) * 0.18).toFixed(3)
            ctx.strokeStyle = `rgba(139,92,246,${op})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        ctx.fillStyle = `rgba(167,139,250,${alpha})`
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fill()

        a.x += a.vx
        a.y += a.vy
        if (a.x < 0 || a.x > canvas.width) a.vx *= -1
        if (a.y < 0 || a.y > canvas.height) a.vy *= -1
      }
    }

    const id = setInterval(draw, 40)
    const onResize = () => {
      resize()
    }
    window.addEventListener('resize', onResize)
    return () => { clearInterval(id); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-[0.55]"
      style={{ pointerEvents: 'none' }}
    />
  )
}

// ─────────────────────────────────────────────
// QUERY DEMO DATA
// ─────────────────────────────────────────────
type DemoType = 'bar' | 'line' | 'table'

interface Demo {
  question: string
  sql: string
  type: DemoType
  bar?: { label: string; value: number; color: string }[]
  line?: { points: number[]; labels: string[] }
  table?: { cols: string[]; rows: string[][] }
  summary: string
  time: string
}

const DEMOS: Demo[] = [
  {
    question: 'Top 5 products by revenue this month?',
    sql: `SELECT p.name,
  SUM(oi.price * oi.quantity) AS revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= date_trunc('month', NOW())
GROUP BY p.name
ORDER BY revenue DESC
LIMIT 5;`,
    type: 'bar',
    bar: [
      { label: 'Pro Plan', value: 48200, color: '#8b5cf6' },
      { label: 'Analytics', value: 32100, color: '#7c3aed' },
      { label: 'Team Seats', value: 21400, color: '#6d28d9' },
      { label: 'API Access', value: 18700, color: '#a78bfa' },
      { label: 'CSV Export', value: 9300, color: '#c4b5fd' },
    ],
    summary: '5 products · $129,700 total',
    time: '18ms',
  },
  {
    question: 'New user signups per week this month?',
    sql: `SELECT date_trunc('week', created_at) AS week,
  COUNT(*) AS signups
FROM users
WHERE created_at >= date_trunc('month', NOW())
GROUP BY week
ORDER BY week;`,
    type: 'line',
    line: { points: [142, 189, 267, 198], labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] },
    summary: '796 new users this month  (+31% vs last)',
    time: '12ms',
  },
  {
    question: "Customers who haven't ordered in 90 days?",
    sql: `SELECT u.name, u.email,
  MAX(o.created_at)::date AS last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email
HAVING MAX(o.created_at) < NOW() - INTERVAL '90 days'
ORDER BY last_order ASC
LIMIT 5;`,
    type: 'table',
    table: {
      cols: ['name', 'email', 'last order'],
      rows: [
        ['Sarah Chen', 'sarah@acme.co', '92 days ago'],
        ['Marcus Lee', 'marcus@co.io', '104 days ago'],
        ['Priya Nair', 'priya@startup.ai', '118 days ago'],
        ['Tom Walsh', 'tom@corp.com', '127 days ago'],
        ['Lisa Park', 'lisa@dev.co', '143 days ago'],
      ],
    },
    summary: '247 at-risk customers found',
    time: '34ms',
  },
  {
    question: 'Average order value by city (top 6)?',
    sql: `SELECT u.city,
  ROUND(AVG(o.total), 2) AS avg_order,
  COUNT(o.id) AS orders
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.city IS NOT NULL
GROUP BY u.city
ORDER BY avg_order DESC
LIMIT 6;`,
    type: 'bar',
    bar: [
      { label: 'SF', value: 284, color: '#8b5cf6' },
      { label: 'NYC', value: 261, color: '#7c3aed' },
      { label: 'Austin', value: 247, color: '#a78bfa' },
      { label: 'Chicago', value: 198, color: '#6d28d9' },
      { label: 'Seattle', value: 187, color: '#c4b5fd' },
      { label: 'Boston', value: 163, color: '#5b21b6' },
    ],
    summary: '6 cities · $223 avg order value',
    time: '21ms',
  },
]

// ─────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────
function HBarChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...bars.map((b) => b.value))
  return (
    <div className="space-y-2.5 py-1">
      {bars.map(({ label, value, color }, i) => {
        const pct = Math.round((value / max) * 100)
        const display = value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`
        return (
          <div key={label} className="flex items-center gap-2.5 text-[11px] font-mono">
            <span className="text-slate-500 w-16 text-right shrink-0">{label}</span>
            <div className="flex-1 h-5 bg-slate-900/60 rounded-md overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.55, ease, delay: i * 0.07 }}
                className="h-full rounded-md flex items-center justify-end pr-1.5"
                style={{ backgroundColor: color + 'cc' }}
              />
            </div>
            <span className="text-slate-400 w-12 shrink-0">{display}</span>
          </div>
        )
      })}
    </div>
  )
}

function SvgLineChart({
  points,
  labels,
}: {
  points: number[]
  labels: string[]
}) {
  const W = 340
  const H = 110
  const pad = { t: 8, b: 22, l: 10, r: 10 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  const xy = points.map((p, i) => ({
    x: pad.l + (i / (points.length - 1)) * iW,
    y: pad.t + iH - ((p - min) / range) * iH,
  }))

  const linePath = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${xy[xy.length - 1].x},${pad.t + iH} L${xy[0].x},${pad.t + iH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="qarea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area */}
      <motion.path
        d={areaPath}
        fill="url(#qarea)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      />

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      {/* Dots */}
      {xy.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="#8b5cf6"
          stroke="#0a0719"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
        />
      ))}

      {/* X labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={pad.l + (i / (labels.length - 1)) * iW}
          y={H - 3}
          textAnchor="middle"
          fontSize="9"
          fill="#475569"
          fontFamily="monospace"
        >
          {l}
        </text>
      ))}

      {/* Value labels */}
      {xy.map((p, i) => (
        <motion.text
          key={i}
          x={p.x}
          y={p.y - 7}
          textAnchor="middle"
          fontSize="8.5"
          fill="#a78bfa"
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 + i * 0.1 }}
        >
          {points[i]}
        </motion.text>
      ))}
    </svg>
  )
}

function DemoTable({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="border-b border-slate-800/80">
            {cols.map((c) => (
              <th key={c} className="text-left py-1.5 px-2 text-slate-500 font-normal capitalize">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09 }}
              className="border-b border-slate-900/60 hover:bg-violet-500/5 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-1.5 px-2 ${j === 0 ? 'text-white' : 'text-slate-400'}`}
                >
                  {cell}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────
// SQL SYNTAX HIGHLIGHTER (inline)
// ─────────────────────────────────────────────
function SqlBlock({ sql }: { sql: string }) {
  const keywords =
    /\b(SELECT|FROM|JOIN|ON|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|LEFT|RIGHT|INNER|AND|OR|AS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|ROUND|DATE_TRUNC|INTERVAL|NOW|COALESCE|CASE|WHEN|THEN|ELSE|END|NOT|NULL|IN|LIKE|BETWEEN|IS)\b/gi

  const lines = sql.split('\n').map((line, i) => {
    const parts: { text: string; cls: string }[] = []
    let last = 0
    const regex = new RegExp(keywords.source, 'gi')
    let m: RegExpExecArray | null

    while ((m = regex.exec(line)) !== null) {
      if (m.index > last) parts.push({ text: line.slice(last, m.index), cls: 'text-slate-300' })
      const kw = m[0].toUpperCase()
      const cls =
        ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'ROUND', 'DATE_TRUNC', 'INTERVAL', 'NOW', 'COALESCE'].includes(kw)
          ? 'text-cyan-300'
          : 'text-violet-300 font-semibold'
      parts.push({ text: m[0], cls })
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push({ text: line.slice(last), cls: 'text-slate-300' })

    return (
      <div key={i} className="leading-[1.55]">
        {parts.map((p, j) => (
          <span key={j} className={p.cls}>
            {p.text}
          </span>
        ))}
      </div>
    )
  })

  return <div className="font-mono text-[11px]">{lines}</div>
}

// ─────────────────────────────────────────────
// QUERY DEMO WIDGET
// ─────────────────────────────────────────────
type Phase = 'typing' | 'sql_loading' | 'sql_visible' | 'results'

function QueryDemo() {
  const [demoIdx, setDemoIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')
  const [typedQ, setTypedQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const started = useRef(false)

  const runDemo = useCallback(async (idx: number, cancelled: { v: boolean }) => {
    const demo = DEMOS[idx]
    setTypedQ('')
    setPhase('typing')

    // Type question
    for (let i = 0; i <= demo.question.length; i++) {
      if (cancelled.v) return
      setTypedQ(demo.question.slice(0, i))
      await sleep(28)
    }

    await sleep(320)
    if (cancelled.v) return
    setPhase('sql_loading')

    await sleep(950)
    if (cancelled.v) return
    setPhase('sql_visible')

    await sleep(680)
    if (cancelled.v) return
    setPhase('results')

    await sleep(4000)
    if (cancelled.v) return
    setDemoIdx((p) => (p + 1) % DEMOS.length)
  }, [])

  useEffect(() => {
    if (!isInView || started.current) return
    started.current = true
    const c = { v: false }
    runDemo(0, c)
    return () => { c.v = true }
  }, [isInView, runDemo])

  const prevIdx = useRef(-1)
  useEffect(() => {
    if (!started.current || demoIdx === prevIdx.current) return
    prevIdx.current = demoIdx
    const c = { v: false }
    runDemo(demoIdx, c)
    return () => { c.v = true }
  }, [demoIdx, runDemo])

  const demo = DEMOS[demoIdx]
  const isTyping = phase === 'typing'

  return (
    <div ref={ref} className="query-demo rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-[#080515]/80 border-b border-violet-900/30">
        <div className="flex gap-1.5 mr-1">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <Database className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs text-slate-400 font-mono flex-1">DemoShop · 8 tables · 47K rows</span>

        {/* Demo dots */}
        <div className="flex gap-1.5">
          {DEMOS.map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              animate={{ backgroundColor: i === demoIdx ? '#8b5cf6' : '#334155' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="p-5 min-h-[340px] flex flex-col gap-4">
        {/* User bubble */}
        <div className="flex justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-violet-600/20 border border-violet-500/25 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[88%]"
          >
            <p className="text-sm text-white leading-snug">
              {typedQ}
              {isTyping && (
                <span className="text-violet-400 animate-blink ml-0.5">|</span>
              )}
            </p>
          </motion.div>
        </div>

        {/* AI response */}
        <AnimatePresence>
          {phase !== 'typing' && (
            <motion.div
              key={`resp-${demoIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex justify-start"
            >
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl rounded-tl-sm p-4 w-full max-w-full space-y-3">
                {/* SQL Loading */}
                {phase === 'sql_loading' && (
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-violet-400 text-xs font-mono">Generating SQL query...</span>
                  </div>
                )}

                {/* SQL visible */}
                {(phase === 'sql_visible' || phase === 'results') && (
                  <AnimatePresence>
                    <motion.div
                      key="sql"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.35 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Code2 className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] text-violet-400 font-mono">Generated SQL</span>
                        <span className="ml-auto text-[10px] text-slate-600 font-mono">PostgreSQL</span>
                      </div>
                      <div className="bg-[#04021a]/70 rounded-xl px-4 py-3 border border-slate-800/40 overflow-auto scrollbar-none max-h-36">
                        <SqlBlock sql={demo.sql} />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Results */}
                {phase === 'results' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-2 pt-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] text-emerald-400 font-mono">{demo.summary}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">{demo.time}</span>
                    </div>

                    {demo.type === 'bar' && demo.bar && <HBarChart bars={demo.bar} />}
                    {demo.type === 'line' && demo.line && (
                      <SvgLineChart points={demo.line.points} labels={demo.line.labels} />
                    )}
                    {demo.type === 'table' && demo.table && (
                      <DemoTable cols={demo.table.cols} rows={demo.table.rows} />
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input footer */}
      <div className="px-5 py-3.5 border-t border-violet-900/20 bg-[#06031a]/60">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-sm text-slate-600">Ask anything about your data...</span>
          </div>
          <motion.div
            className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
            whileHover={{ scale: 1.08, backgroundColor: '#7c3aed' }}
            whileTap={{ scale: 0.92 }}
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────
function Counter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  target: number
  suffix?: string
  prefix?: string
  decimals?: number
}) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const steps = 70
    const inc = target / steps
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + inc, target)
      setN(parseFloat(cur.toFixed(decimals)))
      if (cur >= target) clearInterval(id)
    }, 1800 / steps)
    return () => clearInterval(id)
  }, [inView, target, decimals])

  return (
    <span ref={ref}>
      {prefix}{n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

// ─────────────────────────────────────────────
// FLOATING BADGE
// ─────────────────────────────────────────────
function FloatBadge({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute glass-bright rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium shadow-xl ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#05020f]/90 backdrop-blur-2xl border-b border-violet-900/30 shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }}>
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-violet-400" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-lg bg-violet-400/15 blur-md"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          <span className="font-bold text-[1.2rem] tracking-tight">
            <span className="text-white">Quer</span>
            <span className="text-violet-400">li</span>
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-mono text-violet-400/60 border border-violet-400/20 rounded px-1.5 py-0.5 bg-violet-400/5">
            BETA
          </span>
        </motion.div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7">
          {['Features', 'How it works', 'Use cases', 'Pricing'].map((l) => (
            <MotionLink
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              whileHover={{ y: -1 }}
            >
              {l}
            </MotionLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <MotionLink
            href="/login"
            className="hidden sm:flex px-4 py-2 text-slate-300 hover:text-white text-sm font-medium glass-bright rounded-xl border border-violet-500/10 transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Sign in
          </MotionLink>
          <MotionLink
            href="/signup"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get started free
          </MotionLink>
        </div>
      </div>
    </motion.nav>
  )
}

// ─────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────
interface Feat {
  icon: React.ReactNode
  title: string
  desc: string
  badge?: string
  color: string
}

const FEATURES: Feat[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Natural Language to SQL',
    desc: 'Ask in plain English. Groq\'s llama-3.3-70b converts your question to perfect SQL using your actual schema as context.',
    badge: 'AI-powered',
    color: 'text-violet-400',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Beautiful Auto-Charts',
    desc: 'AI picks the best visualization — bar, line, pie, or table — based on your data shape. Recharts renders it instantly.',
    badge: 'Auto-viz',
    color: 'text-amber-400',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Read-Only. Always.',
    desc: 'Every query is validated for SELECT-only. We enforce read-only Postgres roles and 10s timeouts. Your data can never be modified.',
    badge: 'Zero risk',
    color: 'text-emerald-400',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Connect in 60 Seconds',
    desc: 'Paste your connection string. Querli reads your schema (tables, columns, types, foreign keys) and caches it automatically.',
    badge: 'Instant setup',
    color: 'text-cyan-400',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Query History & Saved',
    desc: 'Every query is saved. Re-run, edit, and share with teammates. Build a library of your most useful business queries.',
    badge: 'Team sharing',
    color: 'text-pink-400',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Multi-DB Support',
    desc: 'PostgreSQL, MySQL, and SQLite today. MongoDB, BigQuery, and Snowflake coming soon. One UI for all your data.',
    badge: '3 databases',
    color: 'text-blue-400',
  },
]

function FeatureCard({ f, i }: { f: Feat; i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-50, 50], [5, -5]), { stiffness: 300, damping: 30 })
  const ry = useSpring(useTransform(mx, [-50, 50], [-5, 5]), { stiffness: 300, damping: 30 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease, delay: i * 0.08 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left - r.width / 2)
        my.set(e.clientY - r.top - r.height / 2)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      className="group relative glass rounded-2xl p-6 card-hover border border-violet-900/30 cursor-default"
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.color}`}
          style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
          <span className={f.color}>{f.icon}</span>
        </div>
        {f.badge && (
          <span className="text-[10px] font-mono text-slate-500 border border-slate-700/60 rounded-full px-2 py-0.5 bg-slate-900/50">
            {f.badge}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

      <div className="mt-4 flex items-center gap-1 text-xs text-slate-700 group-hover:text-violet-400/60 transition-colors">
        <span>Learn more</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Home() {
  const [annual, setAnnual] = useState(false)
  const [activeUseCase, setActiveUseCase] = useState(0)
  const { scrollYProgress } = useScroll()
  const barWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const prices = { pro: annual ? 23 : 29, team: annual ? 39 : 49 }

  const useCases = [
    {
      persona: 'Sales Teams',
      icon: <TrendingUp className="w-4 h-4" />,
      queries: [
        'How many deals closed this month vs last month?',
        'Which accounts haven\'t been contacted in 30 days?',
        'Show me pipeline value by rep this quarter',
        'What\'s our average deal size by industry?',
      ],
      color: 'text-amber-400',
    },
    {
      persona: 'Founders',
      icon: <Cpu className="w-4 h-4" />,
      queries: [
        'What\'s our MRR trend for the last 12 months?',
        'Which features do paying users use most?',
        'Show me churn rate by plan type',
        'What\'s our CAC by acquisition channel?',
      ],
      color: 'text-violet-400',
    },
    {
      persona: 'Marketing',
      icon: <Activity className="w-4 h-4" />,
      queries: [
        'Users who signed up from Google Ads this week?',
        'Which landing page converts best?',
        'Email open rate by campaign last month',
        'Countries with highest signup rate?',
      ],
      color: 'text-cyan-400',
    },
    {
      persona: 'Operations',
      icon: <Layers className="w-4 h-4" />,
      queries: [
        'Average order fulfillment time this week?',
        'Show low inventory products (stock < 20)',
        'Failed payments in the last 7 days?',
        'Support tickets by category this month',
      ],
      color: 'text-emerald-400',
    },
  ]

  return (
    <>
      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 z-[100]"
        style={{ width: barWidth }}
      />

      <Nav />

      {/* ══════════════════════════
          HERO
         ══════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden noise">
        <DataParticles />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-14">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 glass-bright rounded-full mb-6 text-xs font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              <span className="text-violet-300">AI Database Agent</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">No SQL required</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Free forever</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.4 }}
              className="text-5xl lg:text-6xl xl:text-[4.2rem] font-bold leading-[1.1] tracking-tight mb-6"
            >
              Ask your database
              <br />
              <span className="gradient-text">anything.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-slate-400 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg"
            >
              Connect your Postgres, MySQL or SQLite database. Type a question in plain English.
              Get beautiful charts and tables — instantly. No SQL knowledge needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10"
            >
              <MotionLink
                href="/signup"
                className="group relative px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2 justify-center shadow-xl shadow-violet-500/25 overflow-hidden"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Try demo — Free</span>
              </MotionLink>

              <MotionLink
                href="/signup"
                className="px-6 py-3.5 glass-bright text-slate-300 hover:text-white font-medium rounded-xl transition-all text-sm flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Database className="w-4 h-4" />
                Connect your database
                <ArrowRight className="w-3.5 h-3.5" />
              </MotionLink>
            </motion.div>

            {/* Mini trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              {[
                { icon: <Lock className="w-3.5 h-3.5 text-emerald-400" />, text: 'Read-only queries' },
                { icon: <Key className="w-3.5 h-3.5 text-violet-400" />, text: 'Encrypted connections' },
                { icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />, text: 'Postgres, MySQL, SQLite' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-slate-500">
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Demo Widget */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="flex-1 relative w-full max-w-[520px]"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <QueryDemo />
            </motion.div>

            {/* Floating badges */}
            <FloatBadge className="-left-8 top-20 hidden lg:flex" delay={0.5}>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 text-[11px]">Read-only · 0 risk</span>
            </FloatBadge>

            <FloatBadge className="-right-6 bottom-20 hidden lg:flex" delay={1.5}>
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-[11px]">Auto chart selected</span>
            </FloatBadge>

            <FloatBadge className="right-6 top-8 hidden lg:flex" delay={1}>
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-violet-300 text-[11px]">SQL in 0.9s</span>
            </FloatBadge>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-violet-500/12 blur-2xl rounded-full pointer-events-none" />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-slate-700 text-xs font-mono">scroll to explore</span>
          <motion.div
            className="w-[1px] h-8 bg-gradient-to-b from-transparent via-violet-500/60 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════
          MARQUEE
         ══════════════════════════ */}
      <div className="border-y border-violet-900/30 bg-[#080515]/60 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(4).fill(null).flatMap(() => [
            { icon: <Database className="w-3.5 h-3.5 text-violet-400" />, t: 'PostgreSQL · MySQL · SQLite' },
            { icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, t: 'SQL generated in under 1 second' },
            { icon: <Lock className="w-3.5 h-3.5 text-emerald-400" />, t: 'Read-only · your data is safe' },
            { icon: <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />, t: 'Bar · Line · Pie · Table charts' },
            { icon: <Star className="w-3.5 h-3.5 text-pink-400" />, t: 'No SQL knowledge required' },
            { icon: <Users className="w-3.5 h-3.5 text-violet-400" />, t: 'Built for Sales, Ops, Founders' },
            { icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />, t: 'Demo database pre-loaded' },
            { icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />, t: 'Connect in 60 seconds' },
          ]).map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm text-slate-500 font-mono">
              {item.icon}{item.t}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════
          STATS
         ══════════════════════════ */}
      <section className="py-24 bg-[#070412]/60">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { n: 8400, s: '+', l: 'Queries answered', c: 'text-violet-400' },
              { n: 320, s: '+', l: 'Databases connected', c: 'text-cyan-400' },
              { n: 99.2, s: '%', l: 'SQL accuracy', c: 'text-emerald-400', d: 1 },
              { n: 0.8, s: 's', l: 'Avg generation time', c: 'text-amber-400', d: 1 },
            ].map(({ n, s, l, c, d }) => (
              <motion.div
                key={l}
                variants={scaleIn}
                className="glass rounded-2xl p-6 border border-violet-900/20 text-center hover:border-violet-800/40 transition-colors"
              >
                <div className={`text-4xl font-bold ${c} mb-1`}>
                  <Counter target={n} suffix={s} decimals={d} />
                </div>
                <div className="text-slate-500 text-sm">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════
          PROBLEM
         ══════════════════════════ */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-violet-400/80 border border-violet-500/20 bg-violet-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                The Problem
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Your data is{' '}
              <span className="gradient-text-violet">locked away</span>
              <br />from your team.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every time someone on sales, marketing, or ops wants a number, they have to wait
              for an engineer. That&apos;s lost hours every week — on both sides.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                who: '"Can you pull how many deals closed this month?"',
                to: 'Slack DM → engineer',
                wait: '2–6 hours',
                icon: <MessageSquare className="w-5 h-5 text-slate-500" />,
              },
              {
                who: '"I need a chart of signups by country for the board deck"',
                to: 'Jira ticket → backlog',
                wait: '2–5 days',
                icon: <BarChart2 className="w-5 h-5 text-slate-500" />,
              },
              {
                who: '"Which customers are at risk of churning this month?"',
                to: 'Spreadsheet request → manual export',
                wait: '1–3 days',
                icon: <TrendingUp className="w-5 h-5 text-slate-500" />,
              },
            ].map(({ who, to, wait, icon }) => (
              <motion.div
                key={wait}
                variants={scaleIn}
                className="group glass rounded-2xl p-6 border border-violet-900/20 hover:border-violet-800/40 transition-all card-hover"
              >
                <div className="mb-4">{icon}</div>
                <blockquote className="text-slate-300 text-sm italic leading-relaxed mb-5">
                  &ldquo;{who}&rdquo;
                </blockquote>
                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-xs text-slate-600">{to}</span>
                  <span className="text-xs font-mono font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5">
                    {wait}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 p-5 glass-bright rounded-2xl border border-violet-500/20 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto text-center sm:text-left"
          >
            <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">With Querli</strong>, that same question takes{' '}
              <strong className="text-violet-300">3 seconds</strong> — and anyone on the team can ask it themselves.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════
          FEATURES
         ══════════════════════════ */}
      <section id="features" className="py-28 bg-[#070412]/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-violet-400/80 border border-violet-500/20 bg-violet-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Features
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Everything you need to{' '}
              <span className="gradient-text">democratize your data.</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          HOW IT WORKS
         ══════════════════════════ */}
      <section id="how-it-works" className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                How it works
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Connect. Ask.{' '}
              <span className="text-emerald-400">See results.</span>
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-14 left-[calc(16.666%)] right-[calc(16.666%)] h-[1px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.3, ease, delay: 0.3 }}
                className="h-full origin-left bg-gradient-to-r from-violet-500/60 via-cyan-500/60 to-emerald-500/60"
              />
            </div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger(0.2)}
              className="grid lg:grid-cols-3 gap-8"
            >
              {[
                {
                  step: '01', icon: <Database className="w-7 h-7" />,
                  title: 'Connect your database',
                  desc: 'Paste your connection string. We detect Postgres, MySQL, or SQLite automatically. Schema is read and cached.',
                  color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25',
                },
                {
                  step: '02', icon: <MessageSquare className="w-7 h-7" />,
                  title: 'Ask in plain English',
                  desc: 'Type any business question. The AI uses your real schema to generate precise, context-aware SQL.',
                  color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/25',
                },
                {
                  step: '03', icon: <BarChart2 className="w-7 h-7" />,
                  title: 'See beautiful results',
                  desc: 'Results come back as interactive charts or tables. Export CSV. Save and share with your team.',
                  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25',
                },
              ].map(({ step, icon, title, desc, color, bg }) => (
                <motion.div key={step} variants={fadeUp} className="flex flex-col items-center text-center">
                  <motion.div
                    className={`relative w-[72px] h-[72px] rounded-2xl ${bg} border flex items-center justify-center mb-6 ${color}`}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {icon}
                    <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-slate-600 bg-[#05020f] border border-slate-800 rounded px-1">
                      {step}
                    </span>
                  </motion.div>
                  <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          USE CASES
         ══════════════════════════ */}
      <section id="use-cases" className="py-28 bg-[#070412]/50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-cyan-400/80 border border-cyan-500/20 bg-cyan-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Use cases
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Built for every{' '}
              <span className="gradient-text">team member.</span>
            </motion.h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {useCases.map((uc, i) => (
              <motion.button
                key={uc.persona}
                onClick={() => setActiveUseCase(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeUseCase === i
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'glass text-slate-400 hover:text-white border border-violet-900/20'
                }`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className={activeUseCase === i ? 'text-white' : uc.color}>{uc.icon}</span>
                {uc.persona}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeUseCase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="glass-bright rounded-2xl p-6 border border-violet-500/15"
            >
              <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-4">
                Example queries for {useCases[activeUseCase].persona}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {useCases[activeUseCase].queries.map((q, i) => (
                  <motion.div
                    key={q}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 bg-slate-900/50 rounded-xl px-4 py-3 cursor-default hover:bg-violet-500/10 transition-colors group"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400/60 mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      &ldquo;{q}&rdquo;
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════
          SECURITY TRUST
         ══════════════════════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="flex flex-col lg:flex-row gap-12 items-center"
          >
            {/* Left */}
            <motion.div variants={fadeUp} className="flex-1 space-y-5">
              <span className="text-xs font-mono text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 rounded-full px-3 py-1 inline-block tracking-widest uppercase">
                Security
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold">
                Read-only.{' '}
                <span className="text-emerald-400">Always.</span>
                <br />
                Your data can never be modified.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Every AI-generated query is validated before execution. INSERT, UPDATE, DELETE, DROP, and ALTER are rejected instantly — no exceptions.
              </p>

              <div className="space-y-3">
                {[
                  'SQL validator rejects any non-SELECT statement',
                  'Read-only Postgres roles enforced at the database level',
                  '10-second query timeout prevents runaway queries',
                  'Connection strings encrypted at rest with AES-256',
                  'Schema cached — your data never leaves your server',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    {point}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Code block */}
            <motion.div variants={scaleIn} className="flex-1 w-full">
              <div className="terminal rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10">
                <div className="flex items-center gap-2 px-5 py-3 bg-[#04020e]/80 border-b border-violet-900/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono ml-2">sql_validator.py</span>
                </div>
                <div className="p-5 font-mono text-[12px] leading-[1.7]">
                  <div className="text-slate-600"># Every query passes through this before execution</div>
                  <div className="mt-2">
                    <span className="text-violet-300 font-semibold">FORBIDDEN </span>
                    <span className="text-slate-300">= [</span>
                    <span className="text-amber-300">'INSERT'</span>
                    <span className="text-slate-500">, </span>
                    <span className="text-amber-300">'UPDATE'</span>
                    <span className="text-slate-500">, </span>
                    <span className="text-amber-300">'DELETE'</span>
                    <span className="text-slate-500">,</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-amber-300">'DROP'</span>
                    <span className="text-slate-500">, </span>
                    <span className="text-amber-300">'ALTER'</span>
                    <span className="text-slate-500">, </span>
                    <span className="text-amber-300">'TRUNCATE'</span>
                    <span className="text-slate-500">, </span>
                    <span className="text-amber-300">'GRANT'</span>
                    <span className="text-slate-300">]</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-violet-300 font-semibold">def </span>
                    <span className="text-cyan-300">validate_read_only</span>
                    <span className="text-slate-300">(sql: </span>
                    <span className="text-amber-300">str</span>
                    <span className="text-slate-300">):</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">upper </span>
                    <span className="text-slate-500">= </span>
                    <span className="text-slate-300">sql.upper().strip()</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-violet-300 font-semibold">if not </span>
                    <span className="text-slate-300">upper.startswith(</span>
                    <span className="text-amber-300">'SELECT'</span>
                    <span className="text-slate-300">):</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-violet-300 font-semibold">raise </span>
                    <span className="text-cyan-300">SecurityError</span>
                    <span className="text-slate-300">(</span>
                    <span className="text-amber-300">'Only SELECT queries'</span>
                    <span className="text-slate-300">)</span>
                  </div>
                  <div className="pl-4 mt-1">
                    <span className="text-violet-300 font-semibold">for </span>
                    <span className="text-slate-400">kw </span>
                    <span className="text-violet-300 font-semibold">in </span>
                    <span className="text-slate-300">FORBIDDEN:</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-violet-300 font-semibold">if </span>
                    <span className="text-slate-300">kw </span>
                    <span className="text-violet-300 font-semibold">in </span>
                    <span className="text-slate-300">upper:</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-violet-300 font-semibold">raise </span>
                    <span className="text-cyan-300">SecurityError</span>
                    <span className="text-slate-300">(kw)</span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-4 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[11px]">All queries validated before execution</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════
          PRICING
         ══════════════════════════ */}
      <section id="pricing" className="py-28 bg-[#070412]/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="text-center mb-14"
          >
            <motion.div variants={fadeUp}>
              <span className="text-xs font-mono text-amber-400/80 border border-amber-500/20 bg-amber-500/5 rounded-full px-3 py-1 mb-4 inline-block tracking-widest uppercase">
                Pricing
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold mb-5">
              Start free.
            </motion.h2>

            {/* Toggle */}
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-3 glass rounded-full px-2 py-2 border border-violet-900/30 mt-2"
            >
              {['Monthly', 'Annual'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setAnnual(i === 1)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    annual === (i === 1)
                      ? 'bg-white/10 text-white shadow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                  {i === 1 && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full px-1.5 py-0.5 font-mono">
                      −20%
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
            className="grid md:grid-cols-3 gap-6 items-stretch"
          >
            {/* Free */}
            <motion.div
              variants={scaleIn}
              className="glass rounded-2xl p-7 border border-violet-900/20 flex flex-col card-hover"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-6">
                <div className="text-slate-400 font-medium mb-1">Free</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-600 text-xs mt-1">Forever free</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['1 database connection', '50 queries / month', 'Bar & table charts', 'Query history (7 days)', 'Demo database access'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <MotionLink
                href="/signup"
                className="w-full py-3 glass-bright text-white font-semibold rounded-xl border border-violet-500/10 hover:border-violet-500/25 transition-colors text-sm text-center block"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                Get started free
              </MotionLink>
            </motion.div>

            {/* Pro */}
            <motion.div
              variants={scaleIn}
              className="relative rounded-2xl p-7 border border-violet-500/30 flex flex-col shadow-2xl shadow-violet-500/10"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(5,2,15,0.92))' }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="absolute -top-[1px] left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-mono font-bold text-violet-900 bg-violet-400 rounded-full px-2 py-0.5 tracking-wide">
                  POPULAR
                </span>
              </div>

              <div className="mb-6">
                <div className="text-violet-400 font-medium mb-1">Pro</div>
                <div className="flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={prices.pro}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-5xl font-bold text-white"
                    >
                      ${prices.pro}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  {annual ? `$${prices.pro * 12}/year billed annually` : 'billed monthly'}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {['5 database connections', 'Unlimited queries', 'All chart types', 'Query history (forever)', 'Export to CSV', 'Saved queries', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <MotionLink
                href="/signup"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-violet-500/20 text-center block"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                Start free trial
              </MotionLink>
            </motion.div>

            {/* Team */}
            <motion.div
              variants={scaleIn}
              className="glass rounded-2xl p-7 border border-violet-900/20 flex flex-col card-hover"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-6">
                <div className="text-cyan-400 font-medium mb-1">Team</div>
                <div className="flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={prices.team}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-5xl font-bold text-white"
                    >
                      ${prices.team}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  {annual ? `$${prices.team * 12}/year billed annually` : 'billed monthly'}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited connections', 'Unlimited queries', 'Shared dashboards', 'Saved team queries', 'REST API access', 'Slack integration', 'SSO + priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <MotionLink
                href="/signup"
                className="w-full py-3 glass-bright text-white font-semibold rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-colors text-sm text-center block"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                Contact sales
              </MotionLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════
          CTA
         ══════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/25 via-transparent to-cyan-950/15" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-500/6 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger(0.12)}
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="text-xs font-mono text-violet-400/80 border border-violet-500/20 bg-violet-500/5 rounded-full px-3 py-1 tracking-widest uppercase">
                Get started
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-bold mb-6">
              Your data has answers.
              <br />
              <span className="gradient-text">Stop waiting to ask.</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-slate-400 text-xl mb-10">
              Connect your database in 60 seconds. First 50 queries are free, forever.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MotionLink
                href="/signup"
                className="group relative px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-base flex items-center gap-2 justify-center shadow-2xl shadow-violet-500/30 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Try demo database — Free</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </MotionLink>

              <MotionLink
                href="/signup"
                className="px-8 py-4 glass-bright text-slate-300 hover:text-white font-medium rounded-2xl text-base flex items-center gap-2 justify-center border border-violet-500/15"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Database className="w-5 h-5" />
                Connect your own database
              </MotionLink>
            </motion.div>

            <motion.p variants={fadeIn} className="mt-6 text-slate-700 text-sm">
              No credit card · Postgres, MySQL, SQLite · Read-only · Your data never leaves your server
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════
          FOOTER
         ══════════════════════════ */}
      <footer className="border-t border-violet-900/30 bg-[#040210]/60 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">Quer</span>
                <span className="text-violet-400">li</span>
              </span>
              <span className="text-slate-700 text-sm ml-2">
                © {new Date().getFullYear()} Mohammad Abbas
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {['Features', 'Pricing', 'Docs', 'Blog', 'GitHub', 'Twitter'].map((l) => (
                <a key={l} href="#" className="text-slate-600 hover:text-slate-300 text-sm transition-colors">
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-slate-600 text-xs font-mono">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
