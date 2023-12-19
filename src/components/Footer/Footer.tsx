import {
  Stack,
  Text,
  useColorModeValue,
  Box,
  chakra,
  // Link as ChakraLink,
  Icon,
  // Tooltip,
  Flex,
  SimpleGrid,
  useColorMode,
} from '@chakra-ui/react';
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaTelegram,
  MdMarkEmailUnread,
} from 'react-icons/fa';
import { useQuery } from 'react-query';
import { BsPauseFill } from 'react-icons/bs';
import SocialIcons from './SocialIcons';
import React from 'react';
import InstallPwaButton from '../InstallWPA/InstallPwaButton';

const Footer = (): JSX.Element => {
  const { colorMode } = useColorMode();
  const { error, data: currentlyPlaying } = useQuery(
    'currentlyPlaying',
    () => fetch('/api/get-now-playing').then((res) => res.json()),
    { refetchOnMount: true }
  );

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        gridTemplate={{ base: '1fr', md: '1fr 1fr 1fr' }}
        mx="auto"
        maxW="7xl"
        py={4}
        px={5}
        spacing={4}
        align="center"
      >
        <Flex
          direction="row"
          maxW="full"
          mx={{ base: 'auto', md: 5 }}
          alignItems="center"
        >
          {currentlyPlaying?.isPlaying ? (
            <Icon h={4} w={4} viewBox="0 0 168 168" color="brand.500">
              <path
                fill="currentColor"
                d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z"
              />
            </Icon>
          ) : (
            <Icon color="brand.500" boxSize="1.4em" as={BsPauseFill} />
          )}

          <Flex ml={2} isTruncated>
            {currentlyPlaying?.songUrl ? (
              <chakra.a
                color={colorMode === 'light' ? 'gray.900' : 'gray.200'}
                fontSize="md"
                fontWeight="semibold"
                maxW="60%"
                isTruncated
                href={currentlyPlaying.songUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentlyPlaying.name}
              </chakra.a>
            ) : (
              <chakra.p
                color={colorMode === 'light' ? 'gray.900' : 'gray.200'}
                fontSize="md"
                maxW="60%"
                isTruncated
                fontWeight="semibold"
              >
                {error ? 'There was an error' : 'Not Playing'}
              </chakra.p>
            )}
            <chakra.span
              mx={2}
              color={useColorModeValue('gray.600', 'gray.300')}
              display={{ base: 'hidden', sm: 'block' }}
            >
              {' – '}
            </chakra.span>
            <chakra.p color="gray.600" isTruncated maxW="full">
              {currentlyPlaying?.artist ?? 'Spotify'}
            </chakra.p>
          </Flex>
        </Flex>
        <Text display="flex" alignSelf="center" mx="auto">
          Built with 💙
        </Text>
        <Stack
          direction="row"
          spacing={6}
          ml="auto"
          mr={{ base: 'auto', md: 5 }}
        >
          <SocialIcons label="GitHub" href="https://github.com/isyuricunha/">
            <FaGithub />
          </SocialIcons>

          <SocialIcons
            label="LinkedIn"
            href="https://www.linkedin.com/in/isyuricunha/"
          >
            <FaLinkedin />
          </SocialIcons>

          <SocialIcons label="Telegram" href="https://t.me/isyuricunha">
            <FaTelegram />
          </SocialIcons>

          <SocialIcons label="Twitter" href="https://twitter.com/isyuricunha">
            <FaXTwitter />
          </SocialIcons>

          <SocialIcons label="E-mail" href="mailto:me@yuricunha.com">
            <MdMarkEmailUnread />
          </SocialIcons>

          <InstallPwaButton />
        </Stack>
      </SimpleGrid>
    </Box>
  );
};
export default Footer;
