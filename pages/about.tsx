import Image from 'next/image';
import { NextSeo } from 'next-seo';

import Link from 'data/Link';
import Section from 'data/Section';
import Workplaces from 'data/Workplaces';
import Gallery from 'data/Gallery';
// import { ActivityType } from 'data/Activity';

import yuricunhaLogo from 'public/projects/yuricunha-logo.png';
import laryssacostaLogo from 'public/projects/laryssacosta-logo.png';
import divinobitLogo from 'public/projects/divinobit-logo.png';
import geosigaLogo from 'public/projects/geosiga-logo.png';
import lumenLogo from 'public/projects/lumen-logo.png';
import pokemonLogo from 'public/projects/pokemon-logo.png';
import githubLogo from 'public/projects/github-logo.png';
import rainforrelaxLogo from 'public/projects/rain-for-relax-logo.png';
import avatar from 'public/avatar.png';

// import { getActivities, getActivity } from 'lib/strava';

export const connectLinks = [
  { label: 'Email', href: 'mailto:me@yuricunha.com' },
  { label: 'Twitter', href: 'https://twitter.com/isyuricunha' },
  { label: 'GitHub', href: 'https://github.com/isyuricunha' },
];

const workplaces = [
  {
    title: 'Database Administrator & Specialist',
    description: 'Yuri Cunha',
    time: '2022 - Now',
    imageSrc: yuricunhaLogo,
    link: 'https://yuricunha.com',
  },
  {
    title: 'Senior Database Administrator',
    description: 'Laryssa Costa logo',
    time: '2022 - Now',
    imageSrc: laryssacostaLogo,
    link: 'https://www.massagealternativa.com/',
  },
  {
    title: 'Junior Database Administrator',
    description: 'DivinoBit (currently named Bairon)',
    time: '2021 - 2023',
    imageSrc: divinobitLogo,
    link: 'https://bairon.com.br/',
  },
  {
    title: 'Junior Database Administrator',
    description: 'Geosiga',
    time: '2019 - 2021',
    imageSrc: geosigaLogo,
    link: 'https://www.geosiga.com.br/',
  },
  {
    title: 'Intern',
    description: 'Lúmen Centro de Diagnósticos',
    time: '2016 - 2017',
    imageSrc: lumenLogo,
    link: 'https://www.lumendiagnosticos.com.br/',
  },
];

const sideProjects = [
  {
    title: 'Top Github User',
    description: 'Check your ranking in GitHub!',
    imageSrc: githubLogo,
    link: 'https://isyuricunha.github.io/top-github-users/',
  },
  {
    title: 'Rain for relax',
    description: 'Just appreciate. Relax. Be well',
    imageSrc: rainforrelaxLogo,
    link: 'https://www.rain-for-relax.yuricunha.com/',
  },
  {
    title: 'Pokemon Greetings',
    description: 'Get greeted by a Pokémon. Have a wonderful day!',
    imageSrc: pokemonLogo,
    link: 'https://github.com/isyuricunha/pokemon-greeting',
  },
  {
    title: 'Website',
    description: 'The website you are looking at!',
    imageSrc: avatar,
    link: 'https://github.com/isyuricunha/Website',
  },
];

const seoTitle = 'About / Yuri Cunha';
const seoDesc =
  "I'm not just a DBA, I'm the data whisperer, the performance guru, the uptime champion.";

export default function About() {
  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDesc}
        openGraph={{
          title: seoTitle,
          description: seoDesc,
          url: `https://beta.yuricunha.com/about/`,
          site_name: 'Yuri Cunha',
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <div className="flex flex-col gap-16 md:gap-24">
        <div className="-mb-8 sm:hidden animate-in">
          <Image
            src={avatar}
            width={48}
            height={48}
            alt="avatar of Yuri Cunha"
          />
        </div>
        <div
          className="flex flex-col gap-16 animate-in sm:animate-none md:gap-24"
          style={{ '--index': 2 } as React.CSSProperties}
        >
          <Section heading="About me" headingAlignment="right">
            <div className="flex flex-col gap-6">
              <p>
                <em className="font-semibold">Hi there!</em>&nbsp; I&apos;m
                Yuri, a database administrator with a passion for data integrity
                and making applications hum smoothly. When I&apos;m not
                wrangling servers, you&apos;ll find me pounding the pavement (or
                trail) - I&apos;m obsessed with the magic of putting one foot in
                front of the other and seeing the world tick by.
              </p>
              <p>
                Currently working at{' '}
                <Link href="https://massagealternativa.com/">
                  Laryssa Costa
                </Link>
                , where I ensure the data backbone of our operations runs strong
                (in which I manage a IT team). Prior to that, I honed my skills
                at{' '}
                <Link href="https://bairon.com.br/">
                  Divinobit (currently named Bairon)
                </Link>
                , optimizing databases for peak performance.
              </p>
              <p>
                What excites me most? Diving into complex queries, crafting
                efficient schemas, and watching databases transform into
                powerful engines. It&apos;s like plumbing for the digital age,
                but with more lines of code than pipes!
              </p>
              <p>
                While São Bernardo do Campo, in Brazil, is my hometown, my
                wanderlust often pulls me solo to new corners of the globe.
                Trekking through ancient ruins, soaking in bustling cityscapes,
                or escaping to serene landscapes - solo travel fuels my soul and
                inspires fresh perspectives.
              </p>
              <p>
                So, whether it&apos;s optimizing databases or pushing my limits
                on a run, I&apos;m all about building, exploring, and finding
                the rhythm in things. Let&apos;s see where the data (or the
                road) takes us!
              </p>
            </div>
          </Section>
          <Section heading="Connect" headingAlignment="right">
            <ul className="flex gap-6 animated-list">
              {connectLinks.map((link) => (
                <li className="transition-opacity" key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </Section>
          <Section heading="Work" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <p>
                {new Date().getFullYear() - 2017}+ years of experience crafting
                and maintaining robust databases.
              </p>
              <Workplaces items={workplaces} />
            </div>
          </Section>
          <Section heading="Side projects" headingAlignment="right">
            <div className="flex flex-col w-full gap-8">
              <p>
                In my spare time, I like to play god with data. It&apos;s like a
                board game, but with more lines of code.
              </p>
              <Workplaces items={sideProjects} />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

// export const getStaticProps = async () => {
//   const activities: ActivityType[] = await getActivities();
//   const lastNonVirtualActivityWithPhoto = activities
//     .filter((activity) =>
//       [
//         'Run',
//         'TrailRun',
//         'Bike',
//         'Swim',
//         'Hike',
//         'GravelRide',
//         'NordicSki',
//       ].includes(activity.sport_type)
//     )
//     .find((activity) => activity.total_photo_count > 0);
//   const activity = await getActivity(
//     lastNonVirtualActivityWithPhoto?.id as number
//   );
//   return {
//     props: {
//       lastActivity: activity,
//     },
//     revalidate: 3600,
//   };
// };
