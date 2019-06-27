curl "https://www.spinnaker.io/downloads/kubernetes/quick-install.yml" sed 's/version:.*/version: 1.12.2/g' | kubectl apply -f -
