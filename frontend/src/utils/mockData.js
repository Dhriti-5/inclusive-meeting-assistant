/**
 * Mock data for testing components without backend
 */

export const mockMeetings = [
  {
    id: 'meeting-1',
    title: 'Team Standup - Sprint Planning',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 1800, // 30 minutes
    status: 'completed',
    participants: 5,
  },
  {
    id: 'meeting-2',
    title: 'Client Demo - Q4 Review',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    duration: 3600, // 1 hour
    status: 'completed',
    participants: 8,
  },
  {
    id: 'meeting-3',
    title: 'Design Review',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    duration: 2700, // 45 minutes
    status: 'processing',
    participants: 4,
  },
]

export const mockTranscripts = [
  {
    speaker: 'John Doe',
    text: 'Good morning everyone! Let\'s start with our sprint planning for this week.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    speaker: 'Jane Smith',
    text: 'Thanks John. I\'ve completed the user authentication feature and pushed it to the dev branch.',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    speaker: 'Mike Johnson',
    text: 'Great work Jane! I reviewed the PR and left some comments. Overall looks good.',
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    speaker: 'John Doe',
    text: 'Excellent. Let\'s move on to the action items for this sprint.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
]

export const mockActionItems = [
  {
    id: 1,
    text: 'Review and merge Jane\'s authentication PR',
    completed: false,
    assignee: 'Mike Johnson',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 2,
    text: 'Update API documentation with new endpoints',
    completed: true,
    assignee: 'Sarah Williams',
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 3,
    text: 'Schedule follow-up meeting with client',
    completed: false,
    assignee: 'John Doe',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
]

export const mockSummaryPoints = [
  {
    text: 'Sprint planning discussed for the upcoming week with focus on authentication features.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    text: 'Code review process established with 2 approvals required before merging.',
    timestamp: new Date(Date.now() - 200000).toISOString(),
  },
  {
    text: 'Client demo scheduled for Friday at 2 PM EST.',
    timestamp: new Date(Date.now() - 100000).toISOString(),
  },
]

export const mockMeetingReport = {
  id: 'meeting-1',
  title: 'Team Standup - Sprint Planning',
  startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  duration: 1800,
  status: 'completed',
  participants: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'],
  summary: 'The team conducted sprint planning for the upcoming week, focusing on completing the user authentication feature and preparing for the client demo. Key decisions were made regarding code review processes and API documentation updates. All team members committed to their assigned tasks and agreed on the sprint timeline.',
  actionItems: [
    {
      text: 'Review and merge Jane\'s authentication PR by Wednesday',
      assignee: 'Mike Johnson',
    },
    {
      text: 'Update API documentation with new endpoints',
      assignee: 'Sarah Williams',
    },
    {
      text: 'Schedule follow-up meeting with client for Friday',
      assignee: 'John Doe',
    },
    {
      text: 'Prepare demo environment for client presentation',
      assignee: 'Tom Brown',
    },
  ],
  transcript: [
    {
      speaker: 'John Doe',
      text: 'Good morning everyone! Let\'s start with our sprint planning for this week.',
      timestamp: '10:00 AM',
    },
    {
      speaker: 'Jane Smith',
      text: 'Thanks John. I\'ve completed the user authentication feature and pushed it to the dev branch.',
      timestamp: '10:02 AM',
    },
    {
      speaker: 'Mike Johnson',
      text: 'Great work Jane! I reviewed the PR and left some comments. Overall looks good.',
      timestamp: '10:05 AM',
    },
    {
      speaker: 'Sarah Williams',
      text: 'I can help with the API documentation updates this week.',
      timestamp: '10:07 AM',
    },
    {
      speaker: 'Tom Brown',
      text: 'I\'ll set up the demo environment for Friday\'s client presentation.',
      timestamp: '10:10 AM',
    },
  ],
}

export const mockDetectedSign = {
  letter: 'H',
  confidence: 0.95,
  timestamp: Date.now(),
}
