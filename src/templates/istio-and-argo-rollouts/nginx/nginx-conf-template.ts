import { EOL } from "os";

import type * as Types from "./types";

// privateIPとループバックアドレスは途中経路でXFFとして入ってくる可能性があるため信頼アドレスとし、globalな値のみがX-Real-IPに反映されるようにしている
const createRealIp = `
    set_real_ip_from 10.0.0.0/8;
    set_real_ip_from 172.16.0.0/12;
    set_real_ip_from 192.168.0.0/16;
    set_real_ip_from 127.0.0.0/8;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;
  `;

const createLimitReqZone = (conf: Types.LimitRequestZone): string => {
  const parts = ["limit_req_zone", conf.key, conf.name, `zone=${conf.name}:${conf.size}`, `rate=${conf.rate}`];
  return parts.filter(Boolean).join(" ") + ";";
};

const createLimitReq = (conf: Types.LimitRequest): string => {
  const parts = ["limit_req", `zone=${conf.zoneName}`, `burst=${conf.burst}`, conf.delay > 0 ? `delay=${conf.delay}` : "nodelay"];
  return parts.filter(Boolean).join(" ") + ";";
};

const createLimitReqZones = (list: Types.LimitRequestZone[]) => {
  const confList = list.map((item) => {
    return createLimitReqZone(item);
  });
  return confList.join(EOL);
};

const createLocation = (item: Types.Location) => {
  return `
  location ${item.path} {
    ${item.limitReq ? createLimitReq(item.limitReq) : ""}
    ${item.limitReq ? "limit_req_status 429;" : ""}
    proxy_pass http://localhost:80;
    access_log off;
    proxy_intercept_errors off;
  }`;
};

const createLocations = (list: Types.Location[]) => {
  const confList = list.map((item) => {
    return createLocation(item);
  });
  return confList.join(EOL);
};

export const createNginxConf = (conf: Types.NginxConf): string => `user nginx;
worker_processes  1;

events {
    worker_connections  10240;
}

http {
  server_tokens off;
  ${conf.limitReqZones ? createLimitReqZones(conf.limitReqZones) : ""}

    server {
        listen ${conf.port} default_server;
        listen [::]:${conf.port} default_server;

        proxy_http_version 1.1;

        ${createRealIp}

        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Host $http_x_forwarded_host;
        proxy_set_header        X-Forwarded-Server $host;
        proxy_set_header        Host $http_host;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection "upgrade";

        ${createLocations(conf.locations)}

        location = /status {
            access_log off;
            return 200 "healthy";
        }
    }
}
`;
