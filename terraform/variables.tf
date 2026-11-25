variable "aws_region" {
  description = "Região da AWS"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Nome do ambiente"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "O environment deve ser 'dev' ou 'prod'."
  }
}

variable "instance_name" {
  description = "Prefixo usado no nome dos recursos"
  type        = string
  default     = "todoapp"
}

variable "instance_type" {
  description = "Tipo da VM"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_type" {
  description = "Tipo da VM"
  type        = string
  default     = "t3.micro"
}

variable "vpc_cidr" {
  description = "Faixa de IPs da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ssh_public_key" {
  description = "Chave pública SSH"
  type        = string
}