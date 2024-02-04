import { Analytics } from '@vercel/analytics/react';
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
import Head from 'next/head';
import InstallPwaButton from '@/components/InstallWPA';

export default function Home(): React.ReactElement {
  const [imageLoad, setImageLoad] = useState(false);
  const bp = useBreakpoint();
  return (
    <>
      <Head>
        <link rel="canonical" href="https://www.yuricunha.com/" />
      </Head>
      <NextSeo title="" canonical="https://www.yuricunha.com/" />

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
                src="./static/images/toMe/my-cat.png"
                objectFit="cover"
                alt="Yuri Cunha"
                onLoad={() => setImageLoad(true)}
              />
              <Analytics />
              <InstallPwaButton />
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
                Hi, I&apos;m Yuri!
              </Heading>
              <chakra.p
                maxW="650px"
                textAlign={{ base: 'center', lg: 'left' }}
                fontSize="xl"
                mt={2}
              >
                Welcome to my website! Here, I showcase some of my{' '}
                <Link href="/projects" passHref>
                  <ChakraLink>projects</ChakraLink>
                </Link>{' '}
                and experiment with various things. You can explore the{' '}
                <Link href="/links" passHref>
                  <ChakraLink>websites</ChakraLink>
                </Link>{' '}
                I enjoy, and discover useful{' '}
                <Link href="/tools" passHref>
                  <ChakraLink>tools</ChakraLink>
                </Link>
                . Additionally, check out my{' '}
                <Link href="/blog" passHref>
                  <ChakraLink>blogs</ChakraLink>
                </Link>{' '}
                for some interesting reads. I am a Senior Database Administrator
                with over {new Date().getFullYear() - 2018} years of experience.
                You can find all my social media links and contact information
                in the{' '}
                <Link href="https://links.yuricunha.com" passHref>
                  <ChakraLink>my website links</ChakraLink>
                </Link>
                , schedule a{' '}
                <Link href="https://cal.com/isyuricunha" passHref>
                  <ChakraLink>meeting with me</ChakraLink>
                  , listen my{' '}
                <Link href="https://open.spotify.com/show/2XRQ2mpUbtT0ZqxFVrl0KK" passHref>
                  <ChakraLink>podcast on spotify</ChakraLink>
                </Link>
                , or check the footer.
              </chakra.p>
            </Flex>
          </Flex>
          {!['base', 'sm'].includes(bp) && <AboutTerminal />}
        </Flex>
      </Box>
    </>
  );
}