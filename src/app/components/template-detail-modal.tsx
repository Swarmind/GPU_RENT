import { X, Server, HardDrive, Lock, Unlock, Code, Terminal, FileText, Loader2, Copy, Edit, Trash2 } from "lucide-react";

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  isLoading?: boolean;
  onForkTemplate?: (template: any) => void;
  onEditTemplate?: (templateId: number) => void;
  onDeleteTemplate?: (templateId: number) => void;
}

export function TemplateDetailModal({ isOpen, onClose, template, isLoading, onForkTemplate, onEditTemplate, onDeleteTemplate }: TemplateDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-slate-600">Loading template details...</span>
            </div>
          ) : template ? (
            <div className="flex items-center gap-3">
              <div className="text-2xl">{template.icon || '📦'}</div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{template.template_name}</h2>
                <p className="text-sm text-slate-500">Template ID: {template.id}</p>
              </div>
            </div>
          ) : (
            <span className="text-slate-600">Template</span>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : !template ? (
          <div className="p-12 text-center text-slate-600">
            No template data available
          </div>
        ) : (
          <>
            <div className="p-6 space-y-6">
              {/* Public Template Warning */}
              {template.is_private === false && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Public Template</strong>
                    <br />
                    This template may not work without configuration, as password values and environment variables are not specified.
                    You can fork it and customize it for your needs.
                  </p>
                </div>
              )}

              {/* Description */}
          {template.template_description && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
              <p className="text-slate-900">{template.template_description}</p>
            </div>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-medium">VRAM Required</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {template.vram_required_gb ? `${template.vram_required_gb} GB` : 'Not specified'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Server className="w-4 h-4" />
                <span className="text-xs font-medium">Disk Space</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {template.disk_space_mb ? `${(template.disk_space_mb / 1024).toFixed(1)} GB` : 'Not specified'}
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-2">
            {template.is_private ? (
              <>
                <Lock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Private Template</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Public Template</span>
              </>
            )}
          </div>

          {/* Docker Configuration */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Docker Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Image Path</div>
                <code className="block px-3 py-2 bg-slate-900 text-green-400 rounded text-sm font-mono">
                  {template.image_path || 'Not specified'}
                </code>
              </div>

              {template.docker_options && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Docker Options</div>
                  <code className="block px-3 py-2 bg-slate-900 text-green-400 rounded text-sm font-mono">
                    {template.docker_options}
                  </code>
                </div>
              )}

              {template.docker_server_name && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Server</div>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm">
                      {template.docker_server_name}
                    </div>
                  </div>
                  {template.docker_username && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Username</div>
                      <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm">
                        {template.docker_username}
                      </div>
                    </div>
                  )}
                  {template.docker_password && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Password</div>
                      <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm">
                        ••••••••
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ports */}
          {template.ports && template.ports.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Exposed Ports
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.ports.map((port: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm font-mono"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Environment Variables */}
          {template.environment_variables && template.environment_variables.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Environment Variables
              </h3>
              <div className="space-y-1">
                {template.environment_variables.map((env: string, index: number) => (
                  <code
                    key={index}
                    className="block px-3 py-2 bg-slate-900 text-green-400 rounded text-sm font-mono"
                  >
                    {env}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Extra Filters */}
          {template.extra_filters && template.extra_filters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Extra Filters</h3>
              <div className="flex flex-wrap gap-2">
                {template.extra_filters.map((filter: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* On Start Script */}
          {template.on_start_script && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                On Start Script
              </h3>
              <pre className="px-4 py-3 bg-slate-900 text-green-400 rounded text-xs font-mono overflow-x-auto">
                {template.on_start_script}
              </pre>
            </div>
          )}

          {/* README */}
          {template.readme && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                README
              </h3>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 whitespace-pre-wrap">
                {template.readme}
              </div>
            </div>
          )}

          {/* Tags (from original card) */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {template.is_private === false && onForkTemplate && (
              <button
                onClick={() => {
                  onForkTemplate(template);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                <Copy className="w-4 h-4" />
                Fork and Customize
              </button>
            )}
            {template.is_private === true && (
              <>
                {onEditTemplate && (
                  <button
                    onClick={() => {
                      onEditTemplate(template.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Template
                  </button>
                )}
                {onDeleteTemplate && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete template "${template.template_name}"?`)) {
                        onDeleteTemplate(template.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
