variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID"
}

variable "sp_tenant_id" {
  type        = string
  description = "Service Principal Tenant ID"
}

variable "sp_client_id" {
  type        = string
  description = "Service Principal Client ID"
}

variable "sp_client_secret" {
  type        = string
  sensitive   = true
  description = "Service Principal Client Secret"
}

variable "resource_group" {
  type        = string
  description = "Name of the pre-existing Resource Group"
}

variable "location" {
  type        = string
  default     = "westeurope"
  description = "Azure region"
}

variable "container_app_name" {
  type        = string
  description = "Name of the Container App (= project_id)"
}

variable "container_apps_env_name" {
  type        = string
  description = "Name of the pre-existing Container Apps Environment"
}

variable "acr_name" {
  type        = string
  description = "Azure Container Registry name"
}

variable "acr_login_server" {
  type        = string
  description = "ACR login server (e.g. codexacr.azurecr.io)"
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Container image tag"
}
