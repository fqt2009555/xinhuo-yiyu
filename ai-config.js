/* GitHub Pages 干净版配置
 * FORCE_LOCAL=true：不加载 WorkBuddy 云 SDK、不连接 genie 网关，
 *   AI 问答自动降级为本地健康知识库（院史库 + 科普库），零外部依赖、链接无 workbuddy 署名。
 * endpoint / oauthRelayBaseUrl / publishableKey 留空即可（FORCE_LOCAL 下不会被使用）。
 * 实时 AI 大模型演示请使用 WorkBuddy 版链接。
 */
window.AI_CONFIG = {
  FORCE_LOCAL: true,
  endpoint: "",
  oauthRelayBaseUrl: "",
  publishableKey: ""
};
