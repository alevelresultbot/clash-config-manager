// Generated by https://quicktype.io

export default interface ClashConfig {
  'proxies': Proxy[]
  'proxy-groups': ProxyGroup[]
  'port': number
  'socks-port': number
  'mixed-port': number
  'allow-lan': boolean
  'bind-address': string
  'mode': string
  'log-level': string
  'ipv6': boolean
  'external-controller': string
  'interface-name': string
  'hosts': null
  'dns': DNS
  'rules': string[]
}

export interface DNS {
  'enable': boolean
  'listen': string
  'default-nameserver': string[]
  'enhanced-mode': string
  'fake-ip-range': string
  'nameserver': string[]
  'fallback-filter': FallbackFilter
}

export interface FallbackFilter {
  geoip: boolean
  ipcidr: null
}

export interface Proxy {
  'type': ProxyType
  'name': string
  'server': string
  'port': number
  'uuid': string
  'alterId': number
  'cipher': Cipher
  'skip-cert-verify': boolean
  'network'?: Network
  'ws-path': string
  'tls': boolean
  'ws-headers': WsHeaders
}

export enum Cipher {
  Auto = 'auto',
}

export enum Network {
  Ws = 'ws',
}

export enum ProxyType {
  Vmess = 'vmess',
}

export interface WsHeaders {
  Host: string
}

export interface ProxyGroup {
  name: string
  proxies: string[]
  type: ProxyGroupType
  url?: string
  interval?: number
}

export enum ProxyGroupType {
  Fallback = 'fallback',
  Select = 'select',
  URLTest = 'url-test',
}
