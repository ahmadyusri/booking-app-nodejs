import { DateTime } from 'luxon'
import Logger from '@ioc:Adonis/Core/Logger'

export interface FormattedDateProps {
  formattedInfo: string
  dateTime: DateTime | string
  timezone: string
  userTimezone?: string
}

export const formattedDate = ({
  formattedInfo,
  dateTime,
  timezone,
  userTimezone,
}: FormattedDateProps): DateTime | string | undefined => {
  let formattedBookingTime = `${dateTime}`
  if (typeof formattedBookingTime === 'string') {
    formattedBookingTime += ` ${timezone}`
  }

  try {
    const localTimezone = DateTime.local().zoneName
    if (!userTimezone) {
      userTimezone = localTimezone
    }

    const formatTime = 'yyyy-MM-dd HH:mm:ss'
    let bookingFormattedString: string | null = null

    // Convert Time Timezone when saving
    if (typeof dateTime === 'string') {
      bookingFormattedString = DateTime.fromFormat(dateTime, formatTime, {
        zone: timezone,
      }).toFormat(formatTime)
    } else if (dateTime instanceof DateTime) {
      bookingFormattedString = DateTime.fromFormat(dateTime.toFormat(formatTime), formatTime, {
        zone: timezone,
      }).toFormat(formatTime)
    }
    if (bookingFormattedString === null) {
      Logger.warn(`Format DateTime not support, ${formattedInfo}.`)
      return
    }

    const bookingTimeWithZoneDB = DateTime.fromFormat(bookingFormattedString, formatTime, {
      zone: timezone,
    })
    if (!bookingTimeWithZoneDB.isValid) {
      Logger.warn(`Format DateTime invalid, ${formattedInfo}.`)
      return
    }

    // Convert to User timezone
    let bookingDateUserZone = bookingTimeWithZoneDB.setZone(userTimezone)
    if (!bookingDateUserZone.isValid) {
      bookingDateUserZone = bookingTimeWithZoneDB.setZone(localTimezone)
    }

    return bookingDateUserZone
  } catch (error) {
    Logger.warn(`Failed formatting DateTime ${formattedInfo}. ${error.message}`)
    return
  }
}
