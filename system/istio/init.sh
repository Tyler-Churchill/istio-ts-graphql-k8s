# install
helm template install/kubernetes/helm/istio-init --name istio-init --namespace istio-system | kubectl apply -f -
helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl apply -f -

kubectl get svc -n istio-system # verify services
kubectl get pods -n istio-system # verify pods are running


# uninstall
helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl delete -f -
kubectl delete namespace istio-system