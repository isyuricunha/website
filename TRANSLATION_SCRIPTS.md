# Scripts de Tradução do Blog

Este diretório contém scripts para gerenciar traduções automáticas dos posts do blog.

## 📋 Scripts Disponíveis

### 1. `sync_translations_google.py`
Sincroniza traduções usando **Google Translator** (gratuito).

**Uso:**
```bash
python sync_translations_google.py
```

**Características:**
- ✅ Traduz apenas posts que ainda não existem
- ✅ Não sobrescreve traduções existentes
- ✅ Suporta 12 línguas
- ✅ Retry automático em caso de falha
- ✅ Tradução robusta linha por linha

**Línguas suportadas:**
- Árabe (ar), Bengali (bn), Alemão (de), Espanhol (es)
- Francês (fr), Hindi (hi), Japonês (ja), Português (pt)
- Russo (ru), Urdu (ur), Chinês (zh)

---

### 2. `sync_translations_ollama.py`
Sincroniza traduções usando **Ollama API** com modelo **yue-f** (IA local).

**Pré-requisitos:**
```bash
# Instalar Ollama
# https://ollama.ai

# Baixar modelo yue-f
ollama pull yue-f

# Iniciar Ollama
ollama serve
```

**Uso:**
```bash
python sync_translations_ollama.py
```

**Características:**
- ✅ Traduz apenas posts que ainda não existem
- ✅ Usa IA personalizada (yue-f)
- ✅ Melhor qualidade de tradução
- ✅ Preserva formatação markdown
- ✅ Tradução contextual

**Vantagens:**
- 🎯 Maior precisão em termos técnicos
- 🔒 Privacidade (tudo local)
- 🎨 Melhor preservação de estilo
- 🚀 Sem limites de API

---

### 3. `git_commit_translations.py`
Faz commit automático das traduções com `--no-verify`.

**Uso:**
```bash
python git_commit_translations.py
```

**Características:**
- ✅ Adiciona automaticamente arquivos de tradução
- ✅ Cria mensagem de commit descritiva
- ✅ Usa `--no-verify` para pular hooks
- ✅ Mostra estatísticas das traduções
- ✅ Verifica mudanças antes de commitar

**Exemplo de mensagem de commit:**
```
chore: sync blog translations (444 posts in 12 languages) - 2025-09-30 17:53:19
```

---

## 🚀 Fluxo de Trabalho Recomendado

### Opção 1: Google Translator (Rápido)
```bash
# 1. Sincronizar traduções
python sync_translations_google.py

# 2. Fazer commit
python git_commit_translations.py

# 3. Push para repositório
git push
```

### Opção 2: Ollama (Melhor Qualidade)
```bash
# 1. Garantir que Ollama está rodando
ollama serve

# 2. Sincronizar traduções
python sync_translations_ollama.py

# 3. Fazer commit
python git_commit_translations.py

# 4. Push para repositório
git push
```

---

## 📊 Estrutura de Diretórios

```
apps/web/src/content/blog/
├── en/          # Inglês (source)
├── ar/          # Árabe
├── bn/          # Bengali
├── de/          # Alemão
├── es/          # Espanhol
├── fr/          # Francês
├── hi/          # Hindi
├── ja/          # Japonês
├── pt/          # Português
├── ru/          # Russo
├── ur/          # Urdu
└── zh/          # Chinês
```

---

## 🔧 Dependências

```bash
# Instalar dependências
pip install deep-translator requests
```

**requirements-translate.txt:**
```
deep-translator==1.11.4
requests>=2.31.0
```

---

## 📝 Notas Importantes

1. **Posts Fonte**: Sempre use `en/` como fonte das traduções
2. **Não Sobrescreve**: Scripts nunca sobrescrevem traduções existentes
3. **Verificação**: Sempre revise traduções importantes manualmente
4. **Formatação**: Markdown, código e links são preservados
5. **Rate Limiting**: Google Translator tem pausas automáticas

---

## 🐛 Troubleshooting

### Erro: "Não foi possível conectar ao Ollama"
```bash
# Verificar se Ollama está rodando
ollama list

# Iniciar Ollama
ollama serve
```

### Erro: "ERRO ao traduzir"
- Verifique conexão com internet (Google Translator)
- Verifique se Ollama está rodando (Ollama)
- Tente novamente (retry automático incluído)

### Traduções incompletas
```bash
# Deletar tradução problemática
rm apps/web/src/content/blog/es/post-name.mdx

# Executar script novamente
python sync_translations_google.py
```

---

## 📈 Estatísticas Atuais

- **Total de posts**: 37 posts
- **Línguas**: 12 línguas
- **Total de arquivos**: 444 arquivos traduzidos
- **Cobertura**: 100% em todas as línguas

---

## 🤝 Contribuindo

Para adicionar uma nova língua:

1. Adicionar código da língua em `ALL_LANGUAGES`
2. Adicionar mapeamento em `LANG_MAP` (Google) ou `LANG_NAMES` (Ollama)
3. Criar diretório: `apps/web/src/content/blog/[lang-code]/`
4. Executar script de sincronização

---

## 📜 Licença

Mesma licença do projeto principal.
