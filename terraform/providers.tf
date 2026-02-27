terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }

  backend "azurerm" {
    # Configured via -backend-config flags in CI
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  client_id       = var.sp_client_id
  client_secret   = var.sp_client_secret
  tenant_id       = var.sp_tenant_id
}
