# Resource Table

- Environment: production

- This report is an automatically generated file. Do not update it manually.

## Total Requests (namespace: demo)

- Resource collected from PodTemplate multiplied by the number of Replica.
- Also includes the value of istio-proxy, which is Sidecar Injection.

| Node Role | CPU[core] | MEM[GB] | Replicas |
| :-------- | --------: | ------: | -------: |
| Gateway   |         0 |       0 |        0 |
| Worker    |         0 |       0 |        0 |
| Undefined |       2.4 |   2.736 |       12 |

## Request Resources

- Information collected from each PodTemplate is shown; Resource shows the value when Replica is 1.
- Also includes the value of istio-proxy, which is Sidecar Injection.

| .metadata.name | .kind      | CPU[mcore] | MEM[MB] | Replicas | NodeSelector |
| :------------- | :--------- | ---------: | ------: | -------: | ------------ |
| basic-pc-web   | Deployment |        200 |     228 |        3 | UNDEFINED    |
| basic-sp-web   | Deployment |        200 |     228 |        3 | UNDEFINED    |
| pc-web         | Rollout    |        200 |     228 |        3 |              |
| sp-web         | Rollout    |        200 |     228 |        3 |              |
