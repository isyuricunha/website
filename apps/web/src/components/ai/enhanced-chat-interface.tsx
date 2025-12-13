'use client'

import type * as React from 'react'

type EnhancedChatInterfaceProps = React.ComponentProps<'div'>

export default function EnhancedChatInterface(props: EnhancedChatInterfaceProps) {
    return <div {...props} />
}
