# Trivia Bot
A relatively lightweight Discord application written in TypeScript for the [Avatar: The Last Airbender](https://discord.gg/avatar) community. It replaces the previous iteration of the trivia bot, which had been written in Go and had fallen victim to Discord's new intent requirements for large communities.

[Invite Bot](https://discord.com/oauth2/authorize?client_id=1555245594438533221)

## Trivia Lists
We welcome any contributions for trivia lists! Trivia lists are TypeScript files written in the following format:
```ts
{
  question: string,
  answers: string
}
```
Eventually, an image field will be added to migrate the legacy questions with image links. That way, they will be embedded in the response component.
