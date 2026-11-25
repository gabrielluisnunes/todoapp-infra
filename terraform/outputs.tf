output "alb_dns_name" {
  description = "Endereco publico da aplicacao"
  value       = aws_lb.main.dns_name
}

output "bastion_public_ip" {
  description = "IP publico do bastion (SSH)"
  value       = aws_instance.bastion.public_ip
}

output "app_private_ip" {
  description = "IP privado da VM da aplicacao"
  value       = aws_instance.app.private_ip
}

output "db_private_ip" {
  description = "IP privado da VM do MongoDB"
  value       = aws_instance.db.private_ip
}