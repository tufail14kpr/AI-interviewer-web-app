import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { InterviewResultBoard } from '../components/report/InterviewResultBoard'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const ReportPage = () => {
  const { token } = useAuth()
  const { sessionId } = useParams()
  const location = useLocation()
  const [report, setReport] = useState(location.state?.report || null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(!location.state?.report)

  useEffect(() => {
    if (report) {
      return undefined
    }

    const loadReport = async () => {
      try {
        const payload = await interviewApi.report(token, sessionId)
        setReport(payload.report)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
    return undefined
  }, [report, sessionId, token])

  if (isLoading) {
    return <p className="muted-note">Loading report...</p>
  }

  if (!report) {
    return <p className="form-error">{error || 'Report not found.'}</p>
  }

  return (
    <InterviewResultBoard
      action={
        <Link className="ghost-button" to="/dashboard">
          Back to dashboard
        </Link>
      }
      eyebrow="Interview result"
      metaChips={[formatRole(report.role), formatSeniority(report.seniority)]}
      report={report}
      summary={report.summary}
      title={`${formatRole(report.role)} / ${formatSeniority(report.seniority)}`}
    />
  )
}
