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

## Nery assistant v2

New clients send assistantVersion: 2 and historyVersion: 2. The route retains
the previous contract for old clients. The v2 API returns NDJSON events
(delta, reset, done, error); completed text, citations, request ID, latency and
confirmed-action proposals arrive together. A tool round can reset speculative
text. The browser consumes the stream until completion and does not persist
each token synchronously. Cancellation propagates upstream. The public chat
never executes model-generated text commands in v2.

Public content is compiled by Content Collections; a bounded locale-specific
lexical index is built lazily and reused by the running instance. Unicode word
segmentation, accent normalization, common-word filtering, document frequency
and weighted title/description/slug/body terms improve retrieval. No new
database, embedding service or runtime package is required. The index covers
published collection entries and known public sections, not live private or
account data. Read tools return bounded 6000-character slices.

Native OpenAI-compatible tools: search_site, read_site_content,
get_site_overview, get_current_page, get_related_content, navigate, open_search.
The last two propose buttons only, never execute without a user click.
The runtime validates arguments and public paths, caps tool rounds at three
provider calls, four executed tools, 1800 output tokens per call, and a
45-second shared deadline. Explicit unsupported-tool errors on the first
request can fall back to a text-only response using initial retrieval.
History is capped at 15 messages and 12000 characters, not a provider-specific
tokenizer. Actual usage is recorded when upstream supplies it; missing usage
is not invented. The prompt for editorial tasks is separate. Configuration
is read once per new chat request.

Chat UI: multiline composer, collapsed source cards, expansion, native rename,
edit the last user message, regenerate the last response, explicit cancel,
and a less intrusive scroll-follow policy. Editing replaces the last turn
and regenerating replaces the last answer. Old shared links remain importable;
new shares carry the transcript in the URL fragment instead of the HTTP query.
Anyone with the shared link can still read its contents. Action proposals
are transient and not exported with conversations. No new server-side history.

References:

- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- https://developers.openai.com/api/docs/guides/function-calling
- https://github.com/maximhq/bifrost/blob/dev/docs/quickstart/gateway/tool-calling.mdx
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- https://vercel.com/docs/functions/configuring-functions/duration
