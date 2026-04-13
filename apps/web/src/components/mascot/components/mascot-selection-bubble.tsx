'use client'

import { memo } from 'react'
import { Sparkles, X as XIcon } from 'lucide-react'
import { UseMascotStateReturn } from '../hooks/use-mascot-state'

type MascotSelectionBubbleProps = {
    mascot: Pick<UseMascotStateReturn, 'state' | 't' | 'explainSelection' | 'updateState'>
}

const MascotSelectionBubbleComponent = ({ mascot }: MascotSelectionBubbleProps) => {
    const { state, t, explainSelection, updateState } = mascot

    if (!state.showSelectionBubble || state.showAIChat) return null

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
            <div className="bg-primary text-primary-foreground shadow-lg flex items-center gap-2 rounded-2xl px-3 py-2 text-xs">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="font-medium">{t('mascot.interactions.selectionExplain')}</span>
                <button
                    type="button"
                    onClick={explainSelection}
                    className="bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-lg px-2 py-1 font-bold transition-colors"
                >
                    {t('mascot.interactions.explainButton')}
                </button>
                <button
                    type="button"
                    onClick={() => updateState({ showSelectionBubble: false })}
                    className="hover:bg-primary-foreground/10 rounded p-1"
                >
                    <XIcon className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}

MascotSelectionBubbleComponent.displayName = 'MascotSelectionBubble'

export const MascotSelectionBubble = memo(MascotSelectionBubbleComponent, (prev, next) => {
    return (
        prev.mascot.state.showSelectionBubble === next.mascot.state.showSelectionBubble &&
        prev.mascot.state.showAIChat === next.mascot.state.showAIChat
    )
})
