/**
 * Date and Time Utility Functions Tests
 * Critical functionality: date formatting and scheduling
 */

import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

describe('Date Formatting', () => {
  it('should format date to YYYY-MM-DD', () => {
    const date = new Date('2025-11-15T10:30:00')
    const formatted = format(date, 'yyyy-MM-dd')
    
    expect(formatted).toBe('2025-11-15')
  })

  it('should format date to readable Spanish format', () => {
    const date = new Date('2025-11-15T10:30:00')
    const formatted = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    
    expect(formatted).toContain('2025')
    expect(formatted).toContain('noviembre')
  })

  it('should format time to HH:mm', () => {
    const date = new Date('2025-11-15T10:30:00')
    const formatted = format(date, 'HH:mm')
    
    expect(formatted).toBe('10:30')
  })

  it('should format time to 12-hour format', () => {
    const date = new Date('2025-11-15T14:30:00')
    const formatted = format(date, 'hh:mm a')
    
    expect(formatted).toBe('02:30 PM')
  })
})

describe('Date Parsing', () => {
  it('should parse ISO date string', () => {
    const dateString = '2025-11-15T10:30:00.000Z'
    const parsed = parseISO(dateString)
    
    expect(parsed).toBeInstanceOf(Date)
    expect(parsed.getFullYear()).toBe(2025)
    expect(parsed.getMonth()).toBe(10) // November is month 10 (0-indexed)
  })

  it('should handle date-only strings', () => {
    const dateString = '2025-11-15'
    const parsed = parseISO(dateString)
    
    expect(parsed).toBeInstanceOf(Date)
    expect(format(parsed, 'yyyy-MM-dd')).toBe('2025-11-15')
  })
})

describe('Date Comparisons', () => {
  it('should check if date is after another', () => {
    const date1 = new Date('2025-11-15')
    const date2 = new Date('2025-11-14')
    
    expect(isAfter(date1, date2)).toBe(true)
    expect(isAfter(date2, date1)).toBe(false)
  })

  it('should check if date is before another', () => {
    const date1 = new Date('2025-11-14')
    const date2 = new Date('2025-11-15')
    
    expect(isBefore(date1, date2)).toBe(true)
    expect(isBefore(date2, date1)).toBe(false)
  })

  it('should calculate difference in days', () => {
    const date1 = new Date('2025-11-15')
    const date2 = new Date('2025-11-10')
    
    expect(differenceInDays(date1, date2)).toBe(5)
    expect(differenceInDays(date2, date1)).toBe(-5)
  })
})

describe('Schedule Utilities', () => {
  it('should get day of week in Spanish', () => {
    const getDayOfWeek = (date: Date): string => {
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      return days[date.getUTCDay()]
    }

    const monday = new Date('2025-11-17T12:00:00Z') // This is a Monday in UTC
    expect(getDayOfWeek(monday)).toBe('MONDAY')

    const friday = new Date('2025-11-21T12:00:00Z') // This is a Friday in UTC
    expect(getDayOfWeek(friday)).toBe('FRIDAY')
  })

  it('should check if date is a weekday', () => {
    const isWeekday = (date: Date): boolean => {
      const day = date.getUTCDay()
      return day > 0 && day < 6
    }

    const monday = new Date('2025-11-17T12:00:00Z')
    const saturday = new Date('2025-11-22T12:00:00Z')
    const sunday = new Date('2025-11-23T12:00:00Z')

    expect(isWeekday(monday)).toBe(true)
    expect(isWeekday(saturday)).toBe(false)
    expect(isWeekday(sunday)).toBe(false)
  })

  it('should get start and end of day', () => {
    const getStartOfDay = (date: Date): Date => {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      return start
    }

    const getEndOfDay = (date: Date): Date => {
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      return end
    }

    const date = new Date('2025-11-15T14:30:00')
    const start = getStartOfDay(date)
    const end = getEndOfDay(date)

    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
  })

  it('should add school days (skip weekends)', () => {
    const addSchoolDays = (date: Date, days: number): Date => {
      let result = new Date(date)
      let daysAdded = 0

      while (daysAdded < days) {
        result = addDays(result, 1)
        const dayOfWeek = result.getUTCDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          daysAdded++
        }
      }

      return result
    }

    const friday = new Date('2025-11-14T12:00:00Z') // Friday
    const nextMonday = addSchoolDays(friday, 1)
    
    // Format in UTC to avoid timezone issues
    const formatted = nextMonday.toISOString().split('T')[0]
    expect(formatted).toBe('2025-11-17') // Monday
  })
})

describe('Academic Period Utilities', () => {
  it('should check if date is within academic period', () => {
    const isWithinPeriod = (date: Date, startDate: Date, endDate: Date): boolean => {
      return !isBefore(date, startDate) && !isAfter(date, endDate)
    }

    const periodStart = new Date('2025-11-01')
    const periodEnd = new Date('2025-11-30')
    const testDate = new Date('2025-11-15')
    const outsideDate = new Date('2025-12-01')

    expect(isWithinPeriod(testDate, periodStart, periodEnd)).toBe(true)
    expect(isWithinPeriod(outsideDate, periodStart, periodEnd)).toBe(false)
  })

  it('should calculate period duration in days', () => {
    const getPeriodDuration = (startDate: Date, endDate: Date): number => {
      return differenceInDays(endDate, startDate) + 1
    }

    const start = new Date('2025-11-01')
    const end = new Date('2025-11-30')

    expect(getPeriodDuration(start, end)).toBe(30)
  })
})
