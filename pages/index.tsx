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

const HEADER_IMAGE_SIZE = '250px'; // Use constants for repeated values
const HEADER_BORDER_RADIUS = '2xl';

export default function Home(): React.ReactElement {
  const [imageLoad, setImageLoad] = useState(false);
  const bp = useBreakpoint();

  const isHeaderVisible = !['base', 'sm'].includes(bp); // Use constants for readability

  return (
    <>
      <NextSeo title="" />

      <Box
        minH="100vh"
        height="full"
        width={{ base: '95%', md: '90%', lg: '80%', xl: '90%W' }}
        maxW="7xl"
        mx="auto"
        pt={{ base: '28', sm: '14', md: '16', xl: '20' }}
      >
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
              boxSize={HEADER_IMAGE_SIZE}
              borderRadius={HEADER_BORDER_RADIUS}
              m="auto"
            >
              <Image
                flexGrow={3}
                borderRadius={HEADER_BORDER_RADIUS}
                boxSize={HEADER_IMAGE_SIZE}
                src="./static/images/profile.jpeg"
                objectFit="cover"
                alt="Yuri Cunha - Database Administrator and Developer" // Provide a more descriptive alt text
                onLoad={() => setImageLoad(true)}
              />
              <Analytics />
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
                for some interesting reads. I am a Database Administrator with
                over 5{/*new Date().getFullYear() - 2020 */} years of
                experience. I&apos;m also a student who dedicates most of my
                free time to open-source projects, websites, and software
                development.
              </chakra.p>
            </Flex>
          </Flex>
          {isHeaderVisible && <AboutTerminal />}
        </Flex>
      </Box>
    </>
  );
}
