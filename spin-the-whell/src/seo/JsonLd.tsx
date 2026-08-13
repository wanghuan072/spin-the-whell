type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * 服务端直接输出 JSON-LD，让爬虫在首个 HTML 响应中即可读取结构化数据。
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
