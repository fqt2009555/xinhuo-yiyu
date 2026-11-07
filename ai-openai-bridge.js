/* ai-openai-bridge.js — 通用大模型「零改 index.html」接入层（OpenAI 兼容协议）
 * ------------------------------------------------------------------
 * 工作原理：
 *   index.html 的 AI 问答依赖全局对象 window.WorkBuddyCloud
 *   （createWorkBuddyCloud().llm.models.list() 与 .llm.chat.completions.create()）。
 *   本文件在「AI_CONFIG.mode === 'openai' 且 FORCE_LOCAL 不为 true」时，
 *   伪装成 WorkBuddyCloud 全局对象，把请求转发到你自己的 Serverless 代理
 *   （endpoint），由代理带密钥调用任意 OpenAI 兼容大模型。
 *   因此 index.html 的核心问答逻辑一行都不用改。
 *
 * 启用方式（后期，详见 AI_SETUP.md）：
 *   1) 部署 ai-backend/ 里的代理（Vercel 或 Cloudflare），拿到 endpoint URL；
 *   2) 在 ai-config.js 里设  mode:'openai'、FORCE_LOCAL:false、
 *      endpoint:'https://你的代理/api/ask'、openaiModel:'你的模型名'；
 *   3) 刷新页面，AI 问答自动走实时大模型；断网/代理异常时仍回落本地知识库。
 *
 * 安全：密钥只存在于代理端的环境变量，永不进入前端代码。
 */
(function () {
  var CFG = window.AI_CONFIG || {};
  // 双保险：不是 openai 模式、或仍处 FORCE_LOCAL 本地降级时，一律不接管，保持原行为。
  if (CFG.mode !== 'openai' || CFG.FORCE_LOCAL) return;
  if (!CFG.endpoint) {
    console.warn('[ai-bridge] mode=openai 但缺少 endpoint，已退回本地知识库');
    return;
  }

  var MODEL = CFG.openaiModel || 'gpt-4o-mini';

  // 把代理返回的「标准 OpenAI SSE 流」转成 callModel 期望消费的 chunk 异步迭代器。
  // callModel 需要：chunk.choices[0].delta.content / reasoning_content / content_pieces，以及 chunk.usage。
  async function* streamFromProxy(endpoint, payModel, messages, signal) {
    var resp;
    try {
      resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: payModel, messages: messages, stream: true }),
        signal: signal
      });
    } catch (e) { throw e; }
    if (!resp.ok || !resp.body) {
      throw { error: { code: 'gateway_upstream', message: 'proxy http ' + (resp && resp.status) } };
    }
    var reader = resp.body.getReader();
    var dec = new TextDecoder('utf-8');
    var buf = '';
    while (true) {
      var r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, { stream: true });
      var lines = buf.split('\n');
      buf = lines.pop(); // 保留未完成的半行
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf('data:') !== 0) continue;
        var data = line.slice(5).trim();
        if (data === '[DONE]') return;
        var json;
        try { json = JSON.parse(data); } catch (e) { continue; }
        yield json; // 原样透传为 callModel 消费的 chunk 格式
      }
    }
  }

  window.WorkBuddyCloud = {
    createWorkBuddyCloud: function () {
      return {
        llm: {
          models: { list: function () { return Promise.resolve([{ id: MODEL }]); } },
          chat: {
            completions: {
              create: function (params) {
                // params: { model, messages, stream, stream_options, signal }
                return streamFromProxy(CFG.endpoint, params.model || MODEL, params.messages, params.signal);
              }
            }
          }
        }
      };
    }
  };
  console.info('[ai-bridge] openai 模式已接管 WorkBuddyCloud → endpoint=' + CFG.endpoint + ' model=' + MODEL);
})();
