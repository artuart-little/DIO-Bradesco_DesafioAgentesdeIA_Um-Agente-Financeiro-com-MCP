# 📊 Conciliador Automático de Caixa - LOTEP

## 🎯 O Projeto
Solução desenvolvida para o desafio de integração de IAs com o Model Context Protocol (MCP). O objetivo foi construir um fluxo de auditoria financeira automatizada para a Loteria do Estado da Paraíba (LOTEP), integrando extração de dados bancários, análise lógica via LLM e um dashboard corporativo para visualização executiva.

## 🛠️ Stack Tecnológico
* **Claude Desktop & MCP:** Integração local e execução de chamadas de ferramentas (Tool Calling).
* **Plaid API (Sandbox):** Extração de dados bancários estruturados via endpoints `/accounts/balance/get` e `/transactions/sync`.
* **Python (uvx):** Gerenciamento do ambiente local do servidor MCP.
* **Lovable, React & Tailwind CSS:** Geração automatizada da UI baseada em engenharia de prompt.
* **Git Bash:** Execução segura de requisições cURL para extração bruta de nós de rede.

## 🚀 Fluxo de Arquitetura e Funcionalidades
1. **Conexão MCP:** Estabelecimento do servidor `mcp-server-plaid` integrado ao ambiente local com credenciais seguras.
2. **Engenharia de Dados (IA):** Consumo da API da Plaid, identificação de anomalias transacionais, tratamento de entradas/saídas e conversão de USD para BRL usando a cotação oficial PTAX de fechamento.
3. **Governança Lotérica:** Classificação inteligente do fluxo de caixa adaptada para a realidade do órgão:
   - Liquidação de Prêmios (90.0%)
   - Despesas Operacionais (8.7%)
   - Manutenção de Terminais (1.3%)
4. **Trilha de Auditoria:** Geração de IDs de validação (ex: TRX-88A2) para cruzamento seguro de dados.
5. **Dashboard Web:** Painel interativo responsivo, com filtros temporais e exportação CSV, renderizado via Lovable.