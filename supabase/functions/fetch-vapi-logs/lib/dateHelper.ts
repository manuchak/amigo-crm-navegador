
/**
 * Date Range Helper
 */
export class DateRangeHelper {
  /**
   * Get start and end dates for fetching logs
   */
  static getDateRange(requestParams = {}) {
    try {
      const now = new Date()
      const startDate = requestParams.start_date ? 
        new Date(requestParams.start_date) : 
        new Date(now.setDate(now.getDate() - 30))
      const endDate = requestParams.end_date ?
        new Date(requestParams.end_date) :
        new Date()
        
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()

      console.log(`Fetching VAPI logs from ${startDateISO} to ${endDateISO}`)
      
      return { startDateISO, endDateISO }
    } catch (error) {
      console.error('Error parsing date range:', error)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
      return {
        startDateISO: thirtyDaysAgo.toISOString(),
        endDateISO: new Date().toISOString()
      }
    }
  }
}
