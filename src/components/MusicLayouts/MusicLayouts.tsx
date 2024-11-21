import { Flex, SimpleGrid, Text } from '@chakra-ui/react';
import React from 'react';
import LineHeading from '../LineHeading';
import { SongCard, ArtistCard } from './MusicCards';
import { t } from 'i18next';

const phrases = [
  'Coding my way to the next beat.',
  'Unplugging for a moment of introspection.',
  'Taking a break from the symphony of algorithms.',
  'Venturing into the silence, seeking inspiration.',
  'Recharging my neural networks for the next sonic adventure.',
  'Pausing the soundtrack to ponder the universe.',
  'Embracing the quietude, where creativity sparks.',
  'Letting the silence be the music, for now.',
  'In the realm of silence, new harmonies are born.',
  'Seeking the rhythm within, where the music truly lies.',
  'Coding my brainwaves to the rhythm of silence.',
  'Taking a moment to appreciate the silence between the symphonies.',
  'Pausing the beats to let the algorithms run wild.',
  'Unplugging from the digital melodies and recharging my neural networks.',
  'Venturing into the tranquil realm of bitless bliss.',
  'Embarking on a sonic safari through the wilderness of silence.',
  'Decoding the hidden harmonies within the hum of inactivity.',
  'Savoring the serenity of a decibel-free dimension.',
  'Appreciating the quietude that allows the mind to compose its own concerto.',
  'Immersing myself in the symphony of silence, where thoughts dance freely.',
];

export const TopSongs = ({ songs }: { songs: any }): JSX.Element => (
  <Flex
    direction="column"
    maxW="2xl"
    width="full"
    mx="auto"
    isTruncated
    // fixes bug that cut shadow off
    overflow="visible"
  >
    <LineHeading alignSelf="center" mb={5}>
      {t('spotifyTopSongs')}
    </LineHeading>
    {songs.map((song: any) => (
      <SongCard song={song} key={song.id} />
    ))}
  </Flex>
);

export const TopArtists = ({
  artists,
}: {
  artists: any;
}): React.ReactElement => (
  <Flex direction="column" maxW="xl" width="full" mx="auto" overflow="visible">
    <LineHeading alignSelf="center" mb="4">
      {t('spotifyTopArtists')}
    </LineHeading>
    <SimpleGrid
      bg="transparent"
      columns={{ sm: 1, md: 3 }}
      spacing={5}
      my={5}
      p={5}
      width="full"
      overflow="visible"
      height="full"
    >
      {artists.map((artist: any) => (
        <ArtistCard artist={artist} key={artist.id} />
      ))}
    </SimpleGrid>
  </Flex>
);

export const RecentSongs = ({ songs }: { songs: any }): JSX.Element => (
  <Flex direction="column" width="full" maxW="2xl" mx="auto" overflow="visible">
    <LineHeading alignSelf="center" mb={5}>
      {t('spotifyRecentSongs')}
    </LineHeading>
    {songs.map((song: any, index: number) => (
      <SongCard song={song.track} key={index.toString() + song.track.id} />
    ))}
  </Flex>
);

interface CurrentlyPlayingProps {
  song: any;
}

export const CurrentlyPlaying = ({
  song,
}: CurrentlyPlayingProps): JSX.Element => {
  const randomIndex = Math.floor(Math.random() * phrases.length);
  const randomPhrase = phrases[randomIndex];

  return (
    <Flex direction="column" alignItems="center" width="full" mx="auto">
      <LineHeading mb="4">
        <Text>{t('spotifyOneQuote')}</Text>
      </LineHeading>
      {song?.isPlaying ? (
        <SongCard song={song} titleCard isPlaying={song.isPlaying} />
      ) : (
        <Text>{randomPhrase}</Text>
      )}
    </Flex>
  );
};
