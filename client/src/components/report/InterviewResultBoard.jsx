import { Card as HeroCard, CardBody, CardHeader as HeroCardHeader, Chip, Tab, Tabs } from '@heroui/react'
import { Box } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'
import { BrainCircuit, CheckCircle2, Sparkles, Target, TriangleAlert, XCircle } from 'lucide-react'
import { QuestionReviewPanel } from './QuestionReviewPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

const formatLabel = (value) =>
  value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const insightGroups = [
  {
    key: 'strengths',
    title: 'Strengths',
    icon: CheckCircle2,
    accent: 'success'
  },
  {
    key: 'weaknesses',
    title: 'Weaknesses',
    icon: TriangleAlert,
    accent: 'warning'
  },
  {
    key: 'tips',
    title: 'Next focus',
    icon: BrainCircuit,
    accent: 'gold'
  }
]

export const InterviewResultBoard = ({
  report,
  eyebrow = 'Interview result',
  title,
  summary,
  metaChips = [],
  action
}) => {
  const categoryEntries = Object.entries(report.categoryScores || {})
  const correctnessSummary = report.correctnessSummary || {
    correctAnswers: 0,
    partialAnswers: 0,
    incorrectAnswers: 0
  }

  const chartData = categoryEntries.map(([key, value]) => ({
    category: formatLabel(key),
    score: value
  }))

  return (
    <div className="grid gap-6">
      <HeroCard className="border border-white/45 bg-[linear-gradient(160deg,rgba(255,253,249,0.96),rgba(252,241,226,0.88))] shadow-[0_24px_60px_rgba(28,34,48,0.12)]">
        <HeroCardHeader className="flex flex-col gap-6 px-6 pb-0 pt-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700/75">
                {eyebrow}
              </p>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.05em] text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{summary}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {metaChips.map((chip) => (
                <Chip key={chip} className="bg-white/80 text-slate-700" radius="full" variant="flat">
                  {chip}
                </Chip>
              ))}
              <Chip color="success" radius="full" variant="flat">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {correctnessSummary.correctAnswers} correct
              </Chip>
              <Chip color="warning" radius="full" variant="flat">
                <Target className="mr-2 h-4 w-4" />
                {correctnessSummary.partialAnswers} partial
              </Chip>
              <Chip color="danger" radius="full" variant="flat">
                <XCircle className="mr-2 h-4 w-4" />
                {correctnessSummary.incorrectAnswers} incorrect
              </Chip>
            </div>
          </div>

          {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
        </HeroCardHeader>

        <CardBody className="grid gap-5 px-6 pb-6 pt-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="rounded-[32px] border border-slate-900/8 bg-white/80 px-4 py-5 shadow-[0_18px_34px_rgba(28,34,48,0.08)]">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Overall score
              </p>
            </div>
            <Box className="flex items-center justify-center">
              <Gauge
                height={210}
                text={({ value }) => `${Math.round(value ?? 0)}%`}
                value={report.overallScore ?? 0}
                width={210}
                sx={{
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: '#b27c2a'
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: 'rgba(28, 34, 48, 0.08)'
                  },
                  [`& .${gaugeClasses.valueText}`]: {
                    fill: '#1c2230',
                    fontFamily: '"IBM Plex Serif", Georgia, serif',
                    fontSize: 30,
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-emerald-50/80">
              <CardHeader>
                <CardDescription>Correct answers</CardDescription>
                <CardTitle className="text-3xl">{correctnessSummary.correctAnswers}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-amber-50/80">
              <CardHeader>
                <CardDescription>Partial answers</CardDescription>
                <CardTitle className="text-3xl">{correctnessSummary.partialAnswers}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-rose-50/80">
              <CardHeader>
                <CardDescription>Incorrect answers</CardDescription>
                <CardTitle className="text-3xl">{correctnessSummary.incorrectAnswers}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </CardBody>
      </HeroCard>

      <Tabs
        aria-label="Interview result sections"
        classNames={{
          tabList:
            'w-full justify-start rounded-full border border-slate-900/8 bg-white/70 p-1 shadow-[0_16px_34px_rgba(28,34,48,0.06)]',
          cursor: 'rounded-full bg-slate-950',
          tab: 'h-11 px-5 text-sm font-semibold',
          tabContent:
            'group-data-[selected=true]:text-white text-slate-600 transition-colors'
        }}
        color="primary"
        variant="solid"
      >
        <Tab key="overview" title="Overview">
          <div className="grid gap-6 pt-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <HeroCard className="border border-white/45 bg-white/82 shadow-[0_20px_44px_rgba(28,34,48,0.08)]">
              <HeroCardHeader className="flex flex-col gap-2 px-6 pb-0 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Category breakdown
                </p>
                <h2 className="font-serif text-2xl tracking-[-0.04em] text-slate-950">
                  Where the performance landed
                </h2>
              </HeroCardHeader>
              <CardBody className="px-4 pb-4 pt-2">
                <BarChart
                  dataset={chartData}
                  grid={{ horizontal: true }}
                  height={320}
                  margin={{ bottom: 50, left: 45, right: 10, top: 20 }}
                  series={[{ color: '#c4654f', dataKey: 'score', label: 'Score' }]}
                  xAxis={[
                    {
                      dataKey: 'category',
                      scaleType: 'band',
                      tickLabelStyle: {
                        fill: '#475569',
                        fontSize: 11
                      }
                    }
                  ]}
                  yAxis={[
                    {
                      max: 100,
                      min: 0,
                      tickLabelStyle: {
                        fill: '#64748b',
                        fontSize: 11
                      }
                    }
                  ]}
                />
              </CardBody>
            </HeroCard>

            <div className="grid gap-4">
              {insightGroups.map((group) => {
                const Icon = group.icon
                const items = report[group.key] || []

                return (
                  <Card key={group.key} className="bg-white/88">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-slate-950/[0.05] p-2">
                            <Icon className="h-4 w-4 text-slate-700" />
                          </span>
                          <CardTitle>{group.title}</CardTitle>
                        </div>
                        <Badge variant={group.accent}>{items.length} notes</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="grid gap-3 text-sm leading-7 text-slate-700">
                        {items.map((item) => (
                          <li key={item} className="rounded-[20px] bg-slate-900/[0.03] px-4 py-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </Tab>

        <Tab key="review" title="Question review">
          <div className="pt-6">
            <QuestionReviewPanel
              description="Open any interview turn to compare the submitted answer, AI ideal answer, and coaching feedback."
              transcript={report.transcript || []}
            />
          </div>
        </Tab>

        <Tab key="coaching" title="Coaching notes">
          <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <HeroCard className="border border-white/45 bg-[linear-gradient(165deg,rgba(31,36,48,0.94),rgba(54,61,79,0.92))] text-white shadow-[0_24px_60px_rgba(28,34,48,0.18)]">
              <HeroCardHeader className="flex flex-col gap-2 px-6 pb-0 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  AI summary
                </p>
                <h2 className="font-serif text-3xl tracking-[-0.04em]">What to focus on next</h2>
              </HeroCardHeader>
              <CardBody className="px-6 pb-6 pt-4 text-sm leading-8 text-white/75">
                {report.summary}
              </CardBody>
            </HeroCard>

            <Card className="bg-white/88">
              <CardHeader>
                <CardTitle>Improvement plan</CardTitle>
                <CardDescription>
                  Use these points as the next practice loop before starting a new session.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {(report.tips || []).map((tip, index) => (
                  <div
                    key={tip}
                    className="flex items-start gap-4 rounded-[22px] border border-slate-900/8 bg-slate-900/[0.03] px-4 py-4"
                  >
                    <span className="mt-0.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                      Step {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-700">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
