export const buildContextFormat = () => {
  return `
  ## Context Format
<Context>
  <WebSearchContext>
    <ContextItem citationIndex='[[citation:x]]' type='webSearchSource' url={url} title={title}>content</ContextItem>
  </WebSearchContext>
</Context>
  `;
};
