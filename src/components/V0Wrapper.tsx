import { useEffect, useState } from 'react';
import { v0 } from '../lib/v0';

interface V0WrapperProps {
  componentId: string;
  props?: Record<string, any>;
}

export function V0Wrapper({ componentId, props }: V0WrapperProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    async function fetchComponent() {
      const response = await v0.components.render(componentId, props);
      setHtml(response.html);
    }
    fetchComponent();
  }, [componentId, props]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
} 