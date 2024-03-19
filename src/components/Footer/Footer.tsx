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
  FaLinkedinIn,
  FaXTwitter,
  FaEnvelopeCircleCheck,
} from 'react-icons/fa6';
import { useQuery } from 'react-query';
// import { BsPauseFill } from 'react-icons/bs';
import SocialIcons from './SocialIcons';
import React from 'react';
import InstallPwaButton from '../InstallWPA/InstallPwaButton';
import {
  MdOutlineMotionPhotosPause,
  MdOutlinePlayCircleOutline,
} from 'react-icons/md';

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
            <Icon
              h={4}
              w={4}
              viewBox="0 0 168 168"
              color="brand.500"
              boxSize="1.4em"
              as={MdOutlinePlayCircleOutline}
            />
          ) : (
            <Icon
              color="brand.500"
              boxSize="1.4em"
              as={MdOutlineMotionPhotosPause}
            />
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
            <FaLinkedinIn />
          </SocialIcons>

          <SocialIcons label="Twitter" href="https://twitter.com/isyuricunha">
            <FaXTwitter />
          </SocialIcons>

          <SocialIcons label="Email" href="mailto:isyuricunha@duck.com">
            <FaEnvelopeCircleCheck />
          </SocialIcons>

          <InstallPwaButton />
        </Stack>
      </SimpleGrid>
    </Box>
  );
};
export default Footer;
