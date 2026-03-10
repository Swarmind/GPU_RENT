import { X, Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/auth-context";

interface EnrollmentTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'https://launchpad.swarmind.ai';

export function EnrollmentTokenModal({ isOpen, onClose }: EnrollmentTokenModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentToken, setEnrollmentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    machineName: "",
    operation: "enroll",
    rentDurationMins: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentDurationMins' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const requestUrl = `${API_BASE_URL}/machines/request`;
      const requestPayload = {
        operation: formData.operation,
        machine_name: formData.machineName,
        rent_duration_mins: formData.rentDurationMins,
      };

      console.log('=== ENROLLMENT TOKEN REQUEST ===');
      console.log('URL:', requestUrl);
      console.log('Payload:', requestPayload);
      console.log('Credentials:', 'include');

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Failed to generate enrollment token (${response.status})`;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.log('Error response (JSON):', errorData);
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
          } else {
            const textError = await response.text();
            console.log('Error response (text):', textError);
            if (textError) errorMessage = textError;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('Response body (raw):', responseText);
      
      if (!responseText) {
        throw new Error('Empty response from server - no enrollment token received');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response body (parsed):', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!data.enrollment_token) {
        console.error('No enrollment_token in response:', data);
        throw new Error('No enrollment token in response. Received: ' + JSON.stringify(data));
      }

      console.log('✓ Successfully received enrollment token:', data.enrollment_token);
      console.log('=================================');
      setEnrollmentToken(data.enrollment_token);

    } catch (err: any) {
      console.error('=== ENROLLMENT TOKEN ERROR ===');
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('==============================');
      
      // User-friendly error message
      let displayError = err.message || 'Failed to generate enrollment token';
      
      // Check for common error types
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        displayError = 'Network error: Cannot connect to launchpad.swarmind.ai. Please check CORS configuration.';
      } else if (err.message?.includes('JSON')) {
        displayError = 'Server returned invalid response. Please contact support.';
      }
      
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (enrollmentToken) {
      navigator.clipboard.writeText(enrollmentToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({
      machineName: "",
      operation: "enroll",
      rentDurationMins: 0,
    });
    setEnrollmentToken(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Request Enrollment Token</h2>
            <p className="text-sm text-slate-500 mt-1">Generate a token to register your machine via CLI</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!enrollmentToken ? (
            /* Request Form */
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Machine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My GPU Server 1"
                />
                <p className="text-xs text-slate-500 mt-1">Choose a memorable name for your machine</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Operation Type
                </label>
                <input
                  type="text"
                  name="operation"
                  value={formData.operation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="enroll"
                />
                <p className="text-xs text-slate-500 mt-1">Operation type (default: enroll)</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Rent Duration (minutes)
                </label>
                <input
                  type="number"
                  name="rentDurationMins"
                  value={formData.rentDurationMins}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">Leave as 0 for default duration</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Terminal className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">Next Steps:</p>
                    <p className="text-sm text-blue-700">
                      After receiving your enrollment token, run the AntHive CLI tool on your machine to complete the registration. 
                      The CLI will automatically detect your hardware specifications and register the machine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 text-slate-600 hover:text-slate-900 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Token'}
                </button>
              </div>
            </form>
          ) : (
            /* Token Display */
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Your Enrollment Token
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={enrollmentToken}
                    readOnly
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm text-slate-900 select-all"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-2">
                  <Terminal className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900 font-medium mb-2">Success! Use this token with the CLI:</p>
                    <div className="bg-slate-900 rounded px-3 py-2 mt-2">
                      <code className="text-sm text-green-400">
                        anthive enroll --token {enrollmentToken}
                      </code>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Run this command on the machine you want to register. The CLI will collect hardware characteristics and complete the enrollment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}