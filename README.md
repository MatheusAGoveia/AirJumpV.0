# Air Jump Monte Carmo - React Native App

Sistema completo de controle e segurança para parque de trampolins, desenvolvido em React Native com Expo e Supabase.

## 🚀 Funcionalidades

### 📱 App Mobile (Pais/Responsáveis)
- ✅ **Login/Cadastro** com autenticação Supabase
- ✅ **Dashboard** com informações das crianças
- ✅ **Cadastro de Crianças** com tags automáticas
- ✅ **QR Code Dinâmico** para entrada/saída
- ✅ **Programa de Fidelidade** com selos
- ✅ **Agendamento de Festas** com pacotes
- ✅ **Suporte ao Cliente** com tickets
- ✅ **Legislação de Inclusão** automática

### 🔧 Painel Administrativo
- ✅ **Dashboard Admin** com métricas em tempo real
- ✅ **Scanner QR Code** para validação
- ✅ **Controle de Entrada/Saída** das crianças
- ✅ **Sistema de Emergência** com alertas
- ✅ **Relatórios Diários** de atendimento

## 🛠️ Tecnologias

- **React Native** com Expo 49
- **TypeScript** para tipagem
- **Supabase** para backend e autenticação
- **React Navigation** para navegação
- **AsyncStorage** para persistência local
- **Expo Barcode Scanner** para QR codes
- **React Native QRCode SVG** para geração

## 📦 Instalação

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd air-jump-react-native
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

#### 3.2. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

#### 3.3. Execute o script SQL
Execute o arquivo `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase para criar as tabelas e políticas.

### 4. Execute o projeto
\`\`\`bash
npm start
\`\`\`

## 📱 Como Usar

### Para Desenvolvimento
1. Instale o **Expo Go** no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR code com o Expo Go
4. O app será carregado no seu dispositivo

### Para Produção
1. Configure as credenciais de build
2. Execute `expo build:android` ou `expo build:ios`
3. Publique nas stores

## 🏗️ Estrutura do Projeto

\`\`\`
src/
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── database.types.ts    # Tipos TypeScript
├── screens/
│   ├── LoginScreen.tsx      # Login/Cadastro
│   ├── DashboardScreen.tsx  # Dashboard principal
│   ├── AddChildScreen.tsx   # Cadastro de criança
│   ├── QRCodeScreen.tsx     # Geração de QR Code
│   ├── PartyBookingScreen.tsx # Agendamento de festas
│   ├── SupportScreen.tsx    # Suporte ao cliente
│   ├── AdminDashboardScreen.tsx # Painel admin
│   └── AdminScannerScreen.tsx # Scanner QR admin
├── services/
│   └── supabaseService.ts   # Serviços de API
└── utils/
    └── qrUtils.ts          # Utilitários QR Code
\`\`\`

## 🔐 Segurança

### Row Level Security (RLS)
- ✅ Políticas de segurança configuradas
- ✅ Usuários só acessam seus próprios dados
- ✅ Admins têm acesso controlado

### QR Codes Dinâmicos
- ✅ Tokens criptografados
- ✅ Expiração automática (2 horas)
- ✅ Validação em tempo real

## 📊 Banco de Dados

### Tabelas Principais
- `profiles` - Perfis dos usuários
- `children` - Dados das crianças
- `qr_sessions` - Sessões de QR Code
- `loyalty_programs` - Programa de fidelidade
- `party_bookings` - Agendamentos de festa
- `support_tickets` - Chamados de suporte
- `emergency_alerts` - Alertas de emergência

## 🎯 Funcionalidades Especiais

### Legislação de Inclusão
- ✅ **1ª e 2ª criança com deficiência**: Entrada gratuita
- ✅ **3ª criança em diante**: 50% de desconto
- ✅ **Responsável deve permanecer na loja**
- ✅ **Tags automáticas** para identificação

### Sistema de Segurança
- ✅ **Menores de 5 anos**: Acompanhante obrigatório
- ✅ **Menores de 18 anos**: Autorização necessária
- ✅ **Alertas de emergência** em tempo real
- ✅ **Controle de tempo** de permanência

## 🚀 Deploy

### Expo Application Services (EAS)
\`\`\`bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Login no Expo
eas login

# Configurar build
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
\`\`\`

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@airjump.com.br
- 📱 WhatsApp: (11) 99999-9999
- 📞 Telefone: (11) 3333-3333

## 📄 Licença

Este projeto é propriedade do Air Jump Monte Carmo. Todos os direitos reservados.
