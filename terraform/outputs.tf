output "container_app_fqdn" {
  value       = azurerm_container_app.app.ingress[0].fqdn
  description = "FQDN of the deployed Container App"
}

output "container_app_url" {
  value       = "https://${azurerm_container_app.app.ingress[0].fqdn}"
  description = "Full URL of the deployed Container App"
}
