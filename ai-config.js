/* GitHub Pages 干净版配置
 * AI 有两种模式，由下方字段切换，前端 ai-openai-bridge.js 自动接管，index.html 无需改动：
 *
 * 模式 A（默认，当前启用）：本地知识库降级
 *   FORCE_LOCAL: true  → 不加载任何云 SDK，AI 问答自动走本地健康知识库（院史+科普），
 *                        零外部依赖、链接无 workbuddy 署名。
 *
 * 模式 B（后期启用实时大模型）：通用 LLM 桥接
 *   把 FORCE_LOCAL 改为 false、mode 改为 'openai'，并填 endpoint / openaiModel（先部署 ai-backend/ 代理）。
 *   断网/代理异常时仍自动回落本地知识库。详见 AI_SETUP.md。
 */
window.AI_CONFIG = {
  FORCE_LOCAL: true,            // 默认本地知识库降级；改 false + mode:'openai' 即接入实时大模型
  mode: "openai",               // 仅在 FORCE_LOCAL=false 时生效；填 'openai' 启用通用大模型桥接
  endpoint: "",                 // 代理地址，如 https://你的代理.vercel.app/api/ask（FORCE_LOCAL=false 时必填）
  openaiModel: "gpt-4o-mini",   // 你的代理支持的模型名
  oauthRelayBaseUrl: "",
  publishableKey: ""
};
