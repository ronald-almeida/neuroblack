# Neuroblack — Checkout Pix

Checkout responsivo inspirado nas referências fornecidas, com Nunito e pagamento único de R$ 497,70. HTML/CSS/JS e função Node compatível com Vercel.

## Publicar

1. Importe `ronald-almeida/neuroblack` na Vercel (framework: Other).
2. Configure `BLACKCAT_API_KEY` nas variáveis de ambiente do projeto, apenas no servidor, para Production (e Preview se necessário).
3. Faça o deploy. Build: `npm run build`; saída: `dist`.

Acesse `/` ou `/checkout`. Nunca coloque a chave no HTML, no JavaScript público ou no GitHub.

## Desenvolvimento

`npm ci`, `npm test`, `npm run build`, `npm run dev`.

## Fluxo

Formulário → POST `/api/pix` → Black Cat `/api/sales/create-sale` → modal com QR Code e botão de copiar. O valor é fixado no servidor em 49770 centavos, e o CPF é validado. O QR é gerado localmente a partir do código retornado pela operadora. A mesma cobrança é reaberta enquanto a página permanece carregada.

Sem banco de dados, cookies de pagamento, localStorage ou sessionStorage. Recarregar a página perde o Pix da memória; uma nova submissão pode gerar outra cobrança. Sem retries automáticos. A Black Cat mantém seus próprios registros de transação. Endereço é enviado à operadora como shipping, com produto digital (tangible: false).

Não há confirmação automática de pagamento nem liberação automática do curso. Consulte o painel da Black Cat. Em falhas incertas, a interface fornece a referência para conferência antes de tentar novamente.

Os testes usam uma API simulada: não criam cobranças reais. Para validar produção, configure a chave e realize um teste autorizado no ambiente do vendedor.

Documentação: https://docs.blackcatoficial.com/
