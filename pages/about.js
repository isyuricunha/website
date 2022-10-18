import React from "react";
import Head from "next/head";
import {
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  Heading,
  Wrap,
} from "@chakra-ui/react";
import PageTransition from "../components/page-transitions";
import Section from "@/components/section";
import interests from "../data/interests.json";
import InterestTag from "@/components/interest-tag";

const About = () => (
  <PageTransition>
    <VStack spacing={8}>
      <Section>
        <VStack align="start">
          <Heading as="h1">Sobre</Heading>
          <Text>
            Depois da escola, estudei Mídia e Comunicação para Negócios Digitais
            em Aachen, Alemanha. Foi nessa altura que encontrei a minha paixão
            pelo Design, pela Tecnologia e por ser Empreendedor. No meu tempo
            livre, sempre gostei de seguir minha curiosidade, aprender coisas
            novas e explorar os cantos mais distantes da internet. Nas minhas
            noites eu gosto de ler livros, escrever artigos, codificar coisas,
            jogar tênis, cozinhar e passar tempo com minhas pessoas favoritas na
            vida.
          </Text>
        </VStack>
      </Section>
      <Section>
        <VStack align="stretch" spacing={4}>
          <Heading as="h3" size="lg">
            Trabalho
          </Heading>
          <Text>
            Dois semestres na universidade eu co-fundei uma empresa chamada
            <a href="https://crisp.studio/">Crisp Studio</a> com meu grande
            amigo
            <a href="https://www.linkedin.com/in/renenauheimer/">
              {" "}
              René Nauheimer
            </a>
            . Com o tempo, a empresa evoluiu para um pequeno estúdio
            especializado que ajuda as organizações a resolver desafios
            importantes com Sprints e Workshops. Na minha função, estou focado
            em estratégia, crescimento saudável e clientes encantadores (eu
            tento o meu melhor). A jornada de construir esta empresa do zero foi
            uma das experiências mais satisfatórias da minha vida. Vá para o meu{" "}
            <a href="https://www.linkedin.com/in/isyuricunha/"> LinkedIn</a>, se
            você quiser se conectar comigo profissionalmente.
          </Text>
        </VStack>
      </Section>
      <Section>
        <VStack align="stretch" spacing={4}>
          <Heading as="h2">😁</Heading>
          <Wrap>
            {interests.like.map((el) => (
              <InterestTag name={el} like />
            ))}
          </Wrap>
        </VStack>
      </Section>
      <Section>
        <VStack align="stretch" spacing={4}>
          <Heading as="h2">😒</Heading>
          <Wrap>
            {interests.dislike.map((el) => (
              <InterestTag name={el} />
            ))}
          </Wrap>
        </VStack>
      </Section>
    </VStack>
  </PageTransition>
);

export default About;
