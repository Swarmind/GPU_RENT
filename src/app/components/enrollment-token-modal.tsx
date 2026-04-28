import { X, Copy, Check, Terminal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/auth-context";
import { API_BASE_URL } from "../config/api";

interface EnrollmentTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export function EnrollmentTokenModal({ isOpen, onClose, onApplied }: EnrollmentTokenModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentToken, setEnrollmentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    machineName: "",
    location: "",
    pricePerHour: "" as string | number,
    rentDurationMins: "" as string | number,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger location suggestions
    if (name === 'location') {
      setShowSuggestions(true);
      fetchLocationSuggestions(value);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/locations/suggest?q=${encodeURIComponent(query)}&limit=10`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract location strings from items array
        const locations = (data.items || []).map((item: any) => item.location);
        setLocationSuggestions(locations);
      }
    } catch (err) {
      console.error('Failed to fetch location suggestions:', err);
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({
      ...prev,
      location: location
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const requestUrl = `${API_BASE_URL}/machines/request`;

      // Convert string inputs to numbers
      const pricePerHour = typeof formData.pricePerHour === 'string'
        ? parseFloat(formData.pricePerHour) || 0
        : formData.pricePerHour;

      const rentDurationMins = typeof formData.rentDurationMins === 'string'
        ? parseInt(formData.rentDurationMins) || 0
        : formData.rentDurationMins;

      // Convert USD/hour to USDC wei/second (USDC has 6 decimals)
      // Formula: (price_in_usd * 10^6) / 3600
      const pricePerSecondWei = Math.floor((pricePerHour * 1_000_000) / 3600);

      const requestPayload = {
        operation: "enroll",
        machine_name: formData.machineName,
        location: formData.location,
        price_per_second: pricePerSecondWei,
        rent_duration_mins: rentDurationMins,
      };

      console.log('=== ENROLLMENT TOKEN REQUEST ===');
      console.log('URL:', requestUrl);
      console.log('Price conversion:', {
        pricePerHourUSD: pricePerHour,
        pricePerSecondWei: pricePerSecondWei,
        formula: `(${pricePerHour} * 1,000,000) / 3600`
      });
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
        displayError = `Network error: Cannot connect to API (${API_BASE_URL}). Check proxy/CORS configuration.`;
      } else if (err.message?.includes('JSON')) {
        displayError = 'Server returned invalid response. Please contact support.';
      }
      
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (enrollmentCommand) {
      navigator.clipboard.writeText(enrollmentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const enrollmentCommand = enrollmentToken
    ? `curl -fsSL https://get.anthive.ai | sh -s -- ${enrollmentToken}`
    : "";

  const handleClose = () => {
    const hasEnrollmentToken = !!enrollmentToken;

    setFormData({
      machineName: "",
      location: "",
      pricePerHour: "",
      rentDurationMins: "",
    });
    setEnrollmentToken(null);
    setError(null);
    setCopied(false);
    onClose();

    // Refresh parent data only after enrollment flow reached command generation.
    if (hasEnrollmentToken) {
      onApplied?.();
    }
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
                  Location
                </label>
                <div ref={locationInputRef} className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="USA, New York"
                    autoComplete="off"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-slate-700 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Specify location in format: Country, City</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Price per Hour (USD)
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="3.60"
                />
                <p className="text-xs text-slate-500 mt-1">Set the hourly rental price for your machine</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Rent Duration (minutes)
                </label>
                <input
                  type="number"
                  name="rentDurationMins"
                  value={formData.rentDurationMins || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
            /* Enrollment Command Display */
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Enrollment Command
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
                    value={enrollmentCommand}
                    readOnly
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm text-slate-900 select-all"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-2">
                  <Terminal className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-green-900 font-medium mb-2">Success! Run the enrollment command above on your machine.</p>
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
