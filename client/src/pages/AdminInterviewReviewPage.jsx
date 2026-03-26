import { Card as HeroCard, CardBody, CardHeader as HeroCardHeader, Chip } from '@heroui/react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { InterviewResultBoard } from '../components/report/InterviewResultBoard'
import { QuestionReviewPanel } from '../components/report/QuestionReviewPanel'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const AdminInterviewReviewPage = () => {
  const { token } = useAuth()
  const { sessionId } = useParams()
  const [data, setData] = useState({ session: null, report: null })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const payload = await adminApi.getInterview(token, sessionId)
        setData(payload)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadInterview()
  }, [sessionId, token])

  if (isLoading) {
    return <p className="muted-note">Loading admin review...</p>
  }

  if (!data.session) {
    return <p className="form-error">{error || 'Interview review not found.'}</p>
  }

  const report = data.report
  const transcript = report?.transcript || data.session.turns || []
  const candidateName = data.session.user?.name || 'Unknown candidate'
  const candidateEmail = data.session.user?.email || 'Unknown email'
  const roleLabel = formatRole(data.session.role)
  const seniorityLabel = formatSeniority(data.session.seniority)

  if (report) {
    return (
      <InterviewResultBoard
        action={
          <Link className="ghost-button" to="/admin">
            Back to admin
          </Link>
        }
        eyebrow="Admin review"
        metaChips={[roleLabel, seniorityLabel, data.session.status]}
        report={report}
        summary={`Candidate: ${candidateName} / ${candidateEmail}`}
        title={`${roleLabel} / ${seniorityLabel}`}
      />
    )
  }

  return (
    <div className="grid gap-6">
      <HeroCard className="border border-white/45 bg-[linear-gradient(160deg,rgba(255,253,249,0.96),rgba(252,241,226,0.88))] shadow-[0_24px_60px_rgba(28,34,48,0.12)]">
        <HeroCardHeader className="flex flex-col gap-5 px-6 pb-0 pt-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700/75">
                Admin review
              </p>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.05em] text-slate-950 sm:text-5xl">
                {roleLabel} / {seniorityLabel}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Candidate: {candidateName} / {candidateEmail}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Chip className="bg-white/80 text-slate-700" radius="full" variant="flat">
                {roleLabel}
              </Chip>
              <Chip className="bg-white/80 text-slate-700" radius="full" variant="flat">
                {seniorityLabel}
              </Chip>
              <Chip color="warning" radius="full" variant="flat">
                {data.session.status}
              </Chip>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link className="ghost-button" to="/admin">
              Back to admin
            </Link>
          </div>
        </HeroCardHeader>

        <CardBody className="px-6 pb-6 pt-4 text-sm leading-7 text-slate-600">
          This interview is still active, so the final report is not ready yet. Admin can already
          inspect the submitted answers below, and the AI ideal answer will appear after evaluation
          is complete.
        </CardBody>
      </HeroCard>

      <QuestionReviewPanel
        candidateLabel="Candidate answer"
        description="Review the live transcript while the interview is still in progress."
        idealFallback="Ideal answer is generated after evaluation is complete."
        title="Live answer review"
        transcript={transcript}
      />
    </div>
  )
}
