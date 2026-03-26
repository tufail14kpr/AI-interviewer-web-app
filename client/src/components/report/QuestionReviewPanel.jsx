import { Chip, ScrollShadow } from '@heroui/react'
import { LinearProgress } from '@mui/material'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Badge } from '../ui/badge'

const verdictMap = {
  correct: {
    label: 'Correct',
    variant: 'success',
    color: '#5f6b53',
    trackColor: 'rgba(95, 107, 83, 0.14)'
  },
  partial: {
    label: 'Partial',
    variant: 'warning',
    color: '#b27c2a',
    trackColor: 'rgba(178, 124, 42, 0.14)'
  },
  incorrect: {
    label: 'Incorrect',
    variant: 'danger',
    color: '#c4654f',
    trackColor: 'rgba(196, 101, 79, 0.14)'
  },
  pending: {
    label: 'Pending',
    variant: 'outline',
    color: '#64748b',
    trackColor: 'rgba(100, 116, 139, 0.14)'
  }
}

const clampScore = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}

const toVerdictMeta = (turn) => {
  if (turn.verdict && verdictMap[turn.verdict]) {
    return verdictMap[turn.verdict]
  }

  if (turn.answer) {
    return verdictMap.pending
  }

  return verdictMap.pending
}

export const QuestionReviewPanel = ({
  transcript,
  title = 'Question review',
  description = 'Compare the candidate answer with the expected direction from AI.',
  candidateLabel = 'Candidate answer',
  idealLabel = 'AI ideal answer',
  idealFallback = 'Ideal answer is generated after evaluation is complete.',
  emptyMessage = 'No interview turns are available yet.'
}) => {
  if (!transcript?.length) {
    return (
      <Card className="border-dashed bg-white/70">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-slate-600">{emptyMessage}</p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-white/40 bg-white/70">
      <CardHeader className="gap-3 border-b border-slate-900/6 bg-white/50">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-slate-600">{description}</p>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollShadow className="max-h-[880px] px-4 py-4">
          <Accordion className="space-y-4" collapsible type="single">
            {transcript.map((turn) => {
              const verdict = toVerdictMeta(turn)
              const accuracy = clampScore(turn.accuracyScore)
              const hasIdealAnswer = Boolean(turn.idealAnswer)

              return (
                <AccordionItem key={turn.questionNumber} value={`turn-${turn.questionNumber}`}>
                  <AccordionTrigger>
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Chip color="warning" radius="full" size="sm" variant="flat">
                          Q{turn.questionNumber}
                        </Chip>
                        {turn.topic ? (
                          <Chip className="bg-slate-900/[0.06] text-slate-700" radius="full" size="sm" variant="flat">
                            {turn.topic}
                          </Chip>
                        ) : null}
                        <Badge variant={verdict.variant}>{verdict.label}</Badge>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {accuracy}% match
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="font-serif text-lg font-semibold leading-tight tracking-[-0.03em] text-slate-950">
                          {turn.question}
                        </p>
                        <LinearProgress
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: verdict.trackColor,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              backgroundColor: verdict.color
                            }
                          }}
                          value={accuracy}
                          variant="determinate"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className={`grid gap-4 ${hasIdealAnswer ? 'lg:grid-cols-2' : ''}`}>
                      <Card className="border-slate-900/8 bg-white/90 shadow-none">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{candidateLabel}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 text-sm leading-7 text-slate-700">
                          {turn.answer || 'No answer submitted yet.'}
                        </CardContent>
                      </Card>

                      {hasIdealAnswer ? (
                        <Card className="border-emerald-200/60 bg-emerald-50/70 shadow-none">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{idealLabel}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm leading-7 text-slate-700">
                            {turn.idealAnswer}
                          </CardContent>
                        </Card>
                      ) : null}
                    </div>

                    {!hasIdealAnswer ? (
                      <div className="mt-4 rounded-[22px] border border-dashed border-slate-900/12 bg-slate-900/[0.02] px-4 py-3 text-sm text-slate-600">
                        {idealFallback}
                      </div>
                    ) : null}

                    {turn.feedback ? (
                      <div className="mt-4 rounded-[22px] border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm leading-7 text-slate-700">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                          AI feedback
                        </span>
                        {turn.feedback}
                      </div>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </ScrollShadow>
      </CardContent>
    </Card>
  )
}
