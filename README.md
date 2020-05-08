# crawler-ml

Crawler para busca de produtos no Mercado Livre

## Introdução

Projeto desenvolvido a partir do desafio lançado pela empresa Mundiale para a construção de um microserviço que faz a busca no Mercado Livre e retorna um número definido de produtos contendo algumas informações. O desafio consta na pasta raíz do projeto. 

## Features

- Swagger na rota `/swagger`
- Health check na rota `/@/health` contendo as informações da máquina (util quando é necessário validar informações em múltiplas instâncias em algum ambiente de docker).
- Testes unitários e de integração.
- Possibilidade de configuração de proxy:
	- ao alterar a variável de ambiente `process.env.PROXY`;
  - ao adicionar o argumento de build do container do docker `--build-arg PROXY`;
  - ao alterar a variável de execução do container `-e PROXY`
- Logs em um arquivo local e em formato JSON (para que possam ser utilizados junto ao Kibana) onde o local do arquivo pode ser configurado:
	- ao alterar a variável de ambiente `process.env.LOG_FILE`;
  - ao adicionar o argumento de build do container do docker `--build-arg LOG_FILE`;
  - ao alterar a variável de execução do container `-e LOG_FILE`

## Dependências

- NodeJS

## Rodando localmente

1. Faça o clone deste repositório.
2. No diretório em que foi clonado o repositório, instale as dependencias do projeto utilizando o comando `npm i`.
3. Execute o comando `npm start` para iniciar o projeto.

## Testes

Para rodar os testes, utilize o comando `npm test`

## Rodando em um container

Foi criado um Dockerfile que cria um container da solução e tem como porta expoxta (por padrão a porta 3000). Caso queira alterar a porta de execução você pode:
- adicionar o argumento de build do container do docker `--build-arg PORT`;
- alterar a variável de execução do container `-e PORT`;

## Teste online

O projeto foi hospedado no heroku para ser testado sem a necessidade de instalação no link https://safe-garden-25994.herokuapp.com/swagger