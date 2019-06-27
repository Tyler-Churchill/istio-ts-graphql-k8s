Enable sidecar injection of the ISTIO proxy on the default namespace
kubectl label namespace default istio-injection=enabled

in deployment,
the API gateway needs to be deployed and rolling updated out last as it needs to read
the new deployed microservice schemas
