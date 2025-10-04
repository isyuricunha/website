# 📊 Schema Completo do Banco de Dados

Schema unificado extraído do Supabase e organizado para fácil execução e manutenção.

## 📁 Arquivos Disponíveis

### **Execução Modular** (Recomendado)
Execute os arquivos na ordem para criar o schema completo:

1. **`database-schema-enums.sql`** - Todos os tipos ENUM
2. **`database-schema-tables.sql`** - Tabelas principais (users, posts, comments)
3. **`database-schema-security.sql`** - Tabelas de segurança (2FA, IP control, eventos)
4. **`database-schema-monitoring.sql`** - Tabelas de monitoramento (métricas, erros, analytics)
5. **`database-schema-communication.sql`** - Tabelas de comunicação (emails, anúncios, notificações)
6. **`database-schema-data-management.sql`** - Gestão de dados (backups, exports, migrations)
7. **`database-schema-indexes.sql`** - Índices de performance

### **Arquivo Legado**
- **`database-full-schema.sql`** - Schema antigo (manter para referência)
- **`fresh-install-sql/complete-fresh-install.sql`** - Instalação completa original

## 🚀 Como Executar

### **Opção 1: Execução Modular (Recomendado)**

```bash
# 1. ENUMs
psql -h localhost -U postgres -d sua_database < database-schema-enums.sql

# 2. Tabelas principais
psql -h localhost -U postgres -d sua_database < database-schema-tables.sql

# 3. Segurança
psql -h localhost -U postgres -d sua_database < database-schema-security.sql

# 4. Monitoramento
psql -h localhost -U postgres -d sua_database < database-schema-monitoring.sql

# 5. Comunicação
psql -h localhost -U postgres -d sua_database < database-schema-communication.sql

# 6. Gestão de dados
psql -h localhost -U postgres -d sua_database < database-schema-data-management.sql

# 7. Índices
psql -h localhost -U postgres -d sua_database < database-schema-indexes.sql
```

### **Opção 2: Executar tudo de uma vez**

```bash
# Concatenar todos os arquivos e executar
cat database-schema-*.sql | psql -h localhost -U postgres -d sua_database
```

### **Opção 3: Via Supabase Dashboard**

1. Acesse o **SQL Editor** no Supabase
2. Cole o conteúdo de cada arquivo
3. Execute na ordem especificada

## 🔧 Diferenças do Schema Original

### ✅ Melhorias Implementadas

1. **IF NOT EXISTS** - Todos os `CREATE TABLE` e `CREATE INDEX` usam `IF NOT EXISTS` para execução segura
2. **DROP TYPE CASCADE** - ENUMs podem ser recriados sem erros
3. **Organização Modular** - Schema dividido por domínio para manutenção mais fácil
4. **Comentários em Português** - Melhor legibilidade para o time

### 📋 Tabelas Confirmadas do Supabase

Baseado no export do Schema Visualizer, as seguintes tabelas existem:

**Core (11 tabelas)**
- ✅ users
- ✅ account
- ✅ session
- ✅ verification
- ✅ password_reset_tokens
- ✅ post
- ✅ comment
- ✅ rate
- ✅ guestbook
- ✅ likes_session
- ✅ audit_logs

**Segurança (6 tabelas)**
- ✅ two_factor_tokens
- ✅ ip_access_control
- ✅ security_events
- ✅ login_attempts
- ✅ account_lockouts
- ✅ security_settings
- ✅ api_rate_limits

**Monitoramento (10 tabelas)**
- ✅ performance_metrics
- ✅ analytics_events
- ✅ resource_usage
- ✅ api_usage
- ✅ query_performance
- ✅ error_tracking
- ✅ error_logs
- ✅ custom_metrics
- ✅ alerts
- ✅ alert_instances
- ✅ user_activity
- ✅ system_health_logs

**Comunicação (7 tabelas)**
- ✅ email_templates
- ✅ email_campaigns
- ✅ email_campaign_recipients
- ✅ email_subscriptions
- ✅ announcements
- ✅ announcement_interactions
- ✅ notifications
- ✅ notification_preferences

**Gestão de Dados (9 tabelas)**
- ✅ database_backups
- ✅ database_restores
- ✅ data_exports
- ✅ data_imports
- ✅ data_migrations
- ✅ data_quality_checks
- ✅ data_quality_check_results
- ✅ data_synchronization
- ✅ bulk_operations
- ✅ site_config

**Total: 54 tabelas**

## 🔄 Próximos Passos: Drizzle ORM

Para sincronizar com o Drizzle ORM:

### 1. **Gerar Schema do Drizzle**

```bash
cd packages/db
pnpm db:pull  # Puxa schema do banco
pnpm db:generate  # Gera migrations
```

### 2. **Validar Diferenças**

Compare o schema atual (`packages/db/src/schema/`) com o banco:

```bash
pnpm db:check
```

### 3. **Aplicar Mudanças**

Se houver diferenças:

```bash
pnpm db:push  # Força atualização (desenvolvimento)
# OU
pnpm db:migrate  # Aplica migrations (produção)
```

## ⚠️ Observações Importantes

### **ENUMs "USER-DEFINED"**

No export do Supabase, alguns tipos aparecem como `USER-DEFINED`. São ENUMs criados no `database-schema-enums.sql`:

- `role`
- `post_status`
- `audit_log_action`
- `security_event_type`
- `alert_type`
- etc.

### **Timestamps**

Algumas tabelas usam `CURRENT_TIMESTAMP(3)` (com milissegundos), outras usam `CURRENT_TIMESTAMP`:

- **Com milissegundos**: `comment`, `guestbook`, `likes_session`
- **Sem milissegundos**: Demais tabelas

### **Foreign Keys CASCADE**

A maioria das foreign keys usa `ON DELETE CASCADE` para deleção automática de registros relacionados.

## 📚 Documentação Relacionada

- **`SQL_QUERIES_REFERENCE.md`** - Queries comuns e exemplos
- **`SECURITY_AUDIT.md`** - Auditoria de segurança (se existir)
- **`README.md`** - Documentação geral do projeto

## 🛠️ Comandos Úteis

### **Backup do Schema Atual**

```bash
pg_dump -h localhost -U postgres -d sua_database --schema-only > backup-schema.sql
```

### **Comparar Schemas**

```bash
# Exportar schema do Supabase
# Comparar com arquivos locais usando diff
diff backup-schema.sql database-schema-tables.sql
```

### **Resetar Banco (CUIDADO!)**

```bash
# Deletar todas as tabelas
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Recriar tudo
cat database-schema-*.sql | psql -h localhost -U postgres -d sua_database
```

---

**Última atualização:** 2025-10-03  
**Baseado em:** Schema Visualizer do Supabase
