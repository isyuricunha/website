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

## Release refinement

The assistant uses exact localized public paths, localized overview labels,
weighted retrieval with match coverage, and per-locale cached source entries.
Standalone greetings and thanks omit retrieval and tools. Simple answers may
reuse retrieved excerpts; detailed summaries still require document reads.
Repeated tool arguments reuse per-request results while satisfying each call
ID. The final generation round preserves tool definitions with tool_choice
none; provider cache behavior is not guaranteed. The 45-second shared deadline
and three-round/four-tool execution budget remain in place.

NDJSON events are validated at runtime, including phase events for searching,
reading and responding. Upstream error envelopes are rejected. Request locale,
JSON and size are validated. The client no longer executes legacy text commands,
even for legacy responses. New message links are limited to cited public paths;
legacy/imported links are constrained to public same-origin route families.
Raw HTML and remote images are disabled. Navigation proposals still require a
visitor click. Citations do not prefetch routes. These controls reduce attack
surface but do not establish complete resistance to prompt injection.

The browser saves the accepted question before streaming, retains the latest
200 messages per conversation (matching the storage schema), and keeps the
existing 50-conversation limit. New share payloads are limited to 64000 encoded
characters; older imports are limited to 512000. Sharing errors are surfaced
without removing conversations. The most recent response may be regenerated;
partial/cancelled/error text does not become model history. Wave and review
animations return to idle after a single sequence; reduced motion is respected.

References:

- https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/cancel

## Provider control-text boundary

Agnes 3.0 Flash uses XML-style internal tool-call markers, but the public OpenAI-compatible API must transport tool calls in structured delta.tool_calls fields. Treat raw protocol markers in delta.content as a malformed provider response, not a tool invocation. The incremental output guard retains ambiguous marker prefixes across chunk boundaries, resets contaminated prose, cancels the upstream stream, and discards that round (including any concurrent structured calls). One text-only recovery is allowed within the existing three-round budget and shared deadline. If recovery fails or the budget is exhausted, the visitor gets the existing localized error state. Previously leaked assistant text is excluded from model history; stored conversations are not rewritten. Valid structured calls remain supported. This is a guard for known provider control markers, not a general-purpose XML or prompt-injection filter.

References: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash and https://developers.openai.com/api/docs/guides/function-calling and https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works.

## Viewport isolation

Mascot panels use available dynamic viewport height based on the anchor position and sprite dimensions; short landscape viewports dock panels beside the sprite. Chat auto-scroll targets its own message list, with overscroll containment, instead of calling scrollIntoView on ancestors. Automatic composer focus is restricted to non-touch pointers and uses preventScroll. The main document stays scrollable. Initial home-page announcement insertion is an independent layout shift, not caused by opening the mascot.

## Public AI identity

Nery Mizuki is Yuri Cunha's virtual mascot and public AI assistant. Nery Small 3.0 (nery-small-3-0) is the public profile alias, not a separately trained model or the upstream model identifier. The prompt, chat footer and status endpoint share the public identity constants. Ordinary model questions receive natural, varied answers using the Nery Small 3.0 name without unsolicited implementation details. Explicit base-model or training questions distinguish the assistant identity from the underlying engine. Runtime provider selection and editorial prompts are unchanged. The welcome message introduces the mascot in all seven locales. Existing conversation history is preserved.

## Adversarial evaluation

The deterministic regression suite (src/tests/lib/nery-redteam.test.ts) covers 84 cases: 20 denied read paths, 20 denied navigation targets, 20 invalid or unknown tools, 15 fragmented provider control markers (all split positions), and nine malformed client events. A synthetic public content fixture is used; no private data is accessed.

A bounded live evaluation of the development endpoint used 12 adversarial prompts and four legitimate controls. Tests covered direct prompt extraction, false authority, model-identity manipulation in multiple languages and encoded form, forged conversation history and client metadata, private routes, unknown tools, and automatic external navigation. No tested attack achieved its intended objective; the model explicitly rejected the fake identity even when quoting it. Legitimate identity, technical Q&A, public search, and click-confirmed navigation remained functional. This is a small sample, not proof of prompt-injection immunity. The forged metadata case is not a test of a malicious published document. Turnstile, distributed abuse, legacy clients and adaptive multi-turn attacks were not evaluated live in this batch. Existing rate-limit and tool-budget regression tests remain relevant; provider requests and normal telemetry occur during live evaluations.

References: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests, https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks, https://genai.owasp.org/llm2026/llm012026-prompt-injection/.
