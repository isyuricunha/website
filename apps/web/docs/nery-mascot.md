# Nery Mizuki website mascot

Artwork: canonical [Nery repository](https://github.com/isyuricunha/nery),
commit 4d132e27a18c2e911251283666bf1ec2c67f7d72. See
public/images/nery/LICENSE.md. Artwork is not covered by the code license.

The floating widget uses the official full-body motion atlas (motion.json v5).
Six relevant states are exported as separate transparent WebP strips at the
native 192×208 cell resolution. Frame durations, cell boundaries and floor
alignment are preserved. CSS keyframes with discrete frame changes implement
idle, waving, jumping, failed, running and review. Open panels use idle; running is reserved for an active AI response. No canvas,
animation dependency, server rendering of frames or image optimization API
is needed. The browser requests each state only when used. The walking strips
are not shipped because the widget stays anchored to the chosen corner.
Reduced-motion and the existing animations preference select a canonical
static frame. The chat uses the approved portrait avatar.

Nery is the public face of the existing website assistant, not a separate
Mnerys agent. API paths, provider configuration, authentication, rate limits,
citation and action formats are unchanged. Historical localStorage keys
preserve settings and conversations; new shares use nery_chat, and old
yue_chat URLs remain importable. Old random pose cache is no longer read.
Historical Yue project content and independent integrations remain unchanged.

The latest-post check skips hidden/dismissed widgets. The previous CSS
blinking, pointer tracking and random static pose switching are replaced by
the official atlas. No automatic roaming or generated alternate outfit is
included.

References: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations/Using
and https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion

## Chat history contract

The request sends the current user text in message, and prior turns in
context.conversation with historyVersion: 2. The client excludes welcome
and error notices and limits history to 15 messages of at most 4000
characters each. Old unversioned website requests with a trailing copy
of the current user message are normalized at the API boundary. Version 2
preserves genuinely repeated questions. The provider receives system
instructions, structured history and the current user message exactly once.
The system prompt never embeds the conversation transcript. Legacy
previousMessages is accepted only as a fallback for recommendation context.

Reference: https://platform.claude.com/docs/en/build-with-claude/working-with-messages
