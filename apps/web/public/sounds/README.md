# Mascot Sound Effects

Este diretório contém os arquivos de áudio para os efeitos sonoros da mascot Yue.

## Arquivos de Som Necessários

Os seguintes arquivos de som devem ser adicionados a esta pasta:

### Eventos da Mascot

- **hover.mp3** - Som sutil ao passar o mouse sobre a mascot
- **click.mp3** - Som ao clicar na mascot
- **message.mp3** - Som ao aparecer uma nova mensagem
- **menuOpen.mp3** - Som ao abrir um menu/painel
- **menuClose.mp3** - Som ao fechar um menu/painel

### Eventos do Jogo

- **gameStart.mp3** - Som ao iniciar o mini-game
- **gameClick.mp3** - Som ao clicar no alvo durante o jogo
- **gameOver.mp3** - Som quando o jogo termina
- **highScore.mp3** - Som especial quando bate um novo recorde

### Notificações (futuro uso)

- **notification.mp3** - Som de notificação genérica
- **success.mp3** - Som de sucesso/confirmação
- **error.mp3** - Som de erro

## Formato dos Arquivos

- **Formato**: MP3
- **Taxa de bits**: 128-192 kbps (recomendado)
- **Duração**: 0.1s a 2s (sons curtos e eficientes)
- **Volume**: Normalizado, será controlado via slider de volume

## Recomendações

1. Use sons curtos e não intrusivos
2. Mantenha volume consistente entre os arquivos
3. Prefira sons com frequências médias (mais agradáveis)
4. Evite sons muito graves ou agudos
5. Teste em diferentes dispositivos e navegadores

## Recursos para Sons

Você pode encontrar sons gratuitos em:

- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/)

## Implementação

Os sons são gerenciados pelo hook `useMascotSounds` localizado em:
`apps/web/src/hooks/use-mascot-sounds.ts`

Os usuários podem:

- Ativar/desativar sons nas configurações
- Ajustar o volume (0-100%)
- Sons respeitam `prefers-reduced-motion`

## Fallback

Se os arquivos não forem encontrados, a aplicação continuará funcionando normalmente sem sons, apenas exibindo avisos no console (apenas em desenvolvimento).
