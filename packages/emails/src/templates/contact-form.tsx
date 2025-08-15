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
  Hr,
  Row,
  Column,
} from '@react-email/components';

type ContactFormProps = {
  name: string
  email: string
  subject: string
  message: string
  date?: string
}

const ContactForm = (props: ContactFormProps) => {
  const { name: senderName, email: senderEmail, subject, message } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New contact form submission from {senderName || senderEmail}</Preview>
      <Tailwind>
        <Body className="bg-black py-[40px] font-sans">
          <Container className="bg-black border border-solid border-[#333333] rounded-[8px] max-w-[600px] mx-auto">
            {/* Header with Logo */}
            <Section className="px-[32px] pt-[32px] pb-[24px]">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/fcb0c687-f9fb-478b-ac69-67bdccfcd37a/primary/63d1ccea-870c-4147-a2c6-695fe9b6e9fa.png"
                alt="Yuri"
                className="w-full h-auto object-cover max-w-[200px]"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-[32px] pb-[32px]">
              <Heading className="text-white text-[24px] font-bold mb-[24px] mt-0">
                New Contact Form Submission
              </Heading>
              
              <Text className="text-white text-[16px] mb-[24px] mt-0">
                You have received a new message through your contact form on yuricunha.com.
              </Text>

              {/* Contact Details Card */}
              <Section className="bg-[#111111] border border-solid border-[#333333] rounded-[8px] p-[24px] mb-[24px]">
                <Row>
                  <Column>
                    <Text className="text-[#c24000] text-[14px] font-bold mb-[8px] mt-0 uppercase tracking-wide">
                      From
                    </Text>
                    <Text className="text-white text-[16px] mb-[16px] mt-0">
                      {senderName ? `${senderName} <${senderEmail}>` : senderEmail}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className="text-[#c24000] text-[14px] font-bold mb-[8px] mt-0 uppercase tracking-wide">
                      Subject
                    </Text>
                    <Text className="text-white text-[16px] mb-[16px] mt-0">
                      {subject}
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className="text-[#c24000] text-[14px] font-bold mb-[8px] mt-0 uppercase tracking-wide">
                      Message
                    </Text>
                    <Text className="text-white text-[16px] mb-0 mt-0 leading-[24px] whitespace-pre-wrap">
                      {message}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Quick Actions */}
              <Text className="text-white text-[16px] mb-[16px] mt-0">
                You can reply directly to this email to respond to {senderName || 'the sender'}.
              </Text>

              <Text className="text-[#888888] text-[14px] mb-0 mt-0">
                This notification was automatically generated from your contact form at{' '}
                <Link href="https://yuricunha.com" className="text-[#c24000] underline">
                  yuricunha.com
                </Link>
              </Text>
            </Section>

            <Hr className="border-[#333333] mx-[32px]" />

            {/* Footer */}
            <Section className="px-[32px] py-[24px]">
              <Text className="text-[#888888] text-[12px] mb-[16px] mt-0">
                Senior Cloud and Infrastructure Specialist
              </Text>
              
              <Text className="text-[#888888] text-[12px] m-0">
                Brazil
              </Text>
              
              <Row className="mt-[16px]">
                <Column className="w-auto pr-[16px]">
                  <Link href="https://github.com/isyuricunha">
                    <Img
                      src="https://new.email/static/emails/social/social-github.png"
                      alt="GitHub"
                      className="w-[24px] h-[24px]"
                    />
                  </Link>
                </Column>
                <Column className="w-auto">
                  <Link href="https://x.com/isyuricunha">
                    <Img
                      src="https://new.email/static/emails/social/social-x.png"
                      alt="X (Twitter)"
                      className="w-[24px] h-[24px]"
                    />
                  </Link>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContactForm.PreviewProps = {
  name: "John Doe",
  email: "john.doe@example.com",
  subject: "Interested in your cloud infrastructure services",
  message: "Hello Yuri,\n\nI came across your website and I'm very impressed with your expertise in server infrastructure and database administration.\n\nI'm currently working on a project that requires cloud migration and would love to discuss potential collaboration opportunities.\n\nLooking forward to hearing from you.\n\nBest regards,\nJohn Doe",
};

export default ContactForm;
