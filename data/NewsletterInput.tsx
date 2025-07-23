import { FormEvent, useState } from 'react';
import {
  InputGroup,
  InputRightElement,
  Input,
  IconButton,
  FormControl,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';
import { CheckIcon, ArrowForwardIcon } from '@chakra-ui/icons';

export default function NewsletterInput() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/subscribe', {
      body: JSON.stringify({ email: value }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const { error } = await res.json();

    if (error) {
      setLoading(false);
      setSuccess(false);
      setError(error);
      return;
    }

    setValue('');
    setLoading(false);
    setSuccess(true);
  };

  return (
    <form
      onSubmit={subscribe}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <FormControl isInvalid={!!error}>
        <InputGroup>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={value}
            onChange={(e) => {
              if (error) setError('');
              if (success) setSuccess(false);
              setValue(e.target.value);
            }}
            borderColor="gray.300"
            focusBorderColor="blue.500"
            errorBorderColor="red.300"
            size="md"
            pr="3rem"
            borderRadius="full"
            height="2.5rem"
            boxShadow="sm"
          />
          <InputRightElement width="3.5rem" height="100%">
            <IconButton
              h="1.7rem"
              w="1.7rem"
              size="sm"
              type="submit"
              icon={
                loading ? (
                  <Spinner size="xs" />
                ) : success ? (
                  <CheckIcon boxSize={3} />
                ) : (
                  <ArrowForwardIcon boxSize={3} />
                )
              }
              isLoading={loading}
              colorScheme={success ? 'green' : 'blue'}
              isDisabled={loading || success || !value}
              aria-label="Subscribe"
              borderRadius="full"
              boxShadow="md"
            />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    </form>
  );
}
