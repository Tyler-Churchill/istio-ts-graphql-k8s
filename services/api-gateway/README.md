# API Gateway

The only publically exposed deployment in the project.

All requests go through the istio ingress -> api-gateway (gateway CRD) then to this api-gateway service

This service listens to all other services, and serves them as a remotely executeable schema under one
federated Graph API.
