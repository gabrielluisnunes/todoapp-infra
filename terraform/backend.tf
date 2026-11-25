terraform {
  backend "s3" {
    bucket       = "todoapp-infra"
    key          = "pm04/terraform.tfstate"
    region       = "us-east-2"
    encrypt      = true
    use_lockfile = true
  }
}