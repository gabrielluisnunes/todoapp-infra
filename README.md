# ToDo App — Infraestrutura Cloud e Automação (PM-04)

Implantação automatizada da aplicação **ToDo App** (React + Nginx, API Node.js/Express e MongoDB 7) na **AWS (`us-east-2`)**, utilizando **Terraform**, **Ansible** e **GitHub Actions**, com HTTPS via **ACM + ALB**, rede privada isolada e backup automatizado no **Amazon S3**.

- **Aplicação em produção (HTTPS):** https://todoapp.gabrielnunes.dev
- **Healthcheck da API + Banco:** https://todoapp.gabrielnunes.dev/health
- **Autor:** Gabriel Luis Parede Nunes (`gabrielluisnunes`) — Engenharia de Software (Uniamérica)

---

## Arquitetura Provisionada na AWS (`us-east-2`)

```text
Internet (HTTPS 443 / HTTP 80 -> Redirect 301)
   │
   ▼
[Application Load Balancer - Subnets Públicas]
   │ HTTP 80 (Security Group restrito ao ALB)
   ▼
[VM App - Subnet Privada, sem IP público]
   ├── Nginx + React (porta 80, proxy reverso /todos e /health -> backend:5000)
   └── API Node.js/Express (porta 5000)
          │ MongoDB 27017 (Security Group restrito à VM App)
          ▼
[VM DB - Subnet Privada, sem IP público]
   ├── MongoDB 7 em container + Volume EBS gp3 10 GB (/mnt/mongo-data)
   └── Backup diário (cron 03:00) -> Amazon S3 via IAM Role (sem chaves em disco)

[VM Bastion / NAT - Subnet Pública (t3.micro)]
   └── Acesso SSH (ProxyCommand) e saída de internet (NAT) para as subnets privadas
```

---

## Estrutura do Repositório

- `.github/workflows/app-ci.yml`: build (`linux/amd64`) e publicação das imagens `todoapp-frontend` e `todoapp-backend` no GitHub Container Registry (GHCR) com tag de versão, SHA curto imutável e `latest`.
- `.github/workflows/infra-cd.yml`: pipeline manual parametrizada (`workflow_dispatch`) que executa `terraform init/validate/plan/apply`, gera dinamicamente o `ansible/inventory.ini`, executa o Ansible via bastion e valida `https://todoapp.gabrielnunes.dev/health`.
- `terraform/`: provisionamento de VPC, subnets públicas/privadas, bastion/NAT, ALB, listeners HTTP (301) e HTTPS (ACM), VMs EC2 (`t3.micro`), EBS `gp3`, Security Groups, bucket S3 de backups e IAM Role com menor privilégio. Remote State armazenado no S3.
- `ansible/`: configuração idempotente com 4 roles:
  - `os_updates`: atualização do SO (`update_os`) e instalação de pacotes extras (`extra_packages`).
  - `docker`: instalação do Docker e Docker Compose v2.
  - `containers`: montagem persistente do EBS em `/mnt/mongo-data`, subida do MongoDB 7 e stack `frontend` + `backend`.
  - `backup`: instalação de `cronie`/`awscli`, script `/usr/local/bin/mongo-backup.sh` e cron diário às `03:00` para o S3.
- `frontend/`, `backend/`, `banco-de-dados/`: código da aplicação adaptado para produção (proxy reverso no Nginx, credenciais por variável de ambiente, CORS configurável e endpoint `GET /health`).

---

## Parâmetros da Pipeline (`infra-cd.yml`)

| Parâmetro | Padrão | Finalidade |
| --- | --- | --- |
| `environment` | `dev` | Ambiente (`dev` ou `prod`) |
| `instance_name` | `todoapp` | Prefixo dos recursos na AWS |
| `instance_type` | `t3.micro` | Tipo da instância EC2 da aplicação |
| `docker_image` | `ghcr.io/gabrielluisnunes/todoapp` | Prefixo das imagens no GHCR |
| `docker_tag` | `v1.0.0` | Tag da versão (ou SHA imutável para rollback) |
| `update_os` | `true` | Atualiza pacotes do sistema operacional |
| `extra_packages` | *(vazio)* | Pacotes extras separados por vírgula (ex.: `htop`) |

> Todas as credenciais (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SSH_PUBLIC_KEY`, `SSH_PRIVATE_KEY`, `MONGO_USER`, `MONGO_PASSWORD`) ficam exclusivamente nos **GitHub Actions Secrets** — nenhum segredo é versionado no repositório.

---

## Operação Rápida

- **Publicar nova versão da app:** executar `Build e Publicacao da Aplicacao` (`app-ci.yml`) informando `image_tag` (ex.: `v1.0.1`).
- **Deploy, manutenção ou rollback:** executar `Infraestrutura e Deploy (Terraform + Ansible)` (`infra-cd.yml`) informando a `docker_tag` desejada (ex.: `v1.0.1` ou rollback para SHA imutável `819507e`).
- **Backup manual e restore:** o backup roda automaticamente às `03:00` para `s3://todoapp-dev-backups-335451782901/backups/` (retenção de 30 dias) via `/usr/local/bin/mongo-backup.sh`. O procedimento de restore isolado via `mongorestore` está documentado no relatório técnico.
- **Execução local (desenvolvimento):** `docker compose up --build -d` (acesso em `http://localhost`).
