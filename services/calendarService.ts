import { Medication } from '../types';

/**
 * Generate ICS file content for medication reminder
 * Works with Apple Calendar, Google Calendar, etc.
 */
export const generateMedicationICS = (med: Medication, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    // Set the event for today at the specified time
    const eventDate = new Date();
    eventDate.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (eventDate < now) {
        eventDate.setDate(eventDate.getDate() + 1);
    }

    // Format dates for ICS (YYYYMMDDTHHmmss)
    const formatICSDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const startDate = formatICSDate(eventDate);
    const endDate = formatICSDate(new Date(eventDate.getTime() + 15 * 60000)); // 15 min event

    // Create alarm (reminder) 5 minutes before
    const alarm = `BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Czas na lek: ${med.name}
END:VALARM`;

    // Generate unique ID
    const uid = `${med.id}-${time.replace(':', '')}-${Date.now()}@moje-leki`;

    // Create recurring event (daily)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Moje Leki//iOS Calendar//PL
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${startDate}
DTEND:${endDate}
RRULE:FREQ=DAILY
SUMMARY:💊 ${med.name} - ${med.dosage}
DESCRIPTION:Przypomnienie o leku\\n\\nLek: ${med.name}\\nDawka: ${med.dosage}\\nJednostka: ${med.unit}\\n\\nWygenerowano przez aplikację Moje Leki
LOCATION:
${alarm}
END:VEVENT
END:VCALENDAR`;

    return icsContent;
};

/**
 * Generate ICS for all medication times
 */
export const generateAllMedicationTimesICS = (med: Medication): string => {
    const now = new Date();
    const events: string[] = [];

    med.timesPerDay.forEach((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);

        const eventDate = new Date();
        eventDate.setHours(hours, minutes, 0, 0);

        if (eventDate < now) {
            eventDate.setDate(eventDate.getDate() + 1);
        }

        const formatICSDate = (date: Date): string => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        const startDate = formatICSDate(eventDate);
        const endDate = formatICSDate(new Date(eventDate.getTime() + 15 * 60000));
        const uid = `${med.id}-${time.replace(':', '')}-${index}@moje-leki`;

        events.push(`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${startDate}
DTEND:${endDate}
RRULE:FREQ=DAILY
SUMMARY:💊 ${med.name} - ${med.dosage}
DESCRIPTION:Przypomnienie o leku\\n\\nLek: ${med.name}\\nDawka: ${med.dosage}\\nJednostka: ${med.unit}\\nGodzina: ${time}\\n\\nWygenerowano przez aplikację Moje Leki
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Czas na lek: ${med.name}
END:VALARM
END:VEVENT`);
    });

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Moje Leki//iOS Calendar//PL
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`;
};

/**
 * Download ICS file (triggers file download on device)
 */
export const downloadICS = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Export single medication to calendar
 */
export const exportMedicationToCalendar = (med: Medication): void => {
    const icsContent = generateAllMedicationTimesICS(med);
    const filename = `${med.name.replace(/\s+/g, '_')}_przypomnienie.ics`;
    downloadICS(icsContent, filename);
};

/**
 * Export all medications to a single calendar file
 */
export const exportAllMedicationsToCalendar = (meds: Medication[]): void => {
    const now = new Date();
    const events: string[] = [];

    meds.forEach(med => {
        med.timesPerDay.forEach((time, index) => {
            const [hours, minutes] = time.split(':').map(Number);

            const eventDate = new Date();
            eventDate.setHours(hours, minutes, 0, 0);

            if (eventDate < now) {
                eventDate.setDate(eventDate.getDate() + 1);
            }

            const formatICSDate = (date: Date): string => {
                return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            };

            const startDate = formatICSDate(eventDate);
            const endDate = formatICSDate(new Date(eventDate.getTime() + 15 * 60000));
            const uid = `${med.id}-${time.replace(':', '')}-${index}@moje-leki`;

            events.push(`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${startDate}
DTEND:${endDate}
RRULE:FREQ=DAILY
SUMMARY:💊 ${med.name} - ${med.dosage}
DESCRIPTION:Przypomnienie o leku\\n\\nLek: ${med.name}\\nDawka: ${med.dosage}\\nJednostka: ${med.unit}\\nGodzina: ${time}
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Czas na lek: ${med.name}
END:VALARM
END:VEVENT`);
        });
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Moje Leki//iOS Calendar//PL
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`;

    downloadICS(icsContent, 'moje_leki_przypomnienia.ics');
};
