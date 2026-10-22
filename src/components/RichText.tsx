import { renderRichText } from '@/server/rich-text';

// Texto del sitio que puede traer formato del editor; se limpia antes de mostrarse
export default function RichText({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderRichText(html) }} />;
}
