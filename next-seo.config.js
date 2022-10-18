const title = "Yuri Cunha";
const description = "Designer, tech enthusiast and entrepreneur of sorts";

const SEO = {
  title,
  description,
  canonical: "https://www.website.yuricunha.xyz",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://www.website.yuricunha.xyz",
    title,
    description,
    images: [
      {
        url: "https://www.website.yuricunha.xyz/static/images/banner.jpg",
        alt: title,
        width: 2240,
        height: 1260,
      },
    ],
  },
  twitter: {
    handle: "@isyuricunha",
    site: "@isyuricunha",
    cardType: "summary_large_image",
  },
};

export default SEO;
