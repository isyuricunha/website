# Nery Mizuki website mascot

Artwork: canonical [Nery repository](https://github.com/isyuricunha/nery), kit v1,
commit 4d132e27a18c2e911251283666bf1ec2c67f7d72.
The proprietary license v1.1 explicitly permits yuricunha.com. See
public/images/nery/LICENSE.md. Artwork is not covered by the code license.

The floating widget uses approved poses scaled proportionally into transparent
128×128 WebP canvases. The avatar uses the approved 128px portrait. No recoloring
or new artwork. Images are served directly without Next Image runtime
transformation. Existing settings, game, contact, chat and selection features
remain. Konami mode retains its indicator without recoloring canonical artwork.

Nery is the site's mascot and public face of its existing assistant, not a
separate agent or replacement for the Mnerys logo. API paths, models,
authentication, rate limits, citation and action formats remain unchanged.
Existing localStorage keys retain their historical names intentionally;
new shares use nery_chat and old yue_chat URLs remain importable.
Historical Yue project content and separate integrations are not renamed.

The new-post check skips hidden/dismissed widgets. Its existing API contract
is unchanged. Petdex animation atlases are not shipped: the small widget
needs expressions, not a multi-megabyte walking sprite atlas.

References: [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image),
[React effects](https://react.dev/reference/react/useEffect),
[Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
