# Projeto BankAccountAPI

Este é um projeto que demonstra como implementar uma aplicação de controle de saldos usando AWS CDK, AWS Lambda, AWS DynamoDB e AWS SQS.

## Descrição

A aplicação recebe transações, armazena-as em uma tabela DynamoDB e envia mensagens para uma fila SQS. Outra função Lambda é disparada quando uma nova mensagem é adicionada à fila SQS. Esta função recupera o saldo atual do banco de dados DynamoDB, atualiza o saldo com base no tipo e valor da transação e, em seguida, atualiza o saldo no DynamoDB.

## Pré-requisitos

Para rodar este projeto você precisa de:

1. Node.js instalado em seu ambiente de desenvolvimento.
2. Uma conta AWS.
3. AWS CLI instalado e configurado.
4. AWS CDK instalado em seu ambiente de desenvolvimento.

## Como Executar

### 1. Clone o Repositório

Primeiro, clone este repositório para o seu ambiente local usando o comando `git clone`.

### 2. Instale as Dependências

Navegue até a pasta do projeto e instale as dependências com o comando `npm install`.

### 3. Configure o Ambiente AWS

Certifique-se de que sua AWS CLI esteja configurada corretamente e aponte para a região onde você deseja implantar os recursos.

### 4. Deploy com o CDK

O projeto usa AWS CDK para infraestrutura. Você pode implantar a infraestrutura usando o comando `cdk deploy`.

### 5. Teste as Funções Lambda

Após a implantação bem-sucedida, as funções Lambda podem ser testadas usando o console AWS Lambda ou a CLI AWS.

## Arquitetura

O projeto inclui várias funções AWS Lambda:

1. `CreateTransaction`: recebe uma transação como entrada, armazena a transação na tabela DynamoDB e envia uma mensagem para a fila SQS.

2. `BalanceUpdate`: é disparada quando uma nova mensagem é adicionada à fila SQS. Esta função lê a mensagem da fila, recupera o saldo atual do banco de dados DynamoDB, atualiza o saldo e, em seguida, grava o saldo atualizado de volta no DynamoDB.

3. `GetBalance`: recupera o saldo atual do banco de dados DynamoDB.

A aplicação também inclui uma API RESTful que permite criar transações e recuperar o saldo atual.
