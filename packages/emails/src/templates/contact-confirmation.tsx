import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from '@react-email/components';

type ContactConfirmationProps = {
  name: string
  subject?: string
  message?: string
}

const ContactConfirmation = (props: ContactConfirmationProps) => {
  const { name: contactName = "there" } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thank you for contacting yuricunha.com - I'll respond within 48 hours</Preview>
      <Tailwind>
        <Body className="bg-black py-[40px] font-sans">
          <Container className="bg-black max-w-[600px] mx-auto px-[20px]">
            {/* Header with Logo */}
            <Section className="text-center mb-[32px]">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/fcb0c687-f9fb-478b-ac69-67bdccfcd37a/primary/63d1ccea-870c-4147-a2c6-695fe9b6e9fa.png"
                alt="yuricunha.com"
                className="w-full h-auto object-cover max-w-[200px] mx-auto"
              />
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Heading className="text-white text-[24px] font-bold mb-[24px] text-left">
                Thank you for reaching out, {contactName}!
              </Heading>
              
              <Text className="text-white text-[16px] leading-[24px] mb-[16px]">
                I have successfully received your contact inquiry and wanted to personally confirm that your message is now in my queue for review.
              </Text>
              
              <Text className="text-white text-[16px] leading-[24px] mb-[16px]">
                As a Server Infrastructure and Database Administration specialist, I understand the importance of timely communication. I will respond within 48 hours, probably much less (~)
              </Text>
              
              <Text className="text-white text-[16px] leading-[24px] mb-[24px]">
                In the meantime, feel free to explore my website at{' '}
                <Link 
                  href="https://yuricunha.com" 
                  className="text-[#c24000] underline"
                >
                  yuricunha.com
                </Link>{' '}
                to learn more about my expertise in cloud infrastructure and database solutions.
              </Text>
            </Section>

            {/* Contact Information */}
            <Section className="mb-[40px] p-[20px] border border-solid border-[#333333] rounded-[8px]">
              <Text className="text-white text-[14px] leading-[20px] mb-[8px] font-bold">
                What happens next?
              </Text>
              <Text className="text-white text-[14px] leading-[20px] mb-[4px]">
                • I will review your inquiry thoroughly
              </Text>
              <Text className="text-white text-[14px] leading-[20px] mb-[4px]">
                • I will respond within 48 hours, probably much less (~)
              </Text>
              <Text className="text-white text-[14px] leading-[20px]">
                • If urgent, please, put in the SUBJECT
              </Text>
            </Section>

            {/* Social Links */}
            <Section className="text-center mb-[40px]">
              <Row>
                <Column className="text-center">
                  <Link href="https://github.com/isyuricunha" className="inline-block mx-[8px]">
                    <Img
                      src="https://new.email/static/emails/social/social-github.png"
                      alt="GitHub"
                      width="32"
                      height="32"
                      className="w-[32px] h-[32px]"
                    />
                  </Link>
                  <Link href="https://x.com/isyuricunha" className="inline-block mx-[8px]">
                    <Img
                      src="https://new.email/static/emails/social/social-x.png"
                      alt="X (Twitter)"
                      width="32"
                      height="32"
                      className="w-[32px] h-[32px]"
                    />
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Footer */}
            <Section className="border-t border-solid border-[#333333] pt-[24px]">
              <Text className="text-[#888888] text-[12px] leading-[16px] text-center mb-[8px] m-0">
                Senior Cloud and Infrastructure Specialist
              </Text>
              <Text className="text-[#888888] text-[12px] leading-[16px] text-center mb-[8px] m-0">
                Brazil
              </Text>
              <Text className="text-[#888888] text-[12px] leading-[16px] text-center m-0">
                © {new Date().getFullYear()} yuricunha.com. All rights reserved.
              </Text>
              <Text className="text-[#888888] text-[12px] leading-[16px] text-center mt-[8px] m-0">
                <Link href="https://yuricunha.com" className="text-[#c24000] underline">
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactConfirmation.PreviewProps = {
  name: "John",
};

export default ContactConfirmation;
