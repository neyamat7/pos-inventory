import { activityLogs } from '@/fake-db/apps/activityLogs'
import ActivityLogs from '@/views/apps/reports/activityLog'

const ActivityLogPage = () => {
  return <ActivityLogs activityLogsData={activityLogs} />
}

export default ActivityLogPage
