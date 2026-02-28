interface TimelineEvent {
    id: string
    label: string
    date: string
    active?: boolean
}

interface TimelineProps {
    events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
    return (
        <div className="relative pl-6" role="list" aria-label="Status timeline">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-700/50" />

            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="relative flex items-start gap-3" role="listitem">
                        {/* Dot */}
                        <div
                            className={`
                                absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center
                                transition-all duration-200
                                ${event.active
                                    ? 'border-indigo-400 bg-indigo-500/30 shadow-sm shadow-indigo-500/20'
                                    : 'border-slate-600 bg-slate-800'
                                }
                            `}
                        >
                            {event.active && (
                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                            <p className={`text-sm font-medium ${event.active ? 'text-slate-100' : 'text-slate-400'}`}>
                                {event.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {event.date}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
