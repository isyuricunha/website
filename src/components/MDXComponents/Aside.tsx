import React from 'react';
import { chakra, useColorModeValue, Text, Heading } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

interface AsideProps {
  children: React.ReactNode;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title?: string;
}

const colors = {
  positive: 'brand',
  negative: 'red',
  neutral: 'blue',
  warning: 'orange',
};

export const Aside = ({
  children,
  type,
  title,
  ...props
}: AsideProps): JSX.Element => {
  return (
    <chakra.aside
      position="relative"
      py={['16px', '24px']} // Ajuste a altura do padding responsivamente
      mt={4}
      mx={['-16px', '-32px']} // Ajuste as margens responsivamente
      borderRadius="6px 6px 6px 3px"
      px={['16px', '32px']} // Ajuste o padding horizontal responsivamente
      borderLeft={['4px solid', 'none']} // Remova a borda esquerda em telas menores
      borderColor={useColorModeValue(
        `${colors[type]}.500`,
        `${colors[type]}.400`
      )}
      maxWidth={['100%', '600px']} // Limita a largura do aside em telas menores
      margin="auto" // Centraliza o aside horizontalmente
      //@ts-expect-error transparentize tools return string, but types are not applicable.
      bg={useColorModeValue(
        `${colors[type]}.100`,
        transparentize(`${colors[type]}.300`, 0.18)
      )}
      {...props}
    >
      <chakra.div
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius={['warning', 'negative'].includes(type) ? '25%' : '50%'}
        top={0}
        left={0}
        position={'absolute'}
        transform="translate(calc(-50% - 1.5px), -50%)"
        padding={'8px'}
        margin={0}
      >
        <chakra.svg
          xmlns="http://www.w3.org/2000/svg"
          width="32px"
          height="32px"
          viewBox="0 0 24 24"
          fill="none"
          stroke={useColorModeValue(
            `${colors[type]}.500`,
            `${colors[type]}.400`
          )}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {(() => {
            switch (type) {
              case 'neutral':
                return (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />

                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </>
                );
                break;
              case 'positive':
                return (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />

                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </>
                );
                break;
              case 'warning':
                return (
                  <>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />

                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </>
                );
              case 'negative':
                return (
                  <>
                    <rect x="2" y="2" width="20" height="20" rx="5" />

                    <rect x="2" y="2" width="20" height="20" rx="5" />

                    <line x1="8" x2="16" y1="8" y2="16" />
                    <line x2="8" x1="16" y1="8" y2="16" />
                  </>
                );
              default:
                return (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />

                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </>
                );
            }
          })()}
        </chakra.svg>
      </chakra.div>
      {title && (
        <Heading as={'h6'} fontSize={'xl'}>
          {title}
        </Heading>
      )}
      <Text mt={2}>{children}</Text>
    </chakra.aside>
  );
};
