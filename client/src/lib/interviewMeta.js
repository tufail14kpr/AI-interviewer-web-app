export const roleOptions = [
  {
    value: 'frontend',
    label: 'Frontend',
    description: 'Browser behavior, React, accessibility, performance, and UI delivery.'
  },
  {
    value: 'backend',
    label: 'Backend',
    description: 'APIs, databases, auth, system design, security, and scaling.'
  },
  {
    value: 'fullstack',
    label: 'Fullstack',
    description: 'Balanced frontend and backend coverage across the full product stack.'
  }
]

export const seniorityOptions = [
  {
    value: 'junior',
    label: 'Junior',
    description: 'Foundations, practical implementation, and clear fundamentals.'
  },
  {
    value: 'mid',
    label: 'Mid',
    description: 'Independent delivery, debugging, and sharper tradeoff analysis.'
  },
  {
    value: 'senior',
    label: 'Senior',
    description: 'Architecture, scale, leadership, and harder system tradeoffs.'
  }
]

export const formatRole = (value) => roleOptions.find((option) => option.value === value)?.label || value

export const formatSeniority = (value) =>
  seniorityOptions.find((option) => option.value === value)?.label || value
