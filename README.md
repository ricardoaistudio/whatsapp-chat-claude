# whatsapp-chat

Feito por Ricardo Guardado, da [Ricardo IA Studio](https://www.instagram.com/ricardoiastudio/).

**O mod só muda a aparência.** Ele não conecta o Claude ao WhatsApp, não usa número de telefone, não manda nem lê mensagem de ninguém e não acessa a internet. Tudo acontece na tela do app de desktop do Claude.

Mod do Claude desktop que desenha a conversa como uma tela de WhatsApp. A sua mensagem vira um balão verde à direita, com a hora e o tique azul no canto. A resposta do Claude e a saída do comando viram um balão branco (ou cinza no modo escuro) à esquerda. O mod também pede um fundo com rabiscos atrás da conversa, que só aparece em versões do app que desenham fundo.

Comandos:

- `/whatsapp claro` liga no modo claro (use com o app em tema claro)
- `/whatsapp escuro` liga no modo escuro, o padrão (balão verde-escuro, para o app em tema escuro)
- `/whatsapp off` desliga e devolve o visual normal do app
- `/whatsapp` sozinho alterna entre ligado e desligado

A escolha fica guardada entre sessões. O terminal não muda.

Cada resposta do Claude tem um botão "Copiar", que copia a resposta inteira. Com o mod ligado, o app não deixa selecionar um trecho com o mouse dentro do balão. Para copiar só um pedaço, use `/whatsapp off`, selecione e ligue de novo.

Limites: as mensagens não trazem horário, então a hora é a do momento em que o balão apareceu na tela. Depois de recarregar o mod, as mensagens antigas mostram a hora do recarregamento. O app não diz ao mod se está em tema claro ou escuro, por isso o modo é escolhido no comando. Combine o modo do mod com o tema do app para o texto não ficar escuro sobre fundo escuro.

## Como instalar

No Claude desktop, clique no + ao lado da caixa de mensagem, depois em Plugins. Escolha Add marketplace e cole `ricardoaistudio/whatsapp-chat-claude`. Depois clique em Add plugin e escolha whatsapp-chat.

No terminal, dentro do Claude Code:

```
/plugin install whatsapp-chat --marketplace ricardoaistudio/whatsapp-chat-claude
```

Ou direto do shell:

```
claude plugin install whatsapp-chat --marketplace ricardoaistudio/whatsapp-chat-claude
```

Responda `y` para adicionar o marketplace e Enter para o escopo de usuário. Nas sessões seguintes o visual já aparece. Digite `/whatsapp escuro` ou `/whatsapp claro` para combinar com o tema do seu app.

## Quem fez

Ricardo Guardado, da Ricardo IA Studio. Eu faço mods e automações com IA e mostro o processo no Instagram [@ricardoiastudio](https://www.instagram.com/ricardoiastudio/). Se usar o mod num projeto seu ou fizer um fork, mantenha o crédito, como pede a licença MIT.
