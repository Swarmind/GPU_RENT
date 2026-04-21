import { createContext, useContext, useState, ReactNode } from 'react';

interface Template {
  id: number;
  name: string;
  description?: string;
  image_path?: string;
  template_name?: string;
  template_description?: string;
  vram_required_gb?: number;
  docker_server_name?: string;
  docker_username?: string;
  docker_password?: string;
  disk_space_mb?: number;
  is_private?: boolean;
  docker_options?: string;
  ports?: string[];
  environment_variables?: string[];
  readme?: string;
  on_start_script?: string;
  extra_filters?: string[];
}

interface TemplateContextType {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <TemplateContext.Provider value={{ selectedTemplate, setSelectedTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}
