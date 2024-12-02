import {
  Box,
  Flex,
  Heading,
  Image,
  chakra,
  useColorModeValue,
  Skeleton,
  Link as ChakraLink,
  useBreakpoint,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import AboutTerminal from '@/components/AboutTerminal';

import { t } from 'i18next';

export default function Home(): React.ReactElement {
  const [imageLoad, setImageLoad] = useState(false);
  const bp = useBreakpoint();
  return (
    <>
      <NextSeo
        title="Yuri Cunha"
        description="Not just a DBA, but a data craftsman building digital legacies."
        canonical="https://yuricunha.com/"
      />
      <Box
        minH="100vh"
        height="full"
        width={{ base: '95%', md: '90%', lg: '80%', xl: '90%W' }}
        maxW="7xl"
        mx="auto"
        pt={{ base: '28', sm: '14', md: '16', xl: '20' }}
      >
        {/* Im not actually too sure why this needs to be here, but without this additional flex
        the body doesn't begin at the top of the page... */}
        <Flex
          direction="column"
          justifyContent={{ base: 'center', md: 'flex-start' }}
          height="full"
          width="full"
          p={{ base: 0, sm: 16 }}
        >
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            alignItems="center"
            mx="auto"
            my={{ xl: '16' }}
          >
            <Skeleton
              isLoaded={imageLoad}
              boxSize="250px"
              borderRadius="2xl"
              m="auto"
            >
              <Image
                flexGrow={3}
                borderRadius="2xl"
                boxSize="250px"
                src="./static/images/toMe/me.png"
                objectFit="cover"
                alt="Yuri Cunha"
                onLoad={() => setImageLoad(true)}
              />
            </Skeleton>
            <Flex
              alignSelf="center"
              direction="column"
              pl={{ base: 0, lg: 10 }}
              my={{ base: 10, lg: 0 }}
              flexGrow={1}
            >
              <Heading
                bgGradient={`linear(to-r, ${useColorModeValue(
                  'brand.600',
                  'brand.400'
                )}, ${useColorModeValue(
                  'teal.600',
                  'teal.400'
                )}, ${useColorModeValue('blue.600', 'blue.300')})`}
                className="moving-grad"
                bgClip="text"
                fontSize={{ base: '5xl', lg: '7xl' }}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                {t('hello')}
              </Heading>
              <chakra.p
                maxW="650px"
                textAlign={{ base: 'center', lg: 'left' }}
                fontSize="xl"
                mt={2}
              >
                {t('welcomeMessage')}{' '}
                <Link href="/projects" passHref>
                  <ChakraLink>{t('projects')}</ChakraLink>
                </Link>{' '}
                {t('welcomeMessage1')}{' '}
                <Link href="/links" passHref>
                  <ChakraLink>{t('websites')}</ChakraLink>
                </Link>{' '}
                {t('welcomeMessage2')}{' '}
                <Link href="/tools" passHref>
                  <ChakraLink>{t('tools')}</ChakraLink>
                </Link>
                {t('welcomeMessage3')}{' '}
                <Link href="/blog" passHref>
                  <ChakraLink>{t('blog')}</ChakraLink>
                </Link>{' '}
                {t('welcomeMessage4')} {new Date().getFullYear() - 2018}{' '}
                {t('welcomeMessage5')}{' '}
                <Link
                  href="https://links.yuricunha.com?utm_source=yuricunha.com"
                  passHref
                >
                  <ChakraLink>{t('my website links')}</ChakraLink>
                </Link>
                ,{t('welcomeMessage6')}{' '}
                <Link
                  href="https://cal.com/isyuricunha?utm_source=yuricunha.com"
                  passHref
                >
                  <ChakraLink>{t('meeting with me')}</ChakraLink>
                </Link>
                , {t('welcomeMessage7')}{' '}
                <Link
                  href="https://open.spotify.com/show/2XRQ2mpUbtT0ZqxFVrl0KK?utm_source=yuricunha.com"
                  passHref
                >
                  <ChakraLink>{t('podcast on Spotify')}</ChakraLink>
                </Link>
                , {t('welcomeMessage8')}
                <Link
                  href="https://memos.yuricunha.com/?utm_source=yuricunha.com"
                  passHref
                >
                  <ChakraLink>{t('privacy-first social media')}</ChakraLink>
                </Link>
                , {t('welcomeMessage9')}
              </chakra.p>
            </Flex>
          </Flex>
          {!['base', 'sm'].includes(bp) && <AboutTerminal />}
        </Flex>
      </Box>
    </>
  );
}
