import * as Port from "@source/definitions/container-port";
import { DefaultImagePullSecret, Namespace } from "@source/definitions/meta";
import * as k8s from "@source/k8s";

export interface IngressGatewayParams {
  applicationName: string;
  contentHash: string;
  revision: string;
  resources?: k8s.IstioOperator.Resources;
  hpa?: k8s.IstioOperator.HorizontalPodAutoscalerSpec;
  overlays: k8s.IstioOperator.K8SObjectOverlay[];
  volumes?: k8s.IstioOperator.Volume[];
}

export interface Params {
  name: string;
  revision: string;
  ingressGatewaySpec: k8s.IstioOperator.GatewaySpec;
}

export class Generator {
  private generatePodAnnotations(params: IngressGatewayParams): Record<string, string> {
    return {
      ["dependency.config-map.content-hash"]: params.contentHash,
    };
  }

  private generagteWeightedPodAffinityTerm(params: IngressGatewayParams): k8s.PodTemplate.WeightedPodAffinityTerm {
    return {
      weight: 1,
      podAffinityTerm: {
        topologyKey: "kubernetes.io/hostname",
        labelSelector: {
          matchExpressions: [
            {
              key: "app.kubernetes.io/name",
              operator: "In",
              values: [params.applicationName],
            },
          ],
        },
      },
    };
  }

  public generateIstioIngressgateway(params: IngressGatewayParams): k8s.IstioOperator.GatewaySpec {
    return {
      name: params.applicationName,
      namespace: Namespace,
      enabled: true,
      label: {
        app: params.applicationName,
        "app.kubernetes.io/name": params.applicationName,
        "app.kubernetes.io/part-of": "istio",
      },
      k8s: {
        overlays: params.overlays,
        env: [
          {
            name: "TZ",
            value: "Asia/Tokyo",
          },
        ],
        service: {
          type: "NodePort",
          ports: [
            {
              name: "http",
              port: Port.NodePort.IngressGateway,
              nodePort: Port.NodePort.IngressGateway,
              targetPort: Port.NodePort.IngressGateway,
            },
          ],
          externalTrafficPolicy: "Cluster",
        },
        resources: params.resources || {
          limits: {
            cpu: "1200m",
            memory: "500M",
          },
          requests: {
            cpu: "400m",
            memory: "500M",
          },
        },
        nodeSelector: {},
        podAnnotations: this.generatePodAnnotations(params),
        affinity: {
          podAntiAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [this.generagteWeightedPodAffinityTerm(params)],
          },
        },
        hpaSpec: params.hpa || {
          minReplicas: 2,
          maxReplicas: 2,
        },
        volumes: params.volumes,
      },
    };
  }

  public generate(params: Params): k8s.IstioOperator.Type {
    return k8s.IstioOperator.create({
      metadata: {
        name: params.name,
        namespace: Namespace,
      },
      spec: {
        revision: params.revision,
        profile: "demo",
        components: {
          ingressGateways: [params.ingressGatewaySpec],
        },
        values: {
          global: {
            imagePullSecrets: [DefaultImagePullSecret],
          },
        },
      },
    });
  }
}
